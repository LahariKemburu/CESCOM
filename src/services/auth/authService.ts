import type { User } from '../../types/auth'
import { mockLogin } from './mockAuthService'

const KEY = 'cescom_session'

// Later, replace mockLogin with a real GraphQL call here.
export async function login(identifier: string, password: string, remember: boolean): Promise<User> {
  const user = await mockLogin(identifier, password)
  const store = remember ? localStorage : sessionStorage
  store.setItem(KEY, JSON.stringify(user))
  return user
}

export function getSession(): User | null {
  const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}