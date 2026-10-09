'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

export type MapPlace = {
  displayName: string
  latitude: number
  longitude: number
}

const MapCanvas = dynamic(() => import('./map-canvas'), {
  ssr: false,
  loading: () => <div className="grid h-[420px] place-items-center bg-secondary text-sm text-muted-foreground">Loading map…</div>,
})

export default function MapView({ place }: { place: MapPlace }) {
  return <section className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-foreground/5">
    <div className="p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <MapPin className="mt-1 size-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <h2 className="font-serif text-2xl">Map location</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{place.displayName}</p>
          <p className="mt-3 text-sm font-medium">Coordinates: {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}</p>
        </div>
      </div>
    </div>
    <MapCanvas place={place} />
  </section>
}
