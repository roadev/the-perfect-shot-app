"use client"

import * as React from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { MapPin, Compass, Navigation } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Public token for demo purposes (usually would be in .env)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1Ijoiam9uYXRoYW5yb2EiLCJhIjoiY203YmQ2bW8wMGNnejJscHl2Nmd4eHpxeSJ9.8h9u_b8_8_8_8_8_8_8_8"; // Placeholder

interface SkyMapProps {
  latitude?: number;
  longitude?: number;
}

export function SkyMap({ latitude = 3.2333, longitude = -75.1667 }: SkyMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = React.useState(longitude);
  const [lat, setLat] = React.useState(latitude);
  const [zoom, setZoom] = React.useState(9);

  React.useEffect(() => {
    if (map.current) {
      // Update center if props change
      map.current.setCenter([longitude, latitude]);
      return;
    }
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [longitude, latitude],
      zoom: zoom
    });

    map.current.on('move', () => {
      if (!map.current) return;
      setLng(Number(map.current.getCenter().lng.toFixed(4)));
      setLat(Number(map.current.getCenter().lat.toFixed(4)));
      setZoom(Number(map.current.getZoom().toFixed(2)));
    });

    // Add Heatmap Layer (Simulated Light Pollution)
    map.current.on('load', () => {
       if (!map.current) return;
       
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

    return () => {
      map.current?.remove();
    };
  }, [lng, lat, zoom]);

  return (
    <Card className="relative w-full h-[500px] overflow-hidden border-none shadow-2xl rounded-3xl group">
      <div ref={mapContainer} className="absolute inset-0" />
      
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
                    <div className="text-[10px] font-black uppercase text-muted-foreground leading-tight">Milky Way Core</div>
                    <div className="text-sm font-bold">185° South</div>
                 </div>
             </div>
             
             <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Elevation</span>
                    <span>1,250m</span>
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
