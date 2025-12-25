import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: string;
  telegram_id?: number;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setToken: (token) =>
        set({ token }),

      setRefreshToken: (refreshToken) =>
        set({ refreshToken }),

      login: (user, token, refreshToken) =>
        set({ 
          user, 
          token, 
          refreshToken: refreshToken || null,
          isAuthenticated: true, 
          isLoading: false 
        }),

      logout: () =>
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
          isAuthenticated: false 
        }),

      setLoading: (isLoading) =>
        set({ isLoading }),
    }),
    {
      name: 'uzbek-talim-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

