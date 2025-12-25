"""
Main menu keyboards.
"""

from aiogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)


def get_guest_keyboard() -> ReplyKeyboardMarkup:
    """Get keyboard for guest users."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="📝 Ro'yxatdan o'tish"),
                KeyboardButton(text="📚 Kurslar"),
            ],
            [
                KeyboardButton(text="🌐 Web sahifa"),
            ],
            [
                KeyboardButton(text="📞 Bog'lanish"),
                KeyboardButton(text="❓ Yordam"),
            ],
        ],
        resize_keyboard=True,
    )


def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Get main menu keyboard for registered users."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="👤 Mening profilim"),
                KeyboardButton(text="📅 Dars jadvali"),
            ],
            [
                KeyboardButton(text="💰 To'lovlar"),
                KeyboardButton(text="📊 Baholar"),
            ],
            [
                KeyboardButton(text="📚 Kurslar"),
                KeyboardButton(text="📝 Vazifalar"),
            ],
            [
                KeyboardButton(text="🌐 Web sahifa"),
            ],
            [
                KeyboardButton(text="📞 Bog'lanish"),
                KeyboardButton(text="❓ Yordam"),
            ],
        ],
        resize_keyboard=True,
    )


def get_back_keyboard() -> InlineKeyboardMarkup:
    """Get back button keyboard."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back")],
        ]
    )

