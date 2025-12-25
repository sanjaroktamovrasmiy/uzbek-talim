"""
Telegram Bot Entry Point.
"""

import asyncio
import logging
import os
import signal
from urllib.parse import urlparse

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.redis import RedisStorage
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp import web

from shared import get_settings
from db.session import init_db, close_db

from src.handlers import register_all_handlers
from src.middlewares import register_all_middlewares


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

DEFAULT_WEBHOOK_LISTEN_HOST = os.getenv("TELEGRAM_WEBHOOK_LISTEN_HOST", "0.0.0.0")
DEFAULT_WEBHOOK_LISTEN_PORT = int(os.getenv("TELEGRAM_WEBHOOK_LISTEN_PORT", "8081"))


def _get_webhook_config() -> dict | None:
    """
    Return webhook config if TELEGRAM_WEBHOOK_URL is valid; otherwise None (fallback to polling).

    Telegram requires HTTPS for webhooks.
    """
    url = (settings.telegram_webhook_url or "").strip()
    if not url:
        return None

    # Common placeholder seen in templates
    if "your-domain.com" in url:
        logger.warning("TELEGRAM_WEBHOOK_URL looks like a placeholder; falling back to polling.")
        return None

    if not url.startswith("https://"):
        logger.warning("TELEGRAM_WEBHOOK_URL must start with https:// for Telegram; falling back to polling.")
        return None

    parsed = urlparse(url)
    if not parsed.netloc:
        logger.warning("TELEGRAM_WEBHOOK_URL has no host; falling back to polling.")
        return None

    webhook_path = parsed.path or "/telegram/webhook"
    if webhook_path == "/":
        webhook_path = "/telegram/webhook"

    secret = (settings.telegram_webhook_secret or "").strip() or None

    return {
        "url": url,
        "path": webhook_path,
        "listen_host": DEFAULT_WEBHOOK_LISTEN_HOST,
        "listen_port": DEFAULT_WEBHOOK_LISTEN_PORT,
        "secret_token": secret,
    }


async def on_startup(bot: Bot) -> None:
    """Startup callback."""
    logger.info("Bot starting...")

    # Initialize database
    await init_db()

    webhook = _get_webhook_config()

    if webhook:
        logger.info("Starting bot in webhook mode. Setting webhook: %s", webhook["url"])
        await bot.set_webhook(
            url=webhook["url"],
            secret_token=webhook["secret_token"],
            drop_pending_updates=True,
        )
    else:
        # Polling mode can't be used while a webhook is active.
        # Always delete webhook before starting polling.
        if settings.telegram_webhook_url:
            logger.warning(
                "TELEGRAM_WEBHOOK_URL is set, but bot is running in polling mode (invalid webhook url). "
                "Deleting webhook to avoid getUpdates conflicts."
            )
        await bot.delete_webhook(drop_pending_updates=True)

    logger.info("Bot started successfully!")


async def on_shutdown(bot: Bot) -> None:
    """Shutdown callback."""
    logger.info("Bot shutting down...")

    # Remove webhook on shutdown (optional, but avoids Telegram delivering to a dead endpoint)
    try:
        await bot.delete_webhook(drop_pending_updates=False)
    except Exception:
        # Don't block shutdown if webhook delete fails
        logger.exception("Failed to delete webhook on shutdown")

    # Close database
    await close_db()

    # Close bot HTTP session
    try:
        await bot.session.close()
    except Exception:
        logger.exception("Failed to close bot session")

    logger.info("Bot stopped.")


async def main() -> None:
    """Main function."""

    # Validate token
    if not settings.telegram_bot_token:
        raise ValueError("TELEGRAM_BOT_TOKEN is not set")

    # Create bot instance
    bot = Bot(
        token=settings.telegram_bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )

    # Create storage
    if settings.redis_url:
        storage = RedisStorage.from_url(settings.redis_url)
    else:
        from aiogram.fsm.storage.memory import MemoryStorage
        storage = MemoryStorage()

    # Create dispatcher
    dp = Dispatcher(storage=storage)

    # Register middlewares
    register_all_middlewares(dp)

    # Register handlers
    register_all_handlers(dp)

    # Register startup/shutdown callbacks
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)

    webhook = _get_webhook_config()

    if webhook:
        # Webhook server
        app = web.Application()
        SimpleRequestHandler(
            dispatcher=dp,
            bot=bot,
            secret_token=webhook["secret_token"],
        ).register(app, path=webhook["path"])
        setup_application(app, dp, bot=bot)

        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(
            runner,
            host=webhook["listen_host"],
            port=webhook["listen_port"],
        )
        await site.start()

        logger.info(
            "Webhook HTTP server started on http://%s:%s%s",
            webhook["listen_host"],
            webhook["listen_port"],
            webhook["path"],
        )

        stop_event = asyncio.Event()
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            try:
                loop.add_signal_handler(sig, stop_event.set)
            except NotImplementedError:
                # Some environments don't support signal handlers (e.g., Windows)
                pass

        try:
            await stop_event.wait()
        finally:
            await runner.cleanup()
    else:
        # Start polling
        logger.info("Starting bot in polling mode...")
        await dp.start_polling(
            bot,
            allowed_updates=dp.resolve_used_update_types(),
        )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")

