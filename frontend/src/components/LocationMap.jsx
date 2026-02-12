import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix default marker icon for Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function Recenter({ center, zoom = 15 }) {
  const map = useMap()
  useEffect(() => {
    if (center?.lat != null && center?.lng != null) {
      map.flyTo([center.lat, center.lng], zoom)
    }
  }, [center?.lat, center?.lng, map, zoom])
  return null
}

export function LocationMap({ center, selected, onSelect, height = "400px" }) {
  const fallbackCenter = [20.2961, 74.2376] // Kolhapur default
  const pos = selected ? [selected.lat, selected.lng] : center ? [center.lat, center.lng] : fallbackCenter

  return (
    <div style={{ height, width: "100%", borderRadius: "8px", overflow: "hidden" }}>
      <MapContainer
        center={pos}
        zoom={center || selected ? 15 : 12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={selected || center} zoom={15} />
        <MapClickHandler onLocationSelect={(lat, lng) => onSelect?.({ lat, lng })} />
        {(selected || (center && center.lat)) && (
          <Marker position={[selected?.lat ?? center?.lat, selected?.lng ?? center?.lng]} />
        )}
      </MapContainer>
    </div>
  )
}
