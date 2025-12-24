"""
Telegram Bot Entry Point.
"""

import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.redis import RedisStorage

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


async def on_startup(bot: Bot) -> None:
    """Startup callback."""
    logger.info("Bot starting...")

    # Initialize database
    await init_db()

    # Set webhook if configured
    if settings.telegram_webhook_url:
        await bot.set_webhook(
            url=f"{settings.telegram_webhook_url}/webhook",
            secret_token=settings.telegram_webhook_secret,
        )
        logger.info(f"Webhook set to {settings.telegram_webhook_url}")
    else:
        # Delete webhook for polling mode
        await bot.delete_webhook()

    logger.info("Bot started successfully!")


async def on_shutdown(bot: Bot) -> None:
    """Shutdown callback."""
    logger.info("Bot shutting down...")

    # Close database
    await close_db()

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

    try:
        # Start polling
        logger.info("Starting bot in polling mode...")
        await dp.start_polling(
            bot,
            allowed_updates=dp.resolve_used_update_types(),
        )
    finally:
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")

