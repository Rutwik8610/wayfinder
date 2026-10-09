'use client'

import Link from 'next/link'
import { Compass, Globe2, Heart, MapPin, Sparkles } from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'

export function Footer() {
  const { t } = useAppSettings()

  return (
    <footer className="border-t border-border bg-card/60 backdrop-blur-sm text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                <Compass className="size-5" />
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight">Wayfinder</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('home.intro') || 'Curated journeys, live navigation routes, and AI-grounded trip budgeting designed for modern travelers.'}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Smart Travel Planning Platform</span>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Destinations</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/explore" className="text-muted-foreground hover:text-primary transition">
                  {t('explore.allSpots') || 'All Tourist Attractions'}
                </Link>
              </li>
              <li>
                <Link href="/explore?filter=Culture" className="text-muted-foreground hover:text-primary transition">
                  Heritage & Temples
                </Link>
              </li>
              <li>
                <Link href="/explore?filter=Nature" className="text-muted-foreground hover:text-primary transition">
                  Scenic Nature Escapes
                </Link>
              </li>
              <li>
                <Link href="/explore?filter=Adventure" className="text-muted-foreground hover:text-primary transition">
                  Adventure & Parks
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Planning */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trip Tools</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/plan-trip" className="text-muted-foreground hover:text-primary transition">
                  {t('nav.planTrip') || 'Plan Trip & Route Map'}
                </Link>
              </li>
              <li>
                <Link href="/live-info" className="text-muted-foreground hover:text-primary transition">
                  {t('nav.liveInfo') || 'Live Weather & Forecasts'}
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="text-muted-foreground hover:text-primary transition">
                  {t('nav.aiAssistant') || 'AI Travel Assistant'}
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-muted-foreground hover:text-primary transition">
                  {t('nav.community') || 'Traveler Stories & Community'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Preferences & Account */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account & Settings</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/settings" className="text-muted-foreground hover:text-primary transition">
                  {t('nav.settings') || 'Preferences & Appearance'}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary transition">
                  {t('nav.profile') || 'My Profile & Trips'}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary transition">
                  {t('auth.login') || 'Sign In / Account'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Wayfinder Travel Co. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Globe2 className="size-3.5 text-primary" /> Multi-lingual & Real-time Grounded
            </span>
            <span className="flex items-center gap-1">
              Made with <Heart className="size-3 text-rose-500 fill-rose-500" /> for travelers
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
