import * as React from "react"
import {
  Search,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  X,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Clock,
  TrendingUp,
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
import { toast } from "sonner"
import { profileService } from "@tellervo/supabase"

export interface CustomerRecord {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  joinedDate: string
  status: "Active" | "Inactive"
  city?: string
  avatarColor?: string
}

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust-1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1(555) 123-4567",
    totalOrders: 12,
    totalSpent: 459.95,
    joinedDate: "12 Sept 2025",
    status: "Active",
    city: "New York, USA",
  },
  {
    id: "cust-2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1(555) 234-5678",
    totalOrders: 23,
    totalSpent: 1245.8,
    joinedDate: "12 Sept 2025",
    status: "Active",
    city: "San Francisco, USA",
  },
  {
    id: "cust-3",
    name: "Michael Brown",
    email: "mbrown@example.com",
    phone: "+1(555) 123-4567",
    totalOrders: 34,
    totalSpent: 459.95,
    joinedDate: "12 Sept 2025",
    status: "Active",
    city: "Chicago, USA",
  },
  {
    id: "cust-4",
    name: "Emily Davis",
    email: "emily.d@example.com",
    phone: "+1(555) 456-7870",
    totalOrders: 12,
    totalSpent: 2150.4,
    joinedDate: "11 Sept 2025",
    status: "Inactive",
    city: "Seattle, USA",
  },
  {
    id: "cust-5",
    name: "David Wilson",
    email: "dwilson@example.com",
    phone: "+1(555) 456-7890",
    totalOrders: 34,
    totalSpent: 3000.95,
    joinedDate: "09 Sept 2025",
    status: "Active",
    city: "Boston, USA",
  },
  {
    id: "cust-6",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    phone: "+358 50 111-2233",
    totalOrders: 15,
    totalSpent: 980.5,
    joinedDate: "09 Sept 2025",
    status: "Active",
    city: "Helsinki, Finland",
  },
  {
    id: "cust-7",
    name: "Novshad Khan",
    email: "novshad.khan@example.com",
    phone: "+358 40 123-4567",
    totalOrders: 8,
    totalSpent: 650.0,
    joinedDate: "08 Sept 2025",
    status: "Inactive",
    city: "Espoo, Finland",
  },
  {
    id: "cust-8",
    name: "Khalid Rehman",
    email: "khalid.rehman@example.com",
    phone: "+358 50 987-6543",
    totalOrders: 29,
    totalSpent: 2450.0,
    joinedDate: "08 Sept 2025",
    status: "Active",
    city: "Tampere, Finland",
  },
  {
    id: "cust-9",
    name: "Sophia Lindqvist",
    email: "sophia.l@example.com",
    phone: "+358 40 555-6677",
    totalOrders: 18,
    totalSpent: 1420.0,
    joinedDate: "07 Sept 2025",
    status: "Active",
    city: "Turku, Finland",
  },
  {
    id: "cust-10",
    name: "Marcus Vance",
    email: "marcus.vance@example.com",
    phone: "+358 50 444-3322",
    totalOrders: 5,
    totalSpent: 340.0,
    joinedDate: "07 Sept 2025",
    status: "Inactive",
    city: "Oulu, Finland",
  },
]

export function CustomerManagement() {
  const [customers, setCustomers] = React.useState<CustomerRecord[]>(INITIAL_CUSTOMERS)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [dateFilter, setDateFilter] = React.useState<string>("all")
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerRecord | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 10

  // Query live patron profiles from Supabase and merge seamlessly with customer records
  React.useEffect(() => {
    let isMounted = true
    async function loadLiveCustomers() {
      try {
        const liveProfiles = await profileService.fetchAllProfiles()
        if (!isMounted || !liveProfiles || liveProfiles.length === 0) return

        const mappedLive: CustomerRecord[] = liveProfiles.map((p) => {
          const dateStr = p.created_at
            ? new Date(p.created_at).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Recent"

          return {
            id: p.id,
            name: p.full_name || p.email?.split("@")[0] || "Patron",
            email: p.email || "—",
            phone: p.phone || "—",
            totalOrders: 0,
            totalSpent: 0,
            joinedDate: dateStr,
            status: "Active",
            city: p.address || "Helsinki, Finland",
          }
        })

        setCustomers((prev) => {
          const liveIds = new Set(mappedLive.map((m) => m.id))
          const liveEmails = new Set(
            mappedLive
              .map((m) => m.email.toLowerCase())
              .filter((e) => e && e !== "—")
          )
          const filteredPrev = prev.filter(
            (c) => !liveIds.has(c.id) && !liveEmails.has(c.email.toLowerCase())
          )
          return [...mappedLive, ...filteredPrev]
        })
      } catch (err) {
        console.warn("Failed to query live Supabase profiles:", err)
      }
    }

    loadLiveCustomers()
    return () => {
      isMounted = false
    }
  }, [])

  // Metrics from reference image
  const totalCustomersMetric = 5000
  const activeCustomersMetric = 4000
  const inactiveCustomersMetric = 1000
  const totalRevenueMetric = "$68,760"

  // Filtered List
  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)

      const matchesStatus =
        statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase()

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "12" && c.joinedDate.includes("12 Sept")) ||
        (dateFilter === "11" && c.joinedDate.includes("11 Sept")) ||
        (dateFilter === "09" && c.joinedDate.includes("09 Sept")) ||
        (dateFilter === "08" && c.joinedDate.includes("08 Sept")) ||
        (dateFilter === "07" && c.joinedDate.includes("07 Sept"))

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [customers, searchTerm, statusFilter, dateFilter])

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedCustomers = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredCustomers.slice(start, start + pageSize)
  }, [filteredCustomers, safeCurrentPage, pageSize])

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === "Active" ? "Inactive" : "Active"
          toast.success(`${c.name} is now ${newStatus}`)
          return { ...c, status: newStatus }
        }
        return c
      })
    )
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "Active" ? "Inactive" : "Active",
            }
          : null
      )
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Customer Name", "Email", "Phone", "Total Orders", "Total Spent", "Joined Date", "Status"]
    const rows = filteredCustomers.map((c) => [
      `"${c.name}"`,
      c.email,
      `"${c.phone}"`,
      c.totalOrders,
      c.totalSpent.toFixed(2),
      c.joinedDate,
      c.status,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Tellervo_Customers_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredCustomers.length} customer records to CSV`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      <div className="p-5 md:p-7 lg:p-8 space-y-6 min-w-0 transition-all">
        {/* HEADER SECTION (Matching Product Page & Image) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-sans">
              Customers
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Manage customer accounts and information
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

        {/* TOP 4 KPI CARDS (Matching Image Exactly: Total, Active, Inactive, Total Revenue) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Total Customers */}
          <div
            onClick={() => {
              setStatusFilter("all")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Customers
              </span>
              <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                {totalCustomersMetric.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Card 2: Active Customers */}
          <div
            onClick={() => {
              setStatusFilter("Active")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Active Customers
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                {activeCustomersMetric.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Card 3: Inactive Customers */}
          <div
            onClick={() => {
              setStatusFilter("Inactive")
              setCurrentPage(1)
            }}
            className="cursor-pointer bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Inactive Customers
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                {inactiveCustomersMetric.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Card 4: Total Revenue */}
          <div
            className="bg-card rounded-2xl border-0 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold font-sans tracking-tight text-foreground">
                {totalRevenueMetric}
              </div>
            </div>
          </div>
        </div>

        {/* UNIFIED CONTAINER: CONTROLS & TABLE (Single Borderless Card matching Product Page) */}
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
                  placeholder="Search customers, email, phone..."
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
                    <SelectItem value="12">12 Sept 2025</SelectItem>
                    <SelectItem value="11">11 Sept 2025</SelectItem>
                    <SelectItem value="09">09 Sept 2025</SelectItem>
                    <SelectItem value="08">08 Sept 2025</SelectItem>
                    <SelectItem value="07">07 Sept 2025</SelectItem>
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* CUSTOMERS TABLE */}
          <div className="relative w-full overflow-x-auto">
            <Table className="w-full text-left border-collapse text-xs">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
                  <TableHead className="py-4 px-5 font-medium text-xs text-muted-foreground">
                    Customer Name
                  </TableHead>
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Email
                  </TableHead>
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Phone
                  </TableHead>
                  <TableHead className="py-4 px-4 font-medium text-xs text-muted-foreground">
                    Joined Date
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
                {paginatedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-44 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Users className="w-8 h-8 opacity-40" />
                        <p className="text-sm font-medium">No customers found</p>
                        <p className="text-xs">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((cust) => (
                    <TableRow
                      key={cust.id}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer group"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      {/* Customer Name */}
                      <TableCell className="py-3.5 px-5 font-medium text-xs text-foreground">
                        {cust.name}
                      </TableCell>

                      {/* Email */}
                      <TableCell className="py-3.5 px-4 text-xs text-muted-foreground">
                        {cust.email}
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="py-3.5 px-4 text-xs text-muted-foreground">
                        {cust.phone}
                      </TableCell>


                      {/* Joined Date */}
                      <TableCell className="py-3.5 px-4 text-xs text-muted-foreground">
                        {cust.joinedDate}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs ${
                            cust.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {cust.status}
                        </span>
                      </TableCell>

                      {/* Action Menu (•••) */}
                      <TableCell className="py-3.5 px-5 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-0 bg-transparent shadow-none"
                              title="Customer actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Actions</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuLabel className="text-xs">Customer Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem onClick={() => setSelectedCustomer(cust)}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                toast.info(`Viewing orders for ${cust.name}`)
                              }}
                            >
                              View Orders ({cust.totalOrders})
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                handleToggleStatus(cust.id)
                              }}
                            >
                              Mark as {cust.status === "Active" ? "Inactive" : "Active"}
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

          {/* TABLE FOOTER / PAGINATION (Matching Image 1: Result 1-10 of 45) */}
          <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Result{" "}
              <span className="font-semibold text-foreground">
                {filteredCustomers.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
              </span>
              -
              <span className="font-semibold text-foreground">
                {Math.min(safeCurrentPage * pageSize, filteredCustomers.length)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{filteredCustomers.length}</span>{" "}
              customers
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

      {/* CUSTOMER PROFILE DETAILS MODAL */}
      <Dialog open={Boolean(selectedCustomer)} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border p-6 shadow-xl">
          {selectedCustomer && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-xs border-border font-semibold ${
                      selectedCustomer.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedCustomer.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Member since {selectedCustomer.joinedDate}
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                    {selectedCustomer.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-foreground">
                      {selectedCustomer.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Customer ID: #{selectedCustomer.id}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Customer Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block font-medium">Total Orders</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span className="text-base font-bold text-foreground">{selectedCustomer.totalOrders}</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block font-medium">Lifetime Spend</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-base font-bold text-foreground">${selectedCustomer.totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-foreground font-medium">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-foreground font-medium">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-foreground font-medium">{selectedCustomer.city || "Helsinki, Finland"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Joined on {selectedCustomer.joinedDate}</span>
                </div>
              </div>

              <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-full border-border text-xs px-4"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleToggleStatus(selectedCustomer.id)}
                  className="rounded-full bg-primary text-primary-foreground text-xs px-4"
                >
                  {selectedCustomer.status === "Active" ? "Set Inactive" : "Set Active"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
