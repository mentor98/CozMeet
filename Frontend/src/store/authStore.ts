import { create } from 'zustand'
import { Profile } from '@/types'

interface AuthStore {
  user: Profile | null
  isAuthenticated: boolean
  setUser: (user: Profile | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))
