export type AuthResponse = {
  id: number
  name: string
  email: string
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export type AuthSession = {
  id: number
  name: string
  email: string
  accessToken: string
  expiresAt: number
}

export type AuthUserResponse = Pick<AuthSession, 'id' | 'name' | 'email'>

const sessionKey = 'wayfinder-auth-session'

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export function saveAuthSession(response: AuthResponse): AuthSession {
  const session: AuthSession = {
    id: response.id,
    name: response.name,
    email: response.email,
    accessToken: response.accessToken,
    expiresAt: Date.now() + response.expiresIn * 1000,
  }
  sessionStorage.setItem(sessionKey, JSON.stringify(session))
  return session
}

export function readAuthSession(): AuthSession | null {
  const storedSession = sessionStorage.getItem(sessionKey)
  if (!storedSession) return null

  try {
    const session = JSON.parse(storedSession) as AuthSession
    if (
      typeof session.id !== 'number'
      || typeof session.name !== 'string'
      || typeof session.email !== 'string'
      || typeof session.accessToken !== 'string'
      || typeof session.expiresAt !== 'number'
      || session.expiresAt <= Date.now()
    ) {
      sessionStorage.removeItem(sessionKey)
      return null
    }
    return session
  } catch {
    sessionStorage.removeItem(sessionKey)
    return null
  }
}

export function clearAuthSession() {
  sessionStorage.removeItem(sessionKey)
}

export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  const session = readAuthSession()
  if (!session) throw new Error('A valid signed-in session is required.')

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${session.accessToken}`)
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers })
  if (response.status === 401) {
    clearAuthSession()
    window.dispatchEvent(new Event('wayfinder-auth-expired'))
  }
  return response
}
