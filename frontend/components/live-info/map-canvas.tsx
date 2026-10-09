'use client'

import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import type { MapPlace } from './map-view'

Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIconRetina.src,
  shadowUrl: markerShadow.src,
})

export default function MapCanvas({ place }: { place: MapPlace }) {
  return <MapContainer
    key={`${place.latitude},${place.longitude}`}
    center={[place.latitude, place.longitude]}
    zoom={13}
    scrollWheelZoom={false}
    className="h-[420px] w-full"
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[place.latitude, place.longitude]}>
      <Popup>{place.displayName}</Popup>
    </Marker>
  </MapContainer>
}
