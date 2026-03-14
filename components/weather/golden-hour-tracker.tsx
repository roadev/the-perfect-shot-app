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
  const [now, setNow] = React.useState(new Date())

  React.useEffect(() => {
    const updateEvents = () => {
      const currentTime = new Date()
      setNow(currentTime)
      
      const lat = latitude
      const lng = longitude
      
      const today = SunCalc.getTimes(currentTime, lat, lng)
      const tomorrowDate = new Date(currentTime)
      tomorrowDate.setDate(tomorrowDate.getDate() + 1)
      const tomorrow = SunCalc.getTimes(tomorrowDate, lat, lng)

      const events: SolarEvent[] = [
        { name: "Golden Hour", time: today.goldenHour },
        { name: "Sunset", time: today.sunset },
        { name: "Blue Hour", time: today.dusk },
        { name: "Sunrise", time: tomorrow.sunrise },
        { name: "Golden Hour (AM)", time: tomorrow.goldenHourEnd },
      ].sort((a, b) => a.time.getTime() - b.time.getTime())

      const next = events.find((e) => e.time > currentTime) || events[0]
      setNextEvent(next)
    }

    updateEvents()
    const timer = setInterval(updateEvents, 60000)

    return () => clearInterval(timer)
  }, [latitude, longitude])

  if (!nextEvent) return null

  const timeLeft = nextEvent.time.getTime() - now.getTime()
  const totalDuration = 60 * 60 * 1000 // 60 minutes for progress baseline
  const minutesLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60)))
  const progressValue = Math.min(100, Math.max(0, 100 - (timeLeft / totalDuration) * 100))

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
              {minutesLeft > 60 ? `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m` : `${minutesLeft}m`}
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
            value={progressValue}
            className="h-2 bg-secondary"
          />
        </div>
      </CardContent>
    </Card>
  )
}
