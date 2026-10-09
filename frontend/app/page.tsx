'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Globe2,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const destinations = [
  {
    name: 'Siddheshwar Temple',
    city: 'Solapur',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=900&q=85',
    tagKey: 'Heritage Sanctuary',
    category: 'Culture',
  },
  {
    name: 'Gol Gumbaz',
    city: 'Vijayapura',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=900&q=85',
    tagKey: 'Acoustic Marvel',
    category: 'Heritage',
  },
  {
    name: 'Amalfi Coast',
    city: 'Campania',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=85',
    tagKey: 'home.tagCoastal',
    category: 'Coastal',
  },
]

export default function HomePage() {
  const { t } = useAppSettings()
  const router = useRouter()

  const [searchDestination, setSearchDestination] = useState('')
  const [searchDates, setSearchDates] = useState('')
  const [searchTravelers, setSearchTravelers] = useState(2)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchDestination.trim()) {
      router.push(`/explore?query=${encodeURIComponent(searchDestination.trim())}`)
    } else {
      router.push('/explore')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Shared Unified Navbar */}
      <Navbar transparent />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative -mt-16 flex min-h-[720px] items-end overflow-hidden px-5 pb-20 pt-36 lg:min-h-[820px] lg:px-8 lg:pb-28">
          <Image
            src="/images/hero-dolomites.png"
            alt={t('home.heroAlt') || 'Scenic mountain destination at sunset'}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-black/30" />

          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="max-w-2xl text-white">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>{t('home.eyebrow') || 'AI Real-time Travel Experience'}</span>
              </div>
              <h1 className="font-serif text-5xl font-medium leading-[1.08] tracking-tight text-white text-balance sm:text-7xl">
                {t('home.title') || 'Wander further. Plan smarter.'}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                {t('home.intro') || 'Curated spots, turn-by-turn route maps, and AI-grounded budgeting built for seamless exploration.'}
              </p>
              <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:bg-primary/90"
                >
                  {t('home.startExploring') || 'Start Exploring'}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/plan-trip"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <Play className="size-4 fill-current" />
                  {t('home.howItWorks') || 'Plan a Trip'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Search Bar Panel */}
        <section className="relative z-20 mx-auto -mt-10 max-w-6xl px-5 lg:px-8">
          <form
            onSubmit={handleSearchSubmit}
            className="grid gap-3 rounded-3xl border border-border bg-card p-3 shadow-2xl shadow-foreground/10 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center md:gap-0 md:p-2"
          >
            {/* Where to */}
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 md:border-r md:border-border">
              <Search className="size-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <label htmlFor="hero-dest" className="block text-xs font-semibold text-muted-foreground">
                  {t('home.whereTo') || 'Where to?'}
                </label>
                <input
                  id="hero-dest"
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="e.g. Siddheshwar Temple, Solapur"
                  className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
                />
              </div>
            </div>

            {/* When / Dates */}
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3 md:border-r md:border-border">
              <CalendarDays className="size-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <label htmlFor="hero-date" className="block text-xs font-semibold text-muted-foreground">
                  {t('home.when') || 'Dates'}
                </label>
                <input
                  id="hero-date"
                  type="date"
                  value={searchDates}
                  onChange={(e) => setSearchDates(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                />
              </div>
            </div>

            {/* Travelers */}
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3">
              <Users className="size-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <label htmlFor="hero-travelers" className="block text-xs font-semibold text-muted-foreground">
                  {t('home.travelers') || 'Travelers'}
                </label>
                <select
                  id="hero-travelers"
                  value={searchTravelers}
                  onChange={(e) => setSearchTravelers(Number(e.target.value))}
                  className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  <option value={1} className="bg-card text-foreground">1 Traveler</option>
                  <option value={2} className="bg-card text-foreground">2 Travelers</option>
                  <option value={4} className="bg-card text-foreground">4 Travelers</option>
                  <option value={6} className="bg-card text-foreground">Family (6+)</option>
                </select>
              </div>
            </div>

            {/* Search CTA */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90"
            >
              <span>{t('home.findTrip') || 'Explore Now'}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>
        </section>

        {/* Feature Cards Showcase */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {t('home.featuresEyebrow') || 'Intelligent Travel Suite'}
            </span>
            <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {t('home.featuresTitle') || 'Everything you need for an unforgettable journey'}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t('home.featuresIntro') || 'From live weather radar to distance-calculated route directions and real-time grounded budgets.'}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/plan-trip"
              className="group rounded-3xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Compass className="size-6" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-bold">{t('nav.planTrip') || 'Plan Trip & Route'}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Get spot info, live Google route map navigation, and distance-backed pricing.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
                Create a Plan <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/live-info"
              className="group rounded-3xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Globe2 className="size-6" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-bold">{t('home.realTime') || 'Live Weather & Radar'}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t('home.weatherIntro') || 'Real-time forecasts, temperature trends, and regional map geocoding.'}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
                {t('home.viewLiveInfo') || 'View Live Info'} <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/explore"
              className="group rounded-3xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
                <MapPin className="size-6" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-bold">{t('home.hiddenPlaces') || 'Tourist Attractions'}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t('home.hiddenPlacesIntro') || 'Discover temples, monuments, sanctuaries, and waterparks.'}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
                {t('home.exploreHidden') || 'Browse All Spots'} <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/ai-assistant"
              className="group rounded-3xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-bold">{t('home.assistant') || 'AI Travel Companion'}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t('home.assistantIntro') || 'Ask tailored questions about itineraries, local culture, and food.'}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
                {t('home.askWayfinder') || 'Ask Assistant'} <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </section>

        {/* Featured Destinations Section */}
        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {t('home.curated') || 'Handpicked Destinations'}
              </span>
              <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-5xl">
                {t('home.placesTitle') || 'Popular Places to Visit'}
              </h2>
            </div>
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <span>{t('home.exploreAll') || 'Explore all attractions'}</span>
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {destinations.map((destination) => (
              <article
                key={destination.name}
                className="group relative overflow-hidden rounded-3xl bg-muted shadow-sm transition duration-300 hover:shadow-xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={destination.image}
                    alt={`${destination.name}, ${destination.country}`}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-card/85 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
                    {destination.category}
                  </span>
                  <div className="absolute inset-x-5 bottom-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                      {destination.tagKey}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold">{destination.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/80">
                      <MapPin className="size-3.5 text-primary" />
                      {destination.city}, {destination.country}
                    </p>
                    <Link
                      href={`/plan-trip?destination=${encodeURIComponent(destination.name)}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white underline underline-offset-4 hover:text-primary transition"
                    >
                      Plan trip here <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Shared Unified Footer */}
      <Footer />
    </div>
  )
}
