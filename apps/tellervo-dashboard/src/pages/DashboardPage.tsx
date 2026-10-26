import * as React from "react"
import {
  TrendingUp,
  Coins,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Order {
  id: string
  customer: string
  total: number
  status: "Delivered" | "Processing" | "Shipped" | "Pending"
  date: string
}

interface TopProduct {
  name: string
  sold: number
  image: string
}

interface LowStockItem {
  name: string
  stock: number
  image: string
}



const TOP_PRODUCTS: TopProduct[] = [
  {
    name: "Wild Berry Spritz",
    sold: 182,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Lemon Grass Cooler",
    sold: 156,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Forest Berry Elixir",
    sold: 120,
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Pine Forest Tonic",
    sold: 96,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Coconut Dream",
    sold: 87,
    image: "https://images.unsplash.com/photo-1587888637140-849b25d80ef9?w=120&auto=format&fit=crop&q=80",
  },
]

const RECENT_ORDERS: Order[] = [
  {
    id: "#T-10248",
    customer: "Sarah Johnson",
    total: 32.5,
    status: "Delivered",
    date: "Apr 26, 2025",
  },
  {
    id: "#T-10247",
    customer: "Michael Brown",
    total: 48.2,
    status: "Processing",
    date: "Apr 26, 2025",
  },
  {
    id: "#T-10246",
    customer: "Emily Davis",
    total: 21.1,
    status: "Shipped",
    date: "Apr 25, 2025",
  },
  {
    id: "#T-10245",
    customer: "David Wilson",
    total: 67.8,
    status: "Delivered",
    date: "Apr 25, 2025",
  },
  {
    id: "#T-10244",
    customer: "Jessica Lee",
    total: 39.4,
    status: "Pending",
    date: "Apr 24, 2025",
  },
]

const LOW_STOCK_ITEMS: LowStockItem[] = [
  {
    name: "Citrus Blossom Tonic",
    stock: 1,
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Coconut Dream",
    stock: 6,
    image: "https://images.unsplash.com/photo-1587888637140-849b25d80ef9?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Berry Bloom Spritz",
    stock: 9,
    image: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Golden Glow Tonic",
    stock: 12,
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Forest Berry Elixir",
    stock: 15,
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=120&auto=format&fit=crop&q=80",
  },
]

export function DashboardPage() {
  const [timeframe, setTimeframe] = React.useState("month")
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    date: string
    sales: number
    x: number
    y: number
  } | null>(null)

  return (
    <div className="p-5 md:p-7 lg:p-8 space-y-6 bg-background min-h-screen text-foreground w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-sans">
            Good morning, Admin
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 font-sans">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Timeframe Filter */}
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[140px] h-9.5 text-xs font-semibold bg-card border-border rounded-xl text-foreground shadow-2xs">
            <SelectValue placeholder="This Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-2xl bg-[#edf5f0] text-[#1e4630] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground font-medium block">Total Revenue</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground">€24,850</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 12%
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">vs. last month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ebf3fd] text-[#1e61b8] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground font-medium block">Total Orders</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground">1,248</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 8%
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">vs. last month</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-2xl bg-[#f5eefc] text-[#7836b8] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground font-medium block">Total Customers</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground">864</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 14%
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">vs. last month</span>
          </div>
        </div>

        {/* Active Products */}
        <div className="cursor-pointer bg-card rounded-2xl border-0 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-2xl bg-[#fef1e2] text-[#bc6719] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground font-medium block">Active Products</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-sans tracking-tight text-foreground">48</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 3%
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5">vs. last month</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Sales Overview Chart (Left) + Top Selling Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Overview Chart */}
        <div className="lg:col-span-8 bg-card rounded-2xl p-5 md:p-6 border-0 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Sales Overview
              </h2>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-2xl font-bold font-sans tracking-tight text-foreground">€24,850</span>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 12% vs. last month
                </span>
              </div>
            </div>
          </div>

          {/* Responsive SVG Area Chart matching screenshot */}
          <div className="relative w-full h-64 mt-2">
            <svg
              className="w-full h-full"
              viewBox="0 0 600 215"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#256b43" stopOpacity={0.28} />
                  <stop offset="90%" stopColor="#256b43" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              {/* Y-Axis dashed gridlines and labels */}
              {[
                { label: "20k", y: 25 },
                { label: "15k", y: 68 },
                { label: "10k", y: 111 },
                { label: "5k", y: 154 },
                { label: "0k", y: 195 },
              ].map((grid) => (
                <g key={grid.label}>
                  <text
                    x="24"
                    y={grid.y + 4}
                    fill="#7e9487"
                    fontSize="11"
                    textAnchor="end"
                    fontFamily="sans-serif"
                  >
                    {grid.label}
                  </text>
                  <line
                    x1="36"
                    y1={grid.y}
                    x2="590"
                    y2={grid.y}
                    stroke="#ede9e1"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* Area Gradient Fill */}
              <path
                d="M 50 150 C 80 135, 90 125, 105 120 C 130 115, 140 140, 160 135 C 185 130, 195 110, 215 105 C 240 100, 250 80, 270 75 C 295 70, 305 100, 325 95 C 350 90, 360 60, 380 55 C 405 50, 415 75, 435 70 C 460 65, 470 35, 490 30 C 515 25, 540 22, 570 18 L 570 195 L 50 195 Z"
                fill="url(#salesAreaGrad)"
              />

              {/* Smooth Area Stroke Line */}
              <path
                d="M 50 150 C 80 135, 90 125, 105 120 C 130 115, 140 140, 160 135 C 185 130, 195 110, 215 105 C 240 100, 250 80, 270 75 C 295 70, 305 100, 325 95 C 350 90, 360 60, 380 55 C 405 50, 415 75, 435 70 C 460 65, 470 35, 490 30 C 515 25, 540 22, 570 18"
                stroke="#256b43"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points */}
              {[
                { date: "Jan 1", sales: 8200, x: 50, y: 150 },
                { date: "Jan 3", sales: 11400, x: 105, y: 120 },
                { date: "Jan 5", sales: 9800, x: 160, y: 135 },
                { date: "Jan 8", sales: 13200, x: 215, y: 105 },
                { date: "Jan 12", sales: 16500, x: 270, y: 75 },
                { date: "Jan 15", sales: 14200, x: 325, y: 95 },
                { date: "Jan 19", sales: 18900, x: 380, y: 55 },
                { date: "Jan 22", sales: 17100, x: 435, y: 70 },
                { date: "Jan 26", sales: 22400, x: 490, y: 30 },
                { date: "Jan 29", sales: 24850, x: 570, y: 18 },
              ].map((pt) => {
                const isHovered = hoveredPoint?.date === pt.date
                return (
                  <g
                    key={pt.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 3.5}
                      fill={isHovered ? "#ffffff" : "#256b43"}
                      stroke="#256b43"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all"
                    />
                  </g>
                )
              })}

              {/* X-Axis Dates */}
              {[
                { date: "Jan 5", x: 160 },
                { date: "Jan 12", x: 270 },
                { date: "Jan 19", x: 380 },
                { date: "Jan 26", x: 490 },
              ].map((tick) => (
                <text
                  key={tick.date}
                  x={tick.x}
                  y="212"
                  fill="#7e9487"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {tick.date}
                </text>
              ))}
            </svg>

            {/* Hover Tooltip Box */}
            {hoveredPoint && (
              <div
                className="absolute z-10 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-[#13251f] text-white px-2.5 py-1.5 rounded-xl shadow-lg border border-[#1e3b2e] text-center"
                style={{
                  left: `${(hoveredPoint.x / 600) * 100}%`,
                  top: `${(hoveredPoint.y / 215) * 100}%`,
                }}
              >
                <div className="text-[10px] text-[#9db4a8] leading-tight font-medium">
                  {hoveredPoint.date}
                </div>
                <div className="text-xs font-bold text-white mt-0.5">
                  €{hoveredPoint.sales.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-4 bg-card rounded-2xl p-5 md:p-6 border-0 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground mb-4">
              Top Selling Products
            </h2>
            <div className="divide-y divide-border">
              {TOP_PRODUCTS.map((prod) => (
                <div key={prod.name} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                    />
                    <span className="text-xs font-semibold text-foreground truncate">
                      {prod.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {prod.sold} sold
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders (Left) + Low Stock Alerts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-card rounded-2xl p-5 md:p-6 border-0 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground">
              Recent Orders
            </h2>
            <button
              type="button"
              onClick={() => toast.info("Opening all orders")}
              className="text-xs font-semibold text-[#1f5938] hover:text-[#143926] flex items-center gap-1 transition-colors"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">
                      {order.id}
                    </td>
                    <td className="py-3 px-3 text-foreground">
                      {order.customer}
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground">
                      €{order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                          order.status === "Delivered"
                            ? "bg-[#e5f7eb] text-[#1b6b37]"
                            : order.status === "Processing"
                            ? "bg-[#fef2e2] text-[#b36319]"
                            : order.status === "Shipped"
                            ? "bg-[#eaf3fd] text-[#1f62b8]"
                            : "bg-[#fff7ea] text-[#b37719]"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-card rounded-2xl p-5 md:p-6 border-0 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground">
              Low Stock Alerts
            </h2>
            <button
              type="button"
              onClick={() => toast.info("Opening inventory & low stock view")}
              className="text-xs font-semibold text-[#1f5938] hover:text-[#143926] transition-colors"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-2.5 px-2">Product</th>
                  <th className="py-2.5 px-2 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {LOW_STOCK_ITEMS.map((item) => (
                  <tr key={item.name} className="hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border"
                        />
                        <span className="font-semibold text-foreground text-xs truncate">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span
                        className={`font-bold ${
                          item.stock <= 3
                            ? "text-rose-600"
                            : item.stock <= 9
                            ? "text-amber-600"
                            : "text-[#1d3527]"
                        }`}
                      >
                        {item.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
