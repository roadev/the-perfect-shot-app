"use client"

import * as React from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { MapPin, Compass, Navigation } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mapbox access token is set dynamically in the component to ensure it uses the latest env variable

interface SkyMapProps {
  latitude?: number;
  longitude?: number;
  elevation?: number;
  name?: string;
}

export function SkyMap({ latitude = 3.2333, longitude = -75.1667, elevation, name }: SkyMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = React.useState(longitude);
  const [lat, setLat] = React.useState(latitude);
  const [zoom, setZoom] = React.useState(9);
  const [mapError, setMapError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (map.current) {
      // Update center if props change
      map.current.setCenter([longitude, latitude]);
      return;
    }
    if (!mapContainer.current) return;

    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token || token.length < 20) {
        setMapError("Mapbox token is missing or too short. Please check your .env file.");
        return;
      }
      mapboxgl.accessToken = token;

      const m = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [longitude, latitude],
        zoom: zoom,
        pitch: 45,
        collectResourceTiming: false, // Helps reduce telemetry noise, though ad-blockers may still flag event requests
      });

      map.current = m;

      // Add marker for current location
      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([longitude, latitude])
        .addTo(m);

      m.on('error', (e) => {
        console.error('Mapbox error:', e);
        // Mapbox generic error type doesn't always expose status, so we use unknown cast
        const err = e as unknown as { error?: { status?: number }; message?: string };
        if (err.error?.status === 401 || (err.message && err.message.includes('401'))) {
          setMapError("Invalid Mapbox Access Token. Please check your .env file.");
        }
      });

      map.current.on('move', () => {
        if (!map.current) return;
        setLng(Number(map.current.getCenter().lng.toFixed(4)));
        setLat(Number(map.current.getCenter().lat.toFixed(4)));
        setZoom(Number(map.current.getZoom().toFixed(2)));
      });

      map.current.on('load', () => {
         if (!map.current) return;
         setMapError(null);
         
         // Add a source for the light pollution heatmap
         // In a real app, this would be a GeoJSON from a server
         map.current.addSource('light-pollution', {
           type: 'geojson',
           data: {
             type: 'FeatureCollection',
             features: [
               { type: 'Feature', geometry: { type: 'Point', coordinates: [longitude, latitude] }, properties: { intensity: 2 } },
               { type: 'Feature', geometry: { type: 'Point', coordinates: [longitude + 0.05, latitude + 0.03] }, properties: { intensity: 3 } },
               { type: 'Feature', geometry: { type: 'Point', coordinates: [longitude - 0.04, latitude - 0.02] }, properties: { intensity: 4 } },
             ]
           }
         });

         map.current.addLayer({
           id: 'light-pollution-heat',
           type: 'heatmap',
           source: 'light-pollution',
           maxzoom: 15,
           paint: {
             'heatmap-weight': ['get', 'intensity'],
             'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
             'heatmap-color': [
               'interpolate',
               ['linear'],
               ['heatmap-density'],
               0, 'rgba(0,0,0,0)',
               0.2, 'rgb(0,0,255)',
               0.4, 'rgb(0,255,255)',
               0.6, 'rgb(0,255,0)',
               0.8, 'rgb(255,255,0)',
               1, 'rgb(255,0,0)'
             ],
             'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
             'heatmap-opacity': 0.6
           }
         });
      });
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setMapError("Failed to initialize map. Verify your API configuration.");
    }

    return () => {
      map.current?.remove();
    };
  }, [lng, lat, zoom, latitude, longitude]);

  return (
    <Card className="relative w-full h-[500px] overflow-hidden border-none shadow-2xl rounded-3xl group bg-slate-950">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20 p-8 text-center">
            <div className="space-y-4 max-w-md">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Navigation className="h-6 w-6 text-red-500 rotate-45" />
                </div>
                <h3 className="text-xl font-bold">Map unavailable</h3>
                <p className="text-sm text-muted-foreground">{mapError || "Mapbox Access Token is missing or invalid. Please check your .env.local file."}</p>
                <div className="pt-4 flex flex-col items-center gap-2">
                   <Badge variant="outline" className="text-[10px] uppercase tracking-tighter opacity-50">Coordinates</Badge>
                   <div className="font-mono text-lg">{lat}, {lng}</div>
                </div>
            </div>
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Badge className="bg-background/80 backdrop-blur-md border border-border shadow-lg p-3 rounded-2xl flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold">{lat}, {lng}</span>
        </Badge>
        
        <div className="bg-background/80 backdrop-blur-md border border-border shadow-lg p-4 rounded-3xl space-y-4">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-xl">
                    <Compass className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                    <div className="text-[10px] font-black uppercase text-muted-foreground leading-tight">{name || "Tatacoa Desert"}</div>
                    <div className="text-sm font-bold">185° South</div>
                 </div>
             </div>
             
             <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Elevation</span>
                    <span>{elevation ? `${elevation}m` : "800m"}</span>
                 </div>
                 <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3" />
                 </div>
             </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Scout This Location
          </button>
      </div>
    </Card>
  )
}
