import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { usersApi, authApi } from '@/services/api';
import { 
  User, 
  Phone, 
  Mail, 
  Edit2, 
  Save, 
  X, 
  Shield, 
  MessageSquare,
  Key,
  Loader2,
  Camera,
  Trash2,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
  specialization?: string;
}

interface ChangePasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      specialization: (user as any)?.specialization || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
    watch,
  } = useForm<ChangePasswordForm>();

  const newPassword = watch('new_password');

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'student': return "O'quvchi";
      case 'teacher': return "O'qituvchi";
      case 'admin': return "Administrator";
      case 'super_admin': return "Super Admin";
      default: return role;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'student': return 'bg-blue-500/20 text-blue-400';
      case 'teacher': return 'bg-green-500/20 text-green-400';
      case 'admin': return 'bg-orange-500/20 text-orange-400';
      case 'super_admin': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true);
    try {
      const updatedUser = await usersApi.updateProfile(data);
      setUser({ ...user, ...updatedUser });
      setIsEditing(false);
      toast.success("Ma'lumotlar saqlandi");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    if (data.new_password !== data.confirm_password) {
      toast.error("Yangi parollar mos kelmaydi");
      return;
    }

    setIsSaving(true);
    try {
      await authApi.changePassword(data.current_password, data.new_password);
      resetPassword();
      setIsChangingPassword(false);
      toast.success("Parol muvaffaqiyatli o'zgartirildi");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm fayllari qabul qilinadi');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan kichik bo\'lishi kerak');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await usersApi.uploadAvatar(file);
      if (user) {
        setUser({ ...user, avatar_url: result.avatar_url });
      }
      toast.success('Profil rasmi yangilandi');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Rasm yuklashda xatolik");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    reset({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      specialization: (user as any)?.specialization || '',
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await authApi.deleteAccount();
      toast.success('Hisob muvaffaqiyatli o\'chirildi');
      logout();
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Hisobni o\'chirishda xatolik');
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container-custom max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Profil</h1>

        {/* Main Profile Card */}
        <div className="card mb-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-slate-800">
            <div className="relative group">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                title="Rasm yuklash"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-semibold mb-1">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-slate-400 mb-3">{user?.phone}</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
                <Shield className="w-3.5 h-3.5" />
                {getRoleLabel(user?.role)}
              </span>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary"
              >
                <Edit2 className="w-4 h-4" />
                Tahrirlash
              </button>
            )}
          </div>

          {/* Profile Form / Info */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ism
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      className="input"
                      {...register('first_name', { required: 'Ism kiriting' })}
                    />
                    {errors.first_name && (
                      <p className="text-red-400 text-sm mt-1">{errors.first_name.message}</p>
                    )}
                  </>
                ) : (
                  <p className="py-2.5 text-white">{user?.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Familiya
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      className="input"
                      {...register('last_name', { required: 'Familiya kiriting' })}
                    />
                    {errors.last_name && (
                      <p className="text-red-400 text-sm mt-1">{errors.last_name.message}</p>
                    )}
                  </>
                ) : (
                  <p className="py-2.5 text-white">{user?.last_name}</p>
                )}
              </div>

              {/* Phone (read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1.5" />
                  Telefon raqam
                </label>
                <p className="py-2.5 text-white">{user?.phone}</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1.5" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    className="input"
                    placeholder="email@example.com"
                    {...register('email')}
                  />
                ) : (
                  <p className="py-2.5 text-white">{user?.email || 'Kiritilmagan'}</p>
                )}
              </div>

              {/* Specialization (Teacher only) */}
              {user?.role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mutaxassislik yo'nalishi
                  </label>
                  {isEditing ? (
                    <select
                      className="input"
                      {...register('specialization')}
                    >
                      <option value="">Tanlang</option>
                      <option value="Ingliz tili">Ingliz tili</option>
                      <option value="Rus tili">Rus tili</option>
                      <option value="Matematika">Matematika</option>
                      <option value="Fizika">Fizika</option>
                      <option value="Kimyo">Kimyo</option>
                      <option value="Biologiya">Biologiya</option>
                      <option value="Tarix">Tarix</option>
                      <option value="Geografiya">Geografiya</option>
                      <option value="Informatika">Informatika</option>
                      <option value="Ona tili va adabiyot">Ona tili va adabiyot</option>
                      <option value="Boshqa">Boshqa</option>
                    </select>
                  ) : (
                    <p className="py-2.5 text-white">{(user as any)?.specialization || 'Kiritilmagan'}</p>
                  )}
                </div>
              )}
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  <X className="w-4 h-4" />
                  Bekor qilish
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telegram Connection */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0088cc]/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-[#0088cc]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Telegram</h3>
                {user?.telegram_id ? (
                  <p className="text-sm text-green-400">
                    ✓ Ulangan (ID: {user.telegram_id})
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-slate-400 mb-3">
                      Telegram orqali kirish va bildirishnomalar
                    </p>
                    <a
                      href="https://t.me/uzbektalim_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:underline text-sm"
                    >
                      Telegram botga o'ting →
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Parol</h3>
                {!isChangingPassword ? (
                  <>
                    <p className="text-sm text-slate-400 mb-3">
                      Xavfsizlik uchun parolni o'zgartiring
                    </p>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="text-primary-400 hover:underline text-sm"
                    >
                      Parolni o'zgartirish →
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Joriy parol</label>
                      <input
                        type="password"
                        className="input text-sm"
                        {...registerPassword('current_password', { required: 'Joriy parol kiriting' })}
                      />
                      {passwordErrors.current_password && (
                        <p className="text-red-400 text-xs mt-1">{passwordErrors.current_password.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Yangi parol</label>
                      <input
                        type="password"
                        className="input text-sm"
                        {...registerPassword('new_password', { 
                          required: 'Yangi parol kiriting',
                          minLength: { value: 6, message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' }
                        })}
                      />
                      {passwordErrors.new_password && (
                        <p className="text-red-400 text-xs mt-1">{passwordErrors.new_password.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Parolni tasdiqlash</label>
                      <input
                        type="password"
                        className="input text-sm"
                        {...registerPassword('confirm_password', { 
                          required: 'Parolni tasdiqlang',
                          validate: (value) => value === newPassword || "Parollar mos kelmaydi"
                        })}
                      />
                      {passwordErrors.confirm_password && (
                        <p className="text-red-400 text-xs mt-1">{passwordErrors.confirm_password.message}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Saqlash'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          resetPassword();
                        }}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        Bekor
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="card border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-orange-400">Tizimdan chiqish</h3>
                <p className="text-xs text-slate-400">
                  Joriy seansni yakunlash
                </p>
              </div>
            </div>
            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="btn-secondary border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 text-sm px-3 py-1.5"
              >
                <LogOut className="w-4 h-4" />
                Chiqish
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-orange-400 font-medium mr-2">Tasdiqlaysizmi?</span>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="btn-secondary border-orange-500/50 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:border-orange-500 text-sm px-3 py-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Ha
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn-secondary text-sm px-3 py-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Yo'q
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="card border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-red-400">Xavfli zona</h3>
                <p className="text-xs text-slate-400">
                  Hisobni o'chirish - qaytarib bo'lmaydi
                </p>
              </div>
            </div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-secondary border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200 text-sm px-3 py-1.5"
              >
                <Trash2 className="w-4 h-4" />
                O'chirish
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <p className="text-xs text-red-400 font-medium mb-1">
                    ⚠️ Tasdiqlaysizmi?
                  </p>
                  <p className="text-xs text-slate-400">
                    Barcha ma'lumotlar o'chiladi
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="btn-secondary border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-1.5"
                >
                  {isDeletingAccount ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Ha
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setIsDeletingAccount(false);
                  }}
                  disabled={isDeletingAccount}
                  className="btn-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Yo'q
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
