# Scripts Qo'llanmasi

## 👤 Foydalanuvchi Rollarini Boshqarish

### Tez boshlash:

```bash
# Virtual environment aktiv qiling
cd /home/ubuntu/uzbek-talim
source .venv/bin/activate

# Foydalanuvchi ma'lumotlarini ko'rish
python scripts/manage_user_role.py --phone +998901234567

# Teacher rolini berish
python scripts/manage_user_role.py --phone +998901234567 --role teacher

# Super Admin qilish
python scripts/manage_user_role.py --phone +998901234567 --role super_admin
```

Batafsil ma'lumot uchun: `/home/ubuntu/uzbek-talim/ROLE_MANAGEMENT.md`

