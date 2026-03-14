import { WeatherCard } from "@/components/weather/weather-card"
import { SkyTimeline } from "@/components/weather/sky-timeline"
import { SkyMap } from "@/components/maps/sky-map"
import { GoldenHourTracker } from "@/components/weather/golden-hour-tracker"
import { GearChecklist } from "@/components/shared/gear-checklist"
import { RedModeToggle } from "@/components/shared/red-mode-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadButton } from "@/components/shared/upload-button"
import { Badge } from "@/components/ui/badge"
import { api, LocationWithForecast, CelestialEvent, Photo, Location } from "@/lib/api"

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Fetch data from API
  let locationData: LocationWithForecast | null = null;
  let celestialEvents: CelestialEvent[] = [];
  let publicPhotos: Photo[] = [];
  let error: string | null = null;

  try {
    // Get all locations first to pick one dynamic ID
    let locations: Location[] = [];
    try {
      locations = await api.getLocations();
      console.log(`Fetched ${locations.length} locations`);
    } catch (err) {
      console.error('Locations fetch failed:', err);
    }
    
    const activeLocationId = locations.length > 0 ? locations[0].id : 'tatacoa-desert-001';
    console.log(`Active Location ID: ${activeLocationId}`);

    // Fetch forecast for the selected location
    try {
      locationData = await api.getLocationWithForecast(activeLocationId);
      console.log(`[DEBUG] Fetched forecast for ${locationData.name}: ${locationData.forecasts?.length} items`);
    } catch (err) {
      console.error(`[ERROR] Forecast fetch failed for ${activeLocationId}:`, err);
      // If specific fetch fails, try to get basic location info at least
      if (locations.length > 0) {
        const base = locations.find(l => l.id === activeLocationId) || locations[0];
        locationData = { ...base, forecasts: [] };
      }
    }
    
    // Fetch remaining data independently
    const [eventsResult, photosResult] = await Promise.allSettled([
      api.getCelestialEvents(90),
      api.getPublicPhotos()
    ]);

    if (eventsResult.status === 'fulfilled') {
      celestialEvents = eventsResult.value;
      console.log(`[DEBUG] Fetched ${celestialEvents.length} celestial events`);
    } else {
      console.error('[ERROR] Celestial Events fetch failed:', eventsResult.reason);
    }

    if (photosResult.status === 'fulfilled') {
      publicPhotos = photosResult.value;
      console.log(`[DEBUG] Fetched ${publicPhotos.length} photos`);
    } else {
      console.error('[ERROR] Photos fetch failed:', photosResult.reason);
    }

    if (!locationData && locations.length === 0) {
      error = "Could not fetch any location or forecast data from the API.";
    }

  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch initial data';
    console.error('[ERROR] Main Page API Error:', err);
  }

  // Default location for display
  const location = locationData || {
    id: 'default',
    name: 'Tatacoa Desert',
    latitude: 3.2333,
    longitude: -75.1667,
    elevation: 800,
    bortleScale: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    forecasts: []
  };

  const description = location.elevation 
    ? `Huila, Colombia | Bortle ${location.bortleScale} | ${location.elevation}m`
    : `Huila, Colombia | Bortle ${location.bortleScale}`;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tight mb-2">The Perfect Shot</h1>
           <p className="text-muted-foreground font-medium">Clear Skies & Deep Space Planning</p>
        </div>
        <div className="flex items-center gap-4">
           <RedModeToggle />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Map & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <SkyMap 
              latitude={location.latitude} 
              longitude={location.longitude}
              elevation={location.elevation}
              name={location.name}
            />
          </section>
          
          <section className="bg-card/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-border/50 shadow-inner">
            <Tabs defaultValue="weather" className="w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <TabsList className="bg-secondary/50 p-1 rounded-2xl h-12">
                  <TabsTrigger value="weather" className="rounded-xl px-6 font-bold">Forecast</TabsTrigger>
                  <TabsTrigger value="celestial" className="rounded-xl px-6 font-bold">Events</TabsTrigger>
                  <TabsTrigger value="gallery" className="rounded-xl px-6 font-bold">Gallery</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-4">
                  <TabsContent value="gallery" className="mt-0">
                    <UploadButton locationId={location.id} />
                  </TabsContent>
                  <div className="text-[10px] font-black uppercase text-secondary-foreground/40 tracking-widest px-2">
                    Updated: {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <TabsContent value="weather" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {error ? (
                  <div className="text-red-500 text-center py-8">
                    <p>Failed to load forecast data</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                ) : (
                  <>
                    <SkyTimeline 
                      forecasts={location.forecasts} 
                      bortleScale={location.bortleScale}
                    />
                    
                    <div className="pt-4">
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4 px-2">Detailed Hourly</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {location.forecasts.slice(0, 12).map((f, i) => (
                          <div key={i} className="p-4 rounded-[2rem] bg-secondary/10 border border-white/5 flex flex-col items-center justify-center gap-1 group hover:bg-secondary/20 transition-all duration-300">
                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                              {new Date(f.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </span>
                            <div className="text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">{f.skyScore}</div>
                            <div className="w-full h-1 bg-secondary/50 rounded-full mt-2 overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-1000" 
                                style={{ width: `${f.skyScore}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="celestial" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {celestialEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {celestialEvents.map((event) => (
                      <div key={event.id} className="p-6 rounded-[2rem] bg-secondary/10 border border-border/40 hover:bg-secondary/20 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="font-black text-lg group-hover:text-primary transition-colors">{event.name}</h3>
                           <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black">Upcoming</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                             <span className="text-muted-foreground font-bold">Peak:</span>
                             <span className="font-black text-foreground">{new Date(event.peakDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Visible from {new Date(event.startDate).toLocaleDateString()} to {new Date(event.endDate).toLocaleDateString()}. Best viewing conditions around {new Date(event.peakDate).getHours()}:00 local time.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-[2rem] bg-secondary/10 border border-border/40">
                    <p className="text-muted-foreground font-medium italic">No upcoming major celestial events in the next 90 days.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gallery" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {publicPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {publicPhotos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-[2rem] bg-secondary/10 border border-border/40 flex flex-col overflow-hidden group relative shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.celestialTarget || "Astrophotography"} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 blur-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                           <p className="text-xs font-black text-white mb-1">{photo.celestialTarget}</p>
                           <p className="text-[10px] font-bold text-white/70">by {photo.user?.email.split('@')[0]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-[2rem] bg-secondary/10 border border-border/40">
                    <p className="text-muted-foreground font-medium italic">No public photos in the gallery yet. Be the first to share!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* Right Column: Key Stats & Gear */}
        <div className="space-y-8">
          <section>
            {error ? (
              <div className="text-red-500 text-center py-8">
                <p>Failed to load weather data</p>
              </div>
            ) : (
              <WeatherCard 
                location={location.name}
                description={description}
                forecasts={location.forecasts}
              />
            )}
          </section>

          <section>
             <GoldenHourTracker 
               latitude={location.latitude}
               longitude={location.longitude}
             />
          </section>

          <section>
             <GearChecklist />
          </section>
        </div>
      </div>

      <footer className="text-center py-12 text-muted-foreground">
         <p className="text-xs font-black uppercase tracking-widest opacity-50">Built for Stargazers & Photographers</p>
      </footer>
    </main>
  )
}
