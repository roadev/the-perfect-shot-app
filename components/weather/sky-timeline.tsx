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
      
      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth">
        {forecasts.slice(0, 24).map((forecast, i) => {
          const condition = getCondition(forecast.cloudCover);
          return (
            <div 
              key={forecast.id} 
              className="flex-shrink-0 w-24 p-3 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center space-y-3 transition-transform hover:scale-105"
            >
              <span className="text-xs font-bold">{formatTime(forecast.date)}</span>
              
              <div className={`p-2 rounded-full ${forecast.cloudCover < 20 ? 'bg-blue-900/20' : 'bg-slate-500/10'}`}>
                {condition === 'clear' && <Moon className="h-5 w-5 text-blue-400" />}
                {condition === 'partial' && <CloudMoon className="h-5 w-5 text-slate-400" />}
                {condition === 'cloudy' && <Cloud className="h-5 w-5 text-slate-500" />}
              </div>

              <div className="w-full space-y-1">
                <div className="flex justify-between text-[9px] font-bold uppercase text-muted-foreground">
                   <span>Cloud</span>
                   <span className={forecast.cloudCover < 30 ? 'text-primary' : 'text-foreground'}>{forecast.cloudCover}%</span>
                </div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      forecast.cloudCover < 30 ? 'bg-blue-600' :
                      forecast.cloudCover < 60 ? 'bg-blue-400' : 'bg-slate-400'
                    }`}
                    style={{ width: `${forecast.cloudCover}%` }}
                  />
                </div>
              </div>

              <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 font-black">
                Class {bortleScale}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  )
}
