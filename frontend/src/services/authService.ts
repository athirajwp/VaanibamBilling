export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

const demoUser: AuthUser = {
  id: 'u-1',
  name: 'Athi Krishnan',
  email: 'athi@bizflow.local',
  role: 'Owner',
}

export interface AuthResult {
  user: AuthUser | null
  error: string | null
}

export async function login(email: string, _password: string): Promise<AuthResult> {
  await delay(400)
  if (!email.includes('@')) {
    return { user: null, error: 'Enter a valid email address' }
  }
  return { user: { ...demoUser, email }, error: null }
}

export async function logout(): Promise<void> {
  await delay(200)
}

export async function getCurrentUser(): Promise<AuthUser> {
  return demoUser
}

export function hasRole(_user: AuthUser, _role: string): boolean {
  return true
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
