import * as React from "react"
import {
  Search,
  Eye,
  MoreHorizontal,
  Package,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Truck,
  RotateCcw,
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
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
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRecord | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 10

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
  const shipmentsOrdersCount = React.useMemo(
    () => orders.filter((o) => o.status === "Shipments").length,
    [orders]
  )
  const completedOrdersCount = React.useMemo(
    () => orders.filter((o) => o.status === "Completed").length,
    [orders]
  )
  const refundedOrdersCount = React.useMemo(
    () => orders.filter((o) => o.status === "Refunded").length,
    [orders]
  )

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

      let matchesDate = true
      if (dateFilter !== "all") {
        if (dateFilter === "today") {
          const today = new Date().toISOString().slice(0, 10)
          matchesDate = ord.rawDate ? ord.rawDate.slice(0, 10) === today : false
        } else if (dateFilter === "this-week") {
          const now = new Date()
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = ord.rawDate ? new Date(ord.rawDate) >= weekAgo : false
        } else if (dateFilter === "this-month") {
          const now = new Date()
          const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
          matchesDate = ord.rawDate ? new Date(ord.rawDate) >= monthAgo : false
        } else if (dateFilter === "last-30") {
          const now = new Date()
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = ord.rawDate ? new Date(ord.rawDate) >= thirtyDaysAgo : false
        } else {
          matchesDate = ord.date.toLowerCase().includes(dateFilter.toLowerCase())
        }
      }

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

        {/* 6 CLEAN KPI CARDS (Matching ProductManagement structure with border-0) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {/* Card 1: Total Orders */}
          <div
            onClick={() => {
              setStatusFilter("all")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#edf5f0] text-[#1e4630] dark:bg-[#1e4630]/20 dark:text-[#6ee7b7] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate">
                Total Orders
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {totalOrdersCount}
              </span>
            </div>
          </div>

          {/* Card 2: Pending Orders */}
          <div
            onClick={() => {
              setStatusFilter("Pending")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#fef7ee] text-[#b45309] dark:bg-[#b45309]/20 dark:text-[#fcd34d] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate">
                Pending Orders
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {pendingOrdersCount}
              </span>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div
            onClick={() => {
              setStatusFilter("In Progress")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#f0f9ff] text-[#0284c7] dark:bg-[#0284c7]/20 dark:text-[#7dd3fc] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate">
                In Progress
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {inProgressOrdersCount}
              </span>
            </div>
          </div>

          {/* Card 4: Shipments */}
          <div
            onClick={() => {
              setStatusFilter("Shipments")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#eef2ff] text-[#4f46e5] dark:bg-[#4f46e5]/20 dark:text-[#a5b4fc] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate">
                Shipments
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {shipmentsOrdersCount}
              </span>
            </div>
          </div>

          {/* Card 5: Completed Orders */}
          <div
            onClick={() => {
              setStatusFilter("Completed")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#edf5f0] text-[#1e4630] dark:bg-[#1e4630]/20 dark:text-[#6ee7b7] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate">
                Completed
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {completedOrdersCount}
              </span>
            </div>
          </div>

          {/* Card 6: Refunded */}
          <div
            onClick={() => {
              setStatusFilter("Refunded")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#faf5ff] text-[#9333ea] dark:bg-[#9333ea]/20 dark:text-[#d8b4fe] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate">
                Refunded
              </span>
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground mt-0.5">
                {refundedOrdersCount}
              </span>
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
                {/* Date Filter Pill Button (Matching CustomerManagement) */}
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
            <Table className="w-full min-w-[760px] text-left border-collapse text-xs table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
                  <TableHead className="w-[13%] py-4 px-5 font-medium text-xs text-muted-foreground">
                    Order ID
                  </TableHead>
                  <TableHead className="w-[27%] py-4 px-4 font-medium text-xs text-muted-foreground">
                    Products
                  </TableHead>
                  <TableHead className="w-[18%] py-4 px-4 font-medium text-xs text-muted-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="w-[14%] py-4 px-4 font-medium text-xs text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="w-[11%] py-4 px-4 font-medium text-xs text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="w-[11%] py-4 px-4 font-medium text-xs text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="w-[6%] py-4 px-4 text-center font-medium text-xs text-muted-foreground">
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

                      {/* Action DropdownMenu (Three dots matching product table) */}
                      <TableCell className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card border border-border shadow-md p-1.5">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1">
                              Order Options
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setSelectedOrder(ord)}
                              className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-muted text-foreground gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>View Order Details</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* RIGHT SLIDE-OVER DRAWER FOR ORDER DETAILS (Matching Product View Detail Structure) */}
      <Sheet open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent
          showCloseButton={false}
          side="right"
          className="w-full data-[side=right]:sm:max-w-lg data-[side=right]:md:max-w-xl data-[side=right]:lg:max-w-[560px] p-0 flex flex-col gap-0 border-l border-border bg-card shadow-2xl z-50 overflow-hidden h-full"
        >
          {selectedOrder && (
            <>
              {/* Header matching product view details: green circle icon, title, order code, status badge, circular X */}
              <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-[#183626] dark:text-emerald-400 shrink-0">
                    <Package className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-base sm:text-lg font-bold text-foreground font-sans truncate">
                      Order Details
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-muted-foreground">
                        {selectedOrder.orderCode}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Badge
                        variant="outline"
                        className={`text-[11px] border-border font-semibold ${getStatusBadgeClass(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              {/* Scrollable Sheet Content Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 min-h-0">
                {/* Placed On Date & Payment Method */}
                <div className="text-xs text-muted-foreground font-medium">
                  Placed on {selectedOrder.date}
                </div>

                {/* Customer Information Card */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-2.5">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Customer Information
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="font-semibold text-foreground text-sm">
                      {selectedOrder.customer.name}
                    </div>
                    {selectedOrder.customer.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{selectedOrder.customer.phone}</span>
                      </div>
                    )}
                    {selectedOrder.customer.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{selectedOrder.customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items List */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Items ({selectedOrder.items.length})
                  </span>
                  <div className="space-y-2.5">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/40 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover border border-border/40 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground block text-xs sm:text-sm truncate">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground mt-0.5 block">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-foreground text-sm shrink-0 ml-3">
                          ${(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Payment Summary Card */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Paid via {selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Total Amount</span>
                    <span className="text-xl font-bold font-sans text-foreground">
                      ${selectedOrder.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sheet Footer matching Product view detail */}
              <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between bg-card shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="h-10 px-6 rounded-full border-border text-xs text-foreground hover:bg-muted font-medium cursor-pointer"
                >
                  Close
                </Button>
                {selectedOrder.status !== "Completed" && (
                  <Button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "Completed")}
                    className="h-10 px-6 rounded-full bg-[#183626] hover:bg-[#12281c] text-white dark:bg-[#dca038] dark:text-[#0d1a14] dark:hover:bg-[#c58d2e] text-xs font-semibold shadow-xs transition-all cursor-pointer gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark as Completed</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
