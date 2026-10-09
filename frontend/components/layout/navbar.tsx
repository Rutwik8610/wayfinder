'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Compass,
  Menu,
  Moon,
  Sun,
  X,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  MapPin,
  Languages,
} from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { useAuth } from '@/components/auth/auth-provider'

interface NavbarProps {
  transparent?: boolean
}

export function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, theme, setTheme, language, setLanguage } = useAppSettings()
  const { session, logout } = useAuth()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const navLinks = [
    { name: t('nav.home') || 'Home', href: '/' },
    { name: t('nav.explore') || 'Explore', href: '/explore' },
    { name: t('nav.planTrip') || 'Plan Trip', href: '/plan-trip' },
    { name: t('nav.liveInfo') || 'Live Info', href: '/live-info' },
    { name: t('nav.aiAssistant') || 'AI Assistant', href: '/ai-assistant' },
    { name: t('nav.community') || 'Community', href: '/community' },
  ]

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  function toggleLanguage() {
    setLanguage(language === 'en' ? 'hi' : 'en')
  }

  function handleLogout() {
    logout()
    setProfileDropdownOpen(false)
    router.replace('/login')
  }

  const initials = session?.name
    ? session.name
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'G'

  const isHomeOverlay = transparent && pathname === '/'

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        isHomeOverlay
          ? 'border-b border-white/15 bg-black/30 backdrop-blur-md text-white'
          : 'border-b border-border bg-card/90 backdrop-blur-md text-foreground shadow-xs'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90" aria-label="Wayfinder home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Compass className="size-5" />
          </span>
          <span className="font-serif text-xl font-bold tracking-tight">Wayfinder</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : isHomeOverlay
                    ? 'text-white/85 hover:bg-white/15 hover:text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${
              isHomeOverlay
                ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                : 'border border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            <Languages className="size-3.5" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className={`flex size-9 items-center justify-center rounded-full transition ${
              isHomeOverlay
                ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                : 'border border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
          </button>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`flex items-center gap-2 rounded-full p-1 pr-2.5 transition ${
                isHomeOverlay
                  ? 'border border-white/20 bg-white/10 hover:bg-white/20'
                  : 'border border-border bg-card hover:bg-muted'
              }`}
              aria-expanded={profileDropdownOpen}
              aria-label="User menu"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {initials}
              </span>
              <span className="hidden text-xs font-semibold sm:inline-block max-w-[90px] truncate">
                {session?.name || t('auth.guest') || 'Guest'}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                role="menu"
              >
                {session ? (
                  <>
                    <div className="border-b border-border px-3 py-2">
                      <p className="text-xs font-bold text-foreground truncate">{session.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{session.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium hover:bg-muted transition"
                    >
                      <User className="size-3.5 text-primary" />
                      {t('nav.profile') || 'My Profile'}
                    </Link>
                    <Link
                      href="/explore"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium hover:bg-muted transition"
                    >
                      <MapPin className="size-3.5 text-primary" />
                      {t('nav.savedPlaces') || 'Saved Places'}
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium hover:bg-muted transition"
                    >
                      <SettingsIcon className="size-3.5 text-primary" />
                      {t('nav.settings') || 'Settings'}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition"
                    >
                      <LogOut className="size-3.5" />
                      {t('auth.logout') || 'Log Out'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-muted transition"
                    >
                      <User className="size-3.5 text-primary" />
                      {t('auth.login') || 'Sign In'}
                    </Link>
                    <Link
                      href="/tourism-auth"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition"
                    >
                      {t('auth.register') || 'Create Account'}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex size-9 items-center justify-center rounded-full lg:hidden transition ${
              isHomeOverlay
                ? 'border border-white/20 bg-white/10 text-white'
                : 'border border-border bg-card text-foreground'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          className="border-t border-border bg-card/95 backdrop-blur-xl px-5 py-4 lg:hidden animate-in slide-in-from-top-2 duration-150"
          aria-label="Mobile Navigation Drawer"
        >
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground font-medium">Quick Settings</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
              >
                {language === 'en' ? 'हिन्दी' : 'English'}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex size-7 items-center justify-center rounded-full border border-border"
              >
                {theme === 'dark' ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5" />}
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
