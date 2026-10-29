import React from "react"
import type { UseFormRegister, Control } from "react-hook-form"
import { Award, Flame, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Controller } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProductBadgesFieldsProps {
  register: UseFormRegister<any>
  control: Control<any> | any
  disabled?: boolean
}

export const ProductBadgesFields: React.FC<ProductBadgesFieldsProps> = ({
  register,
  control,
  disabled = false,
}) => {
  return (
    <div className="space-y-4 p-4 rounded-2xl bg-muted/20 border border-border">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-sans">
          <Award className="w-3.5 h-3.5 text-primary" />
          <span>Badges & Merchandising Flags</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Badge Text */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground font-sans">
            Badge Text <span className="text-[10px] font-normal text-muted-foreground">(Optional label)</span>
          </label>
          <Input
            placeholder="e.g. BESTSELLER, 0.0% ABV"
            {...register("badge")}
            disabled={disabled}
            className="h-10 text-xs bg-card border-border rounded-xl focus-visible:ring-primary placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Badge Style / Type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground font-sans">
            Badge Visual Style
          </label>
          <Controller
            control={control}
            name="badge_type"
            render={({ field }) => (
              <Select
                value={field.value || "auto"}
                onValueChange={(val) => field.onChange(val === "auto" ? "" : val)}
                disabled={disabled}
              >
                <SelectTrigger className="h-10 text-xs bg-card border-border rounded-xl text-foreground">
                  <SelectValue placeholder="Automatic badge style" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="auto">Auto / Default</SelectItem>
                  <SelectItem value="bestseller">Bestseller (Gold / Amber)</SelectItem>
                  <SelectItem value="seasonal">Seasonal (Forest Pine)</SelectItem>
                  <SelectItem value="organic">Organic (Emerald Leaf)</SelectItem>
                  <SelectItem value="adaptogenic">Adaptogenic (Violet Dusk)</SelectItem>
                  <SelectItem value="new-harvest">New Harvest (Spring Ochre)</SelectItem>
                  <SelectItem value="zero-proof">Zero-Proof / 0.0% ABV</SelectItem>
                  <SelectItem value="exclusive">Exclusive / Limited Edition</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Switches for is_featured and is_most_selling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* is_featured toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
          <div className="space-y-0.5 pr-2">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span className="text-xs font-semibold text-foreground">Featured Drink</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Highlight in top hero banners and promotional carousels
            </p>
          </div>
          <Controller
            control={control}
            name="is_featured"
            render={({ field }) => (
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        </div>

        {/* is_most_selling toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
          <div className="space-y-0.5 pr-2">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-xs font-semibold text-foreground">Most Selling</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Mark as a top-selling favorite across the entire store
            </p>
          </div>
          <Controller
            control={control}
            name="is_most_selling"
            render={({ field }) => (
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}
