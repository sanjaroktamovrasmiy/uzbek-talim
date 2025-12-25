"""
Telegram bot service for sending messages from API.
"""

import logging
from typing import Optional

from aiogram import Bot
from aiogram.exceptions import TelegramBadRequest, TelegramAPIError

from shared import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class TelegramService:
    """Service for sending messages via Telegram bot."""

    def __init__(self):
        """Initialize service."""
        self.bot: Optional[Bot] = None
        if settings.telegram_bot_token:
            try:
                self.bot = Bot(token=settings.telegram_bot_token)
            except Exception as e:
                logger.error(f"Failed to initialize Telegram bot: {e}")

    async def send_message(
        self,
        telegram_id: int,
        text: str,
        parse_mode: Optional[str] = None,
    ) -> bool:
        """
        Send message to Telegram user.

        Args:
            telegram_id: Telegram user ID
            text: Message text
            parse_mode: Parse mode (HTML, Markdown, etc.)

        Returns:
            True if sent successfully, False otherwise
        """
        if not self.bot:
            logger.warning("Telegram bot not initialized")
            return False

        try:
            await self.bot.send_message(
                chat_id=telegram_id,
                text=text,
                parse_mode=parse_mode,
            )
            return True
        except TelegramBadRequest as e:
            logger.error(f"Telegram API error: {e}")
            return False
        except TelegramAPIError as e:
            logger.error(f"Telegram API error: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending Telegram message: {e}")
            return False

    async def send_verification_code(
        self,
        telegram_id: int,
        code: str,
        phone: str,
        is_login: bool = False,
    ) -> bool:
        """
        Send verification code to Telegram user.

        Args:
            telegram_id: Telegram user ID
            code: Verification code
            phone: Phone number
            is_login: True if login, False if registration

        Returns:
            True if sent successfully, False otherwise
        """
        action = "kirish" if is_login else "ro'yxatdan o'tish"
        text = (
            f"🔐 <b>Autentifikatsiya kodi</b>\n\n"
            f"Telefon raqam: <code>{phone}</code>\n"
            f"Kod: <code>{code}</code>\n\n"
            f"Bu kod {action} uchun.\n"
            f"Kodni hech kimga bermang!\n\n"
            f"⏱️ Kod 5 daqiqa davomida amal qiladi."
        )

        return await self.send_message(
            telegram_id=telegram_id,
            text=text,
            parse_mode="HTML",
        )

    async def close(self):
        """Close bot session."""
        if self.bot:
            await self.bot.session.close()


# Global instance
_telegram_service: Optional[TelegramService] = None


def get_telegram_service() -> TelegramService:
    """Get Telegram service instance."""
    global _telegram_service
    if _telegram_service is None:
        _telegram_service = TelegramService()
    return _telegram_service

