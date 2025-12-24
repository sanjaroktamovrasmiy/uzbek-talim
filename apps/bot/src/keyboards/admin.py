"""
Admin keyboards.
"""

from aiogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)


def get_admin_menu() -> ReplyKeyboardMarkup:
    """Get admin menu keyboard."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="📊 Statistika"),
                KeyboardButton(text="👥 Foydalanuvchilar"),
            ],
            [
                KeyboardButton(text="📚 Kurslar boshqaruvi"),
                KeyboardButton(text="📢 Xabar yuborish"),
            ],
            [
                KeyboardButton(text="⬅️ Asosiy menyu"),
            ],
        ],
        resize_keyboard=True,
    )


def get_admin_inline_menu() -> InlineKeyboardMarkup:
    """Get admin inline menu keyboard."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="📊 Statistika", callback_data="admin_stats"),
                InlineKeyboardButton(text="👥 Users", callback_data="admin_users"),
            ],
            [
                InlineKeyboardButton(text="📚 Kurslar", callback_data="admin_courses"),
                InlineKeyboardButton(text="📢 Broadcast", callback_data="admin_broadcast"),
            ],
        ]
    )


def get_confirm_broadcast_keyboard() -> InlineKeyboardMarkup:
    """Get broadcast confirmation keyboard."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Yuborish", callback_data="broadcast_confirm"),
                InlineKeyboardButton(text="❌ Bekor qilish", callback_data="broadcast_cancel"),
            ],
        ]
    )

