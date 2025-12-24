"""
Admin handlers - management commands.
"""

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery

from shared import get_settings
from src.filters.auth import AdminFilter
from src.keyboards.admin import get_admin_menu


router = Router(name="admin")
router.message.filter(AdminFilter())


settings = get_settings()


@router.message(Command("admin"))
async def admin_panel(message: Message) -> None:
    """Show admin panel."""
    await message.answer(
        "🔐 <b>Admin Panel</b>\n\n"
        "Boshqaruv funksiyalarini tanlang:",
        reply_markup=get_admin_menu(),
    )


@router.message(F.text == "📊 Statistika")
async def show_statistics(message: Message) -> None:
    """Show statistics."""
    # TODO: Get statistics from database

    await message.answer(
        "📊 <b>Statistika:</b>\n\n"
        "👥 Jami foydalanuvchilar: 0\n"
        "📚 Jami kurslar: 0\n"
        "👨‍🎓 Aktiv o'quvchilar: 0\n"
        "💰 Bu oydagi to'lovlar: 0 so'm",
    )


@router.message(F.text == "👥 Foydalanuvchilar")
async def manage_users(message: Message) -> None:
    """Manage users."""
    await message.answer(
        "👥 <b>Foydalanuvchilar boshqaruvi:</b>\n\n"
        "Foydalanuvchilarni boshqarish uchun web admin paneliga kiring.",
    )


@router.message(F.text == "📚 Kurslar boshqaruvi")
async def manage_courses(message: Message) -> None:
    """Manage courses."""
    await message.answer(
        "📚 <b>Kurslar boshqaruvi:</b>\n\n"
        "Kurslarni boshqarish uchun web admin paneliga kiring.",
    )


@router.message(F.text == "📢 Xabar yuborish")
async def broadcast_message(message: Message) -> None:
    """Start broadcast."""
    await message.answer(
        "📢 <b>Xabar yuborish:</b>\n\n"
        "Barcha foydalanuvchilarga xabar yuborish uchun "
        "xabaringizni yozing yoki bekor qilish uchun /cancel buyrug'ini bosing.",
    )


# ===========================================
# Callbacks
# ===========================================


@router.callback_query(F.data == "admin_stats")
async def admin_stats_callback(callback: CallbackQuery) -> None:
    """Handle admin stats callback."""
    await callback.answer("Statistika yuklanmoqda...")
    await show_statistics(callback.message)


@router.callback_query(F.data == "admin_broadcast")
async def admin_broadcast_callback(callback: CallbackQuery) -> None:
    """Handle broadcast callback."""
    await callback.answer()
    await broadcast_message(callback.message)

