"""
Input validators.
"""

import re

from shared.constants import UZ_PHONE_REGEX


def validate_phone(phone: str) -> bool:
    """
    Validate Uzbek phone number.

    Args:
        phone: Phone number to validate

    Returns:
        True if valid, False otherwise
    """
    formatted = format_phone(phone)
    return bool(re.match(UZ_PHONE_REGEX, formatted))


def format_phone(phone: str) -> str:
    """
    Format phone number to standard format.

    Args:
        phone: Phone number in any format

    Returns:
        Formatted phone number (+998XXXXXXXXX)
    """
    # Remove all non-digit characters
    digits = re.sub(r"\D", "", phone)

    # Handle different formats
    if digits.startswith("998"):
        return f"+{digits}"
    elif digits.startswith("8") and len(digits) == 10:
        return f"+998{digits[1:]}"
    elif len(digits) == 9:
        return f"+998{digits}"

    return f"+{digits}"

