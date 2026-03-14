"use client"

import * as React from "react"
import { Cloud, Moon, CloudMoon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { WeatherForecast } from "@/lib/api"

interface SkyTimelineProps {
  forecasts: WeatherForecast[];
  bortleScale?: number;
}

function getCondition(cloudCover: number): 'clear' | 'partial' | 'cloudy' {
  if (cloudCover < 30) return 'clear';
  if (cloudCover < 70) return 'partial';
  return 'cloudy';
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

export function SkyTimeline({ forecasts, bortleScale = 2 }: SkyTimelineProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sky Timeline</h3>
        <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-blue-900" /> 0% Cloud
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-slate-400" /> 100% Cloud
            </span>
        </div>
      </div>
      
      <div className="flex overflow-x-auto pb-6 gap-4 no-scrollbar scroll-smooth px-1">
        {forecasts.length > 0 ? (
          forecasts.slice(0, 24).map((forecast) => {
            const condition = getCondition(forecast.cloudCover);
            return (
              <div 
                key={forecast.id} 
                className="flex-shrink-0 w-28 p-5 rounded-[2.5rem] bg-secondary/20 border border-white/5 flex flex-col items-center space-y-4 transition-all duration-500 hover:bg-secondary/30 hover:-translate-y-1 hover:shadow-2xl group"
              >
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                  {formatTime(forecast.date)}
                </span>
                
                <div className="relative group/icon">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover/icon:scale-150 transition-transform duration-500" />
                  <div className={`p-3 rounded-full transition-colors ${forecast.cloudCover < 20 ? 'bg-primary/10' : 'bg-slate-500/5'}`}>
                    {condition === 'clear' && <Moon className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />}
                    {condition === 'partial' && <CloudMoon className="h-6 w-6 text-slate-400" />}
                    {condition === 'cloudy' && <Cloud className="h-6 w-6 text-slate-500" />}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-black tracking-tighter text-primary">{forecast.skyScore}</div>
                  <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Sky Score</div>
                </div>

                <Badge 
                  variant="outline" 
                  className={`text-[9px] font-black px-3 py-0.5 rounded-full uppercase border-none ${
                    forecast.skyScore && forecast.skyScore >= 80 ? 'bg-primary/20 text-primary' : 
                    forecast.skyScore && forecast.skyScore >= 50 ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-slate-500/20 text-muted-foreground'
                  }`}
                >
                  Class {bortleScale}
                </Badge>
              </div>
            );
          })
        ) : (
          <div className="w-full py-8 text-center text-muted-foreground italic text-sm">
            No forecast data available for this location.
          </div>
        )}
      </div>
    </div>
  )
}
