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
  TrendingUp,
  TrendingDown,
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
  RotateCcw,
  SlidersHorizontal,
  Sprout,
  Image as ImageIcon,
  Calendar,
  UploadCloud,
  Loader2,
} from "lucide-react"

import { Input } from "@/components/ui/input"
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
import { productService, type ProductRecord } from "@/lib/supabase"

export interface ProductItem {
  id: string
  name: string
  category: "Adaptogenic Tonics" | "Wild Berry Spritz" | "Zero-Proof Spirits" | "Herbal Elixirs"
  price: number
  stock: number
  status: "Active" | "Low Stock" | "Out of Stock"
  image: string
  description: string
  sku?: string
  volume?: string
  addedDate?: string
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
    price: Number(record.price) || 0,
    stock: Number(record.stock) || 0,
    status,
    image: record.image_url || "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80",
    sku: record.sku || "",
    volume: record.volume || "330 ml",
    addedDate: record.created_at
      ? new Date(record.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "Today",
    created_by: record.created_by,
    updated_by: record.updated_by,
  }
}

const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(100, "Product name cannot exceed 100 characters"),
  category: z.enum([
    "Adaptogenic Tonics",
    "Wild Berry Spritz",
    "Zero-Proof Spirits",
    "Herbal Elixirs",
  ]),
  volume: z.string().trim().min(1, "Volume is required (e.g. 330 ml)"),
  price: z.number({ message: "Price must be a valid number" }).positive("Price must be greater than $0.00"),
  stock: z.number({ message: "Inventory units must be a valid number" }).int("Inventory units must be a whole number").min(0, "Inventory units cannot be negative"),
  status: z.enum(["Active", "Low Stock", "Out of Stock"]),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  image: z.string().min(1, "Product image is required"),
})

export type ProductFormData = z.infer<typeof productFormSchema>

export function ProductManagement() {
  const [products, setProducts] = React.useState<ProductItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { isAdmin } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
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
  const [formImage, setFormImage] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "Adaptogenic Tonics",
      volume: "330 ml",
      price: 0,
      stock: 20,
      status: "Active",
      description: "",
      image: "",
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


    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit")
        return
      }
      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setFormImage(dataUrl)
        setValue("image", dataUrl, { shouldValidate: true })
        clearErrors("image")
        toast.success("Image selected for upload")
      }
      reader.readAsDataURL(file)
    }
  }

  // Open Panel for creating new product
  const handleOpenCreate = () => {
    setSelectedImageFile(null)
    setEditingProduct(null)
    setPanelMode("create")
    setFormImage("")
    reset({
      name: "",
      category: "Adaptogenic Tonics",
      volume: "330 ml",
      price: "" as unknown as number,
      stock: 20,
      status: "Active",
      description: "",
      image: "",
    })
    clearErrors()
    setIsPanelOpen(true)
  }

  // Open Panel for editing existing product
  const handleOpenEdit = (product: ProductItem) => {
    setSelectedImageFile(null)
    setEditingProduct(product)
    setPanelMode("edit")
    setFormImage(product.image)
    reset({
      name: product.name,
      category: product.category,
      volume: product.volume || "330 ml",
      price: product.price,
      stock: product.stock,
      status: product.status,
      description: product.description || "",
      image: product.image || "",
    })
    clearErrors()
    setIsPanelOpen(true)
  }

  // Open Panel for viewing details of an existing product in the slide drawer
  const handleOpenView = (product: ProductItem) => {
    setSelectedImageFile(null)
    setEditingProduct(product)
    setPanelMode("view")
    setFormImage(product.image)
    reset({
      name: product.name,
      category: product.category,
      volume: product.volume || "330 ml",
      price: product.price,
      stock: product.stock,
      status: product.status,
      description: product.description || "",
      image: product.image || "",
    })
    clearErrors()
    setIsPanelOpen(true)
  }







  // Form Save using react-hook-form
  // Form Save using react-hook-form
  const onSubmitProduct = async (data: ProductFormData) => {
    // Preserve the admin's exact chosen status directly
    const chosenStatus: ProductItem["status"] = data.status

    setIsSaving(true)
    try {
      let finalImageUrl = data.image.trim()
      if (selectedImageFile) {
        toast.loading("Uploading product image...", { id: "upload-image" })
        const { url, error: uploadErr } = await productService.uploadProductImage(selectedImageFile)
        toast.dismiss("upload-image")
        if (uploadErr) {
          console.warn("[ProductManagement] Image upload fallback:", uploadErr.message)
        } else if (url) {
          finalImageUrl = url
        }
      }

      if (editingProduct) {
        const { data: updatedRecord, error: updateErr } = await productService.updateProduct(
          editingProduct.id,
          {
            name: data.name.trim(),
            category: data.category,
            volume: data.volume.trim() || "330 ml",
            price: data.price,
            stock: data.stock,
            status: chosenStatus,
            description: data.description.trim(),
            image_url: finalImageUrl || editingProduct.image,
          }
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
          name: data.name.trim(),
          category: data.category,
          volume: data.volume.trim() || "330 ml",
          price: data.price,
          stock: data.stock,
          status: chosenStatus,
          description: data.description.trim(),
          image_url: finalImageUrl || "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80",
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
      setSelectedImageFile(null)
      setFormImage("")
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
      return matchesSearch && matchesCategory && matchesStatus
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
  }, [products, searchTerm, categoryFilter, statusFilter, sortField, sortDirection])

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["ID", "SKU", "Name", "Category", "Price", "Stock", "Status", "Volume", "Added Date"]
    const rows = filteredProducts.map((p) => [
      p.id,
      p.sku || "",
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.price.toFixed(2),
      p.stock,
      p.status,
      p.volume || "",
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
    setDateFilter("all")
    setCurrentPage(1)
  }

  const isFiltered = searchTerm || categoryFilter !== "all" || statusFilter !== "all" || dateFilter !== "all"

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

        {/* 4 CLEAN KPI CARDS (Matching Reference Mockup Exactly) */}
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
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-foreground">
                  {totalCount}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" /> 5%
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                vs. last month
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
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-foreground">
                  {activeCount}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" /> 8%
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {Math.round((activeCount / (totalCount || 1)) * 100)}% of total stock
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
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-foreground">
                  {lowStockCount}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-500">
                  <TrendingDown className="w-3.5 h-3.5" /> 2%
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Needs replenishment
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
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-foreground">
                  {outOfStockCount}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-500">
                  <TrendingDown className="w-3.5 h-3.5" /> 1%
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Unavailable online
              </span>
            </div>
          </div>
        </div>

        {/* UNIFIED CONTAINER: CONTROLS & TABLE COMBINED (Single Borderless Card) */}
        <div className="bg-card rounded-2xl shadow-xs overflow-hidden">
          {/* Top Controls: Search & Filter Pills */}
          <div className="p-5 pb-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Pill Search Input */}
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

              {/* Pill Filters on Right */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Date Filter Pill */}
                <Select
                  value={dateFilter}
                  onValueChange={(val) => {
                    setDateFilter(val)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-10 text-xs font-medium bg-card border border-border rounded-full text-foreground px-4 shadow-2xs min-w-[155px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <SelectValue placeholder="12 Sept - 20 Sept" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="12-20-sept">12 Sept - 20 Sept</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-30">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category Filter Pill */}
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
                    <SelectItem value="Adaptogenic Tonics">Adaptogenic Tonics</SelectItem>
                    <SelectItem value="Wild Berry Spritz">Wild Berry Spritz</SelectItem>
                    <SelectItem value="Zero-Proof Spirits">Zero-Proof Spirits</SelectItem>
                    <SelectItem value="Herbal Elixirs">Herbal Elixirs</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter Pill */}
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

                {/* Reset Filter Button if active */}
                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-10 px-3.5 text-xs text-muted-foreground hover:text-foreground rounded-full gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </Button>
                )}

                {/* Side Panel Toggle Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPanelOpen(!isPanelOpen)}
                  className={`h-10 px-4 text-xs font-medium rounded-full border border-border transition-colors gap-2 shadow-2xs ${
                    isPanelOpen ? "bg-muted text-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{isPanelOpen ? "Hide Panel" : "Side Panel"}</span>
                </Button>
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

          {/* Table Container - seamless without separate outer border */}
          <div className="relative w-full overflow-x-auto">
            <Table className="w-full text-left border-collapse text-xs">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
                  {/* Select All Checkbox */}
                  <TableHead className="w-12 py-4 px-4 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all on current page"
                    />
                  </TableHead>

                  {/* Image Column */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Image
                  </TableHead>

                  {/* Product Name Column */}
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

                  {/* Code (SKU) Column */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Code
                  </TableHead>

                  {/* Category / Category Column */}
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

                  {/* Price Column */}
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

                  {/* Stock Column */}
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

                  {/* Added Date Column (From Image 1) */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Added Date
                  </TableHead>

                  {/* Status Column */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Status
                  </TableHead>

                  {/* Action Column */}
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-56 text-center">
                      <div className="flex flex-col items-center justify-center p-6 space-y-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin text-[#183626] dark:text-[#dca038]" />
                        <p className="font-medium text-xs text-muted-foreground">Loading products...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-48 text-center">
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

                        {/* Image Thumbnail (Square with rounded corners, Image 1 style - no border) */}
                        <TableCell className="py-4 px-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted/30 shrink-0 flex items-center justify-center">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>

                        {/* Product Name */}
                        <TableCell className="py-4 px-4">
                          <div className="flex flex-col min-w-0 max-w-[220px]">
                            <span
                              onClick={() => handleOpenView(product)}
                              className="font-semibold text-xs md:text-sm text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                            >
                              {product.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              
                              {product.volume && (
                                <span className="text-[10px] text-muted-foreground">
                                  {product.volume}
                                </span>
                              )}
                              <span className="text-[11px] text-muted-foreground truncate">
                                {product.description}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Code (SKU) */}
                        <TableCell className="py-4 px-4 text-xs font-mono text-muted-foreground">
                          {product.sku || "N/A"}
                        </TableCell>

                        {/* Subcategory */}
                        <TableCell className="py-4 px-4 text-xs font-medium text-foreground">
                          {product.category}
                        </TableCell>

                        {/* Price */}
                        <TableCell className="py-4 px-4 text-xs font-semibold text-foreground">
                          ${product.price.toFixed(2)}
                        </TableCell>

                        {/* Stock */}
                        <TableCell className="py-4 px-4 text-xs font-medium text-foreground">
                          {product.stock}
                        </TableCell>

                        {/* Added Date */}
                        <TableCell className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {product.addedDate || "14 Sept 2025"}
                        </TableCell>

                        {/* Status (Static Pill Badge - Non-dropdown) */}
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

                        {/* Action Menu (Image 1 ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ horizontal dots) */}
                        <TableCell className="py-4 px-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors focus:outline-none"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Actions</span>
                              </button>
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
              </TableBody>
            </Table>
          </div>

          {/* Table Footer with Pagination (Clean, airy layout) */}
          <div className="p-4 border-t border-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-card">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong>{filteredProducts.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</strong> to{" "}
                <strong>{Math.min(safeCurrentPage * pageSize, filteredProducts.length)}</strong> of{" "}
                <strong>{filteredProducts.length}</strong> products
              </span>

              {/* Page Size Selector */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-border">
                <span className="text-[11px] text-muted-foreground">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="h-8 text-xs bg-card border border-border rounded-lg px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={20}>20</option>
                </select>
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
                  variant={safeCurrentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                    safeCurrentPage === page
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                disabled={safeCurrentPage === totalPages || totalPages === 0}
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

          {/* Form matching screenshot layout */}
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

              {/* Category & Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground font-sans">
                    Category <span className="text-rose-500">*</span>
                  </label>
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
                            "h-10 text-xs bg-card border-border rounded-xl text-foreground",
                            errors.category && "border-rose-400"
                          )}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border rounded-xl">
                          <SelectItem value="Adaptogenic Tonics">Adaptogenic Tonics</SelectItem>
                          <SelectItem value="Wild Berry Spritz">Wild Berry Spritz</SelectItem>
                          <SelectItem value="Zero-Proof Spirits">Zero-Proof Spirits</SelectItem>
                          <SelectItem value="Herbal Elixirs">Herbal Elixirs</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
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

              {/* Price & Inventory Units */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground font-sans">
                    Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("price", { valueAsNumber: true })}
                      disabled={panelMode === "view"}
                      className={cn(
                        "pl-8 h-10 text-xs bg-card border-border rounded-xl focus-visible:ring-primary placeholder:text-muted-foreground/60",
                        errors.price && "border-rose-400 focus-visible:ring-rose-400"
                      )}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.price.message}</p>
                  )}
                </div>

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
              </div>

              {/* Publication Status */}
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

              {/* Description */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-foreground font-sans">
                  Description <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  placeholder="Enter product details..."
                  {...register("description")}
                  disabled={panelMode === "view"}
                  rows={4}
                  className={cn(
                    "text-xs bg-card border-border rounded-xl focus-visible:ring-primary resize-none placeholder:text-muted-foreground/60",
                    errors.description && "border-rose-400 focus-visible:ring-rose-400"
                  )}
                />
                {errors.description && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Product Image - Full Width, Mobile-First Responsive & High Clarity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-foreground font-sans">
                    Product Image <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">PNG, JPG, WebP, GIF (max 5MB)</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {formImage && formImage !== "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80" ? (
                  <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-border bg-muted/15 dark:bg-muted/10 group flex items-center justify-center shadow-xs">
                    <img
                      src={formImage}
                      alt="Product preview"
                      className="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />

                    {/* Desktop Hover / Mobile Touch Action Bar */}
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                      {panelMode !== "view" && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs rounded-full h-9 px-4 cursor-pointer shadow-md bg-white text-foreground hover:bg-neutral-100 font-medium"
                          >
                            Change Photo
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setFormImage("")
                              setSelectedImageFile(null)
                              setValue("image", "", { shouldValidate: true })
                            }}
                            className="text-xs rounded-full h-9 px-4 cursor-pointer shadow-md font-medium"
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (panelMode !== "view") fileInputRef.current?.click()
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (panelMode !== "view") setIsDragging(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      if (panelMode === "view") return
                      const file = e.dataTransfer.files?.[0]
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("File size exceeds 5MB limit")
                          return
                        }
                        setSelectedImageFile(file)
                        const reader = new FileReader()
                        reader.onload = () => {
                          const dataUrl = reader.result as string
                          setFormImage(dataUrl)
                          setValue("image", dataUrl, { shouldValidate: true })
                          toast.success("Image selected for upload")
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className={cn(
                      "w-full border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all text-center select-none min-h-[170px] sm:min-h-[200px]",
                      isDragging
                        ? "border-[#183626] bg-[#183626]/5 dark:border-emerald-400 dark:bg-emerald-950/20"
                        : "border-border/80 hover:border-primary/60 bg-muted/10 hover:bg-muted/20",
                      errors.image && "border-rose-400 bg-rose-50/20 dark:bg-rose-950/20",
                      panelMode === "view" && "cursor-default hover:border-border/80 hover:bg-muted/10"
                    )}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-center text-muted-foreground transition-transform group-hover:scale-105">
                      <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5] text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {panelMode === "view" ? "No product image uploaded" : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">
                        High resolution recommended (1:1 or 4:5 ratio)
                      </p>
                    </div>
                  </div>
                )}
                {errors.image && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.image.message}</p>
                )}
              </div>
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

