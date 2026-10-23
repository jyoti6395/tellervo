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
  Mail,
  Phone,
  CreditCard,
  Check,
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

export type OrderStatus = "Pending" | "In Progress" | "Completed" | "Cancelled" | "Refunded"

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
  amount: number
  status: OrderStatus
  paymentMethod: string
}

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: "ord-1",
    orderCode: "#11852",
    customer: {
      name: "Novshad Khan",
      email: "novshad.khan@example.com",
      phone: "+358 40 123 4567",
      address: "Mannerheimintie 12 B 4, 00100 Helsinki, Finland",
    },
    primaryProduct: {
      name: "Wild Berry Spritz",
      image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&auto=format&fit=crop&q=80",
      additionalCount: 2,
    },
    items: [
      {
        name: "Wild Berry Spritz",
        quantity: 2,
        price: 15.5,
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&auto=format&fit=crop&q=80",
      },
      {
        name: "Berry Bloom Spritz",
        quantity: 2,
        price: 15.5,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&auto=format&fit=crop&q=80",
      },
      {
        name: "Forest Berry Elixir",
        quantity: 1,
        price: 16.2,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=120&auto=format&fit=crop&q=80",
      },
    ],
    date: "24 Dec 2025",
    amount: 300.0,
    status: "Pending",
    paymentMethod: "Credit Card (Stripe)",
  },
  {
    id: "ord-2",
    orderCode: "#11851",
    customer: {
      name: "Khalid Rehman",
      email: "khalid.rehman@example.com",
      phone: "+358 50 987 6543",
      address: "Aleksanterinkatu 15, 00170 Helsinki, Finland",
    },
    primaryProduct: {
      name: "Citrus Blossom Tonic",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80",
      additionalCount: 3,
    },
    items: [
      {
        name: "Citrus Blossom Tonic",
        quantity: 4,
        price: 13.9,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80",
      },
      {
        name: "Pine Forest Tonic",
        quantity: 6,
        price: 14.5,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&auto=format&fit=crop&q=80",
      },
    ],
    date: "24 Dec 2025",
    amount: 500.0,
    status: "Pending",
    paymentMethod: "Apple Pay",
  },
  {
    id: "ord-3",
    orderCode: "#11850",
    customer: {
      name: "Ashraf Ali",
      email: "ashraf.ali@example.com",
      phone: "+358 45 321 7890",
      address: "Bulevardi 8, 00120 Helsinki, Finland",
    },
    primaryProduct: {
      name: "Pine Forest Tonic",
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&auto=format&fit=crop&q=80",
      additionalCount: 1,
    },
    items: [
      {
        name: "Pine Forest Tonic",
        quantity: 4,
        price: 14.5,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&auto=format&fit=crop&q=80",
      },
      {
        name: "Golden Glow Tonic",
        quantity: 2,
        price: 14.0,
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&auto=format&fit=crop&q=80",
      },
    ],
    date: "24 Dec 2025",
    amount: 400.0,
    status: "In Progress",
    paymentMethod: "PayPal",
  },
  {
    id: "ord-4",
    orderCode: "#11849",
    customer: {
      name: "Ratul Rezwan",
      email: "ratul.rezwan@example.com",
      phone: "+358 40 765 4321",
      address: "Hämeenkatu 22, 33200 Tampere, Finland",
    },
    primaryProduct: {
      name: "Coconut Dream Botanical",
      image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=120&auto=format&fit=crop&q=80",
      additionalCount: 2,
    },
    items: [
      {
        name: "Coconut Dream Botanical",
        quantity: 3,
        price: 11.9,
        image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=120&auto=format&fit=crop&q=80",
      },
      {
        name: "Elderberry Nightcap",
        quantity: 2,
        price: 16.5,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=120&auto=format&fit=crop&q=80",
      },
    ],
    date: "24 Dec 2025",
    amount: 290.0,
    status: "In Progress",
    paymentMethod: "Klarna Invoice",
  },
  {
    id: "ord-5",
    orderCode: "#11848",
    customer: {
      name: "Elena Rostova",
      email: "elena.rostova@example.com",
      phone: "+358 50 111 2233",
      address: "Kauppakatu 5, 20100 Turku, Finland",
    },
    primaryProduct: {
      name: "Golden Glow Tonic",
      image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&auto=format&fit=crop&q=80",
      additionalCount: 1,
    },
    items: [
      {
        name: "Golden Glow Tonic",
        quantity: 3,
        price: 14.0,
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&auto=format&fit=crop&q=80",
      },
    ],
    date: "23 Dec 2025",
    amount: 142.5,
    status: "Completed",
    paymentMethod: "Credit Card (Stripe)",
  },
  {
    id: "ord-6",
    orderCode: "#11847",
    customer: {
      name: "Sophia Lindqvist",
      email: "sophia.l@example.com",
      phone: "+358 40 555 6677",
      address: "Torikatu 14, 90100 Oulu, Finland",
    },
    primaryProduct: {
      name: "Forest Berry Elixir",
      image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=120&auto=format&fit=crop&q=80",
      additionalCount: 0,
    },
    items: [
      {
        name: "Forest Berry Elixir",
        quantity: 4,
        price: 16.2,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=120&auto=format&fit=crop&q=80",
      },
    ],
    date: "23 Dec 2025",
    amount: 64.8,
    status: "Completed",
    paymentMethod: "Credit Card (Stripe)",
  },
  {
    id: "ord-7",
    orderCode: "#11846",
    customer: {
      name: "Marcus Vance",
      email: "marcus.vance@example.com",
      phone: "+358 50 444 3322",
      address: "Kirkkokatu 3, 70100 Kuopio, Finland",
    },
    primaryProduct: {
      name: "Elderberry Nightcap",
      image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=120&auto=format&fit=crop&q=80",
      additionalCount: 2,
    },
    items: [
      {
        name: "Elderberry Nightcap",
        quantity: 2,
        price: 16.5,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=120&auto=format&fit=crop&q=80",
      },
    ],
    date: "22 Dec 2025",
    amount: 198.0,
    status: "Completed",
    paymentMethod: "Apple Pay",
  },
  {
    id: "ord-8",
    orderCode: "#11845",
    customer: {
      name: "Liam O'Connor",
      email: "liam.oc@example.com",
      phone: "+358 45 888 9900",
      address: "Satamakatu 19, 65100 Vaasa, Finland",
    },
    primaryProduct: {
      name: "Spruce Tip Soda",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80",
      additionalCount: 0,
    },
    items: [
      {
        name: "Spruce Tip Soda",
        quantity: 1,
        price: 12.0,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80",
      },
    ],
    date: "21 Dec 2025",
    amount: 12.0,
    status: "Cancelled",
    paymentMethod: "Credit Card (Refunded)",
  },
]

export function OrderManagement() {
  const [orders, setOrders] = React.useState<OrderRecord[]>(INITIAL_ORDERS)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [dateFilter, setDateFilter] = React.useState<string>("all")
  const [chartTimeRange, setChartTimeRange] = React.useState<string>("7d")
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRecord | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 5

  // KPI Calculations
  const totalOrdersCount = 5000
  const pendingOrdersCount = 400
  const inProgressOrdersCount = 500
  const completedOrdersCount = 4000

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

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "24" && ord.date.includes("24 Dec")) ||
        (dateFilter === "23" && ord.date.includes("23 Dec")) ||
        (dateFilter === "22" && ord.date.includes("22 Dec"))

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
  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    )
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    toast.success(`Order status updated to ${newStatus}`)
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
              className={`cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all ${
                statusFilter === "all" ? "ring-2 ring-primary/40 bg-muted/15" : ""
              }`}
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
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> +0.1%
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
              className={`cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all ${
                statusFilter === "Pending" ? "ring-2 ring-amber-600/40 bg-amber-50/20" : ""
              }`}
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
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> +2.4%
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
              className={`cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all ${
                statusFilter === "In Progress" ? "ring-2 ring-sky-600/40 bg-sky-50/20" : ""
              }`}
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
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> +2.4%
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
              className={`cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all ${
                statusFilter === "Completed" ? "ring-2 ring-emerald-600/40 bg-emerald-50/20" : ""
              }`}
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
                  <span className="inline-flex items-center gap-0.5 text-rose-500 font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" /> -0.6%
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
              {/* Clean SVG Donut Chart with percentages inside */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Segment 1: Completed 48% (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="32"
                    strokeDasharray="102.5 213.6"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Pending 32% (Orange) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="32"
                    strokeDasharray="68.4 213.6"
                    strokeDashoffset="-102.5"
                  />
                  {/* Segment 3: In Progress 20% (Sky Blue) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="32"
                    strokeDasharray="42.7 213.6"
                    strokeDashoffset="-170.9"
                  />
                </svg>

                {/* Percentage Labels placed over segments */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* 48% Label */}
                  <span className="absolute right-7 top-18 text-xs font-bold text-white drop-shadow-xs">
                    48%
                  </span>
                  {/* 32% Label */}
                  <span className="absolute left-8 top-12 text-xs font-bold text-white drop-shadow-xs">
                    32%
                  </span>
                  {/* 20% Label */}
                  <span className="absolute left-13 bottom-9 text-xs font-bold text-white drop-shadow-xs">
                    20%
                  </span>
                </div>
              </div>

              {/* Status Legend List (Exact matching Image 1) */}
              <div className="space-y-2 text-xs font-medium min-w-[120px]">
                <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6] shrink-0" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#f97316] shrink-0" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] shrink-0" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
                  <span>Cancelled</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 shrink-0" />
                  <span>Refunded</span>
                </div>
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
                      <SelectValue placeholder="12 Sept - 20 Sept" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="24">24 Dec 2025</SelectItem>
                    <SelectItem value="23">23 Dec 2025</SelectItem>
                    <SelectItem value="22">22 Dec 2025</SelectItem>
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
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                {paginatedOrders.length === 0 ? (
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
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ord.id, "Completed")}>
                              Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ord.id, "Cancelled")}>
                              Cancelled
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
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedOrder.customer.email}</span>
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
