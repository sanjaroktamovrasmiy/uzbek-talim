"""
Common handlers - start, help, etc.
"""

from aiogram import Router, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message

from src.keyboards.main import get_main_keyboard, get_guest_keyboard
from src.utils.messages import MESSAGES


router = Router(name="common")


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    """Handle /start command."""
    user = message.from_user

    # Check if user is registered
    # TODO: Check database for user

    await message.answer(
        MESSAGES["welcome"].format(name=user.first_name),
        reply_markup=get_guest_keyboard(),
    )


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    """Handle /help command."""
    await message.answer(MESSAGES["help"])


@router.message(Command("about"))
async def cmd_about(message: Message) -> None:
    """Handle /about command."""
    await message.answer(MESSAGES["about"])


@router.message(Command("contact"))
async def cmd_contact(message: Message) -> None:
    """Handle /contact command."""
    await message.answer(MESSAGES["contact"])


@router.message(F.text == "📚 Kurslar")
async def show_courses(message: Message) -> None:
    """Show available courses."""
    await message.answer(
        "📚 <b>Mavjud kurslar:</b>\n\n"
        "Kurslar ro'yxatini ko'rish uchun tanlang:",
        reply_markup=get_guest_keyboard(),
    )


@router.message(F.text == "📞 Bog'lanish")
async def show_contact(message: Message) -> None:
    """Show contact information."""
    await message.answer(MESSAGES["contact"])


@router.message(F.text == "❓ Yordam")
async def show_help(message: Message) -> None:
    """Show help."""
    await message.answer(MESSAGES["help"])

