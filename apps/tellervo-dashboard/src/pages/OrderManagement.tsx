import * as React from "react"
import {
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  ChevronDown,
  X,
  MapPin,

  Phone,
  CreditCard,
  Check,
  Loader2,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { orderService } from "@tellervo/supabase"

export type OrderStatus = "Pending" | "In Progress" | "Shipments" | "Completed" | "Cancelled" | "Refunded"

export interface OrderItemProduct {
  name: string
  quantity: number
  price: number
  image: string
}

export interface OrderRecord {
  id: string
  orderCode: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  primaryProduct: {
    name: string
    image: string
    additionalCount: number
  }
  items: OrderItemProduct[]
  date: string
  rawDate?: string
  amount: number
  status: OrderStatus
  paymentMethod: string
}

const INITIAL_ORDERS: OrderRecord[] = []

export function OrderManagement() {
  const [orders, setOrders] = React.useState<OrderRecord[]>(INITIAL_ORDERS)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [dateFilter, setDateFilter] = React.useState<string>("all")
  const [chartTimeRange, setChartTimeRange] = React.useState<string>("7d")
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRecord | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 5

  // Fetch live orders from Supabase (orders, order_items, address.user_id, order_status_history)
  React.useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      try {
        setIsLoading(true)
        const liveOrders = await orderService.fetchAllOrdersAdmin()
        if (isMounted) {
          setOrders(liveOrders || [])
        }
      } catch (err) {
        console.warn("Failed to load live orders from Supabase:", err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      isMounted = false
    }
  }, [])

    // Dynamic KPI Calculations from live orders
  const totalOrdersCount = orders.length
  const pendingOrdersCount = React.useMemo(
    () => orders.filter((o) => o.status === "Pending").length,
    [orders]
  )
  const inProgressOrdersCount = React.useMemo(
    () => orders.filter((o) => o.status === "In Progress").length,
    [orders]
  )
  const completedOrdersCount = React.useMemo(
    () => orders.filter((o) => o.status === "Completed").length,
    [orders]
  )

  // Dynamic Week-over-Week trends
  const weeklyTrends = React.useMemo(() => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const thisWeek = orders.filter((o) => o.rawDate && new Date(o.rawDate) >= oneWeekAgo)
    const prevWeek = orders.filter(
      (o) =>
        o.rawDate &&
        new Date(o.rawDate) >= twoWeeksAgo &&
        new Date(o.rawDate) < oneWeekAgo
    )

    const calcTrend = (cur: number, prev: number) => {
      if (prev === 0) {
        if (cur > 0) return { text: `+${cur * 10}%`, isPositive: true }
        return { text: "+0%", isPositive: true }
      }
      const pct = Math.round(((cur - prev) / prev) * 100)
      return {
        text: `${pct >= 0 ? "+" : ""}${pct}%`,
        isPositive: pct >= 0,
      }
    }

    return {
      total: calcTrend(thisWeek.length, prevWeek.length),
      pending: calcTrend(
        thisWeek.filter((o) => o.status === "Pending").length,
        prevWeek.filter((o) => o.status === "Pending").length
      ),
      inProgress: calcTrend(
        thisWeek.filter((o) => o.status === "In Progress").length,
        prevWeek.filter((o) => o.status === "In Progress").length
      ),
      completed: calcTrend(
        thisWeek.filter((o) => o.status === "Completed").length,
        prevWeek.filter((o) => o.status === "Completed").length
      ),
    }
  }, [orders])

  // Dynamic chart filtering by time range
  const chartOrders = React.useMemo(() => {
    if (chartTimeRange === "all") return orders
    const now = new Date()
    if (chartTimeRange === "7d") {
      const cut = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return orders.filter((o) => !o.rawDate || new Date(o.rawDate) >= cut)
    }
    if (chartTimeRange === "30d") {
      const cut = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return orders.filter((o) => !o.rawDate || new Date(o.rawDate) >= cut)
    }
    if (chartTimeRange === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return orders.filter((o) => !o.rawDate || new Date(o.rawDate) >= startOfMonth)
    }
    return orders
  }, [orders, chartTimeRange])

  // Dynamic Order Status percentages & donut SVG segments
  const statusStats = React.useMemo(() => {
    const total = chartOrders.length
    const getCount = (st: OrderStatus) => chartOrders.filter((o) => o.status === st).length

    const list: {
      key: OrderStatus
      label: string
      color: string
      count: number
      pct: number
    }[] = [
      { key: "In Progress", label: "In Progress", color: "#3b82f6", count: getCount("In Progress"), pct: 0 },
      { key: "Shipments", label: "Shipments", color: "#6366f1", count: getCount("Shipments"), pct: 0 },
      { key: "Pending", label: "Pending", color: "#f97316", count: getCount("Pending"), pct: 0 },
      { key: "Completed", label: "Completed", color: "#10b981", count: getCount("Completed"), pct: 0 },
      { key: "Cancelled", label: "Cancelled", color: "#f43f5e", count: getCount("Cancelled"), pct: 0 },
      { key: "Refunded", label: "Refunded", color: "#a855f7", count: getCount("Refunded"), pct: 0 },
    ]

    if (total > 0) {
      list.forEach((item) => {
        item.pct = Math.round((item.count / total) * 100)
      })
    }

    const circumference = 213.628 // 2 * PI * 34
    let accOffset = 0
    let accAngle = 0

    const segments = list
      .filter((item) => item.count > 0)
      .map((item) => {
        const ratio = item.count / total
        const strokeDash = ratio * circumference
        const offset = -accOffset
        accOffset += strokeDash

        const angleSpan = ratio * 360
        const midAngle = accAngle + angleSpan / 2
        accAngle += angleSpan

        return {
          ...item,
          strokeDash: `${strokeDash.toFixed(2)} ${circumference.toFixed(2)}`,
          strokeOffset: offset.toFixed(2),
          midAngle,
        }
      })

    return { total, list, segments }
  }, [chartOrders])

  // Dynamic available dates for filter
  const availableDates = React.useMemo(() => {
    const dates = new Set<string>()
    orders.forEach((o) => {
      if (o.date) dates.add(o.date)
    })
    return Array.from(dates)
  }, [orders])

  // Filtered Orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((ord) => {
      const matchesSearch =
        ord.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.primaryProduct.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || ord.status.toLowerCase() === statusFilter.toLowerCase()

      const matchesDate = dateFilter === "all" || ord.date === dateFilter

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [orders, searchTerm, statusFilter, dateFilter])

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedOrders = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, safeCurrentPage, pageSize])

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    )
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    toast.success(`Order status updated to ${newStatus}`)

    try {
      const res = await orderService.updateOrderStatus(
        id,
        newStatus,
        "admin@tellervo.com",
        "Status updated via Admin Orders Table"
      )
      if (!res.success && res.error) {
        console.warn("Could not sync status with backend:", res.error.message)
      }
    } catch (err) {
      console.warn("Failed to persist order status:", err)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer Name", "Customer Email", "Primary Product", "Date", "Amount", "Status"]
    const rows = filteredOrders.map((o) => [
      o.orderCode,
      `"${o.customer.name}"`,
      o.customer.email,
      `"${o.primaryProduct.name}"`,
      o.date,
      o.amount.toFixed(2),
      o.status,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Tellervo_Orders_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredOrders.length} orders to CSV`)
  }

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 hover:bg-amber-100/80"
      case "In Progress":
        return "bg-sky-50 text-sky-700 hover:bg-sky-100/80"
      case "Shipments":
        return "bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:text-indigo-300"
      case "Completed":
        return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80"
      case "Cancelled":
        return "bg-rose-50 text-rose-700 hover:bg-rose-100/80"
      case "Refunded":
        return "bg-purple-50 text-purple-700 hover:bg-purple-100/80"
      default:
        return "bg-muted text-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      <div className="p-5 md:p-7 lg:p-8 space-y-6 min-w-0 transition-all">
        {/* HEADER SECTION (Matching Product Page & Image 1) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-sans">
              Orders
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Manage and track customer orders
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
          </div>
        </div>

        {/* TOP METRICS & ORDER STATUS ROW (2x2 Cards on Left + Pie Chart on Right, matching Image 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT 4 KPI CARDS (2x2 Grid) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Total Orders */}
            <div
              onClick={() => {
                setStatusFilter("all")
                setCurrentPage(1)
              }}
              className="cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Total Orders
                </span>
                <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                  {totalOrdersCount.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                  <span className={`inline-flex items-center gap-0.5 font-semibold ${weeklyTrends.total.isPositive ? "text-emerald-600" : "text-rose-500"}`}>
                    {weeklyTrends.total.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />} {weeklyTrends.total.text}
                  </span>
                  <span>vs Last Week</span>
                </div>
              </div>
            </div>

            {/* Card 2: Pending Orders */}
            <div
              onClick={() => {
                setStatusFilter("Pending")
                setCurrentPage(1)
              }}
              className="cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Pending Orders
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                  {pendingOrdersCount.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                  <span className={`inline-flex items-center gap-0.5 font-semibold ${weeklyTrends.pending.isPositive ? "text-emerald-600" : "text-rose-500"}`}>
                    {weeklyTrends.pending.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />} {weeklyTrends.pending.text}
                  </span>
                  <span>vs Last Week</span>
                </div>
              </div>
            </div>

            {/* Card 3: In Progress */}
            <div
              onClick={() => {
                setStatusFilter("In Progress")
                setCurrentPage(1)
              }}
              className="cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  In Progress
                </span>
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-700">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                  {inProgressOrdersCount.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                  <span className={`inline-flex items-center gap-0.5 font-semibold ${weeklyTrends.inProgress.isPositive ? "text-emerald-600" : "text-rose-500"}`}>
                    {weeklyTrends.inProgress.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />} {weeklyTrends.inProgress.text}
                  </span>
                  <span>vs Last Week</span>
                </div>
              </div>
            </div>

            {/* Card 4: Completed Orders */}
            <div
              onClick={() => {
                setStatusFilter("Completed")
                setCurrentPage(1)
              }}
              className="cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Completed Orders
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                  {completedOrdersCount.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                  <span className={`inline-flex items-center gap-0.5 font-semibold ${weeklyTrends.completed.isPositive ? "text-emerald-600" : "text-rose-500"}`}>
                    {weeklyTrends.completed.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />} {weeklyTrends.completed.text}
                  </span>
                  <span>vs Last Week</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT ORDER STATUS PIE CHART CARD (Exact Match to Image 1) */}
          <div className="lg:col-span-5 bg-card rounded-2xl border-0 p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-sans text-foreground">
                Order Status
              </h2>

              <Select value={chartTimeRange} onValueChange={setChartTimeRange}>
                <SelectTrigger className="h-8 px-3 text-xs bg-muted/30 border border-border/80 rounded-full text-muted-foreground w-auto gap-1.5 font-medium">
                  <SelectValue placeholder="Last 7 days" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pie Chart & Legends */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto pt-4 pb-2">
              {/* Clean SVG Donut Chart with dynamic segments & percentages */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {statusStats.total === 0 ? (
                    <circle
                      cx="50"
                      cy="50"
                      r="34"
                      fill="transparent"
                      stroke="currentColor"
                      className="text-muted/20"
                      strokeWidth="32"
                    />
                  ) : (
                    statusStats.segments.map((seg) => (
                      <circle
                        key={seg.key}
                        cx="50"
                        cy="50"
                        r="34"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="32"
                        strokeDasharray={seg.strokeDash}
                        strokeDashoffset={seg.strokeOffset}
                        className="transition-all duration-500 ease-out"
                      />
                    ))
                  )}

                  {/* Percentage text rendered inside segments having >= 10% */}
                  {statusStats.total > 0 &&
                    statusStats.segments.map((seg) => {
                      if (seg.pct < 10) return null
                      const rad = (seg.midAngle * Math.PI) / 180
                      const x = 50 + 34 * Math.cos(rad)
                      const y = 50 + 34 * Math.sin(rad)
                      return (
                        <text
                          key={`txt-${seg.key}`}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                          transform={`rotate(90 ${x} ${y})`}
                          className="select-none pointer-events-none drop-shadow-xs"
                        >
                          {seg.pct}%
                        </text>
                      )
                    })}
                </svg>

                {/* If total is 0, show friendly center label */}
                {statusStats.total === 0 && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-medium">0 Orders</span>
                  </div>
                )}
              </div>

              {/* Status Legend List (Dynamic matching Image 3) */}
              <div className="space-y-2 text-xs font-medium min-w-[130px]">
                {statusStats.list.map((s) => (
                  <div
                    key={s.key}
                    onClick={() => {
                      setStatusFilter(s.key)
                      setCurrentPage(1)
                    }}
                    className="flex items-center justify-between gap-3 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span>{s.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-foreground/80">
                      {s.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* UNIFIED CONTAINER: CONTROLS & ORDERS TABLE (Single Borderless Card matching Product Page) */}
        <div className="bg-card rounded-2xl shadow-xs overflow-hidden">
          {/* Top Controls: Search & Pill Filters */}
          <div className="p-5 pb-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Pill Search Input */}
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Search orders, customers..."
                  className="pl-9 pr-8 h-10 text-xs bg-card border border-border rounded-full shadow-2xs focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right Filter Pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Date Filter Pill Button */}
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
                      <SelectValue placeholder="All Dates" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="all">All Dates</SelectItem>
                    {availableDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter Pill Dropdown */}
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
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Shipments">Shipments</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table Container - seamless without separate outer border matching ProductManagement */}
          <div className="relative w-full overflow-x-auto">
            <Table className="w-full text-left border-collapse text-xs">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
                  <TableHead className="py-4 px-5 font-medium text-xs text-muted-foreground">
                    Order ID
                  </TableHead>
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Products
                  </TableHead>
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="py-4 px-5 text-right font-medium text-xs text-muted-foreground pr-6">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-56 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <Package className="w-8 h-8 opacity-40 animate-pulse text-primary" />
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>Loading orders</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-44 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Package className="w-8 h-8 opacity-40" />
                        <p className="text-sm font-medium">No orders found</p>
                        <p className="text-xs">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((ord) => (
                    <TableRow
                      key={ord.id}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrder(ord)}
                    >
                      {/* Order Code */}
                      <TableCell className="py-3.5 px-5 font-mono text-xs font-semibold text-foreground">
                        {ord.orderCode}
                      </TableCell>

                      {/* Products */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted/60 shrink-0">
                            <img
                              src={ord.primaryProduct.image}
                              alt={ord.primaryProduct.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-foreground block truncate">
                              {ord.primaryProduct.name}
                            </span>
                            {ord.primaryProduct.additionalCount > 0 && (
                              <span className="text-[11px] text-muted-foreground block">
                                +{ord.primaryProduct.additionalCount} other products
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="py-3.5 px-4">
                        <span className="text-xs font-medium text-foreground block">
                          {ord.customer.name}
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3.5 px-4 text-xs text-muted-foreground">
                        {ord.date}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="py-3.5 px-4 text-xs font-semibold font-sans text-foreground">
                        ${ord.amount.toFixed(2)}
                      </TableCell>

                      {/* Interactive Status Pill Badge */}
                      <TableCell className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors shadow-2xs ${getStatusBadgeClass(
                                ord.status
                              )}`}
                            >
                              <span>{ord.status}</span>
                              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-card border-border">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ord.id, "Pending")}>
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ord.id, "In Progress")}>
                              In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ord.id, "Shipments")}>
                              Shipments
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ord.id, "Completed")}>
                              Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ord.id, "Cancelled")}>
                              Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ord.id, "Refunded")}>
                              Refunded
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* Action View Eye Button */}
                      <TableCell className="py-3.5 px-5 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(ord)}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">View Order</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* TABLE FOOTER / PAGINATION (Matching Product Page) */}
          <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredOrders.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(safeCurrentPage * pageSize, filteredOrders.length)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{filteredOrders.length}</span>{" "}
              orders
            </div>

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

      {/* ORDER DETAILS RECEIPT MODAL (Matching Product Page Dialog Style) */}
      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl bg-card border-border p-6 shadow-xl">
          {selectedOrder && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-xs border-border font-semibold ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    {selectedOrder.orderCode}
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold text-foreground pt-1">
                  Order Details
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Placed on {selectedOrder.date} • {selectedOrder.paymentMethod}
                </DialogDescription>
              </DialogHeader>

              {/* Customer Contact Card */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <span>{selectedOrder.customer.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedOrder.customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedOrder.customer.address}</span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-foreground block">
                  Items ({selectedOrder.items.length})
                </span>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div>
                          <span className="font-semibold text-foreground block">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Payment Summary */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>Paid via {selectedOrder.paymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Total Amount</span>
                  <span className="text-lg font-bold font-sans text-foreground">
                    ${selectedOrder.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full border-border text-xs px-4"
                >
                  Close
                </Button>
                {selectedOrder.status !== "Completed" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id, "Completed")
                    }}
                    className="rounded-full bg-primary text-primary-foreground text-xs px-4 gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Completed</span>
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
