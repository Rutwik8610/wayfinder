'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { apiBaseUrl, type AuthResponse } from '../../lib/auth-session'
import { useAuth } from '../../components/auth/auth-provider'

export function TourismAuth({ initialMode = 'register' }: { initialMode?: 'login' | 'register' }) {
  const { t } = useAppSettings()
  const { login } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      ...(mode === 'register' ? { name: String(formData.get('name') ?? '') } : {}),
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as AuthResponse & { detail?: string; message?: string }

      if (!response.ok) {
        setErrorMessage(
          result.detail ||
            result.message ||
            (mode === 'register' ? t('auth.registrationFailed') : t('auth.invalidCredentials'))
        )
        return
      }

      login(result)
      router.replace('/')
    } catch {
      setErrorMessage(t('auth.connectionError'))
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(nextMode: 'login' | 'register') {
    setMode(nextMode)
    setErrorMessage('')
  }

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* Visual Hero Panel (Desktop) */}
      <section className="relative hidden min-h-screen overflow-hidden bg-muted lg:block" aria-label="Explore the world">
        <Image
          src="/images/hero-dolomites.png"
          alt="Scenic alpine destination"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

        <div className="absolute left-10 top-10 flex items-center gap-2.5 text-sm font-semibold tracking-wider text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Compass className="size-5" />
          </span>
          <span className="font-serif text-xl font-bold tracking-tight">Wayfinder</span>
        </div>

        <div className="absolute bottom-16 left-10 right-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary backdrop-blur-md">
            {t('auth.heroEyebrow') || 'AI-Powered Tourism & Exploration'}
          </span>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-tight text-foreground text-balance">
            {t('auth.heroTitle') || 'Discover places that leave lasting memories.'}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t('auth.heroIntro') || 'Plan custom itineraries, navigate with live direction maps, and budget accurately with real-time web intelligence.'}
          </p>
        </div>
      </section>

      {/* Auth Form Panel */}
      <section className="flex min-h-screen flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
        {/* Top Bar with Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>{t('common.backHome') || 'Back to Home'}</span>
          </Link>

          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="size-4" />
            </span>
            <span className="font-serif font-bold text-sm">Wayfinder</span>
          </Link>
        </div>

        {/* Centered Form Container */}
        <div className="mx-auto w-full max-w-md py-8">
          {/* Mode Switcher Tabs */}
          <div className="mb-8 grid grid-cols-2 rounded-2xl border border-border bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-xl py-2.5 text-xs font-bold transition ${
                mode === 'login'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.login') || 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`rounded-xl py-2.5 text-xs font-bold transition ${
                mode === 'register'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.register') || 'Create Account'}
            </button>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
              {mode === 'register' ? t('auth.registerTitle') : t('auth.loginTitle')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {mode === 'register' ? t('auth.registerIntro') : t('auth.loginIntro')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-foreground">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={120}
                    placeholder="e.g. Alex Morgan"
                    className="auth-input pl-11"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-foreground">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@example.com"
                  className="auth-input pl-11"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-foreground">
                  {t('auth.password')}
                </label>
                {mode === 'login' && (
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    {t('auth.forgot')}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                  minLength={mode === 'register' ? 6 : undefined}
                  maxLength={mode === 'register' ? 72 : undefined}
                  placeholder={t('auth.passwordHint') || '••••••••'}
                  className="auth-input pl-11 pr-11"
                />
                <button
                  type="button"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 grid h-full w-11 place-items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <label className="flex items-start gap-2.5 pt-1 text-xs leading-5 text-muted-foreground">
                <input type="checkbox" required className="mt-0.5 size-4 rounded accent-primary" />
                <span>
                  {t('auth.termsIntro')}{' '}
                  <span className="font-semibold text-foreground underline underline-offset-2">
                    {t('auth.terms')}
                  </span>{' '}
                  {t('auth.and')}{' '}
                  <span className="font-semibold text-foreground underline underline-offset-2">
                    {t('auth.privacy')}
                  </span>
                  .
                </span>
              </label>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive animate-in fade-in duration-150"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
            >
              <span>
                {submitting
                  ? t('auth.working') || 'Please wait...'
                  : mode === 'register'
                  ? t('auth.createAccount') || 'Create Account'
                  : t('auth.login') || 'Sign In'}
              </span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>{t('auth.safe') || 'Secure TLS 256-bit encrypted session'}</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 Wayfinder Travel Co. · Made for curious explorers.
        </p>
      </section>
    </main>
  )
}

export default TourismAuth
