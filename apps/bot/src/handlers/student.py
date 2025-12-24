"""
Student handlers - courses, schedule, payments.
"""

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery

from src.keyboards.student import (
    get_student_menu,
    get_courses_keyboard,
    get_schedule_keyboard,
)
from src.utils.messages import MESSAGES
from src.filters.auth import RegisteredUserFilter


router = Router(name="student")
router.message.filter(RegisteredUserFilter())


@router.message(F.text == "👤 Mening profilim")
@router.message(Command("profile"))
async def show_profile(message: Message) -> None:
    """Show user profile."""
    user = message.from_user

    # TODO: Get user from database

    await message.answer(
        f"👤 <b>Sizning profilingiz:</b>\n\n"
        f"📱 Telegram: @{user.username or 'yo\'q'}\n"
        f"🆔 ID: {user.id}\n\n"
        f"Profilingizni to'ldirish uchun web ilovaga kiring.",
    )


@router.message(F.text == "📅 Dars jadvali")
@router.message(Command("schedule"))
async def show_schedule(message: Message) -> None:
    """Show lesson schedule."""
    # TODO: Get schedule from database

    await message.answer(
        "📅 <b>Dars jadvali:</b>\n\n"
        "Hozircha sizda aktiv kurslar yo'q.\n"
        "Kursga yozilish uchun 📚 Kurslar bo'limiga o'ting.",
        reply_markup=get_schedule_keyboard(),
    )


@router.message(F.text == "💰 To'lovlar")
@router.message(Command("payments"))
async def show_payments(message: Message) -> None:
    """Show payment history."""
    # TODO: Get payments from database

    await message.answer(
        "💰 <b>To'lovlar tarixi:</b>\n\n"
        "Hozircha to'lovlar yo'q.",
    )


@router.message(F.text == "📊 Baholar")
@router.message(Command("grades"))
async def show_grades(message: Message) -> None:
    """Show grades."""
    # TODO: Get grades from database

    await message.answer(
        "📊 <b>Baholar:</b>\n\n"
        "Hozircha baholar yo'q.\n"
        "Darsga qatnashib, baholaringizni yig'ing!",
    )


@router.message(F.text == "📝 Vazifalar")
@router.message(Command("homework"))
async def show_homework(message: Message) -> None:
    """Show homework."""
    # TODO: Get homework from database

    await message.answer(
        "📝 <b>Uy vazifalari:</b>\n\n"
        "Hozircha vazifalar yo'q.",
    )


# ===========================================
# Callbacks
# ===========================================


@router.callback_query(F.data.startswith("course_"))
async def course_callback(callback: CallbackQuery) -> None:
    """Handle course selection."""
    course_id = callback.data.split("_")[1]

    # TODO: Get course details from database

    await callback.message.edit_text(
        f"📚 <b>Kurs haqida:</b>\n\n"
        f"Kurs ID: {course_id}\n\n"
        f"Batafsil ma'lumot uchun qo'ng'iroq qiling yoki markazga keling.",
    )
    await callback.answer()


@router.callback_query(F.data == "back_to_courses")
async def back_to_courses(callback: CallbackQuery) -> None:
    """Back to courses list."""
    await callback.message.edit_text(
        "📚 <b>Mavjud kurslar:</b>\n\n"
        "Kursni tanlang:",
        reply_markup=get_courses_keyboard([]),
    )
    await callback.answer()

