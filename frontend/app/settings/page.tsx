'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  Compass,
  Globe2,
  Languages,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
} from 'lucide-react'
import { useAppSettings, type Theme } from '@/components/providers/app-settings-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export default function SettingsPage() {
  const { language, theme, setLanguage, setTheme, t } = useAppSettings()
  const [updates, setUpdates] = useState(true)
  const [weekly, setWeekly] = useState(false)
  const [saved, setSaved] = useState(false)

  function savePreferences() {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2400)
  }

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: t('settings.light') || 'Light', icon: Sun },
    { value: 'dark', label: t('settings.dark') || 'Dark', icon: Moon },
    { value: 'system', label: t('settings.system') || 'System', icon: Monitor },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>{t('settings.back') || 'Back to Home'}</span>
          </Link>

          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="size-4" /> {t('settings.eyebrow') || 'Preferences & Appearance'}
            </span>
            <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
              {t('settings.title') || 'Settings'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t('settings.intro') || 'Customize your visual theme, preferred language, and account notification preferences.'}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-6">
            {/* Appearance & Theme Section */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Palette className="size-5" />
                </span>
                <div>
                  <h2 className="font-serif text-xl font-bold">{t('settings.appearance') || 'Visual Theme'}</h2>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.appearanceDesc') || 'Switch between light and dark themes (saved to your browser).'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6 border-t border-border pt-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                    {t('settings.theme') || 'Color Theme'}
                  </label>
                  <div className="grid grid-cols-3 gap-3" role="group" aria-label="Color theme selection">
                    {themes.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={theme === value}
                        onClick={() => setTheme(value)}
                        className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-bold transition ${
                          theme === value
                            ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                    {t('settings.language') || 'Language'}
                  </label>
                  <div className="flex flex-wrap gap-3" role="group" aria-label="Language selection">
                    <button
                      type="button"
                      aria-pressed={language === 'en'}
                      onClick={() => setLanguage('en')}
                      className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition ${
                        language === 'en'
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      <Languages className="size-4" />
                      <span>{t('settings.english') || 'English'}</span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={language === 'hi'}
                      onClick={() => setLanguage('hi')}
                      className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition ${
                        language === 'hi'
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      <Languages className="size-4" />
                      <span>{t('settings.hindi') || 'हिन्दी'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Account & Profile Quick Link */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <UserRound className="size-5" />
                </span>
                <div>
                  <h2 className="font-serif text-xl font-bold">{t('settings.account') || 'Account Management'}</h2>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.accountDesc') || 'Review your travel bio, saved trips, and email.'}
                  </p>
                </div>
              </div>

              <Link
                href="/profile"
                className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4 transition hover:bg-muted/60"
              >
                <div>
                  <span className="block text-sm font-bold text-foreground">
                    {t('settings.profile') || 'View Traveler Profile'}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {t('settings.profileDesc') || 'Manage public profile details and trip history'}
                  </span>
                </div>
                <ArrowLeft className="size-4 rotate-180 text-primary" />
              </Link>
            </section>

            {/* Notifications Section */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Globe2 className="size-5" />
                </span>
                <div>
                  <h2 className="font-serif text-xl font-bold">
                    {t('settings.notifications') || 'Travel Notifications'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.notificationsDesc') || 'Stay informed about weather alerts and saved trip reminders.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                {[
                  [t('settings.tripUpdates') || 'Trip plan itinerary updates', updates, setUpdates],
                  [t('settings.weekly') || 'Weekly curated travel digest', weekly, setWeekly],
                ].map(([label, checked, setChecked]) => (
                  <label
                    key={String(label)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-muted/20 p-4 transition hover:bg-muted/40"
                  >
                    <span className="text-xs font-semibold text-foreground">{label as string}</span>
                    <input
                      type="checkbox"
                      checked={checked as boolean}
                      onChange={(event) =>
                        (setChecked as (value: boolean) => void)(event.target.checked)
                      }
                      className="size-4 rounded accent-primary cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </section>

            {/* Save Button & Status Alert */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={savePreferences}
                className="rounded-full bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90"
              >
                {t('settings.save') || 'Save Preferences'}
              </button>

              {saved && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary animate-in fade-in duration-150"
                >
                  <Check className="size-4" />
                  <span>{t('settings.preferencesSaved') || 'Preferences saved successfully!'}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}