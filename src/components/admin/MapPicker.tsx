"use client";

import { useEffect, useRef } from "react";
import type { Map, Marker } from "leaflet";

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (coords: { lat: number; lng: number }) => void;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamically import Leaflet (no SSR)
    import("leaflet").then((L) => {
      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center: [number, number] = lat && lng ? [lat, lng] : [14.5995, 120.9842];
      const map = L.map(containerRef.current!).setView(center, lat && lng ? 14 : 6);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Place initial marker if coords provided
      if (lat && lng) {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      // Click to place/move marker
      map.on("click", (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng]).addTo(map);
        }
        onChange({ lat: parseFloat(clickLat.toFixed(6)), lng: parseFloat(clickLng.toFixed(6)) });
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-1.5">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        crossOrigin={"anonymous" as any}
      />
      <div
        ref={containerRef}
        className="w-full h-72 rounded-2xl overflow-hidden border z-0"
      />
      <p className="text-xs text-muted-foreground">Click anywhere on the map to set the location.</p>
    </div>
  );
}
