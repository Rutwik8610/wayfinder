'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Compass,
  Heart,
  MapPin,
  Search,
  Sparkles,
  Ticket,
  X,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Skeleton } from '@/components/ui/skeleton'

const filters = ['All spots', 'Adventure', 'Culture', 'Nature', 'Food', 'Tradition']
const filterKeys: Record<string, string> = {
  'All spots': 'explore.allSpots',
  Adventure: 'filter.adventure',
  Culture: 'filter.culture',
  Nature: 'filter.nature',
  Food: 'filter.food',
  Tradition: 'filter.tradition',
}

type TouristSpot = {
  id: number
  name: string
  city: string
  state: string
  country: string
  description: string
  imageUrl: string
  entryFee?: number | null
  attractions?: string | null
  bestTimeToVisit?: string | null
}

const DEFAULT_PLACEHOLDER = '/images/spots/placeholder-spot.jpg'

function SpotCard({
  place,
  onSelect,
  t,
}: {
  place: TouristSpot
  onSelect: (place: TouristSpot) => void
  t: (key: string) => string
}) {
  const [imgSrc, setImgSrc] = useState(
    place.imageUrl && place.imageUrl.trim() !== '' ? place.imageUrl : DEFAULT_PLACEHOLDER
  )

  const feeText =
    place.entryFee != null && place.entryFee > 0
      ? `₹${place.entryFee}`
      : place.entryFee === 0
      ? 'Free Entry'
      : null

  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <button
        type="button"
        onClick={() => onSelect(place)}
        className="block w-full text-left focus:outline-none"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={imgSrc}
            alt={`${place.name}, ${place.city}, ${place.state}`}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc(DEFAULT_PLACEHOLDER)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

          {feeText && (
            <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-foreground backdrop-blur-md shadow-xs">
              <Ticket className="mr-1 inline size-3 text-primary" />
              {feeText}
            </span>
          )}

          <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/85 text-foreground shadow-sm backdrop-blur-md transition group-hover:bg-card">
            <Heart className="size-4 hover:fill-rose-500 hover:text-rose-500 transition-colors" />
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              {t('explore.touristAttraction') || 'Attraction'}
            </span>
            <span className="text-xs text-muted-foreground">{place.city}</span>
          </div>

          <h3 className="mt-2 font-serif text-2xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
            {place.name}
          </h3>

          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{place.city}, {place.state}</span>
          </p>

          <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {place.description || 'Explore this historic and cultural destination.'}
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs font-semibold text-primary group-hover:underline">
              {t('explore.viewDetails') || 'View Details'}
            </span>
            <ArrowRight className="size-3.5 text-primary transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </button>
    </article>
  )
}

function SpotDetailModal({
  selected,
  onClose,
  t,
}: {
  selected: TouristSpot
  onClose: () => void
  t: (key: string) => string
}) {
  const [imgSrc, setImgSrc] = useState(
    selected.imageUrl && selected.imageUrl.trim() !== '' ? selected.imageUrl : DEFAULT_PLACEHOLDER
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={selected.name}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] bg-muted">
          <Image
            src={imgSrc}
            alt={`${selected.name}, ${selected.city}, ${selected.state}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
            onError={() => setImgSrc(DEFAULT_PLACEHOLDER)}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-md backdrop-blur-md hover:bg-card"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground">
              {selected.city}, {selected.state}
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold">{selected.name}</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            {selected.entryFee != null && (
              <div className="rounded-2xl border border-border bg-muted/30 p-3">
                <span className="text-muted-foreground block font-medium">Entry Ticket</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">
                  {selected.entryFee > 0 ? `₹${selected.entryFee} per person` : 'Free Entry'}
                </span>
              </div>
            )}
            {selected.bestTimeToVisit && (
              <div className="rounded-2xl border border-border bg-muted/30 p-3">
                <span className="text-muted-foreground block font-medium">Best Time to Visit</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">
                  {selected.bestTimeToVisit}
                </span>
              </div>
            )}
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About this Place</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
          </div>

          {selected.attractions && (
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Highlights</h4>
              <p className="mt-1 text-xs text-muted-foreground">{selected.attractions}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold hover:bg-muted transition"
            >
              Close
            </button>
            <Link
              href={`/plan-trip?destination=${encodeURIComponent(selected.name)}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition"
            >
              <span>{t('explore.planHere') || 'Plan Trip Here'}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const { t } = useAppSettings()
  const searchParams = useSearchParams()

  const [dbPlaces, setDbPlaces] = useState<TouristSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(() => searchParams.get('query') || '')
  const [filter, setFilter] = useState('All spots')
  const [selected, setSelected] = useState<TouristSpot | null>(null)

  const results = useMemo(() => {
    return dbPlaces.filter((place) =>
      `${place.name} ${place.city} ${place.state}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  }, [dbPlaces, query])

  useEffect(() => {
    let isMounted = true
    const fetchPlaces = async () => {
      setLoading(true)
      try {
        const url =
          filter === 'All spots'
            ? 'http://localhost:8080/api/tourist-spots'
            : `http://localhost:8080/api/tourist-spots/interest/${encodeURIComponent(filter)}`

        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch tourist spots')
        const data = await response.json()
        if (isMounted) {
          setDbPlaces(data)
        }
      } catch (error) {
        console.error('Error fetching tourist spots:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPlaces()
    return () => {
      isMounted = false
    }
  }, [filter])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Explore Hero Header */}
        <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 lg:px-8">
          <div className="max-w-2xl">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="size-4" /> {t('explore.eyebrow') || 'Explore Destinations'}
            </span>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
              {t('explore.title') || 'Find your next adventure'}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t('explore.intro') || 'Browse historic temples, heritage monuments, scenic sanctuaries, and waterparks.'}
            </p>
          </div>

          {/* Search Bar */}
          <form
            className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-md focus-within:border-primary transition"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search className="size-5 text-muted-foreground shrink-0" />
            <label htmlFor="place-search" className="sr-only">
              {t('explore.searchPlaceholder')}
            </label>
            <input
              id="place-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('explore.searchPlaceholder') || 'Search spots by name, city, or state...'}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </form>

          {/* Category Filter Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Destination filters">
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1">
              <Filter className="size-3.5" /> Filters:
            </span>
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  filter === item
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {t(filterKeys[item]) || item}
              </button>
            ))}
          </div>
        </section>

        {/* Tourist Spots Grid */}
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
            <h2 className="font-serif text-2xl font-bold">
              {t('explore.placesTitle') || 'All Attractions'}
              <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">
                ({results.length} found)
              </span>
            </h2>
          </div>

          {/* Shimmer Skeleton Loaders during network request */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="rounded-3xl border border-border bg-card p-4 space-y-4 shadow-xs">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Loaded Results */}
          {!loading && results.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((place) => (
                <SpotCard key={place.id} place={place} onSelect={setSelected} t={t} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
              <MapPin className="mx-auto size-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-serif text-xl font-bold">No tourist spots found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('explore.noResults') || 'Try adjusting your search keywords or choosing another category filter.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setFilter('All spots')
                }}
                className="mt-6 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </section>

        {/* Spot Detail Modal */}
        {selected && <SpotDetailModal selected={selected} onClose={() => setSelected(null)} t={t} />}
      </main>

      <Footer />
    </div>
  )
}
