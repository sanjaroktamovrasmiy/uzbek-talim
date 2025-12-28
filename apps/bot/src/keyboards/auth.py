"""
Authentication keyboards.
"""

from aiogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)


def get_phone_keyboard() -> ReplyKeyboardMarkup:
    """Get phone sharing keyboard."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)],
            [KeyboardButton(text="❌ Bekor qilish")],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def get_cancel_keyboard() -> ReplyKeyboardMarkup:
    """Get cancel keyboard."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="❌ Bekor qilish")],
        ],
        resize_keyboard=True,
    )


def get_role_keyboard() -> ReplyKeyboardMarkup:
    """Get role selection keyboard."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="👨‍🎓 O'quvchi")],
            [KeyboardButton(text="👨‍🏫 Ustoz")],
            [KeyboardButton(text="❌ Bekor qilish")],
        ],
        resize_keyboard=True,
    )


def get_confirm_keyboard() -> ReplyKeyboardMarkup:
    """Get confirmation keyboard."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="✅ Tasdiqlash")],
            [KeyboardButton(text="❌ Bekor qilish")],
        ],
        resize_keyboard=True,
    )

