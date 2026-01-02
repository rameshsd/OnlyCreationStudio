"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { olaLightStyle } from "@/lib/maps/olaLightStyle";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface OlaMapProps {
  latitude: number;
  longitude: number;
}

export function OlaMap({ latitude, longitude }: OlaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error("Mapbox token is not set. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file.");
      return;
    }
    if (!mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: olaLightStyle as mapboxgl.Style,
      center: [longitude, latitude],
      zoom: 14
    });

    new mapboxgl.Marker({ color: "#2BB673" })
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => map.remove();
  }, [latitude, longitude]);

  if (!mapboxgl.accessToken) {
    return (
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <p className="text-destructive-foreground bg-destructive p-4 rounded-md">Mapbox token is not configured.</p>
        </div>
    )
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
