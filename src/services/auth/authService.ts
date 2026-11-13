import { gql } from '@apollo/client'
import type { Role, User } from '../../types/auth'
import { apolloClient } from '../graphql/client'
import { setToken, clearToken } from './tokenStorage'

const KEY = 'cescom_session'

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        fullName
        email
        employeeId
        role
        status
      }
    }
  }
`

const SIGNUP = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      message
    }
  }
`

type LoginResult = {
  login: {
    token: string
    user: {
      id: string
      fullName: string
      email: string
      employeeId: string | null
      role: Role
      status: 'ACTIVE' | 'PENDING'
    }
  }
}

type SignupResult = { signup: { message: string } }

type SignupInput = { fullName: string; email: string; password: string }

function toError(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : ''
  if (message === 'Failed to fetch') return new Error('Cannot reach the server. Please try again.')
  return new Error(message || fallback)
}

export async function login(email: string, password: string, remember: boolean): Promise<User> {
  let payload: LoginResult['login'] | undefined
  try {
    const result = await apolloClient.mutate<LoginResult>({
      mutation: LOGIN,
      variables: { email, password },
    })
    payload = result.data?.login
  } catch (err) {
    throw toError(err, 'Login failed')
  }
  if (!payload) throw new Error('Login failed')

  const u = payload.user
  const user: User = {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    employeeId: u.employeeId ?? '',
    role: u.role,
    status: u.status,
  }

  setToken(payload.token, remember)
  const store = remember ? localStorage : sessionStorage
  store.setItem(KEY, JSON.stringify(user))
  return user
}

export async function signup(input: SignupInput): Promise<string> {
  try {
    const result = await apolloClient.mutate<SignupResult>({
      mutation: SIGNUP,
      variables: { input },
    })
    return result.data?.signup.message ?? ''
  } catch (err) {
    throw toError(err, 'Signup failed')
  }
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
  clearToken()
}