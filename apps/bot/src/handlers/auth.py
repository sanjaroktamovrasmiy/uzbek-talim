"""
Authentication handlers - registration, login.
"""

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from sqlalchemy.ext.asyncio import AsyncSession

from src.states.auth import RegistrationStates
from src.keyboards.auth import (
    get_phone_keyboard,
    get_cancel_keyboard,
    get_confirm_keyboard,
    get_role_keyboard,
)
from src.keyboards.main import get_main_keyboard
from src.utils.messages import MESSAGES
from src.utils.validators import validate_phone, format_phone
from src.services.user_service import UserService


router = Router(name="auth")


# ===========================================
# Registration
# ===========================================


@router.message(F.text == "📝 Ro'yxatdan o'tish")
@router.message(Command("register"))
async def start_registration(message: Message, state: FSMContext) -> None:
    """Start registration process."""
    await state.set_state(RegistrationStates.phone)
    await message.answer(
        MESSAGES["registration_start"],
        reply_markup=get_phone_keyboard(),
    )


@router.message(RegistrationStates.phone, F.contact)
async def process_phone_contact(message: Message, state: FSMContext) -> None:
    """Process phone from contact."""
    if not message.contact:
        await message.answer(MESSAGES["invalid_phone"])
        return

    phone = message.contact.phone_number
    await state.update_data(phone=format_phone(phone))
    await state.set_state(RegistrationStates.first_name)
    await message.answer(
        MESSAGES["enter_first_name"],
        reply_markup=get_cancel_keyboard(),
    )


@router.message(RegistrationStates.phone)
async def process_phone_text(message: Message, state: FSMContext) -> None:
    """Process phone from text."""
    if not message.text:
        await message.answer(MESSAGES["invalid_phone"])
        return

    phone = message.text

    if not validate_phone(phone):
        await message.answer(MESSAGES["invalid_phone"])
        return

    await state.update_data(phone=format_phone(phone))
    await state.set_state(RegistrationStates.first_name)
    await message.answer(
        MESSAGES["enter_first_name"],
        reply_markup=get_cancel_keyboard(),
    )


@router.message(RegistrationStates.first_name)
async def process_first_name(message: Message, state: FSMContext) -> None:
    """Process first name."""
    if not message.text:
        await message.answer("Ismni matn ko'rinishida yuboring.")
        return

    first_name = message.text.strip()

    if len(first_name) < 2:
        await message.answer("Ism kamida 2 ta harfdan iborat bo'lishi kerak.")
        return

    await state.update_data(first_name=first_name)
    await state.set_state(RegistrationStates.last_name)
    await message.answer(MESSAGES["enter_last_name"])


@router.message(RegistrationStates.last_name)
async def process_last_name(message: Message, state: FSMContext) -> None:
    """Process last name."""
    if not message.text:
        await message.answer("Familiyani matn ko'rinishida yuboring.")
        return

    last_name = message.text.strip()

    if len(last_name) < 2:
        await message.answer("Familiya kamida 2 ta harfdan iborat bo'lishi kerak.")
        return

    await state.update_data(last_name=last_name)
    await state.set_state(RegistrationStates.password)
    await message.answer(
        "🔐 <b>Parol yarating:</b>\n\n"
        "Parol kamida 6 ta belgidan iborat bo'lishi kerak.\n"
        "Parolni yaxshi eslab qoling, chunki u web sahifaga kirish uchun kerak bo'ladi.",
        reply_markup=get_cancel_keyboard(),
    )


@router.message(RegistrationStates.password)
async def process_password(message: Message, state: FSMContext) -> None:
    """Process password."""
    if not message.text:
        await message.answer("Parolni matn ko'rinishida yuboring.")
        return

    password = message.text.strip()

    if len(password) < 6:
        await message.answer("Parol kamida 6 ta belgidan iborat bo'lishi kerak.")
        return

    await state.update_data(password=password)
    await state.set_state(RegistrationStates.role)
    await message.answer(
        "👤 <b>Men kimman?</b>\n\n"
        "Iltimos, o'zingizning rolini tanlang:",
        reply_markup=get_role_keyboard(),
    )


@router.message(RegistrationStates.role)
async def process_role(message: Message, state: FSMContext) -> None:
    """Process role selection."""
    if not message.text:
        await message.answer(
            "❌ Rolni tanlang. Iltimos, quyidagilardan birini tanlang:",
            reply_markup=get_role_keyboard(),
        )
        return

    role_text = message.text.strip()
    role = None

    # Check for student role
    if "O'quvchi" in role_text or "👨‍🎓" in role_text or "oquvchi" in role_text.lower():
        role = "student"
    # Check for teacher role
    elif "Ustoz" in role_text or "👨‍🏫" in role_text or "ustoz" in role_text.lower() or "o'qituvchi" in role_text.lower():
        role = "teacher"
    else:
        await message.answer(
            "❌ Noto'g'ri tanlov. Iltimos, quyidagilardan birini tanlang:",
            reply_markup=get_role_keyboard(),
        )
        return

    await state.update_data(role=role)
    await state.set_state(RegistrationStates.confirmation)

    # Show confirmation
    data = await state.get_data()
    role_label = "O'quvchi" if role == "student" else "Ustoz"
    await message.answer(
        MESSAGES["registration_confirm"].format(
            phone=data["phone"],
            first_name=data["first_name"],
            last_name=data["last_name"],
        ) + f"\n\n🔐 Parol: {'*' * len(data['password'])}\n"
        f"👤 Rol: {role_label}",
        reply_markup=get_confirm_keyboard(),
    )


@router.message(RegistrationStates.confirmation, F.text == "✅ Tasdiqlash")
async def confirm_registration(
    message: Message,
    state: FSMContext,
    session: AsyncSession,
) -> None:
    """Confirm registration."""
    if not message.from_user:
        return

    data = await state.get_data()
    user_service = UserService(session)

    try:
        # Check if phone already exists (bitta raqamga bitta account)
        from src.repositories.user_repository import UserRepository
        repo = UserRepository(session)
        existing = await repo.get_by_phone(data["phone"])
        if existing and existing.telegram_id != message.from_user.id:
            await message.answer(
                "❌ Bu telefon raqam allaqachon ro'yxatdan o'tgan.\n"
                "Bitta raqamga faqat bitta account yaratish mumkin.\n\n"
                "Agar bu sizning raqamingiz bo'lsa, web sahifaga kiring va kirish qiling.",
            )
            await state.clear()
            return

        # Save user to database with password
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Get role from state data, default to student
        role = data.get("role", "student")
        
        user = await user_service.register_user(
            telegram_id=message.from_user.id,
            phone=data["phone"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            telegram_username=message.from_user.username,
            role=role,
        )
        
        # Update password if provided
        if "password" in data:
            password_hash = pwd_context.hash(data["password"])
            await repo.update(user, password_hash=password_hash)

        await state.clear()
        await message.answer(
            MESSAGES["registration_success"] + "\n\n"
            "✅ Web sahifaga kirish uchun parolingizni ishlatishingiz mumkin.",
            reply_markup=get_main_keyboard(),
        )
    except ValueError as e:
        await message.answer(
            f"❌ Xatolik: {str(e)}\n\n"
            "Iltimos, boshqa telefon raqam kiriting yoki admin bilan bog'laning.",
        )
    except Exception as e:
        await message.answer(
            f"❌ Xatolik yuz berdi: {str(e)}\n\n"
            "Iltimos, qaytadan urinib ko'ring yoki admin bilan bog'laning.",
        )


# ===========================================
# Cancel
# ===========================================


@router.message(F.text == "❌ Bekor qilish")
async def cancel_action(message: Message, state: FSMContext) -> None:
    """Cancel current action."""
    current_state = await state.get_state()

    if current_state:
        await state.clear()
        await message.answer(
            "Amal bekor qilindi.",
            reply_markup=get_main_keyboard(),
        )
    else:
        await message.answer("Hech qanday amal bajarilmayapti.")

