"""
Student handlers - courses, schedule, payments.
"""

from urllib.parse import urlparse

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)
from sqlalchemy.ext.asyncio import AsyncSession

from shared import get_settings
from src.keyboards.student import (
    get_courses_keyboard,
    get_schedule_keyboard,
)
from src.filters.auth import RegisteredUserFilter
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
    if parsed.hostname == "localhost":
        return False
    return True


router = Router(name="student")
router.message.filter(RegisteredUserFilter())


@router.message(F.text == "👤 Mening profilim")
@router.message(Command("profile"))
async def show_profile(message: Message, session: AsyncSession) -> None:
    """Show user profile."""
    telegram_user = message.from_user
    if not telegram_user:
        return

    user_service = UserService(session)

    # Get user from database
    db_user = await user_service.get_user_by_telegram_id(telegram_user.id)

    if not db_user:
        await message.answer(
            "❌ Profil topilmadi. Iltimos, ro'yxatdan o'ting.",
        )
        return

    web_keyboard: InlineKeyboardMarkup | None = None
    if _is_valid_web_url(WEB_URL):
        profile_url = f"{WEB_URL.rstrip('/')}/profile"
        web_keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="🌐 Web sahifada profilni tahrirlash",
                        url=profile_url,
                    ),
                ],
            ]
        )

    username = telegram_user.username or "yo'q"
    status_text = "Ro'yxatdan o'tgan" if db_user.is_verified else "Tasdiqlanmagan"
    text = (
        f"👤 <b>Sizning profilingiz:</b>\n\n"
        f"📱 Telefon: {db_user.phone}\n"
        f"👤 Ism: {db_user.first_name} {db_user.last_name}\n"
        f"📱 Telegram: @{username}\n"
        f"🆔 ID: {telegram_user.id}\n"
        f"✅ Status: {status_text}\n\n"
        "Profilingizni to'ldirish uchun web ilovaga kiring:"
    )
    if web_keyboard:
        await message.answer(text, reply_markup=web_keyboard)
    else:
        await message.answer(
            text
            + "\n\n⚠️ Web sahifa havolasi sozlanmagan (yoki localhost). "
            "Admin `.env` faylida `WEB_URL` ni public URL (masalan, ngrok) qilib qo'ysin."
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
    if not callback.message:
        await callback.answer()
        return

    course_id = callback.data.split("_")[1]

    # TODO: Ma'lumotlar bazasidan kurs olish
    # Hozircha mock ma'lumotlar
    mock_courses = {
        '1': {
            'name': "Ingliz tili - Boshlang'ich",
            'description': "Ingliz tilini noldan o'rganing",
            'price': '500,000',
            'duration': '3 oy',
            'schedule': 'Dush, Chor, Juma - 15:00',
        },
        '2': {
            'name': 'Matematika - Abituriyent',
            'description': "DTM tayyorlov kursi",
            'price': '400,000',
            'duration': '4 oy',
            'schedule': 'Sesh, Pay, Shan - 10:00',
        },
        '3': {
            'name': 'Dasturlash asoslari',
            'description': "Python dasturlash tilini o'rganing",
            'price': '600,000',
            'duration': '3 oy',
            'schedule': 'Dush, Chor - 18:00',
        },
    }
    
    course = mock_courses.get(course_id, {
        'name': f'Kurs #{course_id}',
        'description': "Ma'lumot mavjud emas",
        'price': '-',
        'duration': '-',
        'schedule': '-',
    })

    # Web sahifaga havola
    enroll_keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📝 Kursga yozilish",
                    callback_data=f"enroll_{course_id}",
                ),
            ],
            [
                InlineKeyboardButton(
                    text="📞 Qo'ng'iroq qilish",
                    callback_data="contact_call",
                ),
            ],
            [
                InlineKeyboardButton(
                    text="⬅️ Orqaga",
                    callback_data="back_to_courses",
                ),
            ],
        ]
    )
    
    if _is_valid_web_url(WEB_URL):
        enroll_keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="🌐 Web sahifada ko'rish",
                        url=f"{WEB_URL.rstrip('/')}/courses",
                    ),
                ],
                [
                    InlineKeyboardButton(
                        text="📝 Kursga yozilish",
                        callback_data=f"enroll_{course_id}",
                    ),
                ],
                [
                    InlineKeyboardButton(
                        text="⬅️ Orqaga",
                        callback_data="back_to_courses",
                    ),
                ],
            ]
        )

    await callback.message.edit_text(
        f"📚 <b>{course['name']}</b>\n\n"
        f"📝 {course['description']}\n\n"
        f"💰 Narxi: {course['price']} so'm/oy\n"
        f"⏱ Davomiyligi: {course['duration']}\n"
        f"📅 Jadval: {course['schedule']}\n\n"
        f"Kursga yozilish uchun quyidagi tugmani bosing:",
        reply_markup=enroll_keyboard,
    )
    await callback.answer()


@router.callback_query(F.data == "back_to_courses")
async def back_to_courses(callback: CallbackQuery) -> None:
    """Back to courses list."""
    if not callback.message:
        await callback.answer()
        return

    # Mock kurslar
    mock_courses = [
        type('Course', (), {'id': '1', 'name': 'Ingliz tili - Boshlang\'ich'}),
        type('Course', (), {'id': '2', 'name': 'Matematika - Abituriyent'}),
        type('Course', (), {'id': '3', 'name': 'Dasturlash asoslari'}),
    ]

    await callback.message.edit_text(
        "📚 <b>Mavjud kurslar:</b>\n\n"
        "Qiziqarli kursni tanlang:",
        reply_markup=get_courses_keyboard(mock_courses),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("enroll_"))
async def enroll_course(callback: CallbackQuery, session: AsyncSession) -> None:
    """Handle course enrollment request."""
    if not callback.message or not callback.from_user:
        await callback.answer()
        return

    course_id = callback.data.split("_")[1]
    
    user_service = UserService(session)
    db_user = await user_service.get_user_by_telegram_id(callback.from_user.id)
    
    if not db_user or not db_user.is_verified:
        # Ro'yxatdan o'tmagan foydalanuvchi
        await callback.message.edit_text(
            "📝 <b>Kursga yozilish</b>\n\n"
            "Kursga yozilish uchun avval ro'yxatdan o'tishingiz kerak.\n\n"
            "Quyidagi tugmani bosib ro'yxatdan o'ting:",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [
                        InlineKeyboardButton(
                            text="📝 Ro'yxatdan o'tish",
                            callback_data="start_registration",
                        ),
                    ],
                    [
                        InlineKeyboardButton(
                            text="⬅️ Orqaga",
                            callback_data="back_to_courses",
                        ),
                    ],
                ]
            ),
        )
    else:
        # Ro'yxatdan o'tgan foydalanuvchi
        await callback.message.edit_text(
            "✅ <b>Ajoyib tanlov!</b>\n\n"
            f"Siz kursga yozilish uchun ariza qoldiryapsiz.\n\n"
            f"👤 Ism: {db_user.first_name} {db_user.last_name}\n"
            f"📱 Telefon: {db_user.phone}\n\n"
            "Tez orada menejerimiz siz bilan bog'lanadi!\n\n"
            "Yoki o'zingiz qo'ng'iroq qilishingiz mumkin:\n"
            "📞 +998 XX XXX XX XX",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [
                        InlineKeyboardButton(
                            text="⬅️ Kurslarga qaytish",
                            callback_data="back_to_courses",
                        ),
                    ],
                ]
            ),
        )
        # TODO: Database'ga enrollment yozish
        
    await callback.answer()


@router.callback_query(F.data == "contact_call")
async def contact_call(callback: CallbackQuery) -> None:
    """Show contact phone number."""
    await callback.answer("📞 +998 XX XXX XX XX", show_alert=True)


@router.callback_query(F.data == "no_courses")
async def no_courses_callback(callback: CallbackQuery) -> None:
    """Handle no courses available."""
    await callback.answer("Kurslar tez orada qo'shiladi!", show_alert=True)

