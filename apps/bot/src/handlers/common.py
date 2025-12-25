"""
Common handlers - start, help, etc.
"""

from urllib.parse import urlparse

from aiogram import Router, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy.ext.asyncio import AsyncSession

from shared import get_settings
from src.keyboards.main import get_main_keyboard, get_guest_keyboard
from src.utils.messages import MESSAGES
from src.services.user_service import UserService


settings = get_settings()
WEB_URL = settings.web_url


def _is_valid_web_url(url: str) -> bool:
    """Return True if url can be used in Telegram inline keyboard buttons."""
    if not url:
        return False
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return False
    if not parsed.netloc:
        return False
    # Telegram rejects localhost URLs for buttons
    if parsed.hostname == "localhost":
        return False
    return True


router = Router(name="common")


@router.message(CommandStart())
async def cmd_start(message: Message, session: AsyncSession) -> None:
    """Handle /start command."""
    telegram_user = message.from_user
    if not telegram_user:
        return

    user_service = UserService(session)

    # Get or create user in database
    db_user = await user_service.get_or_create_by_telegram(
        telegram_id=telegram_user.id,
        telegram_username=telegram_user.username,
    )

    web_keyboard: InlineKeyboardMarkup | None = None
    if _is_valid_web_url(WEB_URL):
        # Web sahifa havolasi
        web_keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="🌐 Web sahifaga o'tish",
                        url=WEB_URL,
                    ),
                ],
            ]
        )

    # Check if user is registered (has phone and verified)
    if db_user.is_verified and db_user.phone and db_user.phone != "+998000000000":
        # Registered user
        await message.answer(
            f"🎓 <b>Xush kelibsiz, {db_user.first_name}!</b>\n\n"
            f"Telefon: {db_user.phone}\n"
            f"Status: ✅ Ro'yxatdan o'tgan\n\n"
            "Barcha funksiyalardan foydalanishingiz mumkin!",
            reply_markup=get_main_keyboard(),
        )
        await message.answer(
            "🌐 <b>Web sahifa:</b>\n\n"
            "To'liq funksiyalardan foydalanish uchun web sahifamizga kiring:",
        )
    else:
        # Guest user
        await message.answer(
            MESSAGES["welcome"].format(name=telegram_user.first_name),
            reply_markup=get_guest_keyboard(),
        )
        await message.answer(
            "🌐 <b>Web sahifa:</b>\n\n"
            "Ro'yxatdan o'tish va boshqa funksiyalardan foydalanish uchun:",
        )
    if web_keyboard:
        await message.answer(
            "🔗 Web sahifaga o'tish uchun tugmani bosing:",
            reply_markup=web_keyboard,
        )
    else:
        await message.answer(
            "⚠️ Web sahifa havolasi sozlanmagan (yoki localhost). "
            "Admin `.env` faylida `WEB_URL` ni public URL (masalan, ngrok) qilib qo'ysin."
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
async def show_courses(message: Message, session: AsyncSession) -> None:
    """Show available courses."""
    from src.keyboards.student import get_courses_keyboard
    
    # TODO: Ma'lumotlar bazasidan kurslarni olish
    # Hozircha mock ma'lumotlar
    mock_courses = [
        type('Course', (), {'id': '1', 'name': 'Ingliz tili - Boshlang\'ich'}),
        type('Course', (), {'id': '2', 'name': 'Matematika - Abituriyent'}),
        type('Course', (), {'id': '3', 'name': 'Dasturlash asoslari'}),
    ]
    
    await message.answer(
        "📚 <b>Mavjud kurslar:</b>\n\n"
        "Qiziqarli kursni tanlang:",
        reply_markup=get_courses_keyboard(mock_courses),
    )


@router.message(F.text == "📞 Bog'lanish")
async def show_contact(message: Message) -> None:
    """Show contact information."""
    await message.answer(MESSAGES["contact"])


@router.message(F.text == "❓ Yordam")
async def show_help(message: Message) -> None:
    """Show help."""
    await message.answer(MESSAGES["help"])


@router.message(F.text == "🌐 Web sahifa")
async def show_web_link(message: Message) -> None:
    """Show web site link."""
    if not _is_valid_web_url(WEB_URL):
        await message.answer(
            "⚠️ Web sahifa havolasi sozlanmagan (yoki localhost). "
            "Admin `.env` faylida `WEB_URL` ni public URL (masalan, ngrok) qilib qo'ysin."
        )
        return

    web_keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🌐 Web sahifaga o'tish",
                    url=WEB_URL,
                ),
            ],
        ]
    )
    await message.answer(
        "🌐 <b>Web sahifa</b>\n\n"
        "To'liq funksiyalardan foydalanish uchun web sahifamizga kiring:\n"
        "• Kurslarni ko'rish\n"
        "• Dars jadvalini ko'rish\n"
        "• To'lovlar tarixi\n"
        "• Profilni tahrirlash\n\n"
        "Quyidagi tugmani bosing:",
        reply_markup=web_keyboard,
    )

