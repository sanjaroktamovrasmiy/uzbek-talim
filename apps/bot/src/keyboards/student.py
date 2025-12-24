"""
Student keyboards.
"""

from typing import List, Any

from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


def get_student_menu() -> InlineKeyboardMarkup:
    """Get student menu keyboard."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="📅 Dars jadvali", callback_data="schedule"),
                InlineKeyboardButton(text="📊 Baholar", callback_data="grades"),
            ],
            [
                InlineKeyboardButton(text="💰 To'lovlar", callback_data="payments"),
                InlineKeyboardButton(text="📝 Vazifalar", callback_data="homework"),
            ],
        ]
    )


def get_courses_keyboard(courses: List[Any]) -> InlineKeyboardMarkup:
    """Get courses keyboard."""
    buttons = []

    for course in courses:
        buttons.append([
            InlineKeyboardButton(
                text=f"📚 {course.name}",
                callback_data=f"course_{course.id}",
            )
        ])

    if not buttons:
        buttons.append([
            InlineKeyboardButton(
                text="Kurslar hozircha mavjud emas",
                callback_data="no_courses",
            )
        ])

    return InlineKeyboardMarkup(inline_keyboard=buttons)


def get_schedule_keyboard() -> InlineKeyboardMarkup:
    """Get schedule keyboard."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="📅 Bugun", callback_data="schedule_today"),
                InlineKeyboardButton(text="📆 Bu hafta", callback_data="schedule_week"),
            ],
            [
                InlineKeyboardButton(text="📆 Bu oy", callback_data="schedule_month"),
            ],
        ]
    )


def get_payment_keyboard(enrollment_id: str) -> InlineKeyboardMarkup:
    """Get payment keyboard for enrollment."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="💳 Payme orqali to'lash",
                    callback_data=f"pay_payme_{enrollment_id}",
                ),
            ],
            [
                InlineKeyboardButton(
                    text="💳 Click orqali to'lash",
                    callback_data=f"pay_click_{enrollment_id}",
                ),
            ],
            [
                InlineKeyboardButton(
                    text="💵 Naqd to'lash",
                    callback_data=f"pay_cash_{enrollment_id}",
                ),
            ],
        ]
    )

