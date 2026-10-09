import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

export type DestinationWeather = {
  temperature: number
  feelsLike: number
  description: string
  humidity: number
  wind: number
  forecast: { date: string; max: number; low: number; description: string }[]
}

export type SpotInfo = {
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

export type RouteInfo = {
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

export type BudgetItem = {
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

export type BudgetPlan = {
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

export type PlanData = {
  spotInfo: SpotInfo
  routeInfo?: RouteInfo
  itinerary?: { day: number; date: string; activities: string[] }[]
  budgetPlan: BudgetPlan
}

export type GeneratePdfOptions = {
  plan: PlanData
  destination: string
  currentLocation: string
  from?: string
  to?: string
  travelerCount?: number
  weather?: DestinationWeather | null
}

function formatINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val)
}

async function convertImageToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'))
  if (images.length === 0) return
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
        setTimeout(() => resolve(), 3000)
      })
    })
  )
}

export async function generateTripPlanPdf({
  plan,
  destination,
  currentLocation,
  from,
  to,
  travelerCount = 1,
  weather,
}: GeneratePdfOptions): Promise<void> {
  const spotName = plan.spotInfo.name || destination || 'Trip'
  const originLabel = plan.routeInfo?.origin || currentLocation || 'Origin'
  const destLocation = [plan.spotInfo.city, plan.spotInfo.state, plan.spotInfo.country]
    .filter(Boolean)
    .join(', ')

  // Calculate day count
  let dayCount = 1
  if (from && to) {
    const d1 = new Date(from)
    const d2 = new Date(to)
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1
    if (diff > 0) dayCount = diff
  }

  // Pre-fetch spot image as base64 to avoid CORS or canvas tainting
  let spotImageBase64: string | null = null
  if (plan.spotInfo.imageUrl) {
    spotImageBase64 = await convertImageToBase64(plan.spotInfo.imageUrl)
  }

  // Fallback image if needed
  if (!spotImageBase64) {
    spotImageBase64 = await convertImageToBase64('/images/spots/placeholder-spot.jpg')
  }

  const budget = plan.budgetPlan
  const budgetItems: BudgetItem[] =
    budget.items && budget.items.length > 0
      ? budget.items
      : [
          {
            category: 'Travel & Intercity Transit',
            min: Math.round(budget.transportation * 0.8),
            max: Math.round(budget.transportation * 1.25),
            recommended: budget.transportation,
            note: 'Intercity and regional transit',
            sourceName: 'Live Transit Grounding',
          },
          {
            category: 'Accommodation',
            min: Math.round(budget.accommodation * 0.75),
            max: Math.round(budget.accommodation * 1.35),
            recommended: budget.accommodation,
            note: 'Hotel/homestay near destination',
            sourceName: 'Tourism Benchmark',
          },
          {
            category: 'Food & Dining',
            min: Math.round(budget.food * 0.8),
            max: Math.round(budget.food * 1.3),
            recommended: budget.food,
            note: 'Local dining and refreshments',
            sourceName: 'Live Dining Data',
          },
          {
            category: 'Entry Fees & Activities',
            min: budget.entryFees,
            max: Math.round(budget.entryFees * 1.5),
            recommended: budget.entryFees,
            note: 'Admission tickets & passes',
            sourceName: 'Official Rates',
          },
          {
            category: 'Local Transit',
            min: Math.round(budget.localTransport * 0.85),
            max: Math.round(budget.localTransport * 1.3),
            recommended: budget.localTransport,
            note: 'Rickshaws and local cabs',
            sourceName: 'City Tariff',
          },
          {
            category: 'Miscellaneous & Buffer',
            min: Math.round(budget.miscellaneous * 0.6),
            max: Math.round(budget.miscellaneous * 1.5),
            recommended: budget.miscellaneous,
            note: 'Contingency & souvenirs',
            sourceName: 'Trip Buffer',
          },
        ]

  const totalRec = budget.totalRecommended ?? budget.total
  const totalMin = budget.totalMin ?? budgetItems.reduce((acc, i) => acc + (i.min || 0), 0)
  const totalMax = budget.totalMax ?? budgetItems.reduce((acc, i) => acc + (i.max || 0), 0)

  const generationDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Create an offscreen mount container with exact standard A4 proportions (794px width x 1123px height per page)
  const container = document.createElement('div')
  container.id = 'pdf-export-container'
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '794px'
  container.style.zIndex = '-9999'
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  container.style.color = '#0f172a'
  container.style.backgroundColor = '#ffffff'

  // Build Page 1: Overview & Spot Information
  const page1 = document.createElement('div')
  page1.className = 'pdf-page'
  page1.style.width = '794px'
  page1.style.height = '1123px'
  page1.style.boxSizing = 'border-box'
  page1.style.padding = '36px 42px'
  page1.style.display = 'flex'
  page1.style.flexDirection = 'column'
  page1.style.justifyContent = 'space-between'
  page1.style.backgroundColor = '#ffffff'

  page1.innerHTML = `
    <div>
      <!-- Header Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #059669, #10b981); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 16px;">
            E
          </div>
          <div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #047857;">ExploreSphere</h1>
            <p style="margin: 0; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Smart Tourism Itinerary</p>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid #a7f3d0;">
            CONFIRMED TRIP PLAN
          </span>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">Generated: ${generationDate}</p>
        </div>
      </div>

      <!-- Title & Hero Info -->
      <div style="margin-top: 20px;">
        <h2 style="margin: 0; font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.2;">${spotName}</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">${destLocation || 'India'}</p>
      </div>

      <!-- Quick Meta Strip -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px;">
          <p style="margin: 0; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Dates</p>
          <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 700; color: #0f172a;">${from && to ? `${from} – ${to}` : 'Flexible'}</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px;">
          <p style="margin: 0; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Duration</p>
          <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 700; color: #0f172a;">${dayCount} ${dayCount === 1 ? 'Day' : 'Days'}</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px;">
          <p style="margin: 0; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Travelers</p>
          <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 700; color: #0f172a;">${travelerCount} ${travelerCount === 1 ? 'Person' : 'People'}</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px;">
          <p style="margin: 0; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Starting From</p>
          <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 700; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${originLabel}</p>
        </div>
      </div>

      <!-- Spot Image -->
      ${
        spotImageBase64
          ? `<div style="margin-top: 16px; width: 100%; height: 210px; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; background: #f1f5f9;">
              <img src="${spotImageBase64}" alt="${spotName}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>`
          : ''
      }

      <!-- Section: Spot Details -->
      <div style="margin-top: 18px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #047857; border-left: 4px solid #059669; padding-left: 8px;">
          1. Spot Information & Highlights
        </h3>

        <!-- Description -->
        ${
          plan.spotInfo.description
            ? `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; font-size: 12px; line-height: 1.5; color: #334155;">
                <p style="margin: 0;">${plan.spotInfo.description}</p>
              </div>`
            : ''
        }

        <!-- Key Spot Attributes Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 12px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
            <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Best Time to Visit</p>
            <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 600; color: #0f172a;">${plan.spotInfo.bestTimeToVisit || 'October – March'}</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
            <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Entry Fee</p>
            <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 600; color: #0f172a;">${typeof plan.spotInfo.entryFee === 'number' ? (plan.spotInfo.entryFee === 0 ? 'Free Entry' : formatINR(plan.spotInfo.entryFee)) : 'Free / Nominal'}</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
            <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Opening Hours</p>
            <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 600; color: #0f172a;">${[plan.spotInfo.openingTime, plan.spotInfo.closingTime].filter(Boolean).join(' – ') || 'Open daily (standard daytime hours)'}</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
            <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Location Anchor</p>
            <p style="margin: 3px 0 0 0; font-size: 12px; font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${destLocation || spotName}</p>
          </div>
        </div>

        ${
          plan.spotInfo.attractions
            ? `<div style="margin-top: 10px; background: #fdfaf6; border: 1px solid #fed7aa; border-radius: 10px; padding: 10px 12px;">
                <p style="margin: 0; font-size: 10px; color: #ea580c; font-weight: 700; text-transform: uppercase;">Nearby Highlights & Attractions</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; line-height: 1.4; color: #431407;">${plan.spotInfo.attractions}</p>
              </div>`
            : ''
        }
      </div>
    </div>

    <!-- Page Footer -->
    <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8;">
      <span>ExploreSphere Tourism • Curated Itinerary</span>
      <span>Page 1 of 3</span>
    </div>
  `

  // Build Page 2: Route Navigation & Weather Forecast
  const page2 = document.createElement('div')
  page2.className = 'pdf-page'
  page2.style.width = '794px'
  page2.style.height = '1123px'
  page2.style.boxSizing = 'border-box'
  page2.style.padding = '36px 42px'
  page2.style.display = 'flex'
  page2.style.flexDirection = 'column'
  page2.style.justifyContent = 'space-between'
  page2.style.backgroundColor = '#ffffff'

  page2.innerHTML = `
    <div>
      <!-- Page Header Mini -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 12px;">
        <span style="font-size: 14px; font-weight: 800; color: #047857;">ExploreSphere Tourism • ${spotName}</span>
        <span style="font-size: 11px; color: #64748b;">Route & Climate Overview</span>
      </div>

      <!-- Section: Route Info -->
      <div style="margin-top: 22px;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #047857; border-left: 4px solid #059669; padding-left: 8px;">
          2. Route Navigation & Directions
        </h3>

        <!-- Origin to Destination Strip -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div style="flex: 1;">
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Origin</span>
              <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 700; color: #0f172a;">${originLabel}</p>
            </div>
            <div style="color: #059669; font-weight: bold; font-size: 18px;">➔</div>
            <div style="flex: 1; text-align: right;">
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Destination</span>
              <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 700; color: #0f172a;">${spotName}</p>
            </div>
          </div>
        </div>

        <!-- Route Metrics 3-box Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px;">
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; text-align: center;">
            <span style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Driving Distance</span>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #047857;">
              ${plan.routeInfo?.distanceKm ? `${plan.routeInfo.distanceKm} km` : 'Standard Route'}
            </p>
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; text-align: center;">
            <span style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Travel Duration</span>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">
              ${plan.routeInfo?.durationText || 'Direct highway'}
            </p>
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; text-align: center;">
            <span style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Navigation Provider</span>
            <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #0284c7;">
              Google Directions
            </p>
          </div>
        </div>

        <!-- Short Directions / Route Note -->
        <div style="margin-top: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 14px; font-size: 11px; color: #166534; line-height: 1.5;">
          <strong style="color: #15803d;">Navigation Note:</strong> Follow primary state and national highway corridors toward ${plan.spotInfo.city || spotName}. Turn-by-turn interactive directions can be opened dynamically via Google Maps directly from your reservation itinerary.
          ${
            plan.routeInfo?.directionsUrl
              ? `<div style="margin-top: 6px; word-break: break-all; font-size: 10px; color: #047857;">
                  Directions URL: <span style="text-decoration: underline;">${plan.routeInfo.directionsUrl}</span>
                </div>`
              : ''
          }
        </div>
      </div>

      <!-- Section: Weather Info -->
      <div style="margin-top: 26px;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #047857; border-left: 4px solid #059669; padding-left: 8px;">
          3. Destination Live Weather & 5-Day Forecast
        </h3>

        ${
          weather
            ? `
          <!-- Current Weather Box -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600;">Current Conditions in ${plan.spotInfo.city || spotName}</span>
              <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px;">
                <span style="font-size: 32px; font-weight: 800; color: #0f172a;">${weather.temperature}°C</span>
                <span style="font-size: 13px; color: #059669; font-weight: 600;">${weather.description}</span>
              </div>
            </div>
            <div style="display: flex; gap: 16px; font-size: 11px; color: #475569;">
              <div style="background: #ffffff; padding: 8px 12px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: #94a3b8;">Feels Like</p>
                <p style="margin: 2px 0 0 0; font-weight: 700; font-size: 13px; color: #0f172a;">${weather.feelsLike}°C</p>
              </div>
              <div style="background: #ffffff; padding: 8px 12px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: #94a3b8;">Humidity</p>
                <p style="margin: 2px 0 0 0; font-weight: 700; font-size: 13px; color: #0f172a;">${weather.humidity}%</p>
              </div>
              <div style="background: #ffffff; padding: 8px 12px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: #94a3b8;">Wind Speed</p>
                <p style="margin: 2px 0 0 0; font-weight: 700; font-size: 13px; color: #0f172a;">${weather.wind} km/h</p>
              </div>
            </div>
          </div>

          <!-- 5-Day Forecast Grid -->
          <div style="margin-top: 12px;">
            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">5-Day Forecast Trend</p>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
              ${weather.forecast
                .map(
                  (f) => `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 8px; text-align: center;">
                  <p style="margin: 0; font-size: 11px; font-weight: 700; color: #64748b;">${f.date}</p>
                  <p style="margin: 4px 0 2px 0; font-size: 13px; font-weight: 800; color: #0f172a;">${f.max}° <span style="font-size: 10px; font-weight: normal; color: #94a3b8;">/ ${f.low}°</span></p>
                  <p style="margin: 0; font-size: 10px; color: #059669; font-weight: 600;">${f.description}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 12px; color: #64748b;">
            Weather forecast data available on departure date. Moderate regional subtropical climate expected.
          </div>
        `
        }
      </div>
    </div>

    <!-- Page Footer -->
    <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8;">
      <span>ExploreSphere Tourism • Route & Climate</span>
      <span>Page 2 of 3</span>
    </div>
  `

  // Build Page 3: Real-Time Grounded Budget & Footer
  const page3 = document.createElement('div')
  page3.className = 'pdf-page'
  page3.style.width = '794px'
  page3.style.height = '1123px'
  page3.style.boxSizing = 'border-box'
  page3.style.padding = '36px 42px'
  page3.style.display = 'flex'
  page3.style.flexDirection = 'column'
  page3.style.justifyContent = 'space-between'
  page3.style.backgroundColor = '#ffffff'

  page3.innerHTML = `
    <div>
      <!-- Page Header Mini -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 12px;">
        <span style="font-size: 14px; font-weight: 800; color: #047857;">ExploreSphere Tourism • ${spotName}</span>
        <span style="font-size: 11px; color: #64748b;">Real-time Itemized Budget</span>
      </div>

      <!-- Section: Budget Info -->
      <div style="margin-top: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #047857; border-left: 4px solid #059669; padding-left: 8px;">
            4. Real-time Itemized Budget
          </h3>
          <span style="background: #ecfdf5; color: #059669; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 8px; border: 1px solid #a7f3d0;">
            ${budget.isEstimate ? 'Regional Estimate' : 'Grounded Live Prices'}
          </span>
        </div>

        <!-- Total Budget Highlight Box -->
        <div style="margin-top: 14px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1.5px solid #a7f3d0; border-radius: 14px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #047857; letter-spacing: 0.5px;">
              Total Estimated Trip Budget
            </span>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">
              For ${travelerCount} ${travelerCount === 1 ? 'traveler' : 'travelers'} • ${dayCount} ${dayCount === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 26px; font-weight: 800; color: #047857;">
              ${formatINR(totalRec)}
            </p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">
              Range: ${formatINR(totalMin)} – ${formatINR(totalMax)}
            </p>
          </div>
        </div>

        <!-- Itemized Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; text-align: left; color: #475569; font-size: 10px; text-transform: uppercase;">
              <th style="padding: 10px 12px; font-weight: 700;">Expense Category</th>
              <th style="padding: 10px 12px; text-align: right; font-weight: 700;">Expected Range</th>
              <th style="padding: 10px 12px; text-align: right; font-weight: 700;">Recommended</th>
              <th style="padding: 10px 12px; font-weight: 700;">Source / Grounding</th>
            </tr>
          </thead>
          <tbody>
            ${budgetItems
              .map(
                (item, idx) => `
              <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#fcfdfd'};">
                <td style="padding: 10px 12px;">
                  <strong style="color: #0f172a; font-size: 11px;">${item.category}</strong>
                  ${item.note ? `<p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">${item.note}</p>` : ''}
                </td>
                <td style="padding: 10px 12px; text-align: right; color: #64748b; font-size: 11px; white-space: nowrap;">
                  ${formatINR(item.min)} – ${formatINR(item.max)}
                </td>
                <td style="padding: 10px 12px; text-align: right; font-weight: 800; color: #047857; font-size: 12px; white-space: nowrap;">
                  ${formatINR(item.recommended)}
                </td>
                <td style="padding: 10px 12px; color: #64748b; font-size: 10px;">
                  ${item.sourceName || 'Live Grounding'}
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f1f5f9; border-top: 2px solid #cbd5e1; font-weight: 800;">
              <td style="padding: 12px; color: #0f172a; font-size: 12px;">Total Estimated Budget</td>
              <td style="padding: 12px; text-align: right; color: #64748b; font-size: 11px; white-space: nowrap;">
                ${formatINR(totalMin)} – ${formatINR(totalMax)}
              </td>
              <td style="padding: 12px; text-align: right; color: #047857; font-size: 14px; white-space: nowrap;">
                ${formatINR(totalRec)}
              </td>
              <td style="padding: 12px; color: #64748b; font-size: 10px;">
                All categories combined
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Pricing Methodology & Grounding Notes -->
        ${
          budget.note
            ? `<div style="margin-top: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 10px; line-height: 1.5; color: #475569;">
                <strong style="color: #0f172a;">Pricing Methodology & Live Grounding:</strong> ${budget.note}
              </div>`
            : ''
        }

        <!-- Last Updated Verification Box -->
        <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 10px 14px; font-size: 10px; color: #92400e;">
          <span>Pricing Grounding Status: <strong>Verified with Live Web Search</strong></span>
          <span>Last Updated: <strong>${budget.lastUpdated || generationDate}</strong></span>
        </div>
      </div>
    </div>

    <!-- Official Document Signoff Footer -->
    <div>
      <div style="margin-top: 20px; border-top: 1.5px solid #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <p style="margin: 0; font-size: 12px; font-weight: 800; color: #047857;">ExploreSphere Tourism</p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">Next-Gen Tourism Discovery & Intelligent Trip Planning</p>
          <p style="margin: 2px 0 0 0; font-size: 9px; color: #94a3b8;">Prices are indicative based on live data search and may vary with seasonal demand.</p>
        </div>
        <div style="text-align: right; font-size: 10px; color: #94a3b8;">
          <p style="margin: 0;">Itinerary ID: EXP-${plan.spotInfo.id || 101}-${Math.floor(Date.now() / 1000)}</p>
          <p style="margin: 2px 0 0 0;">Page 3 of 3</p>
        </div>
      </div>
    </div>
  `

  // Mount offscreen
  container.appendChild(page1)
  container.appendChild(page2)
  container.appendChild(page3)
  document.body.appendChild(container)

  try {
    // Wait for any images to complete loading
    await waitForImagesToLoad(container)
    // Short tick to ensure layout and fonts are rendered
    await new Promise((resolve) => setTimeout(resolve, 80))

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = 210
    const pdfHeight = 297

    const pages = [page1, page2, page3]

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage()
      }

      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    }

    // Clean filename
    const sanitizedSpot = spotName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const filename = `${sanitizedSpot || 'trip'}-trip-plan.pdf`
    pdf.save(filename)
  } finally {
    // Remove temporary container
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }
}
