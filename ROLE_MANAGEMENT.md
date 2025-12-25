# 👤 Foydalanuvchi Rollarini Boshqarish

Bu qo'llanma tizimda rollarni qanday aniqlash va o'zgartirishni ko'rsatadi.

## 📋 Tizimda 2 xil rollarni aniqlash usuli bor:

### 1. **Telegram Bot uchun** (`.env` fayli)
Telegram bot orqali kirgan foydalanuvchilar uchun `.env` faylida `TELEGRAM_ADMIN_IDS` maydoni bor.

### 2. **Database'da** (Asosiy rol tizimi)
Har bir foydalanuvchi database'da `role` maydoniga ega.

---

## 🚀 Qanday ishlatish?

### **Variant 1: Script orqali (Tavsiya etiladi)**

```bash
# 1. Foydalanuvchi ma'lumotlarini ko'rish
python scripts/manage_user_role.py --phone +998901234567

# 2. Foydalanuvchi rolini o'zgartirish (masalan, teacher)
python scripts/manage_user_role.py --phone +998901234567 --role teacher

# 3. Super admin qilish
python scripts/manage_user_role.py --phone +998901234567 --role super_admin

# 4. Barcha teacher'larni ko'rish
python scripts/manage_user_role.py --list --role teacher

# 5. Barcha foydalanuvchilarni ko'rish
python scripts/manage_user_role.py --list
```

### **Variant 2: Database to'g'ridan-to'g'ri**

```sql
-- Foydalanuvchi rolini ko'rish
SELECT phone, first_name, last_name, role FROM users WHERE phone = '+998901234567';

-- Foydalanuvchi rolini o'zgartirish
UPDATE users SET role = 'teacher' WHERE phone = '+998901234567';

-- Super admin qilish
UPDATE users SET role = 'super_admin' WHERE phone = '+998901234567';
```

### **Variant 3: API orqali** (Agar admin bo'lsangiz)

```bash
# Token olish
TOKEN=$(curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=+998901234567&password=your_password" | jq -r '.access_token')

# Foydalanuvchi rolini o'zgartirish
curl -X PATCH "http://localhost:8000/api/v1/users/{user_id}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "teacher"}'
```

---

## 📝 Mavjud Rollar

| Rol | Kod | Tavsif |
|-----|-----|--------|
| Super Admin | `super_admin` | Butun tizimni boshqaradi |
| Admin | `admin` | Ma'muriy vazifalar |
| Manager | `manager` | Operatsion boshqaruv |
| Teacher | `teacher` | O'qituvchi - dars o'tadi |
| Student | `student` | Talaba/O'quvchi (default) |
| Guest | `guest` | Ro'yxatdan o'tmagan |

---

## 🎯 Misollar

### **Teacher rolida kirish uchun:**

1. Avval foydalanuvchi ro'yxatdan o'tishi kerak (Telegram bot orqali yoki Web)
2. Keyin rolini o'zgartirish:

```bash
python scripts/manage_user_role.py --phone +998901234567 --role teacher
```

3. Botni qayta ishga tushirish (agar kerak bo'lsa)
4. Endi Telegram bot orqali teacher funksiyalariga kirish mumkin

### **Super Admin qilish uchun:**

```bash
python scripts/manage_user_role.py --phone +998901234567 --role super_admin
```

**Eslatma:** Super Admin bo'lish uchun `.env` faylida ham `TELEGRAM_ADMIN_IDS` ga Telegram ID qo'shish kerak (agar Telegram bot orqali ishlatmoqchi bo'lsangiz).

---

## ⚠️ Muhim Eslatmalar

1. **Telegram Bot uchun:** `.env` faylida `TELEGRAM_ADMIN_IDS` maydoni Telegram ID'larni tekshiradi
2. **Web/API uchun:** Database'dagi `role` maydoni asosiy rol tizimi
3. **Ikkalasini ham sozlash kerak:** Agar Telegram bot va Web panel ikkalasini ham ishlatmoqchi bo'lsangiz

---

## 🔍 Foydalanuvchi holatini tekshirish

```bash
# Foydalanuvchi ma'lumotlarini ko'rish
python scripts/manage_user_role.py --phone +998901234567
```

Bu quyidagilarni ko'rsatadi:
- Foydalanuvchi ID
- Telefon raqami
- Ism familiya
- Rol
- Telegram ID va username
- Aktiv/Verifikatsiya holati
- Admin/Staff holati

---

## 🛠️ Muammo hal qilish

**Muammo:** Script ishlamayapti
```bash
# Virtual environment aktiv qiling
source .venv/bin/activate

# Yoki to'g'ridan-to'g'ri
cd /home/ubuntu/uzbek-talim
source .venv/bin/activate
python scripts/manage_user_role.py --help
```

**Muammo:** Foydalanuvchi topilmayapti
- Telefon raqamini to'g'ri formatda kiriting: `+998901234567`
- Foydalanuvchi ro'yxatdan o'tganligini tekshiring

**Muammo:** Rol o'zgarmayapti
- Database'ga ulanishni tekshiring
- Botni qayta ishga tushiring (agar kerak bo'lsa)

