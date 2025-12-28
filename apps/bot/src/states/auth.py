"""
Authentication states.
"""

from aiogram.fsm.state import State, StatesGroup


class RegistrationStates(StatesGroup):
    """Registration flow states."""

    phone = State()
    first_name = State()
    last_name = State()
    password = State()
    role = State()
    confirmation = State()


class LoginStates(StatesGroup):
    """Login flow states."""

    phone = State()
    verification_code = State()


class PasswordResetStates(StatesGroup):
    """Password reset states."""

    phone = State()
    verification_code = State()
    new_password = State()

