import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import {
  Search,
  Plus,
  Edit2,
  Eye,
  MoreHorizontal,
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
  Check,
  Sprout,
  Calendar,
  UploadCloud,
  Loader2,
  Flame,
  Star,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  ProductPricingFields,
  ProductImagesFields,
  ProductBadgesFields,
  ProductFlavorProfileFields,
} from "@/components/products"
import type { FlavorProfileRecord } from "@tellervo/supabase"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { productService, supabase, type ProductRecord } from "@/lib/supabase"

export interface ProductItem {
  id: string
  name: string
  category: string
  price: number
  original_price: number
  discount_price?: number | null
  stock: number
  status: "Active" | "Low Stock" | "Out of Stock"
  image: string
  images: string[]
  description: string
  sku?: string
  volume?: string
  addedDate?: string
  is_featured?: boolean
  is_most_selling?: boolean
  badge?: string | null
  badge_type?: string | null
  flavor_profile?: FlavorProfileRecord | null
  created_by?: string | null
  updated_by?: string | null
}



type SortField = "name" | "price" | "stock" | "category"
type SortDirection = "asc" | "desc"

function generateExportFilename() {
  const dateStr = new Date().toISOString().slice(0, 10)
  return `tellervo_catalog_${dateStr}.csv`
}

function mapRecordToProductItem(record: ProductRecord): ProductItem {
  let status: ProductItem["status"] = "Active"
  const rawStatus = (record.status || "").toLowerCase()
  if (rawStatus === "out of stock" || rawStatus === "out_of_stock") {
    status = "Out of Stock"
  } else if (rawStatus === "low stock" || rawStatus === "low_stock") {
    status = "Low Stock"
  } else {
    status = "Active"
  }

  return {
    id: record.id,
    name: record.name,
    description: record.description || "",
    category: (record.category as ProductItem["category"]) || "Adaptogenic Tonics",
    price: Number(record.discount_price ?? record.original_price ?? record.price) || 0,
    original_price: Number(record.original_price ?? record.price) || 0,
    discount_price: record.discount_price != null && Number(record.discount_price) > 0 ? Number(record.discount_price) : null,
    stock: Number(record.stock) || 0,
    status,
    image: (Array.isArray(record.images) && record.images[0]) || record.image_url || "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80",
    images: Array.isArray(record.images) && record.images.length > 0 ? record.images : (record.image_url ? [record.image_url] : []),
    sku: record.sku || "",
    volume: record.volume || "330 ml",
    is_featured: Boolean(record.is_featured),
    is_most_selling: Boolean(record.is_most_selling ?? record.most_selling),
    badge: record.badge || null,
    badge_type: record.badge_type || null,
    flavor_profile: record.flavor_profile || null,
    addedDate: record.created_at
      ? new Date(record.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "Today",
    created_by: record.created_by,
    updated_by: record.updated_by,
  }
}

const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(100, "Product name cannot exceed 100 characters"),
  category: z.string().trim().min(1, "Category is required"),
  volume: z.string().trim().min(1, "Volume is required (e.g. 330 ml)"),
  original_price: z.number({ message: "Original price must be a valid number" }).min(0, "Price cannot be negative"),
  discount_price: z.number().nullable().optional(),
  stock: z.number({ message: "Inventory units must be a valid number" }).int("Inventory units must be a whole number").min(0, "Inventory units cannot be negative"),
  status: z.enum(["Active", "Low Stock", "Out of Stock"]),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  badge: z.string().optional(),
  badge_type: z.string().optional(),
  is_featured: z.boolean(),
  is_most_selling: z.boolean(),
  bitterness: z.number().min(1).max(5),
  sweetness: z.number().min(1).max(5),
  aromatics: z.number().min(1).max(5),
  effervescence: z.number().min(1).max(5),
})

export type ProductFormData = z.infer<typeof productFormSchema>

export function ProductManagement() {
  const [products, setProducts] = React.useState<ProductItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { isAdmin } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [stockFilter, setStockFilter] = React.useState("all")
  const [priceFilter, setPriceFilter] = React.useState("all")
  const [dateFilter, setDateFilter] = React.useState("all")
  const [sortField, setSortField] = React.useState<SortField>("name")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(8)

  // Drawer / Side-panel State for Add / Edit
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<ProductItem | null>(null)

  // Drawer Panel Mode: "create" | "edit" | "view"
  const [panelMode, setPanelMode] = React.useState<"create" | "edit" | "view">("create")

  // Single / Bulk Delete Confirmation Dialog State
  const [deleteCandidate, setDeleteCandidate] = React.useState<ProductItem | null>(null)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false)

  // Form State with react-hook-form
  const [formImages, setFormImages] = React.useState<string[]>([])
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "Adaptogenic Tonics",
      volume: "330 ml",
      original_price: 21,
      discount_price: null,
      stock: 20,
      status: "Active",
      description: "",
      badge: "",
      badge_type: "",
      is_featured: false,
      is_most_selling: false,
      bitterness: 2,
      sweetness: 3,
      aromatics: 4,
      effervescence: 4,
    },
    mode: "onTouched",
  })
  // Fetch live products from Supabase on mount
  React.useEffect(() => {
    let isMounted = true
    async function loadProducts() {
      try {
        setIsLoading(true)
        const { data, error } = await productService.fetchProducts()
        if (error) {
          console.warn("[ProductManagement] Product fetch error:", error.message)
          if (isMounted) setProducts([])
          return
        }
        if (data && data.length > 0) {
          if (isMounted) setProducts(data.map(mapRecordToProductItem))
        } else {
          if (isMounted) setProducts([])
        }
      } catch (err) {
        console.error("[ProductManagement] Failed to fetch products:", err)
        if (isMounted) setProducts([])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadProducts()
    return () => {
      isMounted = false
    }
  }, [])


  // Open Panel for creating new product
  const handleOpenCreate = () => {
    setEditingProduct(null)
    setPanelMode("create")
    setFormImages([])
    reset({
      name: "",
      category: "Adaptogenic Tonics",
      volume: "330 ml",
      original_price: "" as unknown as number,
      discount_price: null,
      stock: 20,
      status: "Active",
      description: "",
      badge: "",
      badge_type: "",
      is_featured: false,
      is_most_selling: false,
      bitterness: 2,
      sweetness: 3,
      aromatics: 4,
      effervescence: 4,
    })
    clearErrors()
    setIsPanelOpen(true)
  }

  // Open Panel for editing existing product
  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product)
    setPanelMode("edit")
    setFormImages(
      product.images && product.images.length > 0
        ? product.images
        : product.image ? [product.image] : []
    )
    reset({
      name: product.name,
      category: product.category,
      volume: product.volume || "330 ml",
      original_price: product.original_price,
      discount_price: product.discount_price ?? null,
      stock: product.stock,
      status: product.status,
      description: product.description || "",
      badge: product.badge || "",
      badge_type: product.badge_type || "",
      is_featured: Boolean(product.is_featured),
      is_most_selling: Boolean(product.is_most_selling),
      bitterness: Number(product.flavor_profile?.bitterness ?? 2),
      sweetness: Number(product.flavor_profile?.sweetness ?? 3),
      aromatics: Number(product.flavor_profile?.aromatics ?? 4),
      effervescence: Number(product.flavor_profile?.effervescence ?? 4),
    })
    clearErrors()
    setIsPanelOpen(true)
  }

  // Open Panel for viewing details of an existing product in the slide drawer
  const handleOpenView = (product: ProductItem) => {
    setEditingProduct(product)
    setPanelMode("view")
    setFormImages(
      product.images && product.images.length > 0
        ? product.images
        : product.image ? [product.image] : []
    )
    reset({
      name: product.name,
      category: product.category,
      volume: product.volume || "330 ml",
      original_price: product.original_price,
      discount_price: product.discount_price ?? null,
      stock: product.stock,
      status: product.status,
      description: product.description || "",
      badge: product.badge || "",
      badge_type: product.badge_type || "",
      is_featured: Boolean(product.is_featured),
      is_most_selling: Boolean(product.is_most_selling),
      bitterness: Number(product.flavor_profile?.bitterness ?? 2),
      sweetness: Number(product.flavor_profile?.sweetness ?? 3),
      aromatics: Number(product.flavor_profile?.aromatics ?? 4),
      effervescence: Number(product.flavor_profile?.effervescence ?? 4),
    })
    clearErrors()
    setIsPanelOpen(true)
  }







  // Upload gallery image for product
  const handleUploadGalleryImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit")
      return
    }
    setIsUploadingImage(true)
    toast.loading("Uploading image...", { id: "gallery-upload" })
    try {
      const { url, error } = await productService.uploadProductImage(file)
      toast.dismiss("gallery-upload")
      if (error) {
        toast.error(`Upload failed: ${error.message}`)
      } else if (url) {
        setFormImages((prev) => [...prev, url])
        toast.success("Image uploaded to gallery")
      }
    } catch {
      toast.dismiss("gallery-upload")
      toast.error("Upload failed")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Form Save using react-hook-form
  // Form Save using react-hook-form
  const onSubmitProduct = async (data: ProductFormData) => {
    // Preserve the admin's exact chosen status directly
    const chosenStatus: ProductItem["status"] = data.status

    setIsSaving(true)
    try {
      const finalImagesList =
        formImages.length > 0
          ? formImages
          : ["https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80"]

      const payloadInput = {
        name: data.name.trim(),
        category: data.category,
        volume: data.volume.trim() || "330 ml",
        original_price: Number(data.original_price),
        discount_price:
          data.discount_price && Number(data.discount_price) > 0
            ? Number(data.discount_price)
            : null,
        stock: Number(data.stock),
        status: chosenStatus,
        description: data.description.trim(),
        images: finalImagesList,
        badge: data.badge?.trim() || null,
        badge_type: data.badge_type?.trim() || null,
        is_featured: Boolean(data.is_featured),
        is_most_selling: Boolean(data.is_most_selling),
        flavor_profile: {
          bitterness: Number(data.bitterness),
          sweetness: Number(data.sweetness),
          aromatics: Number(data.aromatics),
          effervescence: Number(data.effervescence),
        },
      }

      if (editingProduct) {
        const { data: updatedRecord, error: updateErr } = await productService.updateProduct(
          editingProduct.id,
          payloadInput
        )

        if (updateErr) {
          console.error("[ProductManagement] Update failed:", updateErr.message)
          toast.error(`Update failed: ${updateErr.message}`)
          return
        }

        if (updatedRecord) {
          const mapped = mapRecordToProductItem(updatedRecord)
          setProducts((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)))
          toast.success(`Updated "${data.name}" successfully`)
        }
      } else {
        const skuGenerated = `TEL-${data.category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
        const { data: newRecord, error: createErr } = await productService.createProduct({
          ...payloadInput,
          sku: skuGenerated,
        })

        if (createErr) {
          console.error("[ProductManagement] Create failed:", createErr.message)
          toast.error(`Create failed: ${createErr.message}`)
          return
        }

        if (newRecord) {
          const mapped = mapRecordToProductItem(newRecord)
          setProducts((prev) => [mapped, ...prev])
          toast.success(`Created "${data.name}" successfully`)
        }
      }

      setIsPanelOpen(false)
      setEditingProduct(null)
        setFormImages([])
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred while saving"
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  // Delete Handlers with Real Supabase Deletion & Admin Security
  const handleConfirmSingleDelete = async () => {
    if (!deleteCandidate) return

    if (!isAdmin) {
      toast.error("Unauthorized: Only Admin accounts can delete products.")
      setDeleteCandidate(null)
      return
    }

    setIsDeleting(true)
    const candidateName = deleteCandidate.name
    const candidateId = deleteCandidate.id

    try {
      const { error } = await productService.deleteProduct(candidateId)
      if (error) {
        toast.error(`Delete failed: ${error.message}`)
        return
      }

      setProducts((prev) => prev.filter((p) => p.id !== candidateId))
      setSelectedIds((prev) => prev.filter((id) => id !== candidateId))
      toast.success(`"${candidateName}" deleted permanently from catalog`)
      setDeleteCandidate(null)
    } catch (err: any) {
      console.error("[ProductManagement] Delete error:", err)
      toast.error(err?.message || "Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return

    if (!isAdmin) {
      toast.error("Unauthorized: Only Admin accounts can delete products.")
      setIsBulkDeleteOpen(false)
      return
    }

    setIsDeleting(true)
    const count = selectedIds.length

    try {
      const { error } = await productService.deleteProducts(selectedIds)
      if (error) {
        toast.error(`Bulk delete failed: ${error.message}`)
        return
      }

      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)))
      toast.success(`Successfully deleted ${count} products from catalog`)
      setSelectedIds([])
      setIsBulkDeleteOpen(false)
    } catch (err: any) {
      console.error("[ProductManagement] Bulk delete error:", err)
      toast.error(err?.message || "Failed to delete products")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkStatusChange = (newStatus: ProductItem["status"]) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (selectedIds.includes(p.id)) {
          let updatedStock = p.stock
          if (newStatus === "Out of Stock") updatedStock = 0
          if (newStatus === "Active" && p.stock === 0) updatedStock = 15
          return { ...p, status: newStatus, stock: updatedStock }
        }
        return p
      })
    )
    toast.success(`Updated status of ${selectedIds.length} products to ${newStatus}`)
    setSelectedIds([])
  }

  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filtered & Sorted Products
  const filteredProducts = React.useMemo(() => {
    const query = searchTerm.toLowerCase().trim()
    const list = products.filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query))

      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter
      const matchesStatus = statusFilter === "all" || p.status === statusFilter
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "lt-20" && p.stock < 20) ||
        (stockFilter === "lt-100" && p.stock < 100) ||
        (stockFilter === "gt-100" && p.stock > 100)

      const currentPrice = Number(p.discount_price ?? p.original_price ?? p.price) || 0
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under-100" && currentPrice < 100) ||
        (priceFilter === "100-500" && currentPrice >= 100 && currentPrice <= 500) ||
        (priceFilter === "under-500" && currentPrice < 500) ||
        (priceFilter === "above-500" && currentPrice > 500)

      return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesPrice
    })

    list.sort((a, b) => {
      let comparison = 0
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === "price") {
        comparison = a.price - b.price
      } else if (sortField === "stock") {
        comparison = a.stock - b.stock
      } else if (sortField === "category") {
        comparison = a.category.localeCompare(b.category)
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return list
  }, [products, searchTerm, categoryFilter, statusFilter, stockFilter, priceFilter, sortField, sortDirection])

  // Category Management State
  const [customCategories, setCustomCategories] = React.useState<string[]>([])
  const [deletedCategories, setDeletedCategories] = React.useState<string[]>([])
  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false)
  const [newCategoryInput, setNewCategoryInput] = React.useState("")
  const [isEditCategoryOpen, setIsEditCategoryOpen] = React.useState(false)
  const [editingCategoryName, setEditingCategoryName] = React.useState("")
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = React.useState(false)
  const [categoryToDelete, setCategoryToDelete] = React.useState("")

  // Dynamic categories extracted from database products + user additions
  const availableCategories = React.useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      const cat = p.category?.trim()
      if (cat && !deletedCategories.includes(cat)) {
        set.add(cat)
      }
    })
    customCategories.forEach((c) => {
      const cat = c?.trim()
      if (cat && !deletedCategories.includes(cat)) {
        set.add(cat)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [products, customCategories, deletedCategories])

  const handleConfirmAddCategory = () => {
    const trimmed = newCategoryInput.trim()
    if (!trimmed) return
    setDeletedCategories((prev) => prev.filter((c) => c.toLowerCase() !== trimmed.toLowerCase()))
    setCustomCategories((prev) => Array.from(new Set([...prev, trimmed])))
    setValue("category", trimmed, { shouldValidate: true })
    toast.success(`Category "${trimmed}" added`)
    setNewCategoryInput("")
    setIsAddCategoryOpen(false)
  }

  const handleConfirmEditCategory = async () => {
    const oldName = watch("category")
    const newName = editingCategoryName.trim()
    if (!newName || newName === oldName) {
      setIsEditCategoryOpen(false)
      return
    }

    setDeletedCategories((prev) => [...prev.filter((c) => c !== newName), oldName])
    setCustomCategories((prev) => [
      ...prev.filter((c) => c !== oldName),
      newName,
    ])
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: newName } : p))
    )
    setValue("category", newName, { shouldValidate: true })

    try {
      await supabase.from("products").update({ category: newName }).eq("category", oldName)
    } catch (err) {
      console.warn("[ProductManagement] Supabase category rename sync:", err)
    }

    toast.success(`Category renamed to "${newName}"`)
    setIsEditCategoryOpen(false)
  }

  const handleConfirmDeleteCategory = () => {
    const target = categoryToDelete || watch("category")
    if (!target) return

    setDeletedCategories((prev) => Array.from(new Set([...prev, target])))
    setCustomCategories((prev) => prev.filter((c) => c !== target))

    const remaining = availableCategories.filter((c) => c !== target)
    const fallback = remaining[0] || "General"
    if (watch("category") === target) {
      setValue("category", fallback, { shouldValidate: true })
    }

    toast.success(`Category "${target}" deleted`)
    setIsDeleteCategoryOpen(false)
    setCategoryToDelete("")
  }

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "SKU",
      "Name",
      "Category",
      "Original Price",
      "Discount Price",
      "Stock",
      "Status",
      "Volume",
      "Badge",
      "Featured",
      "Most Selling",
      "Added Date",
    ]
    const rows = filteredProducts.map((p) => [
      p.id,
      p.sku || "",
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.original_price.toFixed(2),
      p.discount_price ? p.discount_price.toFixed(2) : "",
      p.stock,
      p.status,
      p.volume || "",
      p.badge || "",
      p.is_featured ? "Yes" : "No",
      p.is_most_selling ? "Yes" : "No",
      p.addedDate || "",
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", generateExportFilename())
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredProducts.length} items to CSV`)
  }

  // Counts for KPI Cards
  const totalCount = products.length
  const activeCount = products.filter((p) => p.status === "Active").length
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length
  const outOfStockCount = products.filter((p) => p.status === "Out of Stock").length

  // Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedProducts = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, safeCurrentPage, pageSize])

  // Bulk Selection
  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.includes(p.id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = paginatedProducts.map((p) => p.id)
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)))
    } else {
      const pageIds = paginatedProducts.map((p) => p.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setStockFilter("all")
    setPriceFilter("all")
    setDateFilter("all")
    setCurrentPage(1)
  }


  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-5 md:p-7 lg:p-8 space-y-6 min-w-0 transition-all">
        {/* HEADER SECTION (Matching Image 1 Clean Header) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-sans">
              Products
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Manage your product inventory
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Export Report Pill Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-10 px-4 text-xs font-medium rounded-full border border-border bg-card hover:bg-muted text-foreground gap-2 shadow-2xs transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-muted-foreground" />
              <span>Export Report</span>
            </Button>

            {/* + Add New Pill Button */}
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="h-10 px-5 bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold rounded-full gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </Button>
          </div>
        </div>

        {/* 4 CLEAN KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Total Products */}
          <div
            onClick={() => {
              setStatusFilter("all")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#edf5f0] text-[#1e4630] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground">
                Total Products
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {totalCount}
              </span>
            </div>
          </div>

          {/* Card 2: Active Products */}
          <div
            onClick={() => {
              setStatusFilter("Active")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#edf5f0] text-[#1e4630] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground">
                Active Products
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {activeCount}
              </span>
            </div>
          </div>

          {/* Card 3: Low Stock Alert */}
          <div
            onClick={() => {
              setStatusFilter("Low Stock")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#fef7ee] text-[#b45309] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground">
                Low Stock Alert
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {lowStockCount}
              </span>
            </div>
          </div>

          {/* Card 4: Out of Stock */}
          <div
            onClick={() => {
              setStatusFilter("Out of Stock")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#fdf2f2] text-[#be123c] flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground">
                Out of Stock
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {outOfStockCount}
              </span>
            </div>
          </div>
        </div>

        {/* UNIFIED CONTAINER: CONTROLS & TABLE COMBINED (Single Borderless Card) */}
        <div className="bg-card rounded-2xl shadow-xs overflow-hidden">
          {/* Top Controls: Search & Filter */}
          <div className="p-5 pb-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 pr-8 h-10 text-xs bg-card border border-border rounded-full shadow-2xs focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters on Right */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Date Filter */}
                <Select
                  value={dateFilter}
                  onValueChange={(val) => {
                    setDateFilter(val)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-10 text-xs font-medium bg-card border border-border rounded-full text-foreground px-4 shadow-2xs min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <SelectValue placeholder="All Dates" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-30">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select
                  value={categoryFilter}
                  onValueChange={(val) => {
                    setCategoryFilter(val)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-10 text-xs font-medium bg-card border border-border rounded-full text-foreground px-4 shadow-2xs min-w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="all">Category: All</SelectItem>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-10 text-xs font-medium bg-card border border-border rounded-full text-foreground px-4 shadow-2xs min-w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="all">Status: All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                {/* Stock Filter */}
                <Select
                  value={stockFilter}
                  onValueChange={(val) => {
                    setStockFilter(val)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-10 text-xs font-medium bg-card border border-border rounded-full text-foreground px-4 shadow-2xs min-w-[120px]">
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="all">Stock: All</SelectItem>
                    <SelectItem value="lt-20">Less than 20</SelectItem>
                    <SelectItem value="lt-100">Less than 100</SelectItem>
                    <SelectItem value="gt-100">More than 100</SelectItem>
                  </SelectContent>
                </Select>

                {/* Price Filter */}
                <Select
                  value={priceFilter}
                  onValueChange={(val) => {
                    setPriceFilter(val)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-10 text-xs font-medium bg-card border border-border rounded-full text-foreground px-4 shadow-2xs min-w-[125px]">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="all">Price: All</SelectItem>
                    <SelectItem value="under-100">Under €100</SelectItem>
                    <SelectItem value="100-500">€100 - €500</SelectItem>
                    <SelectItem value="under-500">Under €500</SelectItem>
                    <SelectItem value="above-500">Above €500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Selection Bar */}
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/60 border border-border p-3 px-5 rounded-2xl animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange("Active")}
                    className="h-8 text-xs bg-card text-emerald-700 border-border rounded-full hover:bg-muted"
                  >
                    Mark Active
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange("Out of Stock")}
                    className="h-8 text-xs bg-card text-rose-700 border-border rounded-full hover:bg-muted"
                  >
                    Mark Out of Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="h-8 text-xs bg-card text-foreground border-border rounded-full hover:bg-muted gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsBulkDeleteOpen(true)}
                    className="h-8 text-xs rounded-full gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Selected</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-full"
                  >
                    Deselect
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* shadcn Table */}
          <div className="relative w-full overflow-x-auto">
            <Table className="w-full text-left text-xs">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
                  {/* Select All */}
                  <TableHead className="w-12 py-4 px-4 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all on current page"
                    />
                  </TableHead>

                  {/* SKU (Before Product Name) */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    ID
                  </TableHead>

                  {/* Product Name */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handleHeaderSort("name")}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-medium text-xs text-muted-foreground"
                    >
                      <span>Product Name</span>
                      {sortField === "name" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-foreground" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-foreground" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </TableHead>

                  {/* Category */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handleHeaderSort("category")}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-medium text-xs text-muted-foreground"
                    >
                      <span>Category</span>
                      {sortField === "category" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-foreground" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-foreground" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </TableHead>

                  {/* Volume */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Volume
                  </TableHead>

                  {/* Stock */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handleHeaderSort("stock")}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-medium text-xs text-muted-foreground"
                    >
                      <span>Stock</span>
                      {sortField === "stock" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-foreground" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-foreground" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </TableHead>

                  {/* Status */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Status
                  </TableHead>

                  {/* Price */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handleHeaderSort("price")}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-medium text-xs text-muted-foreground"
                    >
                      <span>Price</span>
                      {sortField === "price" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-foreground" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-foreground" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </TableHead>

                  {/* Most Selling */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Most Selling
                  </TableHead>

                  {/* Featured */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Featured
                  </TableHead>

                  {/* Action */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-56 text-center">
                      <div className="flex flex-col items-center justify-center p-6 space-y-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin text-[#183626] dark:text-[#dca038]" />
                        <p className="font-medium text-xs text-muted-foreground">Loading products...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center p-6 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-sm text-foreground">No products found</p>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            No drinks match your current search and filter settings. Try clearing the query or change filters.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="h-9 px-4 text-xs rounded-full border-border"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id)
                    const hasDiscount =
                      product.discount_price != null &&
                      product.discount_price > 0 &&
                      product.discount_price < product.original_price

                    return (
                      <TableRow
                        key={product.id}
                        data-state={isSelected ? "selected" : undefined}
                        className={`transition-colors border-b border-muted/30 hover:bg-muted/20 ${
                          isSelected ? "bg-muted/30" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <TableCell className="py-4 px-4 text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelect(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </TableCell>

                        {/* SKU Column (Before Product Name) */}
                        <TableCell className="py-4 px-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {product.sku ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted border border-border text-muted-foreground">
                              {product.sku}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        {/* Product Name */}
                        <TableCell className="py-4 px-4">
                          <span
                            onClick={() => handleOpenView(product)}
                            className="font-semibold text-xs md:text-sm text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                          >
                            {product.name}
                          </span>
                        </TableCell>

                        {/* Category */}
                        <TableCell className="py-4 px-4 text-xs font-medium text-foreground">
                          {product.category}
                        </TableCell>

                        {/* Volume */}
                        <TableCell className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {product.volume || "330 ml"}
                        </TableCell>

                        {/* Stock */}
                        <TableCell className="py-4 px-4 text-xs font-medium text-foreground">
                          {product.stock}
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border select-none ${
                              product.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                                : product.status === "Low Stock"
                                ? "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
                                : "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.status === "Active"
                                  ? "bg-emerald-600"
                                  : product.status === "Low Stock"
                                  ? "bg-amber-600"
                                  : "bg-rose-600"
                              }`}
                            />
                            <span>{product.status}</span>
                          </span>
                        </TableCell>

                        {/* Price: Discount & cut original price in same column */}
                        <TableCell className="py-4 px-4 text-xs font-semibold text-foreground">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            {hasDiscount ? (
                              <>
                                <span>€{product.discount_price!.toFixed(2)}</span>
                                <span className="text-[10px] text-muted-foreground line-through font-normal">
                                  €{product.original_price.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span>€{product.original_price.toFixed(2)}</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Most Selling Column */}
                        <TableCell className="py-4 px-4 text-xs">
                          {product.is_most_selling ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800">
                              <Flame className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                              <span>Most Selling</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 text-xs font-mono">-</span>
                          )}
                        </TableCell>

                        {/* Featured Column */}
                        <TableCell className="py-4 px-4 text-xs">
                          {product.is_featured ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
                              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                              <span>Featured</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 text-xs font-mono">-</span>
                          )}
                        </TableCell>

                        {/* Action DropdownMenu */}
                        <TableCell className="py-4 px-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card border border-border shadow-md p-1.5">
                              <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1">
                                Product Options
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleOpenView(product)}
                                className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-muted text-foreground gap-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(product)}
                                className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-muted text-foreground gap-2"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>Edit Product</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-border" />
                              <DropdownMenuItem
                                onClick={() => setDeleteCandidate(product)}
                                className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-destructive/10 text-destructive focus:text-destructive gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Product</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>            </Table>
          </div>

          {/* Table Footer: Pagination */}
          <div className="p-4 border-t border-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-card">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong>{filteredProducts.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</strong> to{" "}
                <strong>{Math.min(safeCurrentPage * pageSize, filteredProducts.length)}</strong> of{" "}
                <strong>{filteredProducts.length}</strong> products
              </span>

              {/* Per Page Selector */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-border">
                <span className="text-[11px] text-muted-foreground">Per page:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    setPageSize(Number(val))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[72px] text-xs bg-card border-border rounded-lg text-foreground px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="sr-only">Previous page</span>
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === safeCurrentPage ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-xs font-medium ${
                    page === safeCurrentPage
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SLIDE-OVER DRAWER FOR ADD / EDIT / VIEW DETAILS (Full Height Covering Top Navbar) */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
                <SheetContent showCloseButton={false}
          side="right"
          className="w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl data-[side=right]:lg:max-w-[640px] p-0 flex flex-col gap-0 border-l border-border bg-card shadow-2xl z-50 overflow-hidden h-full"
        >
          {/* Header matching screenshot: Sprout icon, Add New Product title, circular X */}
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-card shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-[#183626] dark:text-emerald-400 shrink-0">
                <Sprout className="w-5 h-5 stroke-[1.75]" />
              </div>
              <SheetTitle className="text-base sm:text-lg font-bold text-foreground font-sans">
                {panelMode === "create"
                  ? "Add New Product"
                  : panelMode === "view"
                  ? "Product Details"
                  : "Edit Product"}
              </SheetTitle>
            </div>

            <button
              type="button"
              onClick={() => setIsPanelOpen(false)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

                    {/* Form matching clean modular layout */}
          <form onSubmit={handleSubmit(onSubmitProduct)} className="flex-1 flex flex-col min-h-0 overflow-hidden" noValidate>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground font-sans">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Lingonberry Cloud Tonic"
                  {...register("name")}
                  disabled={panelMode === "view"}
                  className={cn(
                    "h-10 text-xs bg-card border-border rounded-xl focus-visible:ring-primary placeholder:text-muted-foreground/60",
                    errors.name && "border-rose-400 focus-visible:ring-rose-400"
                  )}
                />
                {errors.name && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Category & Volume in the Same Row */}
              <div className="flex flex-col sm:flex-row justify-between gap-3.5">
                {/* Category with Rectangle Select and 3 Square Action Boxes (kept at ~58%) */}
                <div className="space-y-1.5 w-full sm:w-[58%]">
                  <label className="block text-xs font-semibold text-foreground font-sans">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {/* Rectangle box: Category dropdown */}
                    <div className="flex-1 min-w-0">
                      <Controller
                        control={control}
                        name="category"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={panelMode === "view"}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-10 text-xs bg-card border-border rounded-xl text-foreground w-full",
                                errors.category && "border-rose-400"
                              )}
                            >
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-xl">
                              {availableCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {panelMode !== "view" && (
                      <div className="flex items-center gap-1 shrink-0">
                        {/* 1st square box: + add */}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setNewCategoryInput("")
                            setIsAddCategoryOpen(true)
                          }}
                          title="Add new category"
                          className="h-10 w-9 rounded-xl border border-border bg-card hover:bg-muted text-foreground hover:text-primary transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="sr-only">Add Category</span>
                        </Button>

                        {/* 2nd square box: pencil edit */}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingCategoryName(watch("category"))
                            setIsEditCategoryOpen(true)
                          }}
                          title="Edit selected category"
                          className="h-10 w-9 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Edit Category</span>
                        </Button>

                        {/* 3rd square box: bin delete */}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCategoryToDelete(watch("category"))
                            setIsDeleteCategoryOpen(true)
                          }}
                          title="Delete selected category"
                          className="h-10 w-9 rounded-xl border border-border bg-card hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Delete Category</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.category && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.category.message}</p>
                  )}
                </div>

                {/* Volume (shifted to right side) */}
                <div className="space-y-1.5 w-full sm:w-[32%] sm:ml-auto">
                  <label className="block text-xs font-semibold text-foreground font-sans">
                    Volume <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. 330 ml"
                    {...register("volume")}
                    disabled={panelMode === "view"}
                    className={cn(
                      "h-10 text-xs bg-card border-border rounded-xl focus-visible:ring-primary placeholder:text-muted-foreground/60",
                      errors.volume && "border-rose-400 focus-visible:ring-rose-400"
                    )}
                  />
                  {errors.volume && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.volume.message}</p>
                  )}
                </div>
              </div>

              {/* Pricing & Discounts Fields */}
              <ProductPricingFields
                register={register}
                errors={errors}
                originalPrice={watch("original_price") || 0}
                discountPrice={watch("discount_price")}
                disabled={panelMode === "view"}
              />

              {/* Inventory Units & Publication Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground font-sans">
                    Inventory Units <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 20"
                    {...register("stock", { valueAsNumber: true })}
                    disabled={panelMode === "view"}
                    className={cn(
                      "h-10 text-xs bg-card border-border rounded-xl focus-visible:ring-primary placeholder:text-muted-foreground/60",
                      errors.stock && "border-rose-400 focus-visible:ring-rose-400"
                    )}
                  />
                  {errors.stock && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.stock.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground font-sans">
                    Publication Status <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={panelMode === "view"}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-10 text-xs bg-card border-border rounded-xl text-foreground",
                            errors.status && "border-rose-400"
                          )}
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border rounded-xl">
                          <SelectItem value="Active">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Active (Live in Store)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Low Stock">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Low Stock Warning</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Out of Stock">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              <span>Out of Stock (Hidden/Waitlist)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.status.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-foreground font-sans">
                  Description <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  placeholder="Enter product details..."
                  {...register("description")}
                  disabled={panelMode === "view"}
                  rows={3}
                  className={cn(
                    "text-xs bg-card border-border rounded-xl focus-visible:ring-primary resize-none placeholder:text-muted-foreground/60",
                    errors.description && "border-rose-400 focus-visible:ring-rose-400"
                  )}
                />
                {errors.description && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Product Gallery (Multiple Images) Component */}
              <ProductImagesFields
                images={formImages}
                onChange={setFormImages}
                onUploadFile={handleUploadGalleryImage}
                isUploading={isUploadingImage}
                disabled={panelMode === "view"}
              />

              {/* Badges & Merchandising Flags (badge, badge_type, is_featured, is_most_selling) */}
              <ProductBadgesFields
                register={register}
                control={control}
                disabled={panelMode === "view"}
              />

              {/* Sensory & Flavor Profile Radar Component */}
              <ProductFlavorProfileFields
                control={control}
                disabled={panelMode === "view"}
              />
            </div>

            {/* Footer Buttons: Cancel/Close on left, Create/Save Product on right */}
            <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between bg-card shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPanelOpen(false)}
                className="h-10 px-6 rounded-full border-border text-xs text-foreground hover:bg-muted font-medium cursor-pointer"
              >
                {panelMode === "view" ? "Close" : "Cancel"}
              </Button>
              {panelMode !== "view" && (
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 px-6 rounded-full bg-[#183626] hover:bg-[#12281c] text-white dark:bg-[#dca038] dark:text-[#0d1a14] dark:hover:bg-[#c58d2e] text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  {panelMode === "edit" ? (isSaving ? "Saving..." : "Save Changes") : (isSaving ? "Creating..." : "Create Product")}
                </Button>
              )}
            </div>
          </form>

          {/* IN-SHEET CATEGORY ACTION POPUPS (Centered inside sheet, matching exact screenshot) */}
          {(isAddCategoryOpen || isEditCategoryOpen || isDeleteCategoryOpen) && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
              {/* ADD CATEGORY POPUP */}
              {isAddCategoryOpen && (
                <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
                  <div className="p-6 pb-5 space-y-4 relative">
                    <button
                      type="button"
                      onClick={() => setIsAddCategoryOpen(false)}
                      className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span className="sr-only">Close</span>
                    </button>

                    <div>
                      <h3 className="text-lg font-bold text-foreground font-serif tracking-tight">
                        Add New Category
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter a title for the new product category.
                      </p>
                    </div>

                    <div>
                      <Input
                        placeholder="e.g. Sparkling Tonics"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleConfirmAddCategory()
                          }
                        }}
                        className="h-11 rounded-full border-2 border-[#5c7a68] dark:border-[#7a9986] text-xs px-4 bg-background focus-visible:ring-primary text-foreground placeholder:text-muted-foreground/60 shadow-2xs"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="bg-[#f9f7f2] dark:bg-muted/40 p-4 px-6 border-t border-border/60 flex items-center justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddCategoryOpen(false)}
                      className="h-9 px-5 rounded-full border border-border bg-card hover:bg-muted text-xs text-foreground font-medium cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirmAddCategory}
                      disabled={!newCategoryInput.trim()}
                      className="h-9 px-5 rounded-full bg-[#738879] hover:bg-[#607466] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Add Category
                    </Button>
                  </div>
                </div>
              )}

              {/* EDIT CATEGORY POPUP */}
              {isEditCategoryOpen && (
                <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
                  <div className="p-6 pb-5 space-y-4 relative">
                    <button
                      type="button"
                      onClick={() => setIsEditCategoryOpen(false)}
                      className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span className="sr-only">Close</span>
                    </button>

                    <div>
                      <h3 className="text-lg font-bold text-foreground font-serif tracking-tight">
                        Edit Category
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rename the selected category "{watch("category")}".
                      </p>
                    </div>

                    <div>
                      <Input
                        placeholder="New category name"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleConfirmEditCategory()
                          }
                        }}
                        className="h-11 rounded-full border-2 border-[#5c7a68] dark:border-[#7a9986] text-xs px-4 bg-background focus-visible:ring-primary text-foreground placeholder:text-muted-foreground/60 shadow-2xs"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="bg-[#f9f7f2] dark:bg-muted/40 p-4 px-6 border-t border-border/60 flex items-center justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditCategoryOpen(false)}
                      className="h-9 px-5 rounded-full border border-border bg-card hover:bg-muted text-xs text-foreground font-medium cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirmEditCategory}
                      disabled={!editingCategoryName.trim() || editingCategoryName.trim() === watch("category")}
                      className="h-9 px-5 rounded-full bg-[#738879] hover:bg-[#607466] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {/* DELETE CATEGORY POPUP */}
              {isDeleteCategoryOpen && (
                <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
                  <div className="p-6 pb-5 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setIsDeleteCategoryOpen(false)}
                      className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span className="sr-only">Close</span>
                    </button>

                    <div>
                      <h3 className="text-lg font-bold text-foreground font-serif tracking-tight">
                        Delete Category?
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        Are you sure you want to delete category <strong className="text-foreground">"{categoryToDelete || watch("category")}"</strong>?
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#f9f7f2] dark:bg-muted/40 p-4 px-6 border-t border-border/60 flex items-center justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDeleteCategoryOpen(false)}
                      className="h-9 px-5 rounded-full border border-border bg-card hover:bg-muted text-xs text-foreground font-medium cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleConfirmDeleteCategory}
                      className="h-9 px-5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Delete Category
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* SINGLE DELETE CONFIRMATION ALERT DIALOG */}
      <AlertDialog
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => {
          if (!isDeleting && !open) setDeleteCandidate(null)
        }}
      >
        <AlertDialogContent className="rounded-2xl max-w-sm bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">"{deleteCandidate?.name}"</strong> from Supabase?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-full text-xs border-border cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault()
                handleConfirmSingleDelete()
              }}
              className="rounded-full text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-60"
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* BULK DELETE CONFIRMATION ALERT DIALOG */}
      <AlertDialog
        open={isBulkDeleteOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setIsBulkDeleteOpen(open)
        }}
      >
        <AlertDialogContent className="rounded-2xl max-w-sm bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Delete {selectedIds.length} Products?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete all {selectedIds.length} selected items?
              This will remove them from the active online store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-full text-xs border-border cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault()
                handleConfirmBulkDelete()
              }}
              className="rounded-full text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-60"
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete All Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

