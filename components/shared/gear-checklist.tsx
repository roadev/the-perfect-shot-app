"use client"

import * as React from "react"
import { CheckCircle2, Circle, Camera, Battery, Ghost, Layers } from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const items = [
  { id: 1, label: "Wide Angle Lens (14mm)", icon: Camera, checked: true },
  { id: 2, label: "Extra Batteries (x3)", icon: Battery, checked: false },
  { id: 3, label: "Tripod & Star Tracker", icon: Layers, checked: true },
  { id: 4, label: "Lens Heater", icon: Ghost, checked: false },
];

export function GearChecklist() {
  const [checklist, setChecklist] = React.useState(items);

  const toggle = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  return (
    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-3xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Gear Checklist</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase font-black">4 Items</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {checklist.map(item => (
          <div 
            key={item.id}
            onClick={() => toggle(item.id)}
            className="flex items-center justify-between p-3 rounded-2xl bg-secondary/20 border border-border/50 cursor-pointer hover:bg-secondary/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
               <item.icon className={`h-4 w-4 ${item.checked ? 'text-primary' : 'text-muted-foreground'}`} />
               <span className={`text-sm font-medium ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                 {item.label}
               </span>
            </div>
            {item.checked ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
