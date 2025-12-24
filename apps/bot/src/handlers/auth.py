"""
Authentication handlers - registration, login.
"""

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from src.states.auth import RegistrationStates, LoginStates
from src.keyboards.auth import (
    get_phone_keyboard,
    get_cancel_keyboard,
)
from src.keyboards.main import get_main_keyboard
from src.utils.messages import MESSAGES
from src.utils.validators import validate_phone, format_phone


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
    last_name = message.text.strip()

    if len(last_name) < 2:
        await message.answer("Familiya kamida 2 ta harfdan iborat bo'lishi kerak.")
        return

    await state.update_data(last_name=last_name)
    await state.set_state(RegistrationStates.confirmation)

    # Show confirmation
    data = await state.get_data()
    await message.answer(
        MESSAGES["registration_confirm"].format(
            phone=data["phone"],
            first_name=data["first_name"],
            last_name=last_name,
        ),
    )


@router.message(RegistrationStates.confirmation, F.text == "✅ Tasdiqlash")
async def confirm_registration(message: Message, state: FSMContext) -> None:
    """Confirm registration."""
    data = await state.get_data()

    # TODO: Save user to database
    # user = await create_user(
    #     phone=data["phone"],
    #     first_name=data["first_name"],
    #     last_name=data["last_name"],
    #     telegram_id=message.from_user.id,
    # )

    await state.clear()
    await message.answer(
        MESSAGES["registration_success"],
        reply_markup=get_main_keyboard(),
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

