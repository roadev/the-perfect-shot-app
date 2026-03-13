import { WeatherCard } from "@/components/weather/weather-card"
import { SkyTimeline } from "@/components/weather/sky-timeline"
import { SkyMap } from "@/components/maps/sky-map"
import { GoldenHourTracker } from "@/components/weather/golden-hour-tracker"
import { GearChecklist } from "@/components/shared/gear-checklist"
import { RedModeToggle } from "@/components/shared/red-mode-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api, LocationWithForecast, CelestialEvent } from "@/lib/api"

export default async function Page() {
  // Fetch data from API
  let locationData: LocationWithForecast | null = null;
  let celestialEvents: CelestialEvent[] = [];
  let error: string | null = null;

  try {
    // Get the first location with its forecast
    const locations = await api.getLocations();
    if (locations.length > 0) {
      locationData = await api.getLocationWithForecast(locations[0].id);
    }
    
    // Get upcoming celestial events
    celestialEvents = await api.getCelestialEvents(30);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch data';
    console.error('API Error:', err);
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
              <div className="hidden md:block text-[10px] font-black uppercase text-secondary-foreground/40 tracking-widest">
                Data Updated: Just Now
              </div>
            </div>
            
            <TabsContent value="weather" className="mt-0">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* More detailed weather charts would go here */}
                  <div className="h-32 rounded-3xl bg-secondary/20 border border-border/50 animate-pulse" />
                  <div className="h-32 rounded-3xl bg-secondary/20 border border-border/50 animate-pulse delay-75" />
                  <div className="h-32 rounded-3xl bg-secondary/20 border border-border/50 animate-pulse delay-150" />
               </div>
            </TabsContent>
            
            <TabsContent value="celestial" className="mt-0">
               {celestialEvents.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {celestialEvents.map((event) => (
                     <div key={event.id} className="p-6 rounded-3xl bg-secondary/20 border border-border/50">
                       <h3 className="font-bold text-lg mb-2">{event.name}</h3>
                       <p className="text-sm text-muted-foreground">
                         Peak: {new Date(event.peakDate).toLocaleDateString()}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="aspect-square rounded-3xl bg-secondary/20 border border-border/50 flex items-center justify-center overflow-hidden group">
                        <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-transparent group-hover:scale-110 transition-transform duration-500" />
                     </div>
                   ))}
                </div>
            </TabsContent>
        </Tabs>
      </section>

      <footer className="text-center py-12 text-muted-foreground">
         <p className="text-xs font-black uppercase tracking-widest opacity-50">Built for Stargazers & Photographers</p>
      </footer>
    </main>
  )
}
