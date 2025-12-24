"""
General helper utilities.
"""

import re
import secrets
import string
import uuid
from typing import Optional

from shared.constants import UZ_PHONE_REGEX


def generate_uuid() -> str:
    """Generate a UUID4 string."""
    return str(uuid.uuid4())


def generate_code(length: int = 6, chars: Optional[str] = None) -> str:
    """
    Generate a random code.

    Args:
        length: Length of the code
        chars: Characters to use (default: digits)

    Returns:
        Random code string
    """
    if chars is None:
        chars = string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


def generate_password(length: int = 12) -> str:
    """Generate a secure random password."""
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    password = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%^&*"),
    ]
    password.extend(secrets.choice(chars) for _ in range(length - 4))
    secrets.SystemRandom().shuffle(password)
    return "".join(password)


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


def slugify(text: str, max_length: int = 100) -> str:
    """
    Convert text to URL-friendly slug.

    Args:
        text: Text to convert
        max_length: Maximum length of slug

    Returns:
        URL-friendly slug
    """
    # Convert to lowercase
    text = text.lower()

    # Replace Cyrillic characters with Latin equivalents
    cyrillic_map = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e",
        "ё": "yo", "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k",
        "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
        "с": "s", "т": "t", "у": "u", "ф": "f", "х": "kh", "ц": "ts",
        "ч": "ch", "ш": "sh", "щ": "shch", "ъ": "", "ы": "y", "ь": "",
        "э": "e", "ю": "yu", "я": "ya", "ў": "o", "қ": "q", "ғ": "g",
        "ҳ": "h",
    }

    for cyrillic, latin in cyrillic_map.items():
        text = text.replace(cyrillic, latin)

    # Replace non-alphanumeric characters with hyphens
    text = re.sub(r"[^a-z0-9]+", "-", text)

    # Remove leading/trailing hyphens
    text = text.strip("-")

    # Truncate to max length
    if len(text) > max_length:
        text = text[:max_length].rsplit("-", 1)[0]

    return text


def truncate(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to specified length.

    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to append if truncated

    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    return text[: max_length - len(suffix)].rsplit(" ", 1)[0] + suffix


def mask_phone(phone: str) -> str:
    """
    Mask phone number for privacy.

    Args:
        phone: Phone number to mask

    Returns:
        Masked phone number (+998 ** *** ** 45)
    """
    formatted = format_phone(phone)
    if len(formatted) >= 13:
        return f"{formatted[:4]} ** *** ** {formatted[-2:]}"
    return formatted


def mask_email(email: str) -> str:
    """
    Mask email for privacy.

    Args:
        email: Email to mask

    Returns:
        Masked email (u***@example.com)
    """
    if "@" not in email:
        return email
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = local[0] + "*"
    else:
        masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
    return f"{masked_local}@{domain}"

