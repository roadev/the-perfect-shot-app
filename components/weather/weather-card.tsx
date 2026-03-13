"use client"

import * as React from "react"
import { Cloud, Moon, Info } from "lucide-react"
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
    <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-card to-secondary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">{location}</CardTitle>
            <CardDescription className="text-muted-foreground">{description}</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Next 24 Hours
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-4xl font-black text-primary">{score}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Clear Sky Score</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">Cloud Cover</span>
                </div>
                <div className="text-xl font-bold">{cloudCover}%</div>
              </div>
              <div className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">Visibility</span>
                </div>
                <div className="text-xl font-bold">15 mi</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/10">
              <Info className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Conditions are <span className="text-primary font-bold">{score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'}</span> for deep space imaging tonight. {score >= 70 ? 'Minimal cloud cover expected.' : score >= 40 ? 'Some clouds may affect visibility.' : 'Heavy cloud cover expected.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
