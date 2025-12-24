"""
Date and time utilities.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional
import zoneinfo

from shared.constants import DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT


# Uzbekistan timezone
UZ_TIMEZONE = zoneinfo.ZoneInfo("Asia/Tashkent")


def utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.now(timezone.utc)


def local_now(tz: Optional[zoneinfo.ZoneInfo] = None) -> datetime:
    """
    Get current local datetime.

    Args:
        tz: Timezone (default: Asia/Tashkent)

    Returns:
        Current datetime in specified timezone
    """
    tz = tz or UZ_TIMEZONE
    return datetime.now(tz)


def to_local(dt: datetime, tz: Optional[zoneinfo.ZoneInfo] = None) -> datetime:
    """
    Convert datetime to local timezone.

    Args:
        dt: Datetime to convert
        tz: Target timezone (default: Asia/Tashkent)

    Returns:
        Datetime in local timezone
    """
    tz = tz or UZ_TIMEZONE
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(tz)


def to_utc(dt: datetime) -> datetime:
    """
    Convert datetime to UTC.

    Args:
        dt: Datetime to convert

    Returns:
        Datetime in UTC
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UZ_TIMEZONE)
    return dt.astimezone(timezone.utc)


def format_datetime(
    dt: datetime,
    fmt: str = DATETIME_FORMAT,
    to_local_tz: bool = True,
) -> str:
    """
    Format datetime to string.

    Args:
        dt: Datetime to format
        fmt: Format string
        to_local_tz: Convert to local timezone first

    Returns:
        Formatted datetime string
    """
    if to_local_tz:
        dt = to_local(dt)
    return dt.strftime(fmt)


def format_date(dt: datetime, to_local_tz: bool = True) -> str:
    """Format datetime to date string."""
    return format_datetime(dt, DATE_FORMAT, to_local_tz)


def format_time(dt: datetime, to_local_tz: bool = True) -> str:
    """Format datetime to time string."""
    return format_datetime(dt, TIME_FORMAT, to_local_tz)


def parse_datetime(
    dt_str: str,
    fmt: str = DATETIME_FORMAT,
    assume_local: bool = True,
) -> datetime:
    """
    Parse datetime from string.

    Args:
        dt_str: Datetime string
        fmt: Format string
        assume_local: Assume local timezone if no timezone info

    Returns:
        Parsed datetime
    """
    dt = datetime.strptime(dt_str, fmt)
    if dt.tzinfo is None and assume_local:
        dt = dt.replace(tzinfo=UZ_TIMEZONE)
    return dt


def parse_date(date_str: str) -> datetime:
    """Parse date from string."""
    return parse_datetime(date_str, DATE_FORMAT)


def get_start_of_day(dt: Optional[datetime] = None) -> datetime:
    """Get start of day (00:00:00)."""
    dt = dt or local_now()
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def get_end_of_day(dt: Optional[datetime] = None) -> datetime:
    """Get end of day (23:59:59)."""
    dt = dt or local_now()
    return dt.replace(hour=23, minute=59, second=59, microsecond=999999)


def get_start_of_week(dt: Optional[datetime] = None) -> datetime:
    """Get start of week (Monday)."""
    dt = dt or local_now()
    start = dt - timedelta(days=dt.weekday())
    return get_start_of_day(start)


def get_start_of_month(dt: Optional[datetime] = None) -> datetime:
    """Get start of month."""
    dt = dt or local_now()
    return get_start_of_day(dt.replace(day=1))


def get_age(birth_date: datetime) -> int:
    """
    Calculate age from birth date.

    Args:
        birth_date: Date of birth

    Returns:
        Age in years
    """
    today = local_now().date()
    birth = birth_date.date() if isinstance(birth_date, datetime) else birth_date
    age = today.year - birth.year
    if (today.month, today.day) < (birth.month, birth.day):
        age -= 1
    return age


def humanize_timedelta(td: timedelta) -> str:
    """
    Convert timedelta to human-readable string.

    Args:
        td: Timedelta to convert

    Returns:
        Human-readable string (e.g., "2 kun", "3 soat")
    """
    total_seconds = int(td.total_seconds())

    if total_seconds < 60:
        return f"{total_seconds} soniya"
    elif total_seconds < 3600:
        minutes = total_seconds // 60
        return f"{minutes} daqiqa"
    elif total_seconds < 86400:
        hours = total_seconds // 3600
        return f"{hours} soat"
    else:
        days = total_seconds // 86400
        return f"{days} kun"

