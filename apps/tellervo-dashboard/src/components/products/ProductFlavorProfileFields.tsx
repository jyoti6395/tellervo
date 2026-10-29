import React from "react"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { Compass, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductFlavorProfileFieldsProps {
  control: Control<any> | any
  disabled?: boolean
}

interface FlavorMetric {
  name: "bitterness" | "sweetness" | "aromatics" | "effervescence"
  label: string
  lowLabel: string
  highLabel: string
}

const METRICS: FlavorMetric[] = [
  {
    name: "bitterness",
    label: "Bitterness",
    lowLabel: "Mellow",
    highLabel: "Intense Botanical",
  },
  {
    name: "sweetness",
    label: "Sweetness",
    lowLabel: "Dry / Crisp",
    highLabel: "Rich Sweet",
  },
  {
    name: "aromatics",
    label: "Aromatics",
    lowLabel: "Subtle",
    highLabel: "Deep Taiga Flora",
  },
  {
    name: "effervescence",
    label: "Effervescence",
    lowLabel: "Still",
    highLabel: "High Sparkling",
  },
]

export const ProductFlavorProfileFields: React.FC<ProductFlavorProfileFieldsProps> = ({
  control,
  disabled = false,
}) => {
  return (
    <div className="space-y-3.5 p-4 rounded-2xl bg-muted/20 border border-border">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-sans">
          <Compass className="w-3.5 h-3.5 text-primary" />
          <span>Nordic Sensory & Flavor Profile (1 - 5 Scale)</span>
        </label>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Radar Chart Attributes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {METRICS.map((metric) => (
          <div
            key={metric.name}
            className="p-3 rounded-xl border border-border bg-card space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {metric.label}
              </span>
              <Controller
                control={control}
                name={metric.name}
                render={({ field }) => (
                  <span className="text-xs font-mono font-bold text-primary">
                    {field.value || 3} / 5
                  </span>
                )}
              />
            </div>

            {/* Score Selector (1 to 5) */}
            <Controller
              control={control}
              name={metric.name}
              render={({ field }) => {
                const currentVal = Number(field.value) || 3
                return (
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        disabled={disabled}
                        onClick={() => field.onChange(val)}
                        className={cn(
                          "flex-1 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                          val <= currentVal
                            ? "bg-[#163826] text-white dark:bg-emerald-600 shadow-xs"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted/70",
                          disabled && "cursor-not-allowed opacity-60"
                        )}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )
              }}
            />

            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{metric.lowLabel}</span>
              <span>{metric.highLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
