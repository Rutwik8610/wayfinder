'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, session } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (!ready) return

    if (isLoginPage && session) {
      router.replace('/')
    } else if (!isLoginPage && !session) {
      router.replace('/login')
    }
  }, [ready, session, isLoginPage, router])

  if (!ready || (isLoginPage ? Boolean(session) : !session)) {
    return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Checking your session…</main>
  }

  return children
}
