'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  CloudRain,
  CloudSun,
  Compass,
  Download,
  ExternalLink,
  LocateFixed,
  MapPin,
  Navigation,
  RotateCw,
  Route,
  Sparkles,
  Sun,
  Wind,
} from 'lucide-react'
import { generateTripPlanPdf } from '@/lib/plan-pdf'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { useAuth } from '../../components/auth/auth-provider'
import { apiBaseUrl, authenticatedFetch } from '../../lib/auth-session'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Skeleton } from '@/components/ui/skeleton'

const options = ['Create trip', 'My trips', 'Saved itineraries']
const optionKeys: Record<string, string> = {
  'Create trip': 'plan.createTrip',
  'My trips': 'plan.myTrips',
  'Saved itineraries': 'plan.savedItineraries',
}
const interests = ['Food', 'Culture', 'Adventure', 'Tradition', 'Nature', 'Art', 'Wellness']
const savedTrips = [
  {
    title: 'Northern Italy escape',
    detail: 'Milan · Lake Como · Dolomites',
    dates: 'Jun 12 – Jun 22, 2026',
    status: 'In progress',
  },
  {
    title: 'A week in Kyoto',
    detail: 'Temples, tea houses, and quiet gardens',
    dates: 'Saved itinerary',
    status: 'Ready to plan',
  },
]

type SpotInfo = {
  id: number
  name: string | null
  city: string | null
  state: string | null
  country: string | null
  description: string | null
  bestTimeToVisit: string | null
  entryFee: number | null
  openingTime: string | null
  closingTime: string | null
  attractions: string | null
  imageUrl: string | null
}

type RouteInfo = {
  origin: string
  destination: string
  originLat: number | null
  originLng: number | null
  destinationLat: number | null
  destinationLng: number | null
  distanceKm: number | null
  durationText: string
  directionsUrl: string
  embedMapUrl: string
}

type BudgetItem = {
  category: string
  min: number
  max: number
  recommended: number
  sourceName?: string | null
  sourceUrl?: string | null
  lastUpdated?: string | null
  note?: string | null
  isEstimate?: boolean
}

type BudgetPlan = {
  transportation: number
  accommodation: number
  food: number
  entryFees: number
  localTransport: number
  miscellaneous: number
  total: number
  totalMin?: number
  totalMax?: number
  totalRecommended?: number
  items?: BudgetItem[]
  isEstimate?: boolean
  note?: string
  currency?: string
  lastUpdated?: string
}

type PlanResponse = {
  spotInfo: SpotInfo
  routeInfo?: RouteInfo
  itinerary: { day: number; date: string; activities: string[] }[]
  budgetPlan: BudgetPlan
}

type TouristSpotResult = { id: number; name: string }

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function SpotInformation({ spot }: { spot: SpotInfo }) {
  const { t } = useAppSettings()
  const location = [spot.city, spot.state, spot.country].filter(Boolean).join(', ')
  const hours = [spot.openingTime, spot.closingTime].filter(Boolean).join(' – ')

  return (
    <section aria-labelledby="spot-information-heading" className="mt-8 border-t border-border pt-8">
      <h3 id="spot-information-heading" className="font-serif text-3xl">
        {t('plan.spotInfo')}
      </h3>
      {spot.imageUrl && (
        <img
          src={spot.imageUrl}
          alt={spot.name ?? 'Tourist spot'}
          className="mt-5 max-h-96 w-full rounded-2xl object-cover shadow-sm"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/images/spots/placeholder-spot.jpg'
          }}
        />
      )}
      <dl className="mt-5 grid gap-5 sm:grid-cols-2">
        {spot.name && (
          <div>
            <dt className="text-sm font-semibold">{t('common.name')}</dt>
            <dd className="mt-1 text-muted-foreground">{spot.name}</dd>
          </div>
        )}
        {location && (
          <div>
            <dt className="text-sm font-semibold">{t('common.location')}</dt>
            <dd className="mt-1 text-muted-foreground">{location}</dd>
          </div>
        )}
        {spot.description && (
          <div className="sm:col-span-2">
            <dt className="text-sm font-semibold">{t('common.description')}</dt>
            <dd className="mt-1 leading-7 text-muted-foreground">{spot.description}</dd>
          </div>
        )}
        {spot.bestTimeToVisit && (
          <div>
            <dt className="text-sm font-semibold">{t('plan.bestTime')}</dt>
            <dd className="mt-1 text-muted-foreground">{spot.bestTimeToVisit}</dd>
          </div>
        )}
        {typeof spot.entryFee === 'number' && (
          <div>
            <dt className="text-sm font-semibold">{t('plan.entryFee')}</dt>
            <dd className="mt-1 text-muted-foreground">{formatMoney(spot.entryFee)}</dd>
          </div>
        )}
        {hours && (
          <div>
            <dt className="text-sm font-semibold">{t('plan.openingHours')}</dt>
            <dd className="mt-1 text-muted-foreground">{hours}</dd>
          </div>
        )}
        {spot.attractions && (
          <div className="sm:col-span-2">
            <dt className="text-sm font-semibold">{t('plan.nearbyAttractions')}</dt>
            <dd className="mt-1 whitespace-pre-line text-muted-foreground">{spot.attractions}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}

function RouteMapSection({
  route,
  spot,
  origin,
}: {
  route?: RouteInfo
  spot: SpotInfo
  origin: string
}) {
  const originLabel = route?.origin || origin || 'Your Location'
  const destLabel = spot.name ? `${spot.name}, ${spot.city ?? ''}` : route?.destination || 'Destination'

  const embedUrl =
    route?.embedMapUrl ||
    `https://maps.google.com/maps?saddr=${encodeURIComponent(originLabel)}&daddr=${encodeURIComponent(
      destLabel
    )}&output=embed`

  const directionsUrl =
    route?.directionsUrl ||
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      originLabel
    )}&destination=${encodeURIComponent(destLabel)}`

  return (
    <section aria-labelledby="route-map-heading" className="mt-10 border-t border-border pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Navigation className="size-4" /> Live Route Navigation
          </span>
          <h3 id="route-map-heading" className="mt-1 font-serif text-3xl">
            Google Map & Directions
          </h3>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <ExternalLink className="size-4" /> Open in Google Maps
        </a>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <iframe
          title={`Route from ${originLabel} to ${destLabel}`}
          src={embedUrl}
          className="h-[420px] w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-muted/40 p-5 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Route className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Estimated Distance</p>
            <p className="font-semibold text-foreground">
              {route?.distanceKm ? `${route.distanceKm} km` : 'Calculated along route'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Travel Time</p>
            <p className="font-semibold text-foreground">
              {route?.durationText || 'Standard driving route'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Destination Arrival</p>
            <p className="truncate font-semibold text-foreground" title={destLabel}>
              {destLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

type DestinationWeather = {
  temperature: number
  feelsLike: number
  description: string
  humidity: number
  wind: number
  forecast: { date: string; max: number; low: number; description: string }[]
}

function DestinationWeatherSection({
  spot,
  route,
  onWeatherLoaded,
}: {
  spot: SpotInfo
  route?: RouteInfo
  onWeatherLoaded?: (weather: DestinationWeather) => void
}) {
  const [weather, setWeather] = useState<DestinationWeather | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchWeather = async () => {
      try {
        const lat = route?.destinationLat ?? 17.6599
        const lng = route?.destinationLng ?? 75.9064
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
        )
        if (res.ok) {
          const data = await res.json()
          const current = data.current
          const forecast = (data.daily?.time || []).map((date: string, idx: number) => ({
            date: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
            max: Math.round(data.daily.temperature_2m_max[idx]),
            low: Math.round(data.daily.temperature_2m_min[idx]),
            description: data.daily.weather_code[idx] <= 1 ? 'Clear' : data.daily.weather_code[idx] <= 55 ? 'Cloudy' : 'Rain',
          }))

          if (isMounted) {
            const loadedWeather: DestinationWeather = {
              temperature: Math.round(current.temperature_2m),
              feelsLike: Math.round(current.apparent_temperature),
              description: current.weather_code <= 1 ? 'Clear Sunny Sky' : current.weather_code <= 55 ? 'Partly Cloudy' : 'Light Rain',
              humidity: current.relative_humidity_2m,
              wind: Math.round(current.wind_speed_10m),
              forecast,
            }
            setWeather(loadedWeather)
            onWeatherLoaded?.(loadedWeather)
          }
        }
      } catch (err) {
        console.error('Weather error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchWeather()
    return () => {
      isMounted = false
    }
  }, [route?.destinationLat, route?.destinationLng, spot?.city])

  return (
    <section aria-labelledby="weather-heading" className="mt-10 border-t border-border pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <CloudSun className="size-4" /> Destination Climate
          </span>
          <h3 id="weather-heading" className="mt-1 font-serif text-3xl">
            Live Weather & 5-Day Forecast
          </h3>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          {spot.city || 'Destination'}
        </span>
      </div>

      {loading && (
        <div className="mt-5 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-4">
          <Skeleton className="h-24 sm:col-span-1" />
          <Skeleton className="h-24 sm:col-span-3" />
        </div>
      )}

      {!loading && weather && (
        <div className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Sun className="size-8" />
              </span>
              <div>
                <div className="text-4xl font-serif font-bold text-foreground">
                  {weather.temperature}°C
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {weather.description} · Feels like {weather.feelsLike}°C
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Wind className="size-4 text-primary" />
                <span>Wind: {weather.wind} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="size-4 text-primary" />
                <span>Humidity: {weather.humidity}%</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {weather.forecast.map((f, i) => (
              <div key={i} className="rounded-2xl bg-muted/40 p-3 text-center">
                <p className="text-xs font-semibold text-muted-foreground">{f.date}</p>
                <p className="mt-1 font-bold text-foreground text-sm">
                  {f.max}° <span className="text-muted-foreground font-normal text-xs">/ {f.low}°</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function RealtimeBudgetSection({
  budget,
  onRefresh,
  isRefreshing,
}: {
  budget: BudgetPlan
  onRefresh?: () => void
  isRefreshing?: boolean
}) {
  const { t } = useAppSettings()

  const items: BudgetItem[] =
    budget.items && budget.items.length > 0
      ? budget.items
      : [
          {
            category: t('plan.travel') || 'Travel & Transportation',
            min: Math.round(budget.transportation * 0.8),
            max: Math.round(budget.transportation * 1.25),
            recommended: budget.transportation,
            note: 'Intercity and regional transit',
            isEstimate: budget.isEstimate,
          },
          {
            category: t('plan.accommodation') || 'Accommodation',
            min: Math.round(budget.accommodation * 0.75),
            max: Math.round(budget.accommodation * 1.35),
            recommended: budget.accommodation,
            note: 'Hotel/homestay near destination',
            isEstimate: budget.isEstimate,
          },
          {
            category: t('plan.food') || 'Food & Dining',
            min: Math.round(budget.food * 0.8),
            max: Math.round(budget.food * 1.3),
            recommended: budget.food,
            note: 'Meals and refreshments',
            isEstimate: budget.isEstimate,
          },
          {
            category: t('plan.entryActivities') || 'Entry Fees & Activities',
            min: budget.entryFees,
            max: Math.round(budget.entryFees * 1.5),
            recommended: budget.entryFees,
            note: 'Spot admissions and guide passes',
            isEstimate: budget.isEstimate,
          },
          {
            category: t('plan.localTransport') || 'Local Transit',
            min: Math.round(budget.localTransport * 0.85),
            max: Math.round(budget.localTransport * 1.3),
            recommended: budget.localTransport,
            note: 'Auto-rickshaw and local taxis',
            isEstimate: budget.isEstimate,
          },
          {
            category: t('plan.miscellaneous') || 'Miscellaneous & Buffer',
            min: Math.round(budget.miscellaneous * 0.6),
            max: Math.round(budget.miscellaneous * 1.5),
            recommended: budget.miscellaneous,
            note: 'Contingency and local shopping',
            isEstimate: budget.isEstimate,
          },
        ]

  const totalMin = budget.totalMin ?? items.reduce((acc, i) => acc + (i.min || 0), 0)
  const totalMax = budget.totalMax ?? items.reduce((acc, i) => acc + (i.max || 0), 0)
  const totalRec = budget.totalRecommended ?? budget.total

  return (
    <section aria-labelledby="budget-heading" className="mt-10 border-t border-border pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-4" /> Powered by Gemini + Google Search Grounding
          </span>
          <h3 id="budget-heading" className="mt-1 font-serif text-3xl">
            Real-time Budget
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              budget.isEstimate
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {budget.isEstimate ? 'Specific Regional Estimate' : 'Grounded Live Prices'}
          </span>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh budget with live web search"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
            >
              <RotateCw className={`size-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  Expense Category
                </th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                  Expected Range
                </th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                  Recommended
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  Source & Verification
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.category} className="transition hover:bg-muted/30">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">{item.category}</div>
                    {item.note && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right text-xs text-muted-foreground">
                    {formatMoney(item.min)} – {formatMoney(item.max)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-foreground">
                    {formatMoney(item.recommended)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          {item.sourceName || 'Live Source'}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {item.sourceName || 'Tourism Benchmark'}
                        </span>
                      )}
                      {item.isEstimate && (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          Estimated
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border bg-muted/40 font-bold">
              <tr>
                <td className="px-5 py-4 text-base text-foreground">
                  {t('plan.total') || 'Total Estimated Budget'}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-xs text-muted-foreground">
                  {formatMoney(totalMin)} – {formatMoney(totalMax)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right text-lg text-primary">
                  {formatMoney(totalRec)}
                </td>
                <td className="px-5 py-4 text-xs font-normal text-muted-foreground">
                  Per group of travelers
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {budget.note && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Pricing Methodology & Grounding:</p>
          <p className="mt-1 leading-relaxed">{budget.note}</p>
        </div>
      )}
    </section>
  )
}

export default function PlanTripPage() {
  const { t } = useAppSettings()
  const { session } = useAuth()
  const searchParams = useSearchParams()
  const [activeOption, setActiveOption] = useState('Create trip')
  const [step, setStep] = useState(1)
  const [currentLocation, setCurrentLocation] = useState('')
  const [destination, setDestination] = useState(() => searchParams.get('destination') ?? '')
  const [travelerCount, setTravelerCount] = useState(1)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [currentWeather, setCurrentWeather] = useState<DestinationWeather | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as unknown as { __generateTripPlanPdf?: typeof generateTripPlanPdf }).__generateTripPlanPdf = generateTripPlanPdf
    }
  }, [])

  const handleDownloadPdf = async () => {
    if (!plan) return
    setIsGeneratingPdf(true)
    setPdfError('')
    try {
      await generateTripPlanPdf({
        plan,
        destination,
        currentLocation,
        from,
        to,
        travelerCount,
        weather: currentWeather,
      })
    } catch (err: unknown) {
      console.error('PDF generation error:', err)
      const message = err instanceof Error ? err.message : 'Failed to generate PDF. Please try again.'
      setPdfError(message)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const [geoLoading, setGeoLoading] = useState(false)
  const [geoNotice, setGeoNotice] = useState('')

  const handleUseLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser. Please type your location manually.')
      return
    }

    setGeoLoading(true)
    setGeoNotice('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
          )
          if (res.ok) {
            const data = await res.json()
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.state_district ||
              data.address?.state
            if (city) {
              setCurrentLocation(city)
              setGeoNotice(`Detected location: ${city}`)
              setGeoLoading(false)
              return
            }
          }
        } catch {
          // fallback to lat, lon
        }
        setCurrentLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        setGeoNotice(`Coordinates detected: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        setGeoLoading(false)
      },
      () => {
        setGeoLoading(false)
        setGeoNotice('Location permission was denied. Please enter your starting city manually below.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const canContinue = useMemo(
    () =>
      step === 1
        ? Boolean(currentLocation.trim() && destination.trim())
        : step === 2
        ? Boolean(from && to && to >= from)
        : selectedInterests.length > 0,
    [step, currentLocation, destination, from, to, selectedInterests]
  )

  const toggleInterest = (interest: string) =>
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]
    )

  const createPlan = async () => {
    setLoading(true)
    setError('')

    try {
      const query = new URLSearchParams({ name: destination.trim() })
      const spotsResponse = await fetch(`${apiBaseUrl}/api/tourist-spots/search?${query}`)
      if (!spotsResponse.ok) {
        throw new Error(t('plan.lookupError') || 'Failed to search for tourist spots.')
      }

      const spots = (await spotsResponse.json()) as TouristSpotResult[]
      const chosenSpot = spots.find(
        (spot) => spot.name?.trim().toLocaleLowerCase() === destination.trim().toLocaleLowerCase()
      )
      if (!chosenSpot) {
        throw new Error(
          t('plan.notInDatabase') || 'No matching spot found in database. Select one from Explore.'
        )
      }

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotId: chosenSpot.id,
          travelerCount,
          startLocation: currentLocation,
          destination: destination.trim(),
          startDate: from,
          endDate: to,
          interests: selectedInterests.join(', '),
        }),
      }
      const response = session
        ? await authenticatedFetch('/api/trips/plan', requestOptions)
        : await fetch(`${apiBaseUrl}/api/trips/plan`, requestOptions)

      const responseText = await response.text()
      const payload = responseText ? JSON.parse(responseText) : null
      if (!response.ok) {
        throw new Error(payload?.detail ?? payload?.message ?? t('plan.createError'))
      }
      setPlan(payload as PlanResponse)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('plan.createError'))
    } finally {
      setLoading(false)
    }
  }

  const [isRefreshingBudget, setIsRefreshingBudget] = useState(false)

  const handleRefreshBudget = async () => {
    if (!plan?.spotInfo?.id) return
    setIsRefreshingBudget(true)
    try {
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotId: plan.spotInfo.id,
          travelerCount,
          startLocation: currentLocation,
          destination: destination.trim(),
          startDate: from,
          endDate: to,
          interests: selectedInterests.join(', '),
          forceRefresh: true,
        }),
      }
      const response = session
        ? await authenticatedFetch('/api/trips/plan', requestOptions)
        : await fetch(`${apiBaseUrl}/api/trips/plan`, requestOptions)

      if (response.ok) {
        const data = (await response.json()) as PlanResponse
        setPlan((prev) => (prev ? { ...prev, budgetPlan: data.budgetPlan } : data))
      }
    } catch (err) {
      console.error('Failed to refresh budget:', err)
    } finally {
      setIsRefreshingBudget(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 pb-8 pt-16 lg:px-8 lg:pt-24">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          <Sparkles className="size-4" /> {t('plan.eyebrow')}
        </p>
        <h1 className="font-serif text-5xl text-balance sm:text-7xl">{t('plan.title')}</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">{t('plan.intro')}</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8">
        <nav className="flex gap-2 overflow-x-auto border-b border-border" aria-label={t('plan.options')}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setActiveOption(option)
                setPlan(null)
                setError('')
              }}
              aria-selected={activeOption === option}
              className={`min-w-max border-b-2 px-4 py-4 text-sm font-semibold ${
                activeOption === option
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(optionKeys[option])}
            </button>
          ))}
        </nav>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        {activeOption === 'Create trip' && !plan && (
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">{t('plan.step', { step })}</p>
                <h2 className="mt-2 font-serif text-3xl">
                  {step === 1
                    ? t('plan.whereHeading')
                    : step === 2
                    ? t('plan.whenHeading')
                    : t('plan.interestsHeading')}
                </h2>
              </div>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                {step === 1 ? (
                  <MapPin className="size-5" />
                ) : step === 2 ? (
                  <CalendarDays className="size-5" />
                ) : (
                  <Sparkles className="size-5" />
                )}
              </span>
            </div>

            <div className="mt-7 flex gap-2" aria-label={`Trip wizard progress, step ${step}`}>
              <span className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <span className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <span className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            </div>

            {step === 1 && (
              <div className="mt-8 flex flex-col gap-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="current-location-input" className="text-sm font-medium">
                      {t('plan.currentLocation')}
                    </label>
                    <button
                      type="button"
                      onClick={handleUseLocation}
                      disabled={geoLoading}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-muted"
                    >
                      <LocateFixed className="size-3.5" />
                      {geoLoading ? 'Detecting Location...' : 'Use Current Location'}
                    </button>
                  </div>
                  <input
                    id="current-location-input"
                    value={currentLocation}
                    onChange={(event) => setCurrentLocation(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3.5 outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-4"
                    placeholder="e.g. Pune, Mumbai, Solapur"
                  />
                  {geoNotice && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{geoNotice}</p>
                  )}
                </div>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  {t('plan.destination')}
                  <input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    className="rounded-2xl border border-border bg-background px-4 py-3.5 outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-4"
                    placeholder={t('plan.destinationPlaceholder')}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  {t('plan.travelers')}
                  <input
                    type="number"
                    min={1}
                    value={travelerCount}
                    onChange={(event) => setTravelerCount(Math.max(1, Number(event.target.value)))}
                    className="w-32 rounded-2xl border border-border bg-background px-4 py-3.5 outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {t('plan.from')}
                  <input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    className="rounded-2xl border border-border bg-background px-4 py-3.5 outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {t('plan.to')}
                  <input
                    type="date"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                    className="rounded-2xl border border-border bg-background px-4 py-3.5 outline-none focus:ring-4 focus:ring-primary/20"
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="mt-8">
                <p className="text-sm leading-6 text-muted-foreground">{t('plan.chooseInterests')}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      aria-pressed={selectedInterests.includes(interest)}
                      className={`rounded-full border px-5 py-3 text-sm font-medium ${
                        selectedInterests.includes(interest)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:border-primary hover:text-primary'
                      }`}
                    >
                      {selectedInterests.includes(interest) && <Check className="mr-2 inline size-4" />}
                      {t(`interest.${interest.toLowerCase()}`) || interest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            {loading && <p role="status" className="mt-5 text-sm text-muted-foreground">{t('plan.loading')}</p>}

            <div className="mt-10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                disabled={step === 1 || loading}
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground disabled:invisible hover:bg-muted"
              >
                <ArrowLeft className="size-4" /> {t('plan.back')}
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep((current) => current + 1)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('plan.continue')} <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canContinue || loading}
                  onClick={createPlan}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? t('plan.creating') : t('plan.createDetailed')} <Sparkles className="size-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {activeOption === 'Create trip' && plan && (
          <article className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Check className="size-4" /> {t('plan.ready')}
                </p>
                <h2 className="mt-3 font-serif text-4xl">{plan.spotInfo.name ?? destination}</h2>
                <p className="mt-3 text-muted-foreground">
                  {t('plan.fromDates', { location: currentLocation, from, to })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPlan(null)
                  setStep(1)
                }}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                {t('plan.startOver')}
              </button>
            </div>

            {/* 1. Spot info (unchanged, from database) */}
            <SpotInformation spot={plan.spotInfo} />

            {/* 2. Google Map showing route from current location to destination with distance & travel time */}
            <RouteMapSection route={plan.routeInfo} spot={plan.spotInfo} origin={currentLocation} />

            {/* 3. Destination live weather & forecast */}
            <DestinationWeatherSection
              spot={plan.spotInfo}
              route={plan.routeInfo}
              onWeatherLoaded={setCurrentWeather}
            />

            {/* 4. Real-time budget at the bottom */}
            <RealtimeBudgetSection
              budget={plan.budgetPlan}
              onRefresh={handleRefreshBudget}
              isRefreshing={isRefreshingBudget}
            />

            {/* 5. Download Plan Action Bar */}
            <div className="mt-10 border-t border-border pt-8">
              <div className="flex flex-col gap-5 rounded-3xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="size-4" /> Ready for Offline Travel
                  </div>
                  <h4 className="mt-1 font-serif text-2xl font-bold text-foreground">
                    Download Trip Plan
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Export complete itinerary with spot details, route navigation, live 5-day weather forecast, and grounded budget table as a high-resolution, print-ready PDF.
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <RotateCw className="size-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="size-4" />
                        Download Plan
                      </>
                    )}
                  </button>
                </div>
              </div>

              {pdfError && (
                <div
                  role="alert"
                  className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive sm:text-sm"
                >
                  {pdfError}
                </div>
              )}
            </div>
          </article>
        )}

        {activeOption === 'My trips' && (
          <div className="grid gap-5 md:grid-cols-2">
            {savedTrips.map((trip, index) => (
              <article key={trip.title} className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl">
                      {t(index === 0 ? 'plan.savedNorthItaly' : 'plan.savedKyoto')}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t(index === 0 ? 'plan.savedItalyDetail' : 'plan.savedKyotoDetail')}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                    {t(index === 0 ? 'plan.inProgress' : 'plan.readyToPlan')}
                  </span>
                </div>
                <p className="mt-8 text-sm text-muted-foreground">{trip.dates}</p>
              </article>
            ))}
          </div>
        )}

        {activeOption === 'Saved itineraries' && (
          <div className="rounded-3xl bg-secondary p-8">
            <Sparkles className="size-6 text-primary" />
            <h2 className="mt-4 font-serif text-3xl">{t('plan.savedIdeas')}</h2>
            <p className="mt-3 max-w-lg leading-7 text-muted-foreground">{t('plan.savedIdeasIntro')}</p>
            <Link
              href="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {t('home.startExploring')} <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}