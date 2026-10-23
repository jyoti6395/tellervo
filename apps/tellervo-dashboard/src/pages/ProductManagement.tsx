import * as React from "react"
import {
  Search,
  Plus,
  Edit2,
  Eye,
  MoreVertical,
  X,
  UploadCloud,
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
  Copy,
  Star,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

export interface ProductItem {
  id: string
  name: string
  ingredients: string
  category: "Adaptogenic Tonics" | "Wild Berry Spritz" | "Zero-Proof Spirits" | "Herbal Elixirs"
  price: number
  stock: number
  status: "Active" | "Low Stock" | "Out of Stock"
  image: string
  isFeatured?: boolean
  tags?: string
  sku?: string
  volume?: string
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    name: "Pine Forest Tonic",
    ingredients: "Pine Needle • Ashwagandha • Lemon Peel",
    category: "Adaptogenic Tonics",
    price: 14.5,
    stock: 24,
    status: "Active",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80",
    isFeatured: true,
    tags: "bestseller, seasonal, calm",
    sku: "TEL-PFT-001",
    volume: "330 ml",
  },
  {
    id: "prod-2",
    name: "Wild Berry Spritz",
    ingredients: "Nordic Lingonberry • Hibiscus • Spearmint",
    category: "Wild Berry Spritz",
    price: 15.8,
    stock: 18,
    status: "Active",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
    tags: "summer, berry, sparkling",
    sku: "TEL-WBS-002",
    volume: "250 ml",
  },
  {
    id: "prod-3",
    name: "Lemon Grass Cooler",
    ingredients: "Lemongrass • Wild Ginger • Persian Lime",
    category: "Zero-Proof Spirits",
    price: 12.5,
    stock: 32,
    status: "Active",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80",
    isFeatured: true,
    tags: "refreshing, zero-alcohol, citrus",
    sku: "TEL-LGC-003",
    volume: "500 ml",
  },
  {
    id: "prod-4",
    name: "Citrus Blossom Tonic",
    ingredients: "Bergamot • Elderflower • Alpine Botanicals",
    category: "Adaptogenic Tonics",
    price: 13.9,
    stock: 6,
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
    tags: "citrus, elderflower, mood",
    sku: "TEL-CBT-004",
    volume: "330 ml",
  },
  {
    id: "prod-5",
    name: "Forest Berry Elixir",
    ingredients: "Mixed Wild Berries • Acerola • Vitamin C",
    category: "Wild Berry Spritz",
    price: 16.2,
    stock: 0,
    status: "Out of Stock",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
    tags: "vitamin-c, elixir, immune",
    sku: "TEL-FBE-005",
    volume: "330 ml",
  },
  {
    id: "prod-6",
    name: "Golden Glow Tonic",
    ingredients: "Fermented Turmeric • Ginger Root • Raw Honey",
    category: "Adaptogenic Tonics",
    price: 14.0,
    stock: 28,
    status: "Active",
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300&auto=format&fit=crop&q=80",
    isFeatured: true,
    tags: "wellness, turmeric, recovery",
    sku: "TEL-GGT-006",
    volume: "330 ml",
  },
  {
    id: "prod-7",
    name: "Coconut Dream Botanical",
    ingredients: "Young Coconut • Tahitian Vanilla • Lion's Mane",
    category: "Zero-Proof Spirits",
    price: 11.9,
    stock: 15,
    status: "Active",
    image: "https://images.unsplash.com/photo-1587888637140-849b25d80ef9?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
    tags: "creamy, nootropic, focus",
    sku: "TEL-CDB-007",
    volume: "500 ml",
  },
  {
    id: "prod-8",
    name: "Berry Bloom Spritz",
    ingredients: "Raspberry • Hibiscus Infusion • Sparkling Spring Water",
    category: "Wild Berry Spritz",
    price: 15.5,
    stock: 8,
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
    tags: "sparkling, floral, antioxidant",
    sku: "TEL-BBS-008",
    volume: "250 ml",
  },
  {
    id: "prod-9",
    name: "Nordic Birch Elixir",
    ingredients: "Birch Sap • Juniper • Angelica Root",
    category: "Herbal Elixirs",
    price: 17.5,
    stock: 22,
    status: "Active",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&auto=format&fit=crop&q=80",
    isFeatured: true,
    tags: "nordic, detox, botanical",
    sku: "TEL-NBE-009",
    volume: "330 ml",
  },
  {
    id: "prod-10",
    name: "Smoked Cedar Aperitif",
    ingredients: "Oak Smoke • Roasted Cedar • Gentian",
    category: "Zero-Proof Spirits",
    price: 18.0,
    stock: 4,
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
    tags: "bitters, aperitif, evening",
    sku: "TEL-SCA-010",
    volume: "500 ml",
  },
  {
    id: "prod-11",
    name: "Elderberry Nightcap",
    ingredients: "Black Elderberry • Chamomile • Valerian",
    category: "Herbal Elixirs",
    price: 16.5,
    stock: 35,
    status: "Active",
    image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
    tags: "sleep, relaxation, botanical",
    sku: "TEL-EBN-011",
    volume: "330 ml",
  },
  {
    id: "prod-12",
    name: "Sparkling Sea Buckthorn",
    ingredients: "Sea Buckthorn • Blood Orange • Rosemary",
    category: "Wild Berry Spritz",
    price: 14.8,
    stock: 0,
    status: "Out of Stock",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80",
    isFeatured: false,
    tags: "superfruit, tangy, energizing",
    sku: "TEL-SSB-012",
    volume: "250 ml",
  },
]

type SortField = "name" | "price" | "stock" | "category"
type SortDirection = "asc" | "desc"

function generateExportFilename() {
  const dateStr = new Date().toISOString().slice(0, 10)
  return `tellervo_catalog_${dateStr}.csv`
}

export function ProductManagement() {
  const [products, setProducts] = React.useState<ProductItem[]>(INITIAL_PRODUCTS)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sortField, setSortField] = React.useState<SortField>("name")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(8)

  // Drawer / Side-panel State for Add / Edit
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<ProductItem | null>(null)
  const [activeTab, setActiveTab] = React.useState<"basic" | "ingredients" | "media">("basic")

  // View Details Modal State
  const [viewingProduct, setViewingProduct] = React.useState<ProductItem | null>(null)

  // Single / Bulk Delete Confirmation Dialog State
  const [deleteCandidate, setDeleteCandidate] = React.useState<ProductItem | null>(null)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false)

  // Form State
  const [formName, setFormName] = React.useState("")
  const [formCategory, setFormCategory] = React.useState<ProductItem["category"]>("Adaptogenic Tonics")
  const [formPrice, setFormPrice] = React.useState("")
  const [formStock, setFormStock] = React.useState("0")
  const [formIngredients, setFormIngredients] = React.useState("")
  const [formStatus, setFormStatus] = React.useState<ProductItem["status"]>("Active")
  const [formFeatured, setFormFeatured] = React.useState(false)
  const [formTags, setFormTags] = React.useState("")
  const [formVolume, setFormVolume] = React.useState("330 ml")
  const [formImage, setFormImage] = React.useState("")
  const [formAdditionalImages, setFormAdditionalImages] = React.useState<string[]>([])

  // Open Panel for creating new product
  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormName("")
    setFormCategory("Adaptogenic Tonics")
    setFormPrice("")
    setFormStock("20")
    setFormIngredients("")
    setFormStatus("Active")
    setFormFeatured(false)
    setFormTags("")
    setFormVolume("330 ml")
    setFormImage("https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80")
    setFormAdditionalImages([
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80",
    ])
    setActiveTab("basic")
    setIsPanelOpen(true)
  }

  // Open Panel for editing existing product
  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product)
    setFormName(product.name)
    setFormCategory(product.category)
    setFormPrice(product.price.toString())
    setFormStock(product.stock.toString())
    setFormIngredients(product.ingredients)
    setFormStatus(product.status)
    setFormFeatured(Boolean(product.isFeatured))
    setFormTags(product.tags || "")
    setFormVolume(product.volume || "330 ml")
    setFormImage(product.image)
    setFormAdditionalImages([
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80",
    ])
    setActiveTab("basic")
    setIsPanelOpen(true)
  }

  // Duplicate product
  const handleDuplicate = (product: ProductItem) => {
    const duplicated: ProductItem = {
      ...product,
      id: `prod-${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `TEL-CPY-${Math.floor(100 + Math.random() * 900)}`,
      status: product.stock > 0 ? "Active" : "Out of Stock",
    }
    setProducts((prev) => [duplicated, ...prev])
    toast.success(`Duplicated "${product.name}" successfully!`)
  }

  // Toggle Featured status directly
  const handleToggleFeatured = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = !p.isFeatured
          toast.success(`Product ${updated ? "featured" : "unfeatured"}`)
          return { ...p, isFeatured: updated }
        }
        return p
      })
    )
  }

  // Handle Save (Add or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error("Please enter a valid product name")
      return
    }

    const priceNum = parseFloat(formPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    const stockNum = parseInt(formStock, 10)
    const computedStatus =
      stockNum === 0 ? "Out of Stock" : stockNum <= 9 ? "Low Stock" : formStatus

    if (editingProduct) {
      // Update existing
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formName.trim(),
                category: formCategory,
                price: priceNum,
                stock: isNaN(stockNum) ? 0 : stockNum,
                ingredients: formIngredients.trim() || "Artisanal Botanical Infusion",
                status: computedStatus,
                isFeatured: formFeatured,
                tags: formTags.trim(),
                volume: formVolume.trim() || "330 ml",
                image: formImage || p.image,
              }
            : p
        )
      )
      toast.success(`Updated "${formName}" successfully!`)
    } else {
      // Create new
      const newProduct: ProductItem = {
        id: `prod-${Date.now()}`,
        name: formName.trim(),
        ingredients: formIngredients.trim() || "Fresh Botanical Infusion",
        category: formCategory,
        price: priceNum,
        stock: isNaN(stockNum) ? 0 : stockNum,
        status: computedStatus,
        image:
          formImage ||
          "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80",
        isFeatured: formFeatured,
        tags: formTags.trim(),
        sku: `TEL-NEW-${Math.floor(100 + Math.random() * 900)}`,
        volume: formVolume.trim() || "330 ml",
      }
      setProducts((prev) => [newProduct, ...prev])
      toast.success(`Product "${formName}" created successfully!`)
    }

    setIsPanelOpen(false)
  }

  // Delete handlers
  const handleConfirmSingleDelete = () => {
    if (!deleteCandidate) return
    setProducts((prev) => prev.filter((p) => p.id !== deleteCandidate.id))
    setSelectedIds((prev) => prev.filter((id) => id !== deleteCandidate.id))
    toast.success(`Deleted "${deleteCandidate.name}"`)
    setDeleteCandidate(null)
  }

  const handleConfirmBulkDelete = () => {
    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)))
    toast.success(`Deleted ${selectedIds.length} products`)
    setSelectedIds([])
    setIsBulkDeleteOpen(false)
  }

  // Bulk Status Change
  const handleBulkStatusChange = (newStatus: ProductItem["status"]) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (selectedIds.includes(p.id)) {
          return {
            ...p,
            status: newStatus,
            stock: newStatus === "Out of Stock" ? 0 : p.stock === 0 ? 15 : p.stock,
          }
        }
        return p
      })
    )
    toast.success(`Updated ${selectedIds.length} items to "${newStatus}"`)
  }

  // Sorting helper
  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filtering & Sorting derived list
  const filteredProducts = React.useMemo(() => {
    const query = searchTerm.toLowerCase().trim()
    const list = products.filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.ingredients.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.tags && p.tags.toLowerCase().includes(query))
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter
      const matchesStatus = statusFilter === "all" || p.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })

    return [...list].sort((a, b) => {
      let comp = 0
      if (sortField === "name") {
        comp = a.name.localeCompare(b.name)
      } else if (sortField === "price") {
        comp = a.price - b.price
      } else if (sortField === "stock") {
        comp = a.stock - b.stock
      } else if (sortField === "category") {
        comp = a.category.localeCompare(b.category)
      }
      return sortDirection === "asc" ? comp : -comp
    })
  }, [products, searchTerm, categoryFilter, statusFilter, sortField, sortDirection])

  // Export CSV
  const handleExportCSV = () => {
    const listToExport =
      selectedIds.length > 0
        ? products.filter((p) => selectedIds.includes(p.id))
        : filteredProducts

    const headers = ["ID", "Name", "Category", "Price (€)", "Stock", "Status", "Ingredients", "SKU", "Tags"]
    const rows = listToExport.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price.toFixed(2),
      p.stock,
      p.status,
      `"${p.ingredients.replace(/"/g, '""')}"`,
      `"${p.sku || ""}"`,
      `"${p.tags || ""}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", generateExportFilename())
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${listToExport.length} products to CSV file`)
  }

  // Safe Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedProducts = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, safeCurrentPage, pageSize])

  // Select all checkbox handler
  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.includes(p.id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedProducts.map((p) => p.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])))
    } else {
      const pageIds = new Set(paginatedProducts.map((p) => p.id))
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Clear filters
  const handleResetFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setCurrentPage(1)
    toast.info("Filters reset to default")
  }

  const isFiltered = searchTerm !== "" || categoryFilter !== "all" || statusFilter !== "all"

  // Live KPI Metrics
  const totalCount = products.length
  const activeCount = products.filter((p) => p.status === "Active").length
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length
  const outOfStockCount = products.filter((p) => p.status === "Out of Stock").length

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-[#f8f7f4] text-[#12281c] w-full">
      {/* LEFT / CENTER: Main Product Management Dashboard */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 min-w-0 transition-all">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#112a1d]">
                Product Management
              </h1>
              <Badge variant="outline" className="text-xs bg-[#eef5f0] text-[#1d5c38] border-[#cde2d3] font-medium">
                {products.length} Items in Catalog
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-[#617769] mt-1 font-sans">
              Curate your botanical collection, track live inventory, and manage catalog pricing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 text-xs font-medium rounded-xl border-[#dcd6cc] bg-white hover:bg-[#f6f2ea] text-[#334b3e] gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#5e776a]" />
              <span>Export CSV</span>
            </Button>

            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="h-9 px-4 bg-[#143926] hover:bg-[#1a4731] text-white text-xs font-semibold rounded-xl gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        {/* 4 KPI Metric Cards with Interactive Filter Quick-Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Products */}
          <div
            onClick={() => {
              setStatusFilter("all")
              setCurrentPage(1)
            }}
            className={`group cursor-pointer bg-white rounded-2xl p-4 md:p-5 border transition-all duration-200 shadow-2xs hover:shadow-xs flex items-center gap-4 ${
              statusFilter === "all" ? "border-[#143926]/40 ring-1 ring-[#143926]/20 bg-[#fafdfa]" : "border-[#e8e4dc]"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-[#e8f5ec] text-[#21653e] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#637a6b] font-medium block">Total Products</span>
                <span className="text-[10px] text-[#86998e] opacity-0 group-hover:opacity-100 transition-opacity">View all</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-serif text-[#112a1d]">{totalCount}</span>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> 5%
                </span>
              </div>
              <span className="text-[11px] text-[#86998e]">vs. last month</span>
            </div>
          </div>

          {/* Card 2: Active Products */}
          <div
            onClick={() => {
              setStatusFilter("Active")
              setCurrentPage(1)
            }}
            className={`group cursor-pointer bg-white rounded-2xl p-4 md:p-5 border transition-all duration-200 shadow-2xs hover:shadow-xs flex items-center gap-4 ${
              statusFilter === "Active" ? "border-emerald-600/50 ring-1 ring-emerald-600/30 bg-[#f4faf6]" : "border-[#e8e4dc]"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-[#e8f5ec] text-[#21653e] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#637a6b] font-medium block">Active Products</span>
                <span className="text-[10px] text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Filter</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-serif text-[#112a1d]">{activeCount}</span>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> 8%
                </span>
              </div>
              <span className="text-[11px] text-[#86998e]">
                {Math.round((activeCount / (totalCount || 1)) * 100)}% of total stock
              </span>
            </div>
          </div>

          {/* Card 3: Low Stock */}
          <div
            onClick={() => {
              setStatusFilter("Low Stock")
              setCurrentPage(1)
            }}
            className={`group cursor-pointer bg-white rounded-2xl p-4 md:p-5 border transition-all duration-200 shadow-2xs hover:shadow-xs flex items-center gap-4 ${
              statusFilter === "Low Stock" ? "border-amber-600/50 ring-1 ring-amber-600/30 bg-[#fdfaf4]" : "border-[#e8e4dc]"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-[#fff2e2] text-[#bc6719] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#637a6b] font-medium block">Low Stock Alert</span>
                <span className="text-[10px] text-amber-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Filter</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-serif text-[#112a1d]">{lowStockCount}</span>
                <span className="inline-flex items-center text-xs font-semibold text-rose-600">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> 2%
                </span>
              </div>
              <span className="text-[11px] text-[#86998e]">Needs replenishment</span>
            </div>
          </div>

          {/* Card 4: Out of Stock */}
          <div
            onClick={() => {
              setStatusFilter("Out of Stock")
              setCurrentPage(1)
            }}
            className={`group cursor-pointer bg-white rounded-2xl p-4 md:p-5 border transition-all duration-200 shadow-2xs hover:shadow-xs flex items-center gap-4 ${
              statusFilter === "Out of Stock" ? "border-rose-600/50 ring-1 ring-rose-600/30 bg-[#fdf5f6]" : "border-[#e8e4dc]"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-[#feecee] text-[#b92b3b] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#637a6b] font-medium block">Out of Stock</span>
                <span className="text-[10px] text-rose-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Filter</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-serif text-[#112a1d]">{outOfStockCount}</span>
                <span className="inline-flex items-center text-xs font-semibold text-rose-600">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> 1%
                </span>
              </div>
              <span className="text-[11px] text-[#86998e]">Unavailable online</span>
            </div>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-[#e8e4dc] shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Search Input with Clear Button */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a9d91]" />
                <Input
                  placeholder="Search products, botanicals, SKU..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 pr-8 h-9.5 text-xs bg-[#fbfaf8] border-[#e5dfd5] rounded-xl focus-visible:ring-[#163826] text-[#142e20]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a9d91] hover:text-[#112a1d] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-9.5 text-xs bg-[#fbfaf8] border-[#e5dfd5] rounded-xl text-[#334b3e] min-w-[145px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Adaptogenic Tonics">Adaptogenic Tonics</SelectItem>
                  <SelectItem value="Wild Berry Spritz">Wild Berry Spritz</SelectItem>
                  <SelectItem value="Zero-Proof Spirits">Zero-Proof Spirits</SelectItem>
                  <SelectItem value="Herbal Elixirs">Herbal Elixirs</SelectItem>
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
                <SelectTrigger className="h-9.5 text-xs bg-[#fbfaf8] border-[#e5dfd5] rounded-xl text-[#334b3e] min-w-[125px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset Filters button if any active */}
              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 px-2.5 text-xs text-[#718679] hover:text-[#143926] hover:bg-[#f2efe9] rounded-xl gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>

            {/* Quick Stats or Right info */}
            <div className="flex items-center gap-3 text-xs text-[#718679]">
              <span className="hidden sm:inline-block">
                Showing <strong className="text-[#142e20]">{filteredProducts.length}</strong> of {products.length} products
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className={`h-9 px-3 text-xs rounded-xl border-[#dcd6cc] transition-colors gap-1.5 ${
                  isPanelOpen ? "bg-[#eaf4ee] text-[#143926] border-[#bad8c4]" : "bg-white text-[#415a4c]"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isPanelOpen ? "Hide Panel" : "Show Side Panel"}</span>
              </Button>
            </div>
          </div>

          {/* Bulk Selection Action Bar (Visible when items selected) */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#eaf4ee] border border-[#bad8c4] p-2.5 px-4 rounded-xl animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#143926]">
                <div className="w-5 h-5 rounded-md bg-[#143926] text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{selectedIds.length} product{selectedIds.length > 1 ? "s" : ""} selected</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusChange("Active")}
                  className="h-8 text-xs bg-white text-[#1b6b37] border-[#c0deca] hover:bg-[#f2faf5] rounded-lg"
                >
                  Mark Active
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusChange("Out of Stock")}
                  className="h-8 text-xs bg-white text-rose-700 border-rose-200 hover:bg-rose-50 rounded-lg"
                >
                  Mark Out of Stock
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-8 text-xs bg-white text-[#334b3e] border-[#dcd6cc] hover:bg-[#f8f6f0] rounded-lg gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="h-8 text-xs rounded-lg gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Selected</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  className="h-8 text-xs text-[#5e776a] hover:text-[#112a1d] hover:bg-white/60 rounded-lg"
                >
                  Deselect
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* SHADCN TABLE CONTAINER */}
        <div className="bg-white rounded-2xl border border-[#e8e4dc] shadow-2xs overflow-hidden">
          <div className="relative w-full overflow-x-auto">
            <Table className="w-full text-left border-collapse text-xs">
              <TableHeader>
                <TableRow className="border-b border-[#e8e4dc] bg-[#faf8f4] hover:bg-[#faf8f4]">
                  {/* Select All Checkbox */}
                  <TableHead className="w-12 py-3 px-4 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all on current page"
                    />
                  </TableHead>

                  {/* Product Column Header with Sort */}
                  <TableHead className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleHeaderSort("name")}
                      className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold text-[#5e7567] hover:text-[#142e20] transition-colors"
                    >
                      <span>Product</span>
                      {sortField === "name" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-[#143926]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#143926]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#9ab0a2] opacity-70" />
                      )}
                    </button>
                  </TableHead>

                  {/* Category Column Header with Sort */}
                  <TableHead className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleHeaderSort("category")}
                      className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold text-[#5e7567] hover:text-[#142e20] transition-colors"
                    >
                      <span>Category</span>
                      {sortField === "category" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-[#143926]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#143926]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#9ab0a2] opacity-70" />
                      )}
                    </button>
                  </TableHead>

                  {/* Price Column Header with Sort */}
                  <TableHead className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleHeaderSort("price")}
                      className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold text-[#5e7567] hover:text-[#142e20] transition-colors"
                    >
                      <span>Price</span>
                      {sortField === "price" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-[#143926]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#143926]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#9ab0a2] opacity-70" />
                      )}
                    </button>
                  </TableHead>

                  {/* Stock Column Header with Sort */}
                  <TableHead className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleHeaderSort("stock")}
                      className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold text-[#5e7567] hover:text-[#142e20] transition-colors"
                    >
                      <span>Inventory</span>
                      {sortField === "stock" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-[#143926]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#143926]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#9ab0a2] opacity-70" />
                      )}
                    </button>
                  </TableHead>

                  {/* Status Column Header */}
                  <TableHead className="py-3 px-3 uppercase tracking-wider text-[11px] font-semibold text-[#5e7567]">
                    Status
                  </TableHead>

                  {/* Actions Column Header */}
                  <TableHead className="py-3 px-4 uppercase tracking-wider text-[11px] font-semibold text-[#5e7567] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center p-6 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#f5f2eb] text-[#7d9385] flex items-center justify-center">
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-sm text-[#142e20]">No products found</p>
                          <p className="text-xs text-[#718679] max-w-sm">
                            No drinks match your current search and filter settings. Try clearing the query or change filters.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="h-8 text-xs rounded-xl border-[#dcd6cc]"
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
                        className={`transition-colors border-b border-[#f0ece4] hover:bg-[#faf9f6] ${
                          isSelected ? "bg-[#f2f7f4]" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <TableCell className="py-3 px-4 text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelect(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </TableCell>

                        {/* Product Thumbnail & Details */}
                        <TableCell className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-xl object-cover border border-[#e2ddd4] shadow-2xs"
                              />
                              {product.isFeatured && (
                                <span
                                  title="Featured product"
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[#143926] flex items-center justify-center shadow-xs"
                                >
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 max-w-[240px]">
                              <div className="flex items-center gap-1.5">
                                <span
                                  onClick={() => setViewingProduct(product)}
                                  className="font-semibold text-[#142e20] text-xs leading-snug hover:text-[#143926] hover:underline cursor-pointer truncate"
                                >
                                  {product.name}
                                </span>
                                {product.volume && (
                                  <span className="text-[10px] text-[#86998e] bg-[#f4f1ea] px-1.5 py-0.2 rounded font-sans">
                                    {product.volume}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#718679] truncate mt-0.5">
                                {product.ingredients}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category Badge */}
                        <TableCell className="py-3 px-3">
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border-0 tracking-tight ${
                              product.category === "Adaptogenic Tonics"
                                ? "bg-[#e7f5ec] text-[#1c643b]"
                                : product.category === "Wild Berry Spritz"
                                ? "bg-[#f4eaf7] text-[#73368a]"
                                : product.category === "Zero-Proof Spirits"
                                ? "bg-[#fbf1dc] text-[#8e5c1d]"
                                : "bg-[#e2f1f5] text-[#1f6679]"
                            }`}
                          >
                            {product.category}
                          </Badge>
                        </TableCell>

                        {/* Price */}
                        <TableCell className="py-3 px-3 font-semibold text-[#152e21] font-sans">
                          €{product.price.toFixed(2)}
                        </TableCell>

                        {/* Stock Quantity & Health Indicator */}
                        <TableCell className="py-3 px-3">
                          <div className="flex flex-col gap-1 max-w-[100px]">
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`font-semibold ${
                                  product.stock === 0
                                    ? "text-rose-600"
                                    : product.stock <= 9
                                    ? "text-amber-600"
                                    : "text-[#1d3527]"
                                }`}
                              >
                                {product.stock} units
                              </span>
                            </div>
                            {/* Stock Visual Ratio Bar */}
                            <div className="w-full h-1.5 rounded-full bg-[#ede9e0] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  product.stock === 0
                                    ? "bg-rose-500 w-0"
                                    : product.stock <= 9
                                    ? "bg-amber-500"
                                    : "bg-emerald-600"
                                }`}
                                style={{ width: `${Math.min(100, (product.stock / 35) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold ${
                              product.status === "Active"
                                ? "bg-[#e5f7eb] text-[#1b6b37]"
                                : product.status === "Low Stock"
                                ? "bg-[#fef2e2] text-[#b36319]"
                                : "bg-[#feecee] text-[#b92c3a]"
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
                            {product.status}
                          </span>
                        </TableCell>

                        {/* Action Dropdown Menu & Quick Actions */}
                        <TableCell className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1 text-[#73887b]">
                            {/* Quick View Button */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewingProduct(product)}
                                  className="h-8 w-8 text-[#5f776a] hover:text-[#143926] hover:bg-[#eef5f1] rounded-lg transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span className="sr-only">View Details</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Quick View</TooltipContent>
                            </Tooltip>

                            {/* Quick Edit Button */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEdit(product)}
                                  className="h-8 w-8 text-[#5f776a] hover:text-[#143926] hover:bg-[#eef5f1] rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span className="sr-only">Edit Product</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Details</TooltipContent>
                            </Tooltip>

                            {/* Shadcn DropdownMenu for Full Context Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#5f776a] hover:text-[#143926] hover:bg-[#eef5f1] rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white border border-[#e8e4dc] shadow-md p-1.5">
                                <DropdownMenuLabel className="text-[11px] font-semibold text-[#82968a] px-2 py-1">
                                  Product Options
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => setViewingProduct(product)}
                                  className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-[#f4f8f5] text-[#142e20] gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#5e776a]" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenEdit(product)}
                                  className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-[#f4f8f5] text-[#142e20] gap-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#5e776a]" />
                                  <span>Edit Product</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDuplicate(product)}
                                  className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-[#f4f8f5] text-[#142e20] gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5 text-[#5e776a]" />
                                  <span>Duplicate Item</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleFeatured(product.id)}
                                  className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-[#f4f8f5] text-[#142e20] gap-2"
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      product.isFeatured ? "fill-amber-400 text-amber-500" : "text-[#5e776a]"
                                    }`}
                                  />
                                  <span>{product.isFeatured ? "Unfeature" : "Feature in Store"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-[#ede9e1]" />
                                <DropdownMenuItem
                                  onClick={() => setDeleteCandidate(product)}
                                  className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-rose-50 text-rose-600 focus:text-rose-600 focus:bg-rose-50 gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Product</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer with Professional Pagination */}
          <div className="p-3.5 md:p-4 border-t border-[#e8e4dc] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#637a6b] bg-[#fdfcfb]">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong>{filteredProducts.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</strong> to{" "}
                <strong>{Math.min(safeCurrentPage * pageSize, filteredProducts.length)}</strong> of{" "}
                <strong>{filteredProducts.length}</strong> items
              </span>

              {/* Page Size Selector */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#e5dfd5]">
                <span className="text-[11px] text-[#86998e]">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="h-7 text-xs bg-white border border-[#e5dfd5] rounded-lg px-2 text-[#334b3e] focus:outline-none focus:ring-1 focus:ring-[#143926]"
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border-[#e5dfd5] text-[#556c5d] hover:bg-[#f6f4ee] disabled:opacity-40"
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
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    safeCurrentPage === page
                      ? "bg-[#143926] text-white hover:bg-[#19452f] shadow-2xs"
                      : "border-[#e5dfd5] text-[#556c5d] hover:bg-[#f6f4ee]"
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
                className="w-8 h-8 rounded-lg border-[#e5dfd5] text-[#556c5d] hover:bg-[#f6f4ee] disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Slide-over Drawer / Side Panel for Add & Edit Product */}
      {isPanelOpen && (
        <aside className="w-full xl:w-[460px] xl:shrink-0 bg-white border-t xl:border-t-0 xl:border-l border-[#e7e2d8] flex flex-col shadow-xl z-20 animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#e8e4dc] flex items-center justify-between bg-[#fbfaf8]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#eaf4ee] text-[#143926] flex items-center justify-center">
                {editingProduct ? <Edit2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#112a1d]">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-[11px] text-[#698172]">
                  {editingProduct ? `SKU: ${editingProduct.sku || "N/A"}` : "Create and publish a new botanical drink"}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPanelOpen(false)}
              className="h-8 w-8 rounded-lg text-[#778d80] hover:text-[#112a1d] hover:bg-[#f3efe8]"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-[#e8e4dc] px-5 text-xs font-semibold text-[#667d6f] bg-white">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`py-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "basic"
                  ? "border-[#143926] text-[#143926] font-bold"
                  : "border-transparent hover:text-[#112a1d]"
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ingredients")}
              className={`py-3 px-3 border-b-2 font-medium transition-colors ${
                activeTab === "ingredients"
                  ? "border-[#143926] text-[#143926] font-bold"
                  : "border-transparent hover:text-[#112a1d]"
              }`}
            >
              Botanicals & Story
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`py-3 px-3 border-b-2 font-medium transition-colors ${
                activeTab === "media"
                  ? "border-[#143926] text-[#143926] font-bold"
                  : "border-transparent hover:text-[#112a1d]"
              }`}
            >
              Media & Gallery
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === "basic" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Product Name */}
                <div>
                  <label className="block text-[11px] font-bold text-[#233f30] mb-1">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Lingonberry Cloud Tonic"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-9.5 text-xs bg-[#fdfcfb] border-[#e2dcd2] rounded-xl focus-visible:ring-[#143926]"
                  />
                </div>

                {/* Category & Volume */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#233f30] mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={formCategory}
                      onValueChange={(val) => setFormCategory(val as ProductItem["category"])}
                    >
                      <SelectTrigger className="h-9.5 text-xs bg-[#fdfcfb] border-[#e2dcd2] rounded-xl text-[#233f30]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Adaptogenic Tonics">Adaptogenic Tonics</SelectItem>
                        <SelectItem value="Wild Berry Spritz">Wild Berry Spritz</SelectItem>
                        <SelectItem value="Zero-Proof Spirits">Zero-Proof Spirits</SelectItem>
                        <SelectItem value="Herbal Elixirs">Herbal Elixirs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#233f30] mb-1">
                      Volume / Format
                    </label>
                    <Input
                      placeholder="e.g. 330 ml or 4-Pack"
                      value={formVolume}
                      onChange={(e) => setFormVolume(e.target.value)}
                      className="h-9.5 text-xs bg-[#fdfcfb] border-[#e2dcd2] rounded-xl focus-visible:ring-[#143926]"
                    />
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#233f30] mb-1">
                      Price (€) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#768c7e]">
                        €
                      </span>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        placeholder="14.50"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="pl-7 h-9.5 text-xs bg-[#fdfcfb] border-[#e2dcd2] rounded-xl focus-visible:ring-[#143926]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#233f30] mb-1">
                      Stock Level <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      type="number"
                      placeholder="20"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="h-9.5 text-xs bg-[#fdfcfb] border-[#e2dcd2] rounded-xl focus-visible:ring-[#143926]"
                    />
                  </div>
                </div>

                {/* Status & Featured */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#233f30] mb-1">
                      Inventory Status
                    </label>
                    <Select
                      value={formStatus}
                      onValueChange={(val) => setFormStatus(val as ProductItem["status"])}
                    >
                      <SelectTrigger className="h-9.5 text-xs bg-[#fdfcfb] border-[#e2dcd2] rounded-xl text-[#233f30]">
                        <SelectValue placeholder="Active" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2.5 pt-4">
                    <Switch
                      checked={formFeatured}
                      onCheckedChange={setFormFeatured}
                      id="drawer-featured-switch"
                    />
                    <label
                      htmlFor="drawer-featured-switch"
                      className="text-xs font-semibold text-[#254233] cursor-pointer"
                    >
                      Feature in Store
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ingredients" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Botanical Ingredients Summary */}
                <div>
                  <label className="block text-[11px] font-bold text-[#233f30] mb-1">
                    Botanical Blend & Key Notes
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="e.g. Pine Needle • Ashwagandha • Lemon Peel • Wild Thyme"
                    value={formIngredients}
                    onChange={(e) => setFormIngredients(e.target.value)}
                    className="text-xs bg-[#fdfcfb] border-[#e2dcd2] rounded-xl focus-visible:ring-[#143926]"
                  />
                  <p className="text-[10px] text-[#7d9385] mt-1">
                    Displayed prominently on catalog cards and customer recipes.
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[11px] font-bold text-[#233f30] mb-1">
                    Search Tags & Moods
                  </label>
                  <Input
                    placeholder="e.g. bestseller, relaxation, evening, adaptogen"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="h-9.5 text-xs bg-[#fdfcfb] border-[#e2dcd2] rounded-xl focus-visible:ring-[#143926]"
                  />
                </div>
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Main Image URL & Dropzone */}
                <div>
                  <label className="block text-[11px] font-bold text-[#233f30] mb-1">
                    Product Hero Image URL
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="h-9.5 text-xs bg-[#fdfcfb] border-[#e2dcd2] rounded-xl focus-visible:ring-[#143926] mb-2"
                  />

                  {/* Dropzone mockup */}
                  <div
                    onClick={() => toast.info("Image upload simulation triggered")}
                    className="border-2 border-dashed border-[#d8d2c6] hover:border-[#143926] bg-[#fbfaf8] rounded-2xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center group"
                  >
                    <div className="w-9 h-9 rounded-full bg-white shadow-2xs flex items-center justify-center text-[#6e8578] group-hover:text-[#143926] mb-1.5">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-[#183626]">
                      Click to upload new high-res bottle photo
                    </span>
                    <span className="text-[10px] text-[#819689] mt-0.5">
                      Supports JPG, PNG, WebP (Max 5MB)
                    </span>
                  </div>
                </div>

                {/* Additional Images Row */}
                <div>
                  <label className="block text-[11px] font-bold text-[#233f30] mb-1.5">
                    Gallery Thumbnails
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {formAdditionalImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#e2dcd2] shadow-2xs group"
                      >
                        <img src={imgUrl} alt="Additional visual" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setFormAdditionalImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                          title="Remove"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormAdditionalImages((prev) => [
                          ...prev,
                          "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=120&auto=format&fit=crop&q=80",
                        ])
                        toast.success("Additional preview added")
                      }}
                      className="w-14 h-14 rounded-xl border-2 border-dashed border-[#d8d2c6] hover:border-[#143926] bg-[#fbfaf8] flex items-center justify-center text-[#73887b] hover:text-[#143926] transition-colors"
                      title="Add Image"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#e8e4dc] flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPanelOpen(false)}
                className="h-9.5 px-4 text-xs font-semibold rounded-xl border-[#dcd6cc] text-[#3b5546] hover:bg-[#f6f2ea]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9.5 px-5 text-xs font-semibold rounded-xl bg-[#143926] hover:bg-[#1a4731] text-white shadow-xs transition-colors"
              >
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </aside>
      )}

      {/* QUICK VIEW DETAILS MODAL */}
      <Dialog open={Boolean(viewingProduct)} onOpenChange={(open) => !open && setViewingProduct(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 border-[#e8e4dc]">
          {viewingProduct && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-[#e7f5ec] text-[#1c643b]"
                  >
                    {viewingProduct.category}
                  </Badge>
                  <span className="text-xs text-[#718679] font-mono">
                    {viewingProduct.sku || "TEL-GEN-001"}
                  </span>
                </div>
                <DialogTitle className="font-serif text-xl font-bold text-[#142e20] pt-2">
                  {viewingProduct.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#617769]">
                  {viewingProduct.ingredients}
                </DialogDescription>
              </DialogHeader>

              {/* Product Hero Visual */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#e8e4dc] bg-[#fbfaf8]">
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.name}
                  className="w-full h-full object-cover"
                />
                {viewingProduct.isFeatured && (
                  <Badge className="absolute top-3 left-3 bg-amber-400 text-[#143926] font-bold shadow-xs border-0">
                    Featured Drink
                  </Badge>
                )}
                <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg font-bold">
                  €{viewingProduct.price.toFixed(2)}
                </span>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-3 gap-2.5 bg-[#fbfaf8] p-3 rounded-xl border border-[#ebe7df] text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#7a9083] uppercase block font-medium">Stock</span>
                  <span
                    className={`font-bold ${
                      viewingProduct.stock === 0
                        ? "text-rose-600"
                        : viewingProduct.stock <= 9
                        ? "text-amber-600"
                        : "text-[#142e20]"
                    }`}
                  >
                    {viewingProduct.stock} units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7a9083] uppercase block font-medium">Status</span>
                  <span className="font-semibold text-[#142e20]">{viewingProduct.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7a9083] uppercase block font-medium">Volume</span>
                  <span className="font-semibold text-[#142e20]">{viewingProduct.volume || "330 ml"}</span>
                </div>
              </div>

              {/* Tags */}
              {viewingProduct.tags && (
                <div>
                  <span className="text-[11px] font-bold text-[#233f30] block mb-1.5">Tags & Aromas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingProduct.tags.split(",").map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-[#f4f2eb] text-[#3c5547] px-2 py-0.5 rounded-md font-medium"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingProduct(null)}
                  className="rounded-xl border-[#dcd6cc] text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const prod = viewingProduct
                    setViewingProduct(null)
                    handleOpenEdit(prod)
                  }}
                  className="rounded-xl bg-[#143926] hover:bg-[#19452f] text-white text-xs gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Product</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SINGLE DELETE CONFIRMATION ALERT DIALOG */}
      <AlertDialog
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => !open && setDeleteCandidate(null)}
      >
        <AlertDialogContent className="rounded-2xl max-w-sm bg-white border-[#e8e4dc]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg font-bold text-[#142e20]">
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#637a6b]">
              Are you sure you want to remove{" "}
              <strong className="text-[#142e20]">"{deleteCandidate?.name}"</strong> from your catalog?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl text-xs border-[#dcd6cc]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSingleDelete}
              className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* BULK DELETE CONFIRMATION ALERT DIALOG */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm bg-white border-[#e8e4dc]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg font-bold text-[#142e20]">
              Delete {selectedIds.length} Products?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#637a6b]">
              Are you sure you want to permanently delete all {selectedIds.length} selected items?
              This will remove them from the active online store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl text-xs border-[#dcd6cc]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete All Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
