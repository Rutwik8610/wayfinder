'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Compass,
  Edit3,
  LogOut,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { RequireAuth } from '../../components/auth/require-auth'
import { useAuth } from '../../components/auth/auth-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const trips = [
  { date: 'Jun 2026', color: 'from-emerald-900 to-slate-800' },
  { date: 'Apr 2026', color: 'from-amber-900 to-orange-800' },
]

export default function ProfilePage() {
  const { t } = useAppSettings()
  const { session, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  const initials = session?.name
    ? session.name
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <Navbar />

        <main className="flex-1">
          <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span>{t('common.backHome') || 'Back to Home'}</span>
            </Link>

            <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
              {/* Profile Sidebar */}
              <aside className="rounded-3xl border border-border bg-card p-6 text-center shadow-xs sm:p-8">
                <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground shadow-md">
                  {initials}
                </div>
                <h1 className="mt-4 font-serif text-2xl font-bold">{session?.name}</h1>
                <p className="mt-1 text-xs text-muted-foreground">{session?.email}</p>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t('profile.bio')}</p>

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition"
                  >
                    <Edit3 className="size-3.5" /> {t('profile.edit') || 'Edit Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-xs font-bold text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut className="size-3.5" /> {t('auth.logout') || 'Sign Out'}
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-3 border-t border-border pt-5">
                  <div>
                    <p className="font-serif text-lg font-bold text-foreground">12</p>
                    <p className="text-[11px] text-muted-foreground">{t('profile.trips') || 'Trips'}</p>
                  </div>
                  <div>
                    <p className="font-serif text-lg font-bold text-foreground">28</p>
                    <p className="text-[11px] text-muted-foreground">{t('profile.places') || 'Places'}</p>
                  </div>
                  <div>
                    <p className="font-serif text-lg font-bold text-foreground">146</p>
                    <p className="text-[11px] text-muted-foreground">{t('profile.followers') || 'Followers'}</p>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="flex flex-col gap-8">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    <Sparkles className="size-4" /> {t('profile.story') || 'Travel Profile'}
                  </span>
                  <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
                    {t('profile.worldWaiting') || 'Your Travel Journey'}
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('profile.travelStyle') || 'Travel Style'}
                    </p>
                    <p className="mt-2 font-serif text-xl font-bold">{t('profile.styleValue') || 'Cultural Explorer'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                        {t('interest.food') || 'Food'}
                      </span>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                        {t('interest.culture') || 'Culture'}
                      </span>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                        {t('interest.nature') || 'Nature'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('profile.basedIn') || 'Location'}
                    </p>
                    <p className="mt-2 flex items-center gap-2 font-serif text-xl font-bold">
                      <MapPin className="size-5 text-primary shrink-0" /> Solapur, India
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">{t('profile.memberSince') || 'Explorer since 2026'}</p>
                  </div>
                </div>

                {/* Recent Trips Section */}
                <div>
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {t('profile.journal') || 'Trip Journal'}
                      </span>
                      <h3 className="mt-1 font-serif text-2xl font-bold">
                        {t('profile.recentTrips') || 'Recent Trips'}
                      </h3>
                    </div>
                    <Link href="/plan-trip" className="text-xs font-bold text-primary hover:underline">
                      {t('profile.planTrip') || 'Plan New Trip'}
                    </Link>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {trips.map((trip, index) => (
                      <article
                        key={trip.date}
                        className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs transition hover:shadow-md"
                      >
                        <div className={`h-24 bg-gradient-to-br ${trip.color}`} />
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-serif text-lg font-bold">
                                {t(index === 0 ? 'profile.tripDolomites' : 'profile.tripKyoto') || 'Scenic Getaway'}
                              </h4>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {t(index === 0 ? 'profile.tripDolomitesDetail' : 'profile.tripKyotoDetail')}
                              </p>
                            </div>
                            <CalendarDays className="size-4 text-muted-foreground shrink-0" />
                          </div>
                          <p className="mt-4 text-xs font-semibold text-primary">{trip.date}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </RequireAuth>
  )
}