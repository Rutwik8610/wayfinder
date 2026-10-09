'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authenticatedFetch, clearAuthSession, readAuthSession, saveAuthSession, type AuthResponse, type AuthSession, type AuthUserResponse } from '../../lib/auth-session'

type AuthContextValue = {
  session: AuthSession | null
  ready: boolean
  login: (response: AuthResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    const expireSession = () => setSession(null)
    window.addEventListener('wayfinder-auth-expired', expireSession)
    async function restoreSession() {
      const storedSession = readAuthSession()
      if (!storedSession) {
        if (active) setReady(true)
        return
      }

      try {
        const response = await authenticatedFetch('/api/auth/me')
        if (!response.ok) {
          clearAuthSession()
          if (active) setSession(null)
          return
        }
        const user = await response.json() as AuthUserResponse
        if (active) setSession({ ...storedSession, ...user })
      } catch (error) {
        console.error('Could not validate the saved authentication session.', error)
        if (active) setSession(storedSession)
      } finally {
        if (active) setReady(true)
      }
    }
    void restoreSession()
    return () => {
      active = false
      window.removeEventListener('wayfinder-auth-expired', expireSession)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    ready,
    login(response) {
      setSession(saveAuthSession(response))
    },
    logout() {
      clearAuthSession()
      setSession(null)
    },
  }), [session, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
