import { createContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/auth'
import * as authService from '../services/auth/authService'

type AuthContextType = {
  user: User | null
  login: (identifier: string, password: string, remember: boolean) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getSession())

  const login = async (identifier: string, password: string, remember: boolean) => {
    const u = await authService.login(identifier, password, remember)
    setUser(u)
    return u
  }

  const logout = () => {
    authService.clearSession()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}