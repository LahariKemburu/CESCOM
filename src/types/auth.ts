export type Role = 'ADMIN' | 'WAREHOUSE_MANAGER' | 'EMPLOYEE'

export type User = {
  id: string
  fullName: string
  employeeId: string
  email: string
  role: Role
  status: 'ACTIVE' | 'PENDING'
}