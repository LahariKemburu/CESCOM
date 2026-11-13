import type { User } from '../../types/auth'

type MockUser = User & { password: string }

const MOCK_USERS: MockUser[] = [
  { id: '1', fullName: 'Admin User', employeeId: 'EMP001', email: 'admin@cescom.com', password: 'Admin@123', role: 'ADMIN', status: 'ACTIVE' },
  { id: '2', fullName: 'Warehouse Manager', employeeId: 'EMP002', email: 'manager@cescom.com', password: 'Manager@123', role: 'WAREHOUSE_MANAGER', status: 'ACTIVE' },
  { id: '3', fullName: 'Field Employee', employeeId: 'EMP003', email: 'employee@cescom.com', password: 'Employee@123', role: 'EMPLOYEE', status: 'ACTIVE' },
]

export function mockLogin(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase()
      const found = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === normalizedEmail && u.password === password,
      )
      if (!found) return reject(new Error('Invalid email or password'))
      if (found.status === 'PENDING') return reject(new Error('Your account is awaiting administrator approval'))
      resolve({
        id: found.id,
        fullName: found.fullName,
        employeeId: found.employeeId,
        email: found.email,
        role: found.role,
        status: found.status,
      })
    }, 800)
  })
}