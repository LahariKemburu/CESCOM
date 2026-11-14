import { gql } from '@apollo/client'
import type { Role } from '../../types/auth'
import { apolloClient } from '../graphql/client'

export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE'

export type PendingUser = {
  id: string
  fullName: string
  email: string
  status: string
}

export type ReviewedUser = {
  id: string
  employeeId: string | null
  role: Role
  status: string
}

export type AdminUser = {
  id: string
  fullName: string
  email: string
  employeeId: string | null
  role: Role
  status: UserStatus
}

const PENDING_USERS = gql`
  query PendingUsers {
    pendingUsers {
      id
      fullName
      email
      status
    }
  }
`

const USERS = gql`
  query Users {
    users {
      id
      fullName
      email
      employeeId
      role
      status
    }
  }
`

const APPROVE_USER = gql`
  mutation ApproveUser($id: ID!, $role: Role) {
    approveUser(id: $id, role: $role) {
      id
      employeeId
      role
      status
    }
  }
`

const REJECT_USER = gql`
  mutation RejectUser($id: ID!) {
    rejectUser(id: $id) {
      id
      status
    }
  }
`

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: Role!) {
    updateUserRole(id: $id, role: $role) {
      id
      fullName
      email
      employeeId
      role
      status
    }
  }
`

const SET_USER_ACTIVE = gql`
  mutation SetUserActive($id: ID!, $active: Boolean!) {
    setUserActive(id: $id, active: $active) {
      id
      fullName
      email
      employeeId
      role
      status
    }
  }
`

function toError(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : ''
  if (message === 'Failed to fetch') return new Error('Cannot reach the server. Please try again.')
  return new Error(message || fallback)
}

export async function getPendingUsers(): Promise<PendingUser[]> {
  try {
    const result = await apolloClient.query<{ pendingUsers: PendingUser[] }>({
      query: PENDING_USERS,
      fetchPolicy: 'network-only',
    })
    return result.data?.pendingUsers ?? []
  } catch (err) {
    throw toError(err, 'Could not load requests')
  }
}

export async function getUsers(): Promise<AdminUser[]> {
  try {
    const result = await apolloClient.query<{ users: AdminUser[] }>({
      query: USERS,
      fetchPolicy: 'network-only',
    })
    return result.data?.users ?? []
  } catch (err) {
    throw toError(err, 'Could not load users')
  }
}

export async function approveUser(id: string, role: Role): Promise<ReviewedUser> {
  try {
    const result = await apolloClient.mutate<{ approveUser: ReviewedUser }>({
      mutation: APPROVE_USER,
      variables: { id, role },
    })
    if (!result.data) throw new Error('Approval failed')
    return result.data.approveUser
  } catch (err) {
    throw toError(err, 'Approval failed')
  }
}

export async function rejectUser(id: string): Promise<void> {
  try {
    await apolloClient.mutate({ mutation: REJECT_USER, variables: { id } })
  } catch (err) {
    throw toError(err, 'Rejection failed')
  }
}

export async function updateUserRole(id: string, role: Role): Promise<AdminUser> {
  try {
    const result = await apolloClient.mutate<{ updateUserRole: AdminUser }>({
      mutation: UPDATE_USER_ROLE,
      variables: { id, role },
    })
    if (!result.data) throw new Error('Could not change role')
    return result.data.updateUserRole
  } catch (err) {
    throw toError(err, 'Could not change role')
  }
}

export async function setUserActive(id: string, active: boolean): Promise<AdminUser> {
  try {
    const result = await apolloClient.mutate<{ setUserActive: AdminUser }>({
      mutation: SET_USER_ACTIVE,
      variables: { id, active },
    })
    if (!result.data) throw new Error('Could not update the account')
    return result.data.setUserActive
  } catch (err) {
    throw toError(err, 'Could not update the account')
  }
}