import * as React from "react"
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  BarChart3,
  Calendar,
  UploadCloud,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

// --- Mock Data Matching Reference Image ---

const REVENUE_DATA = [
  { month: "Apr", revenue: 2400 },
  { month: "May", revenue: 4200 },
  { month: "Jun", revenue: 3700 },
  { month: "Jul", revenue: 5800 },
  { month: "Aug", revenue: 5200 },
  { month: "Sep", revenue: 8500 },
]

const ORDERS_DATA = [
  { month: "Apr", completed: 105, pending: 45 },
  { month: "May", completed: 125, pending: 55 },
  { month: "Jun", completed: 130, pending: 60 },
  { month: "Jul", completed: 145, pending: 65 },
  { month: "Aug", completed: 160, pending: 70 },
  { month: "Sep", completed: 180, pending: 75 },
]

const ORDER_STATUS_DATA = [
  { name: "Completed", value: 48, count: 2400, color: "#10b981" },
  { name: "Pending", value: 20, count: 1000, color: "#f97316" },
  { name: "In Progress", value: 18, count: 900, color: "#3b82f6" },
  { name: "Cancelled", value: 8, count: 400, color: "#ec4899" },
  { name: "Refunded", value: 6, count: 300, color: "#8b5cf6" },
]

const CUSTOMER_GROWTH_DATA = [
  { month: "Apr", customers: 450 },
  { month: "May", customers: 780 },
  { month: "Jun", customers: 1100 },
  { month: "Jul", customers: 1450 },
  { month: "Aug", customers: 1750 },
  { month: "Sep", customers: 2100 },
]

interface TopProductItem {
  id: number
  name: string
  image: string
  unitsSold: number
  maxUnits: number
  revenue: number
}

const TOP_PRODUCTS: TopProductItem[] = [
  {
    id: 1,
    name: "Wild Berry Spritz",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&auto=format&fit=crop&q=80",
    unitsSold: 450,
    maxUnits: 500,
    revenue: 13500,
  },
  {
    id: 2,
    name: "Citrus Blossom Tonic",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=100&auto=format&fit=crop&q=80",
    unitsSold: 380,
    maxUnits: 500,
    revenue: 11400,
  },
  {
    id: 3,
    name: "Pine Forest Tonic",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=100&auto=format&fit=crop&q=80",
    unitsSold: 290,
    maxUnits: 500,
    revenue: 8700,
  },
  {
    id: 4,
    name: "Coconut Dream Botanical",
    image: "https://images.unsplash.com/photo-1587888637140-849b25d80ef9?w=100&auto=format&fit=crop&q=80",
    unitsSold: 240,
    maxUnits: 500,
    revenue: 7200,
  },
  {
    id: 5,
    name: "Lavender Calm Elixir",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=100&auto=format&fit=crop&q=80",
    unitsSold: 180,
    maxUnits: 500,
    revenue: 5400,
  },
]

interface TopCustomerItem {
  id: number
  name: string
  initial: string
  avatarBg: string
  orders: number
  totalSpent: number
}

const TOP_CUSTOMERS: TopCustomerItem[] = [
  {
    id: 1,
    name: "Novshad Khan",
    initial: "N",
    avatarBg: "bg-rose-100 text-rose-700",
    orders: 34,
    totalSpent: 3450,
  },
  {
    id: 2,
    name: "Khalid Rehman",
    initial: "K",
    avatarBg: "bg-blue-100 text-blue-700",
    orders: 29,
    totalSpent: 2450,
  },
  {
    id: 3,
    name: "David Wilson",
    initial: "D",
    avatarBg: "bg-emerald-100 text-emerald-700",
    orders: 23,
    totalSpent: 2100,
  },
  {
    id: 4,
    name: "Sarah Johnson",
    initial: "S",
    avatarBg: "bg-amber-100 text-amber-700",
    orders: 20,
    totalSpent: 1950.8,
  },
  {
    id: 5,
    name: "Michael Brown",
    initial: "M",
    avatarBg: "bg-purple-100 text-purple-700",
    orders: 18,
    totalSpent: 1850,
  },
]

export function AnalyticsPage() {
  const [globalTimeframe, setGlobalTimeframe] = React.useState("last-30")
  const [revenueRange, setRevenueRange] = React.useState("last-6-months")
  const [ordersRange, setOrdersRange] = React.useState("last-6-months")
  const [statusRange, setStatusRange] = React.useState("last-30")
  const [growthRange, setGrowthRange] = React.useState("last-6-months")
  const [productsRange, setProductsRange] = React.useState("last-30")
  const [customersRange, setCustomersRange] = React.useState("last-30")

  const handleExportReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Metric,Value,Trend",
        "Total Revenue,$68760.00,+12.5%",
        "Total Orders,5000,+8.2%",
        "Total Customers,4000,+6.1%",
        "Average Order Value,$137.52,+4.3%",
        "",
        "Top Product,Units Sold,Revenue",
        ...TOP_PRODUCTS.map((p) => `"${p.name}",${p.unitsSold},${p.revenue}`),
        "",
        "Top Customer,Orders,Total Spent",
        ...TOP_CUSTOMERS.map((c) => `"${c.name}",${c.orders},${c.totalSpent}`),
      ].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Tellervo_Analytics_Report_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Analytics performance report exported successfully")
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      <div className="p-5 md:p-7 lg:p-8 space-y-6 min-w-0 transition-all">
        {/* HEADER SECTION (Matching Product & Customer Pages) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-sans">
              Analytics
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Overview of your business performance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            {/* Global Timeframe Pill */}
            <Select value={globalTimeframe} onValueChange={setGlobalTimeframe}>
              <SelectTrigger className="h-10 text-xs font-medium bg-card border border-border rounded-full text-foreground px-4 shadow-2xs min-w-[145px]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Last 30 days" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last-7">Last 7 days</SelectItem>
                <SelectItem value="last-30">Last 30 days</SelectItem>
                <SelectItem value="last-90">Last 90 days</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Report Pill Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              className="h-10 px-4 text-xs font-medium rounded-full border border-border bg-card hover:bg-muted text-foreground gap-2 shadow-2xs transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-muted-foreground" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {/* TOP 4 KPI METRIC CARDS (Matching Product & Customer Pages Exactly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Total Revenue */}
          <div className="bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                $68,760
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.5%</span>
                <span className="text-[11px] font-normal text-muted-foreground ml-0.5">vs Last Month</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Orders
              </span>
              <div className="w-8 h-8 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                5,000
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8.2%</span>
                <span className="text-[11px] font-normal text-muted-foreground ml-0.5">vs Last Month</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Customers */}
          <div className="bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Customers
              </span>
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                4,000
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+6.1%</span>
                <span className="text-[11px] font-normal text-muted-foreground ml-0.5">vs Last Month</span>
              </div>
            </div>
          </div>

          {/* Card 4: Average Order Value */}
          <div className="bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Average Order Value
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                $137.52
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4.3%</span>
                <span className="text-[11px] font-normal text-muted-foreground ml-0.5">vs Last Month</span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: 3 CHARTS (Revenue Overview, Orders Overview, Order Status) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: Revenue Overview */}
          <div className="bg-card rounded-2xl p-5 shadow-xs border-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground">
                Revenue Overview
              </h2>
              <Select value={revenueRange} onValueChange={setRevenueRange}>
                <SelectTrigger className="h-8 text-[11px] font-medium bg-card border border-border rounded-full text-foreground px-3 shadow-2xs w-[125px]">
                  <SelectValue placeholder="Last 6 months" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="last-6-months">Last 6 months</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888888", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888888", fontSize: 11 }}
                    tickFormatter={(val) => `$${val / 1000}K`}
                    domain={[0, 10000]}
                    ticks={[0, 2000, 4000, 6000, 8000, 10000]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                    dot={{ fill: "#10b981", r: 3.5, strokeWidth: 1, stroke: "#ffffff" }}
                    activeDot={{ r: 5, fill: "#10b981" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Orders Overview */}
          <div className="bg-card rounded-2xl p-5 shadow-xs border-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground">
                Orders Overview
              </h2>
              <div className="flex items-center gap-3">
                <Select value={ordersRange} onValueChange={setOrdersRange}>
                  <SelectTrigger className="h-8 text-[11px] font-medium bg-card border border-border rounded-full text-foreground px-3 shadow-2xs w-[125px]">
                    <SelectValue placeholder="Last 6 months" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="last-6-months">Last 6 months</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-[11px]">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                <span className="text-[11px]">Pending</span>
              </div>
            </div>

            <div className="w-full h-52 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ORDERS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888888", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888888", fontSize: 11 }}
                    domain={[0, 200]}
                    ticks={[0, 50, 100, 150, 200]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="pending" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Order Status Donut Chart */}
          <div className="bg-card rounded-2xl p-5 shadow-xs border-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground">
                Order Status
              </h2>
              <Select value={statusRange} onValueChange={setStatusRange}>
                <SelectTrigger className="h-8 text-[11px] font-medium bg-card border border-border rounded-full text-foreground px-3 shadow-2xs w-[120px]">
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="last-30">Last 30 days</SelectItem>
                  <SelectItem value="last-90">Last 90 days</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4 h-56">
              {/* Donut Chart with Centered Total */}
              <div className="relative w-1/2 h-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        fontSize: "12px",
                      }}
                      formatter={(val, name) => [`${val}%`, name]}
                    />
                    <Pie
                      data={ORDER_STATUS_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {ORDER_STATUS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-bold text-foreground font-sans leading-none">
                    5,000
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                    Total Orders
                  </span>
                </div>
              </div>

              {/* Status List with Percentages */}
              <div className="w-1/2 space-y-2 text-xs">
                {ORDER_STATUS_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground text-xs">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground text-xs">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 3 WIDGETS (Customer Growth, Top Products, Top Customers) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Widget 1: Customer Growth */}
          <div className="bg-card rounded-2xl p-5 shadow-xs border-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground">
                Customer Growth
              </h2>
              <Select value={growthRange} onValueChange={setGrowthRange}>
                <SelectTrigger className="h-8 text-[11px] font-medium bg-card border border-border rounded-full text-foreground px-3 shadow-2xs w-[125px]">
                  <SelectValue placeholder="Last 6 months" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="last-6-months">Last 6 months</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CUSTOMER_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888888", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888888", fontSize: 11 }}
                    domain={[0, 2000]}
                    ticks={[0, 500, 1000, 1500, 2000]}
                    tickFormatter={(val) => (val === 0 ? "0" : val >= 1000 ? `${val / 1000}K` : `${val}`)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [Number(val).toLocaleString(), "Customers"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#growthGradient)"
                    dot={{ fill: "#3b82f6", r: 3.5, strokeWidth: 1, stroke: "#ffffff" }}
                    activeDot={{ r: 5, fill: "#3b82f6" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Widget 2: Top Products */}
          <div className="bg-card rounded-2xl p-5 shadow-xs border-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">
                Top Products
              </h2>
              <Select value={productsRange} onValueChange={setProductsRange}>
                <SelectTrigger className="h-8 text-[11px] font-medium bg-card border border-border rounded-full text-foreground px-3 shadow-2xs w-[120px]">
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="last-30">Last 30 days</SelectItem>
                  <SelectItem value="last-90">Last 90 days</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Top Products Table */}
            <div className="space-y-3 overflow-x-auto">
              <div className="grid grid-cols-12 text-[11px] font-medium text-muted-foreground pb-1 border-b border-border/40">
                <span className="col-span-1">#</span>
                <span className="col-span-5">Product</span>
                <span className="col-span-3 text-right">Units Sold</span>
                <span className="col-span-3 text-right">Revenue</span>
              </div>

              {TOP_PRODUCTS.map((prod) => (
                <div key={prod.id} className="grid grid-cols-12 items-center text-xs py-1">
                  <span className="col-span-1 text-muted-foreground text-xs font-medium">
                    {prod.id}
                  </span>
                  <div className="col-span-5 flex items-center gap-2 min-w-0 pr-1">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-7 h-7 rounded-lg object-cover shrink-0"
                    />
                    <span className="font-semibold text-foreground truncate text-xs">
                      {prod.name}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-1.5">
                    <span className="font-medium text-xs text-foreground shrink-0">{prod.unitsSold}</span>
                    <Progress value={(prod.unitsSold / prod.maxUnits) * 100} className="w-12 h-1.5 bg-muted" />
                  </div>
                  <span className="col-span-3 text-right font-semibold text-foreground text-xs">
                    ${prod.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Top Customers */}
          <div className="bg-card rounded-2xl p-5 shadow-xs border-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">
                Top Customers
              </h2>
              <Select value={customersRange} onValueChange={setCustomersRange}>
                <SelectTrigger className="h-8 text-[11px] font-medium bg-card border border-border rounded-full text-foreground px-3 shadow-2xs w-[120px]">
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="last-30">Last 30 days</SelectItem>
                  <SelectItem value="last-90">Last 90 days</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Top Customers Table */}
            <div className="space-y-3 overflow-x-auto">
              <div className="grid grid-cols-12 text-[11px] font-medium text-muted-foreground pb-1 border-b border-border/40">
                <span className="col-span-1">#</span>
                <span className="col-span-6">Customer</span>
                <span className="col-span-2 text-right">Orders</span>
                <span className="col-span-3 text-right">Total Spent</span>
              </div>

              {TOP_CUSTOMERS.map((cust) => (
                <div key={cust.id} className="grid grid-cols-12 items-center text-xs py-1">
                  <span className="col-span-1 text-muted-foreground text-xs font-medium">
                    {cust.id}
                  </span>
                  <div className="col-span-6 flex items-center gap-2 min-w-0 pr-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${cust.avatarBg}`}
                    >
                      {cust.initial}
                    </div>
                    <span className="font-semibold text-foreground truncate text-xs">
                      {cust.name}
                    </span>
                  </div>
                  <span className="col-span-2 text-right font-medium text-xs text-foreground">
                    {cust.orders}
                  </span>
                  <span className="col-span-3 text-right font-semibold text-foreground text-xs">
                    ${cust.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
