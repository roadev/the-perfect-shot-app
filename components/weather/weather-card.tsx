"use client"

import * as React from "react"
import { Info, Sun, Sparkles } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WeatherForecast } from "@/lib/api"

interface WeatherCardProps {
  location: string;
  description: string;
  forecasts: WeatherForecast[];
}

export function WeatherCard({ location, description, forecasts }: WeatherCardProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate average sky score from forecasts, or use first forecast
  const currentForecast = forecasts.length > 0 ? forecasts[0] : null;
  const score = currentForecast?.skyScore ?? 50;
  const cloudCover = currentForecast?.cloudCover ?? 50;
  
  const data = [
    { name: "score", value: score },
    { name: "remaining", value: 100 - score },
  ];

  const COLORS = ["var(--primary)", "var(--muted)"];

  return (
    <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-card to-secondary/30 backdrop-blur-xl border border-white/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">{location}</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">{description}</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">
            Next 24 Hours
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center gap-10">
          {/* Gauge Section */}
          <div className="relative w-56 h-56 flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[60px]" />
            {mounted ? (
              <div className="w-full h-full transform transition-all duration-700 animate-in fade-in zoom-in-95">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      startAngle={210}
                      endAngle={-30}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={10}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="transition-all duration-500" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="w-full h-full rounded-full border-4 border-muted/20 border-t-primary animate-spin" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-6xl font-black text-primary drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]">{score}</span>
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-1">Clear Sky Score</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="w-full space-y-6 max-w-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="group relative p-5 rounded-[2.5rem] bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                  <Sun className="h-10 w-10 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Clouds</span>
                  </div>
                  <div className="text-3xl font-black tabular-nums">{cloudCover}%</div>
                </div>
              </div>

              <div className="group relative p-5 rounded-[2.5rem] bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Seeing</span>
                  </div>
                  <div className="text-3xl font-black tabular-nums">{currentForecast?.seeing ? currentForecast.seeing.toFixed(1) : "2.0"}<span className="text-sm font-bold text-muted-foreground ml-1">&quot;</span></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-5 rounded-[2.5rem] bg-primary/5 border border-primary/10 shadow-inner group/info transition-colors hover:bg-primary/[0.08]">
              <div className="p-2 rounded-2xl bg-primary/10 text-primary shrink-0 group-hover/info:scale-110 transition-transform">
                <Info className="h-5 w-5" />
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">
                The conditions are <span className="text-primary font-black uppercase tracking-tight">{score >= 85 ? 'perfect' : score >= 70 ? 'excellent' : score >= 50 ? 'good' : 'poor'}</span> for deep space imaging tonight. <span className="text-foreground/80 font-bold">{score >= 70 ? 'Expect exceptionally clear skies with minimal turbulence.' : 'Some moderate transparency issues may occur.'}</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
