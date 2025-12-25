#!/usr/bin/env python3
"""
User role management script.

Bu script orqali foydalanuvchi rollarini o'zgartirish mumkin.

Foydalanish:
    # Foydalanuvchi rolini ko'rish
    python scripts/manage_user_role.py --phone +998901234567

    # Foydalanuvchi rolini o'zgartirish
    python scripts/manage_user_role.py --phone +998901234567 --role teacher

    # Super admin yaratish
    python scripts/manage_user_role.py --phone +998901234567 --role super_admin

Mavjud rollar:
    - super_admin
    - admin
    - manager
    - teacher
    - student
    - guest
"""

import asyncio
import sys
import argparse
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "packages" / "shared" / "src"))
sys.path.insert(0, str(ROOT_DIR / "packages" / "db" / "src"))
sys.path.insert(0, str(ROOT_DIR / "apps" / "api" / "src"))

from db.session import AsyncSessionLocal
from db.models import User
from shared.constants import UserRole
from shared.utils import format_phone


async def get_user_by_phone(phone: str) -> User | None:
    """Get user by phone number."""
    phone = format_phone(phone)
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(
            select(User).where(User.phone == phone, User.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()


async def update_user_role(phone: str, role: str) -> User:
    """Update user role."""
    phone = format_phone(phone)
    
    # Validate role
    valid_roles = [r.value for r in UserRole]
    if role not in valid_roles:
        raise ValueError(f"Invalid role. Must be one of: {', '.join(valid_roles)}")
    
    async with AsyncSessionLocal() as session:
        user = await get_user_by_phone(phone)
        if not user:
            raise ValueError(f"User with phone {phone} not found")
        
        old_role = user.role
        user.role = role
        await session.commit()
        await session.refresh(user)
        
        print(f"✅ User role updated successfully!")
        print(f"   Phone: {user.phone}")
        print(f"   Name: {user.full_name}")
        print(f"   Old role: {old_role}")
        print(f"   New role: {user.role}")
        
        return user


async def show_user_info(phone: str) -> None:
    """Show user information."""
    user = await get_user_by_phone(phone)
    if not user:
        print(f"❌ User with phone {phone} not found")
        return
    
    print(f"\n📋 User Information:")
    print(f"   ID: {user.id}")
    print(f"   Phone: {user.phone}")
    print(f"   Name: {user.full_name}")
    print(f"   Email: {user.email or 'N/A'}")
    print(f"   Role: {user.role}")
    print(f"   Telegram ID: {user.telegram_id or 'N/A'}")
    print(f"   Telegram Username: @{user.telegram_username}" if user.telegram_username else "   Telegram Username: N/A")
    print(f"   Is Active: {user.is_active}")
    print(f"   Is Verified: {user.is_verified}")
    print(f"   Is Admin: {user.is_admin}")
    print(f"   Is Staff: {user.is_staff}")
    print()


async def list_users_by_role(role: str | None = None) -> None:
    """List users by role."""
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        
        query = select(User).where(User.deleted_at.is_(None))
        if role:
            query = query.where(User.role == role)
        
        result = await session.execute(query)
        users = result.scalars().all()
        
        if not users:
            print(f"❌ No users found" + (f" with role '{role}'" if role else ""))
            return
        
        print(f"\n📋 Users" + (f" with role '{role}'" if role else "") + f" ({len(users)}):")
        print("-" * 80)
        for user in users:
            print(f"   {user.phone:20} | {user.full_name:30} | {user.role:15} | @{user.telegram_username or 'N/A'}")
        print()


async def main():
    parser = argparse.ArgumentParser(
        description="User role management script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Show user info
  python scripts/manage_user_role.py --phone +998901234567

  # Change user role to teacher
  python scripts/manage_user_role.py --phone +998901234567 --role teacher

  # Make user super admin
  python scripts/manage_user_role.py --phone +998901234567 --role super_admin

  # List all teachers
  python scripts/manage_user_role.py --list --role teacher

  # List all users
  python scripts/manage_user_role.py --list
        """
    )
    
    parser.add_argument(
        "--phone",
        type=str,
        help="User phone number (e.g., +998901234567)"
    )
    parser.add_argument(
        "--role",
        type=str,
        choices=[r.value for r in UserRole],
        help="New role to assign"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List users (optionally filtered by role)"
    )
    
    args = parser.parse_args()
    
    if args.list:
        await list_users_by_role(args.role)
    elif args.phone:
        if args.role:
            await update_user_role(args.phone, args.role)
        else:
            await show_user_info(args.phone)
    else:
        parser.print_help()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

