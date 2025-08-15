"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import maplibregl, { Map, Marker } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Button } from "@/components/ui/button"
import { useGeolocation, calculateDistance } from "@/hooks/use-geolocation"

interface SpawnPoint {
	id: string
	latitude: number
	longitude: number
	collectedAt?: number
}

const SPAWN_KEY = "ablecheck-spawn-points"
const LAST_SPAWN_AT_KEY = "ablecheck-last-spawn-at"

function randomNearbyCoordinate(lat: number, lon: number, maxMeters: number): { lat: number; lon: number } {
	const distance = Math.random() * maxMeters
	const bearing = Math.random() * 2 * Math.PI
	const dLat = (distance * Math.cos(bearing)) / 111111
	const dLon = (distance * Math.sin(bearing)) / (111111 * Math.cos((lat * Math.PI) / 180))
	return { lat: lat + dLat, lon: lon + dLon }
}

function loadSpawnPoints(): SpawnPoint[] {
	if (typeof window === "undefined") return []
	try {
		const raw = window.localStorage.getItem(SPAWN_KEY)
		return raw ? (JSON.parse(raw) as SpawnPoint[]) : []
	} catch {
		return []
	}
}

function saveSpawnPoints(points: SpawnPoint[]) {
	if (typeof window === "undefined") return
	window.localStorage.setItem(SPAWN_KEY, JSON.stringify(points))
}

function getLastSpawnAt(): number | null {
	if (typeof window === "undefined") return null
	const raw = window.localStorage.getItem(LAST_SPAWN_AT_KEY)
	return raw ? Number(raw) : null
}

function setLastSpawnAt(ts: number) {
	if (typeof window === "undefined") return
	window.localStorage.setItem(LAST_SPAWN_AT_KEY, String(ts))
}

export function MapView() {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const mapRef = useRef<Map | null>(null)
	const userMarkerRef = useRef<Marker | null>(null)
	const spawnMarkerRefs = useRef<Map<string, Marker>>(new Map())

	const { position, getCurrentPosition, watchPosition, clearWatch } = useGeolocation()

	const [spawnPoints, setSpawnPoints] = useState<SpawnPoint[]>(loadSpawnPoints())
	const uncollected = useMemo(() => spawnPoints.filter(p => !p.collectedAt), [spawnPoints])

	// initialize map at user location
	useEffect(() => {
		getCurrentPosition()
	}, [getCurrentPosition])

	useEffect(() => {
		if (!containerRef.current || !position) return
		if (mapRef.current) return

		const map = new maplibregl.Map({
			container: containerRef.current,
			style: "https://demotiles.maplibre.org/style.json",
			center: [position.longitude, position.latitude],
			zoom: 14,
			attributionControl: true,
		})

		mapRef.current = map

		// Add a small dot for user position
		userMarkerRef.current = new maplibregl.Marker({ color: "#2563eb" })
			.setLngLat([position.longitude, position.latitude])
			.addTo(map)

		return () => {
			spawnMarkerRefs.current.forEach(m => m.remove())
			spawnMarkerRefs.current.clear()
			userMarkerRef.current?.remove()
			map.remove()
			mapRef.current = null
		}
	}, [position])

	// update user position marker and recenter softly
	useEffect(() => {
		if (!position || !mapRef.current) return
		if (!userMarkerRef.current) {
			userMarkerRef.current = new maplibregl.Marker({ color: "#2563eb" })
				.setLngLat([position.longitude, position.latitude])
				.addTo(mapRef.current)
		} else {
			userMarkerRef.current.setLngLat([position.longitude, position.latitude])
		}
	}, [position])

	// spawn 10 points each hour near current position
	useEffect(() => {
		if (!position) return
		const last = getLastSpawnAt()
		const now = Date.now()
		const oneHour = 60 * 60 * 1000
		if (!last || now - last >= oneHour) {
			const newPoints: SpawnPoint[] = []
			for (let i = 0; i < 10; i++) {
				const { lat, lon } = randomNearbyCoordinate(position.latitude, position.longitude, 500)
				newPoints.push({ id: `${now}-${i}-${Math.random().toString(36).slice(2)}`, latitude: lat, longitude: lon })
			}
			const updated = [...spawnPoints, ...newPoints]
			setSpawnPoints(updated)
			saveSpawnPoints(updated)
			setLastSpawnAt(now)
		}
	}, [position])

	// render spawn markers
	useEffect(() => {
		const map = mapRef.current
		if (!map) return

		// remove markers for collected points
		spawnMarkerRefs.current.forEach((marker, id) => {
			const stillExists = uncollected.some(p => p.id === id)
			if (!stillExists) {
				marker.remove()
				spawnMarkerRefs.current.delete(id)
			}
		})

		// add markers for new points
		for (const point of uncollected) {
			if (spawnMarkerRefs.current.has(point.id)) continue
			const marker = new maplibregl.Marker({ color: "#ef4444" })
				.setLngLat([point.longitude, point.latitude])
				.addTo(map)
			spawnMarkerRefs.current.set(point.id, marker)
		}
	}, [uncollected])

	// watch user position and collect nearby points
	useEffect(() => {
		const id = watchPosition((pos) => {
			setSpawnPoints((prev) => {
				let changed = false
				const next = prev.map(p => {
					if (p.collectedAt) return p
					const d = calculateDistance(pos.latitude, pos.longitude, p.latitude, p.longitude)
					if (d <= 30) {
						changed = true
						return { ...p, collectedAt: Date.now() }
					}
					return p
				})
				if (changed) {
					saveSpawnPoints(next)
				}
				return next
			})
		})
		return () => {
			if (typeof id === "number") clearWatch(id)
		}
	}, [watchPosition, clearWatch])

	return (
		<div className="w-full">
			<div ref={containerRef} className="w-full h-[50vh] rounded-lg overflow-hidden border" />
			<div className="mt-2 flex items-center justify-between text-sm">
				<div className="text-muted-foreground">
					Ungesammelte Punkte: {uncollected.length}
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						// force respawn now by clearing last spawn time
						setLastSpawnAt(0)
					}}
				>
					Neu spawnen
				</Button>
			</div>
		</div>
	)
}