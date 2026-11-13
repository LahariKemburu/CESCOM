import { gql } from '@apollo/client'
import type { Role } from '../../types/auth'
import { apolloClient } from '../graphql/client'

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