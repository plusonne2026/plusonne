"use client";

import React, { useEffect, useRef, useState } from "react";
import { Navigation, MapPin, Radio, Compass } from "lucide-react";

interface LiveSessionMapProps {
  hostCoords: { lat: number; lng: number };
  userCoords: { lat: number; lng: number };
  clientName?: string;
  locationName?: string;
}

export default function LiveSessionMap({
  hostCoords,
  userCoords,
  clientName = "Client",
  locationName = "Meeting Location",
}: LiveSessionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const hostMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [distanceKm, setDistanceKm] = useState<string>("1.2");
  const [etaMins, setEtaMins] = useState<number>(4);

  // Haversine distance calculator
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(2);
  };

  useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let isMounted = true;

    // Dynamically load Leaflet JS
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default marker icon assets issue in webpack/nextjs
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current) {
        const centerLat = (hostCoords.lat + userCoords.lat) / 2;
        const centerLng = (hostCoords.lng + userCoords.lng) / 2;

        const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Host Marker (Blue Dot Pulsing Icon)
        const hostIcon = L.divIcon({
          className: "custom-host-icon",
          html: `<div class="relative flex items-center justify-center w-8 h-8">
                  <span class="absolute inline-flex w-full h-full rounded-full bg-indigo-400 opacity-75 animate-ping"></span>
                  <span class="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 border-2 border-white text-white shadow-lg text-xs font-bold">📍 Host</span>
                </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        // User Marker (Green Target Icon)
        const userIcon = L.divIcon({
          className: "custom-user-icon",
          html: `<div class="relative flex items-center justify-center w-8 h-8">
                  <span class="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-pulse"></span>
                  <span class="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 border-2 border-white text-white shadow-lg text-xs font-bold">👤</span>
                </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const hostMarker = L.marker([hostCoords.lat, hostCoords.lng], { icon: hostIcon }).addTo(map);
        hostMarker.bindPopup(`<b>Host Location (You)</b><br/>Streaming GPS live`).openPopup();
        hostMarkerRef.current = hostMarker;

        const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(map);
        userMarker.bindPopup(`<b>${clientName}</b><br/>${locationName}`);

        // Polyline connecting Host & User
        const polyline = L.polyline(
          [
            [hostCoords.lat, hostCoords.lng],
            [userCoords.lat, userCoords.lng],
          ],
          { color: "#4f46e5", weight: 4, opacity: 0.8, dashArray: "8, 8" }
        ).addTo(map);
        polylineRef.current = polyline;

        mapInstanceRef.current = map;
        setMapLoaded(true);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update host marker & route polyline on real-time location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    import("leaflet").then((L) => {
      if (hostMarkerRef.current) {
        hostMarkerRef.current.setLatLng([hostCoords.lat, hostCoords.lng]);
      }
      if (polylineRef.current) {
        polylineRef.current.setLatLngs([
          [hostCoords.lat, hostCoords.lng],
          [userCoords.lat, userCoords.lng],
        ]);
      }

      const dist = calculateDistance(hostCoords.lat, hostCoords.lng, userCoords.lat, userCoords.lng);
      setDistanceKm(dist);
      const estMins = Math.max(1, Math.round((parseFloat(dist) / 25) * 60)); // assuming 25km/h avg speed
      setEtaMins(estMins);
    });
  }, [hostCoords, userCoords, mapLoaded]);

  return (
    <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-3 rounded-xl border border-gray-200/80 dark:border-gray-800/80 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Live GPS Sync Active
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Host coords: {hostCoords.lat.toFixed(4)}, {hostCoords.lng.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Dist: <strong>{distanceKm} km</strong></span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/50 flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
            <Navigation className="w-4 h-4 text-amber-500" />
            <span>ETA: <strong>~{etaMins} mins</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
