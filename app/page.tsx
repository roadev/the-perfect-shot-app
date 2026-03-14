import { WeatherCard } from "@/components/weather/weather-card"
import { SkyTimeline } from "@/components/weather/sky-timeline"
import { SkyMap } from "@/components/maps/sky-map"
import { GoldenHourTracker } from "@/components/weather/golden-hour-tracker"
import { GearChecklist } from "@/components/shared/gear-checklist"
import { RedModeToggle } from "@/components/shared/red-mode-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadButton } from "@/components/shared/upload-button"
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
             {error ? (
               <div className="text-red-500 text-center py-8">
                 <p>Failed to load forecast data</p>
                 <p className="text-sm text-muted-foreground">{error}</p>
               </div>
             ) : (
               <SkyTimeline 
                 forecasts={location.forecasts} 
                 bortleScale={location.bortleScale}
               />
             )}
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

      {/* Footer / Tabs Section */}
      <section className="pt-8 border-t border-border/50">
        <Tabs defaultValue="weather" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-secondary/50 p-1 rounded-2xl h-12">
                <TabsTrigger value="weather" className="rounded-xl px-6 font-bold">Weather</TabsTrigger>
                <TabsTrigger value="celestial" className="rounded-xl px-6 font-bold">Celestial Events</TabsTrigger>
                <TabsTrigger value="gallery" className="rounded-xl px-6 font-bold">User Gallery</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-4">
                <TabsContent value="gallery" className="mt-0">
                  <UploadButton 
                    locationId={location.id} 
                  />
                </TabsContent>
                <div className="hidden md:block text-[10px] font-black uppercase text-secondary-foreground/40 tracking-widest">
                  Data Updated: Just Now
                </div>
              </div>
            </div>
            
            <TabsContent value="weather" className="mt-0">
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {location.forecasts.slice(0, 12).map((f, i) => (
                    <div key={i} className="p-4 rounded-[2rem] bg-secondary/20 border border-white/5 flex flex-col items-center justify-center gap-1 group hover:bg-secondary/30 transition-all duration-300">
                      <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                        {new Date(f.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <div className="text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">{f.skyScore}</div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Score</span>
                      <div className="w-full h-1 bg-secondary rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${f.skyScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
               </div>
            </TabsContent>
            
            <TabsContent value="celestial" className="mt-0">
               {celestialEvents.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {celestialEvents.map((event) => (
                     <div key={event.id} className="p-6 rounded-3xl bg-secondary/20 border border-border/50">
                       <h3 className="font-bold text-lg mb-2">{event.name}</h3>
                       <p className="text-sm text-muted-foreground font-bold">
                         Peak: {new Date(event.peakDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                       </p>
                       <p className="text-xs text-muted-foreground mt-1">
                         {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                       </p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-12 text-center rounded-3xl bg-secondary/20 border border-border/50">
                    <p className="text-muted-foreground font-medium italic">No upcoming major celestial events in the next 30 days.</p>
                 </div>
               )}
            </TabsContent>

            <TabsContent value="gallery" className="mt-0">
                {publicPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {publicPhotos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-3xl bg-secondary/20 border border-border/50 flex flex-col overflow-hidden group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.celestialTarget || "Astrophotography"} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                           <p className="text-[10px] font-bold text-white truncate">{photo.celestialTarget}</p>
                           <p className="text-[8px] text-white/70 truncate">by {photo.user?.email.split('@')[0]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-3xl bg-secondary/20 border border-border/50">
                    <p className="text-muted-foreground font-medium italic">No public photos in the gallery yet. Be the first to share!</p>
                  </div>
                )}
            </TabsContent>
        </Tabs>
      </section>

      <footer className="text-center py-12 text-muted-foreground">
         <p className="text-xs font-black uppercase tracking-widest opacity-50">Built for Stargazers & Photographers</p>
      </footer>
    </main>
  )
}
