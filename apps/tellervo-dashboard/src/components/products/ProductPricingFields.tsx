import React from "react"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Tag, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductPricingFieldsProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  originalPrice: number
  discountPrice?: number | null
  disabled?: boolean
}

export const ProductPricingFields: React.FC<ProductPricingFieldsProps> = ({
  register,
  errors,
  originalPrice,
  discountPrice,
  disabled = false,
}) => {
  const hasDiscount =
    discountPrice != null &&
    !isNaN(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < originalPrice

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - discountPrice!) / originalPrice) * 100)
    : 0

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-sans">
          <Tag className="w-3.5 h-3.5 text-primary" />
          <span>Pricing & Discounts</span>
        </label>
        {hasDiscount && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Save {discountPercentage}% OFF</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Original Price */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground font-sans">
            Original Price (€) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
              €
            </span>
            <Input
              type="number"
              step="0.01"
              placeholder="21.00"
              {...register("original_price", { valueAsNumber: true })}
              disabled={disabled}
              className={cn(
                "pl-8 h-10 text-xs bg-card border-border rounded-xl focus-visible:ring-primary placeholder:text-muted-foreground/60",
                errors.original_price && "border-rose-400 focus-visible:ring-rose-400"
              )}
            />
          </div>
          {errors.original_price && (
            <p className="text-[11px] font-medium text-rose-500 mt-1">
              {errors.original_price.message as string}
            </p>
          )}
        </div>

        {/* Discount Price */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground font-sans">
            Discount Price (€) <span className="text-[10px] font-normal text-muted-foreground">(Optional sale)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
              €
            </span>
            <Input
              type="number"
              step="0.01"
              placeholder="Leave empty if regular"
              {...register("discount_price", {
                setValueAs: (v) => (v === "" || v == null || isNaN(v) ? null : Number(v)),
              })}
              disabled={disabled}
              className={cn(
                "pl-8 h-10 text-xs bg-card border-border rounded-xl focus-visible:ring-primary placeholder:text-muted-foreground/60",
                errors.discount_price && "border-rose-400 focus-visible:ring-rose-400"
              )}
            />
          </div>
          {errors.discount_price && (
            <p className="text-[11px] font-medium text-rose-500 mt-1">
              {errors.discount_price.message as string}
            </p>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        {hasDiscount
          ? `Customers will be charged $${discountPrice?.toFixed(2)} with strikethrough $${originalPrice.toFixed(2)} shown.`
          : `Customers will pay the standard price of $${(originalPrice || 0).toFixed(2)}.`}
      </p>
    </div>
  )
}
