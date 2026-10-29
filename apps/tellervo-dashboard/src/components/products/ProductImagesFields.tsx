import React from "react"
import { ImageIcon, Plus, Trash2, Star, UploadCloud, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ProductImagesFieldsProps {
  images: string[]
  onChange: (images: string[]) => void
  onUploadFile: (file: File) => Promise<void>
  isUploading?: boolean
  disabled?: boolean
  error?: string
}

// Client-side validator for 1:1 square aspect ratio
const validateSquareImageFile = (file: File): Promise<{ isSquare: boolean; width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const diff = Math.abs(img.naturalWidth - img.naturalHeight)
      // Allow minor 1-2px tolerance for subtle rounding
      const maxDiff = Math.max(2, Math.round(Math.max(img.naturalWidth, img.naturalHeight) * 0.01))
      resolve({ isSquare: diff <= maxDiff, width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ isSquare: false, width: 0, height: 0 })
    }
    img.src = objectUrl
  })
}

export const ProductImagesFields: React.FC<ProductImagesFieldsProps> = ({
  images,
  onChange,
  onUploadFile,
  isUploading = false,
  disabled = false,
  error,
}) => {
  const [urlInput, setUrlInput] = React.useState("")
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const processAndUploadFile = async (file: File) => {
    // 1:1 Square Dimension Validation for any image format
    const { isSquare, width, height } = await validateSquareImageFile(file)
    if (!isSquare) {
      toast.error(
        `Only 1:1 square images are allowed (e.g. 1000×1000px). Selected image is ${width}×${height}px.`
      )
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    await onUploadFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleAddUrl = async () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (images.includes(trimmed)) {
      setUrlInput("")
      return
    }

    // 1:1 Square validation for URL image
    const checkResult = await new Promise<{ isSquare: boolean; width: number; height: number }>((resolve) => {
      const img = new Image()
      img.onload = () => {
        const diff = Math.abs(img.naturalWidth - img.naturalHeight)
        const maxDiff = Math.max(2, Math.round(Math.max(img.naturalWidth, img.naturalHeight) * 0.01))
        resolve({ isSquare: diff <= maxDiff, width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => {
        // Allow URL if cross-origin policy prevents inspection
        resolve({ isSquare: true, width: 0, height: 0 })
      }
      img.src = trimmed
    })

    if (!checkResult.isSquare && checkResult.width > 0) {
      toast.error(
        `Image URL must be a 1:1 square ratio (e.g. 1000×1000px). Detected: ${checkResult.width}×${checkResult.height}px.`
      )
      return
    }

    onChange([...images, trimmed])
    setUrlInput("")
    toast.success("1:1 Square image added to gallery")
  }

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return
    const target = images[indexToPrimary]
    const rest = images.filter((_, idx) => idx !== indexToPrimary)
    onChange([target, ...rest])
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processAndUploadFile(file)
    }
  }

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-sans">
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
          <span>Product Gallery ({images.length} Image{images.length !== 1 ? "s" : ""})</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
            1:1 Square Only
          </span>
          <span className="text-[11px] text-muted-foreground">First image is primary</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Gallery Thumbnail Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {images.map((img, idx) => {
            const isPrimary = idx === 0
            return (
              <div
                key={`${img}-${idx}`}
                className={cn(
                  "relative group rounded-xl overflow-hidden aspect-square border bg-card flex items-center justify-center transition-all",
                  isPrimary ? "border-emerald-600/70 dark:border-emerald-500 ring-2 ring-emerald-500/20" : "border-border"
                )}
              >
                <img
                  src={img}
                  alt={`Product view ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80"
                  }}
                />

                {/* Primary Tag */}
                {isPrimary ? (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#163826] text-white text-[9px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current text-amber-400" />
                    <span>Primary</span>
                  </span>
                ) : (
                  !disabled && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 hover:bg-black/80 text-white text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      Set Primary
                    </button>
                  )
                )}

                {/* Remove button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Upload & Add URL Controls */}
      {!disabled && (
        <div className="space-y-2 pt-1">
          {/* Dropzone Upload Button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDrop={async (e) => {
              e.preventDefault()
              setIsDragging(false)
              const file = e.dataTransfer.files?.[0]
              if (file) await processAndUploadFile(file)
            }}
            className={cn(
              "border-2 border-dashed rounded-xl p-3.5 flex items-center justify-center gap-2 cursor-pointer transition-colors text-center text-xs font-medium",
              isDragging
                ? "border-[#183626] bg-[#183626]/5 dark:border-emerald-400 dark:bg-emerald-950/20"
                : "border-border hover:border-primary/60 hover:bg-muted/10 text-muted-foreground hover:text-foreground"
            )}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Uploading image to Supabase Storage...</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  <span>Click or drop image to upload</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-normal">
                  (1:1 square required, any file format)
                </span>
              </div>
            )}
          </div>

          {/* Add via URL Input */}
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste 1:1 image URL (https://...)"
              className="h-9 text-xs bg-card border-border rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddUrl()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
              className="h-9 px-3 rounded-xl border-border text-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
    </div>
  )
}
