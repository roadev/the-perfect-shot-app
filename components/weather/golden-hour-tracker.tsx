"use client"

import React from "react"
import { Sunrise } from "lucide-react"
import SunCalc from "suncalc"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface SolarEvent {
  name: string
  time: Date
}

interface GoldenHourTrackerProps {
  latitude?: number;
  longitude?: number;
}

export function GoldenHourTracker({ latitude = 3.2333, longitude = -75.1667 }: GoldenHourTrackerProps) {
  const [nextEvent, setNextEvent] = React.useState<SolarEvent | null>(null)

  React.useEffect(() => {
    const lat = latitude
    const lng = longitude
    const date = new Date()

    const solarTimes = SunCalc.getTimes(date, lat, lng)

    // Find the next golden hour/sunset event
    const events: SolarEvent[] = [
      { name: "Golden Hour", time: solarTimes.goldenHour },
      { name: "Sunset", time: solarTimes.sunset },
      { name: "Blue Hour", time: solarTimes.dusk },
    ].sort((a, b) => a.time.getTime() - b.time.getTime())

    const next = events.find((e) => e.time > date) || events[0]
    setNextEvent(next)

    const timer = setInterval(() => {
      // Force refresh if needed
    }, 60000)

    return () => clearInterval(timer)
  }, [latitude, longitude])

  if (!nextEvent) return null

  const timeLeft = nextEvent.time.getTime() - new Date().getTime()
  const minutesLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60)))

  return (
    <Card className="overflow-hidden rounded-3xl border-none bg-gradient-to-br from-orange-500/10 to-blue-500/10 shadow-xl">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/20 p-2">
              <Sunrise className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm leading-tight font-black tracking-widest text-muted-foreground uppercase">
                Next Light Window
              </h3>
              <div className="text-xl font-bold">{nextEvent.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-primary">
              {minutesLeft}m
            </div>
            <div className="text-[10px] font-bold whitespace-nowrap text-muted-foreground uppercase">
              Countdown
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
            <span>Progress to {nextEvent.name}</span>
            <span>
              {nextEvent.time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <Progress
            value={Math.min(100, 100 - (minutesLeft / 60) * 100)}
            className="h-2 bg-secondary"
          />
        </div>
      </CardContent>
    </Card>
  )
}
