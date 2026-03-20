import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import { MapPin, Trash2, Play, RotateCcw, Navigation, Loader } from 'lucide-react'
import L from 'leaflet'

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const stopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

// ── Haversine distance (used for TSP ordering only) ──────────
function haversine(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

// ── TSP nearest neighbor (orders the stops) ──────────────────
function tspNearestNeighbor(points) {
  if (points.length <= 2) return points.map((_, i) => i)
  const n = points.length
  const visited = new Array(n).fill(false)
  const route = [0]
  visited[0] = true
  for (let i = 1; i < n; i++) {
    const last = route[route.length - 1]
    let nearest = -1, minDist = Infinity
    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const d = haversine(points[last], points[j])
        if (d < minDist) { minDist = d; nearest = j }
      }
    }
    visited[nearest] = true
    route.push(nearest)
  }
  return route
}

// ── Fetch real road route from OSRM ─────────────────────────
async function fetchRoadRoute(orderedPoints) {
  // OSRM expects: lng,lat;lng,lat;...
  const coords = orderedPoints.map(p => `${p.lng},${p.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`

  const res = await fetch(url)
  const json = await res.json()

  if (json.code !== 'Ok') throw new Error('OSRM routing failed')

  const routeData = json.routes[0]

  // GeoJSON coordinates are [lng, lat] — flip to [lat, lng] for Leaflet
  const polyline = routeData.geometry.coordinates.map(([lng, lat]) => [lat, lng])

  // Distance in meters → km
  const distanceKm = (routeData.distance / 1000).toFixed(2)

  // Duration in seconds → minutes
  const durationMin = Math.round(routeData.duration / 60)

  return { polyline, distanceKm, durationMin }
}

// ── Map click handler ────────────────────────────────────────
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) })
  return null
}

// ── Preset locations (Dubai) ─────────────────────────────────
const PRESETS = [
  { name: 'Dubai Mall',        lat: 25.1972, lng: 55.2796 },
  { name: 'Dubai Airport',     lat: 25.2532, lng: 55.3657 },
  { name: 'Palm Jumeirah',     lat: 25.1124, lng: 55.1390 },
  { name: 'Burj Al Arab',      lat: 25.1412, lng: 55.1853 },
  { name: 'Dubai Marina',      lat: 25.0805, lng: 55.1403 },
  { name: 'Deira City Centre', lat: 25.2529, lng: 55.3296 },
  { name: 'JBR Beach',         lat: 25.0778, lng: 55.1338 },
]

export default function RouteOptimizer() {
  const [locations, setLocations]     = useState([])
  const [route, setRoute]             = useState([])
  const [roadPolyline, setRoadPolyline] = useState([])
  const [distanceKm, setDistanceKm]   = useState(null)
  const [durationMin, setDurationMin] = useState(null)
  const [optimized, setOptimized]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [inputName, setInputName]     = useState('')

  // ── Add stop via map click ───────────────────────────────
  const handleMapClick = useCallback((latlng) => {
    const name = inputName.trim() || `Stop ${locations.length + 1}`
    setLocations(prev => [...prev, { name, lat: latlng.lat, lng: latlng.lng }])
    setInputName('')
    resetResult()
  }, [inputName, locations.length])

  function addPreset(preset) {
    if (locations.find(l => l.name === preset.name)) return
    setLocations(prev => [...prev, preset])
    resetResult()
  }

  function removeLocation(index) {
    setLocations(prev => prev.filter((_, i) => i !== index))
    resetResult()
  }

  function resetResult() {
    setOptimized(false)
    setRoute([])
    setRoadPolyline([])
    setDistanceKm(null)
    setDurationMin(null)
    setError('')
  }

  function reset() {
    setLocations([])
    setInputName('')
    resetResult()
  }

  // ── Main optimize function ───────────────────────────────
  async function optimize() {
    if (locations.length < 2) return
    setLoading(true)
    setError('')

    try {
      // Step 1: order stops using TSP nearest neighbor
      const routeOrder = tspNearestNeighbor(locations)
      setRoute(routeOrder)

      // Step 2: build ordered points array (close the loop back to start)
      const orderedPoints = [
        ...routeOrder.map(i => locations[i]),
        locations[routeOrder[0]], // return to start
      ]

      // Step 3: fetch real road route from OSRM
      const { polyline, distanceKm, durationMin } = await fetchRoadRoute(orderedPoints)

      setRoadPolyline(polyline)
      setDistanceKm(distanceKm)
      setDurationMin(durationMin)
      setOptimized(true)
    } catch (err) {
      setError('Could not fetch road route. Check your internet connection.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Route Optimizer</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add delivery stops, then optimize for the shortest real road route
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left panel ──────────────────────────────────── */}
        <div className="space-y-4">

          {/* Name input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-600">Add Stop</h3>
            <input
              type="text"
              placeholder="Stop name (optional)"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400">
              Then click anywhere on the map to place the stop
            </p>
          </div>

          {/* Presets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-600">Quick Add (Dubai)</h3>
            <div className="space-y-1">
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  onClick={() => addPreset(p)}
                  disabled={!!locations.find(l => l.name === p.name)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  📍 {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stop list */}
          {locations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-600">
                Stops ({locations.length})
              </h3>
              {locations.map((loc, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-green-500' : 'bg-red-400'}`}>
                      {i === 0 ? '★' : i}
                    </span>
                    <span className="text-xs text-gray-700 font-medium">{loc.name}</span>
                  </div>
                  <button onClick={() => removeLocation(i)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={optimize}
              disabled={locations.length < 2 || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading
                ? <><Loader size={14} className="animate-spin" /> Fetching route...</>
                : <><Play size={14} /> Optimize Route</>
              }
            </button>
            <button
              onClick={reset}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Result */}
          {optimized && distanceKm && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-green-700">Optimized Route</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2 text-center border border-green-100">
                  <p className="text-lg font-bold text-green-700">{distanceKm}</p>
                  <p className="text-xs text-gray-500">km by road</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-green-100">
                  <p className="text-lg font-bold text-blue-600">{durationMin}</p>
                  <p className="text-xs text-gray-500">min est.</p>
                </div>
              </div>

              <div className="space-y-1">
                {route.map((idx, step) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">
                      {step + 1}
                    </span>
                    {locations[idx].name}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0">↩</span>
                  Return to {locations[route[0]]?.name}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Map ─────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
              <MapPin size={14} className="text-blue-500" />
              <span className="text-xs text-gray-500">
                {locations.length === 0
                  ? 'Click the map to add delivery stops'
                  : `${locations.length} stop${locations.length > 1 ? 's' : ''} — ${locations.length >= 2 ? 'ready to optimize' : 'add at least one more'}`}
              </span>
            </div>
            <MapContainer
              center={[25.1972, 55.2744]}
              zoom={11}
              style={{ height: '520px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />

              {/* Markers */}
              {locations.map((loc, i) => (
                <Marker
                  key={i}
                  position={[loc.lat, loc.lng]}
                  icon={i === 0 ? startIcon : stopIcon}
                >
                  <Popup>
                    <strong>{loc.name}</strong><br />
                    <span className="text-xs text-gray-500">
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </span>
                  </Popup>
                </Marker>
              ))}

              {/* Real road polyline from OSRM */}
              {optimized && roadPolyline.length > 0 && (
                <Polyline
                  positions={roadPolyline}
                  color="#2563eb"
                  weight={4}
                  opacity={0.8}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}