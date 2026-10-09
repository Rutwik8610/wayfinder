'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import {
  Cloud,
  CloudRain,
  Compass,
  Loader2,
  MapPin,
  Search,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Sparkles,
} from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { authenticatedFetch } from '../../lib/auth-session'
import MapView, { type MapPlace } from '../../components/live-info/map-view'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

type ForecastDay = {
  date: string
  temperature: number
  low: number
  description: string
  icon: 'sun' | 'rain' | 'cloud'
}

type Weather = {
  location: string
  temperature: number
  feelsLike: number
  wind: number
  humidity: number
  description: string
  icon: 'sun' | 'rain' | 'cloud'
  forecast: ForecastDay[]
}

type LiveInfoMode = 'weather' | 'map'

function weatherDescription(code: number, t: (key: string) => string) {
  if (code === 0 || code === 1) return { description: t('weather.clearSky') || 'Clear sky', icon: 'sun' as const }
  if (code >= 51 && code <= 82) return { description: t('weather.lightRain') || 'Light rain', icon: 'rain' as const }
  return { description: t('weather.partlyCloudy') || 'Partly cloudy', icon: 'cloud' as const }
}

function formatDay(date: string, language: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'short',
  })
}

export default function LiveInfoPage() {
  const { language, t } = useAppSettings()
  const [mode, setMode] = useState<LiveInfoMode | null>('weather')
  const [location, setLocation] = useState('')
  const [weather, setWeather] = useState<Weather | null>(null)
  const [mapPlace, setMapPlace] = useState<MapPlace | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = location.trim()
    if (!query) {
      setError('Enter a place or city name to continue.')
      return
    }
    if (!mode) return

    setLoading(true)
    setError('')
    setWeather(null)
    setMapPlace(null)

    try {
      if (mode === 'map') {
        await new Promise((resolve) => window.setTimeout(resolve, 350))
        const response = await authenticatedFetch(`/api/map/geocode?q=${encodeURIComponent(query)}`)
        const result = (await response.json().catch(() => ({}))) as Partial<MapPlace> & {
          detail?: string
          message?: string
        }
        if (!response.ok) {
          if (response.status === 404 && result.detail === 'Place not found.') {
            throw new Error('Place not found. Try a more specific name.')
          }
          if (response.status === 404) {
            throw new Error('The map search endpoint was not found. Restart the Spring Boot backend and try again.')
          }
          throw new Error(result.detail || result.message || 'Could not search for this place. Please try again.')
        }
        if (
          typeof result.displayName !== 'string' ||
          typeof result.latitude !== 'number' ||
          typeof result.longitude !== 'number'
        ) {
          throw new Error('The map search returned an invalid result. Restart the Spring Boot backend and try again.')
        }
        setMapPlace({
          displayName: result.displayName,
          latitude: result.latitude,
          longitude: result.longitude,
        })
        return
      }

      const placeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=1&language=${language}&format=json`
      )
      const placeData = await placeResponse.json()
      const place = placeData.results?.[0]
      if (!place) throw new Error(t('live.notFound') || 'Place not found.')

      const forecastResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
      )
      const forecastData = await forecastResponse.json()
      const current = forecastData.current
      const forecast = forecastData.daily.time.map((date: string, index: number) => ({
        date,
        temperature: Math.round(forecastData.daily.temperature_2m_max[index]),
        low: Math.round(forecastData.daily.temperature_2m_min[index]),
        ...weatherDescription(forecastData.daily.weather_code[index], t),
      }))

      setWeather({
        location: `${place.name}${place.country ? `, ${place.country}` : ''}`,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        wind: Math.round(current.wind_speed_10m),
        humidity: current.relative_humidity_2m,
        ...weatherDescription(current.weather_code, t),
        forecast,
      })
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : t('live.error'))
    } finally {
      setLoading(false)
    }
  }

  function selectMode(nextMode: LiveInfoMode) {
    setMode(nextMode)
    setWeather(null)
    setMapPlace(null)
    setError('')
    setLocation('')
  }

  const WeatherIcon = weather?.icon === 'sun' ? Sun : weather?.icon === 'rain' ? CloudRain : Cloud

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="size-4" /> {t('live.eyebrow') || 'Real-time Intelligence'}
            </span>
            <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-6xl">
              {t('live.title') || 'Live Weather & Interactive Maps'}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t('live.intro') || 'Check current temperature, 5-day weather forecasts, and geocoded destination maps in seconds.'}
            </p>

            {/* Segmented Mode Selector */}
            <div
              className="mx-auto mt-8 grid max-w-md grid-cols-2 rounded-2xl border border-border bg-muted/60 p-1"
              role="group"
              aria-label="Live information type"
            >
              <button
                type="button"
                aria-pressed={mode === 'weather'}
                onClick={() => selectMode('weather')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                  mode === 'weather'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sun className="size-4 text-amber-500" />
                Weather Info
              </button>
              <button
                type="button"
                aria-pressed={mode === 'map'}
                onClick={() => selectMode('map')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                  mode === 'map'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MapPin className="size-4 text-primary" />
                Map Info
              </button>
            </div>

            {/* Search Input Form */}
            {mode && (
              <form onSubmit={handleSearch} className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
                <label className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm focus-within:border-primary transition">
                  <MapPin className="size-5 text-primary shrink-0" />
                  <span className="sr-only">{t('live.locationLabel')}</span>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder={
                      mode === 'weather'
                        ? 'Search city (e.g. Solapur, Pune, Tokyo)...'
                        : 'Search landmark (e.g. Siddheshwar Temple, Solapur)...'
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  <span>{loading ? 'Searching…' : mode === 'weather' ? 'Check Weather' : 'Find on Map'}</span>
                </button>
              </form>
            )}

            {error && (
              <div
                role="alert"
                className="mx-auto mt-4 max-w-xl rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
              >
                {error}
              </div>
            )}
          </div>

          {/* Weather Result Display */}
          {mode === 'weather' &&
            (weather ? (
              <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-8">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <MapPin className="size-4" />
                      <span>{weather.location}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-5">
                      <WeatherIcon className="size-16 text-amber-500" />
                      <div>
                        <span className="font-serif text-6xl font-bold">{weather.temperature}°C</span>
                        <p className="mt-1 text-sm font-semibold text-foreground">{weather.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:min-w-64">
                    <div className="rounded-2xl border border-border bg-muted/40 p-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Thermometer className="size-3.5 text-primary" />
                        <span>{t('live.feelsLike') || 'Feels like'}</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold font-serif">{weather.feelsLike}°C</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/40 p-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Droplets className="size-3.5 text-primary" />
                        <span>{t('live.humidity') || 'Humidity'}</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold font-serif">{weather.humidity}%</p>
                    </div>

                    <div className="col-span-2 flex items-center gap-2.5 rounded-2xl border border-border bg-muted/40 p-3.5 text-xs">
                      <Wind className="size-4 text-primary shrink-0" />
                      <span>
                        Wind speed: <strong>{weather.wind} km/h</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-xl font-bold">5-Day Weather Forecast</h3>
                    <Cloud className="size-5 text-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {weather.forecast.map((day) => {
                      const DayIcon =
                        day.icon === 'sun' ? Sun : day.icon === 'rain' ? CloudRain : Cloud
                      return (
                        <div key={day.date} className="rounded-2xl border border-border bg-muted/30 p-3.5 text-center">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {formatDay(day.date, language)}
                          </p>
                          <DayIcon className="mx-auto my-3 size-6 text-amber-500" />
                          <p className="text-base font-bold">{day.temperature}°</p>
                          <p className="text-xs text-muted-foreground">{t('live.low', { temperature: day.low })}</p>
                          <p className="mt-1 truncate text-[11px] text-muted-foreground">{day.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
                <Cloud className="size-12 text-primary/50" />
                <h3 className="mt-4 font-serif text-xl font-bold">{t('live.forecastEmptyTitle') || 'Search for any destination'}</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {t('live.forecastEmptyIntro') || 'Enter a city or place name above to view real-time meteorological conditions and temperature trends.'}
                </p>
              </div>
            ))}

          {/* Map Result Display */}
          {mode === 'map' && mapPlace && <MapView place={mapPlace} />}
        </section>
      </main>

      <Footer />
    </div>
  )
}
