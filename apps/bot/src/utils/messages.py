"""
Bot messages in Uzbek.
"""

MESSAGES = {
    # Welcome
    "welcome": (
        "🎓 <b>Uzbek Ta'lim</b> ga xush kelibsiz, {name}!\n\n"
        "Biz bilan sifatli ta'lim oling.\n\n"
        "📚 Kurslarimiz haqida ma'lumot olish uchun «Kurslar» tugmasini bosing."
    ),

    # Help
    "help": (
        "❓ <b>Yordam</b>\n\n"
        "📚 <b>Kurslar</b> - Mavjud kurslar ro'yxati\n"
        "📝 <b>Ro'yxatdan o'tish</b> - Yangi akkaunt yaratish\n"
        "👤 <b>Profil</b> - Shaxsiy ma'lumotlar\n"
        "📅 <b>Jadval</b> - Dars jadvali\n"
        "💰 <b>To'lovlar</b> - To'lov tarixi\n\n"
        "Savollar uchun: /contact"
    ),

    # About
    "about": (
        "🎓 <b>Uzbek Ta'lim</b>\n\n"
        "Professional ta'lim markazi.\n\n"
        "✅ Sifatli o'qituvchilar\n"
        "✅ Zamonaviy usullar\n"
        "✅ Qulay jadval\n"
        "✅ Arzon narxlar\n\n"
        "Biz bilan muvaffaqiyatga erishing!"
    ),

    # Contact
    "contact": (
        "📞 <b>Bog'lanish</b>\n\n"
        "📍 Manzil: Toshkent shahri\n"
        "📱 Telefon: +998 XX XXX XX XX\n"
        "📧 Email: info@uzbektalim.uz\n\n"
        "🕐 Ish vaqti: 09:00 - 18:00\n"
        "📅 Dam olish: Yakshanba"
    ),

    # Registration
    "registration_start": (
        "📝 <b>Ro'yxatdan o'tish</b>\n\n"
        "Telefon raqamingizni yuboring.\n"
        "Tugmani bosing yoki qo'lda kiriting (+998XXXXXXXXX)."
    ),

    "enter_first_name": (
        "Ismingizni kiriting:"
    ),

    "enter_last_name": (
        "Familiyangizni kiriting:"
    ),

    "invalid_phone": (
        "❌ Noto'g'ri telefon raqam formati.\n"
        "Iltimos, +998XXXXXXXXX formatida kiriting."
    ),

    "registration_confirm": (
        "✅ <b>Ma'lumotlarni tasdiqlang:</b>\n\n"
        "📱 Telefon: {phone}\n"
        "👤 Ism: {first_name}\n"
        "👤 Familiya: {last_name}\n\n"
        "Tasdiqlash uchun «✅ Tasdiqlash» tugmasini bosing."
    ),

    "registration_success": (
        "🎉 <b>Tabriklaymiz!</b>\n\n"
        "Siz muvaffaqiyatli ro'yxatdan o'tdingiz.\n"
        "Endi barcha imkoniyatlardan foydalanishingiz mumkin."
    ),

    # Errors
    "error_general": (
        "❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
    ),

    "error_not_registered": (
        "❌ Siz hali ro'yxatdan o'tmagansiz.\n"
        "Ro'yxatdan o'tish uchun /register buyrug'ini bosing."
    ),

    "error_access_denied": (
        "🚫 Sizda bu amalni bajarish huquqi yo'q."
    ),
}

