"use client"

import { EyeOff } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function RedModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2 rounded-full border border-border bg-background/80 p-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-center space-x-2 px-2">
        <EyeOff
          className={`h-4 w-4 ${theme === "red-mode" ? "animate-pulse text-primary" : "text-muted-foreground"}`}
        />
        <Label
          htmlFor="red-mode"
          className="text-xs font-semibold tracking-wider uppercase"
        >
          Night Mode
        </Label>
        <Switch
          id="red-mode"
          checked={theme === "red-mode"}
          onCheckedChange={(checked) => setTheme(checked ? "red-mode" : "dark")}
        />
      </div>
    </div>
  )
}
