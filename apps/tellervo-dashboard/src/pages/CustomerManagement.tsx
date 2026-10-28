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
  Eye,
  User,
  Loader2,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  TrendingUp,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { profileService, fetchCustomerSignups, type ProfileRecord } from "@tellervo/supabase"
export interface CustomerRecord {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  joinedDate: string
  rawDate?: string
  status: "Active" | "Inactive"
  city?: string
  avatarColor?: string
}

const INITIAL_CUSTOMERS: CustomerRecord[] = []

export function CustomerManagement() {
  const [customers, setCustomers] = React.useState<CustomerRecord[]>(INITIAL_CUSTOMERS)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [dateFilter, setDateFilter] = React.useState<string>("all")
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerRecord | null>(null)
  const [selectedProfile, setSelectedProfile] = React.useState<ProfileRecord | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = React.useState<boolean>(false)

  const handleOpenCustomerDetails = async (cust: CustomerRecord) => {
    setSelectedCustomer(cust)
    setSelectedProfile(null)
    setIsLoadingProfile(true)
    try {
      const profile = await profileService.fetchUserProfile(cust.id)
      if (profile) {
        setSelectedProfile(profile)
      }
    } catch (err) {
      console.warn("Failed to fetch detailed profile:", err)
    } finally {
      setIsLoadingProfile(false)
    }
  }
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 10

  // Query live customer sign-ups from Supabase (excluding admins)
  React.useEffect(() => {
    let isMounted = true
    async function loadLiveCustomers() {
      setIsLoading(true)
      try {
        let liveSignups: any[] = []
        try {
          // Primary source: Supabase RPC fetching direct customer signups excluding admins
          liveSignups = await fetchCustomerSignups()
        } catch (rpcErr) {
          console.warn("fetchCustomerSignups RPC fallback to profileService:", rpcErr)
          // Fallback: Query profiles and strictly filter out any admin role
          const profiles = await profileService.fetchAllProfiles()
          if (profiles) {
            liveSignups = profiles
              .filter((p) => p.role !== "admin")
              .map((p) => ({
                id: p.id,
                name: p.full_name || p.email?.split("@")[0] || "Customer",
                email: p.email || "-",
                phone: p.phone || "-",
                joined_date: p.created_at,
              }))
          }
        }

        if (!isMounted || !liveSignups) return

        const mappedLive: CustomerRecord[] = liveSignups.map((s) => {
          const dateStr = s.joined_date
            ? new Date(s.joined_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recent"

          return {
            id: s.id,
            name: s.name || s.email?.split("@")[0] || "Customer",
            email: s.email || "-",
            phone: s.phone || "-",
            totalOrders: 0,
            totalSpent: 0,
            joinedDate: dateStr,
            rawDate: s.joined_date,
            status: "Active",
            city: "Helsinki, Finland",
          }
        })

        setCustomers(mappedLive)
      } catch (err) {
        console.warn("Failed to query live customer signups:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadLiveCustomers()
    return () => {
      isMounted = false
    }
  }, [])

  // Metrics dynamically calculated from customer sign-ups:
  // - Total Customers: total number of sign-ups excluding admin
  // - Active Customers: total customer count
  // - Inactive Customers: 0
  // - Total Revenue: 
  const totalCustomersMetric = customers.length
  const activeCustomersMetric = customers.filter((c) => c.status === "Active").length
  const inactiveCustomersMetric = customers.filter((c) => c.status === "Inactive").length
  const totalRevenueMetric = ""

  // Filtered List
  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)

      const matchesStatus =
        statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase()

      let matchesDate = true
      if (dateFilter !== "all") {
        if (dateFilter === "today") {
          const today = new Date().toISOString().slice(0, 10)
          matchesDate = c.rawDate ? c.rawDate.slice(0, 10) === today : false
        } else if (dateFilter === "this-week") {
          const now = new Date()
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = c.rawDate ? new Date(c.rawDate) >= weekAgo : false
        } else if (dateFilter === "this-month") {
          const now = new Date()
          const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
          matchesDate = c.rawDate ? new Date(c.rawDate) >= monthAgo : false
        } else if (dateFilter === "last-30") {
          const now = new Date()
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = c.rawDate ? new Date(c.rawDate) >= thirtyDaysAgo : false
        } else {
          matchesDate = c.joinedDate.toLowerCase().includes(dateFilter.toLowerCase())
        }
      }

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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-44 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Users className="w-8 h-8 opacity-40 animate-pulse text-primary" />
                        <p className="text-sm font-medium">Loading customer sign-ups...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedCustomers.length === 0 ? (
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
                      onClick={() => handleOpenCustomerDetails(cust)}
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

                      {/* Action Menu (ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢) */}
                      <TableCell className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
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
                              Customer Options
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleOpenCustomerDetails(cust)}
                              className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-muted text-foreground gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-border" />
                            <DropdownMenuItem
                              onClick={() => {
                                handleToggleStatus(cust.id)
                              }}
                              className="text-xs cursor-pointer rounded-lg px-2 py-1.5 hover:bg-muted text-foreground gap-2"
                            >
                              <UserX className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Mark as {cust.status === "Active" ? "Inactive" : "Active"}</span>
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

      {/* RIGHT SLIDE-OVER DRAWER FOR CUSTOMER DETAILS (Matching Product View Detail Structure) */}
      <Sheet
        open={Boolean(selectedCustomer)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCustomer(null);
            setSelectedProfile(null);
          }
        }}
      >
        <SheetContent
          showCloseButton={false}
          side="right"
          className="w-full data-[side=right]:sm:max-w-lg data-[side=right]:md:max-w-xl data-[side=right]:lg:max-w-[560px] p-0 flex flex-col gap-0 border-l border-border bg-card shadow-2xl z-50 overflow-hidden h-full"
        >
          {selectedCustomer && (
            <>
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-[#183626] dark:text-emerald-400 shrink-0">
                    <User className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-base sm:text-lg font-bold text-foreground font-sans truncate">
                      Customer Details
                    </SheetTitle>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        #{selectedProfile?.id || selectedCustomer.id}
                      </p>
                      {isLoadingProfile && (
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setSelectedProfile(null);
                  }}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              {/* Main Content Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-start">
                {/* 1. Large Circular Profile Picture with Mint Halo Glow */}
                <div className="pt-2 sm:pt-4 flex flex-col items-center">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden bg-muted/40 flex items-center justify-center">
                      {selectedProfile?.avatar_url ? (
                        <img
                          src={selectedProfile.avatar_url}
                          alt={selectedProfile.full_name || selectedCustomer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 flex items-center justify-center text-[#183626] dark:text-emerald-400 font-bold text-4xl sm:text-5xl">
                          {((selectedProfile?.full_name || selectedCustomer.name || "Customer")
                            .split(" ")
                            .map((n) => n[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("") || "C")
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                  {/* 2. Customer Name */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground text-center font-sans tracking-tight mt-6">
                    {selectedProfile?.full_name || selectedCustomer.name}
                  </h3>

                  {/* 3. Status Badge with Dot */}
                  <div className="mt-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-semibold shadow-2xs select-none ${
                        selectedCustomer.status === "Active"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedCustomer.status === "Active" ? "bg-emerald-600" : "bg-neutral-400"
                        }`}
                      />
                      <span>{selectedCustomer.status}</span>
                    </span>
                  </div>
                </div>

                {/* 4. Total Orders & Lifetime Spend (Static KPI Cards) */}
                <div className="grid grid-cols-2 gap-3.5 mt-6">
                  {/* Card 1: Total Orders */}
                  <div className="rounded-2xl border border-border/80 p-4 bg-card/60 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Total Orders</span>
                      <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <span className="text-2xl font-bold font-sans tracking-tight text-foreground">0</span>
                    </div>
                  </div>

                  {/* Card 2: Lifetime Spend */}
                  <div className="rounded-2xl border border-border/80 p-4 bg-card/60 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Lifetime Spend</span>
                      <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 stroke-[1.75]" />
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <span className="text-2xl font-bold font-sans tracking-tight text-foreground">$0.00</span>
                    </div>
                  </div>
                </div>

                {/* 5. Rounded Info Cards Group */}
                <div className="mt-4 rounded-2xl border border-border/80 p-4 space-y-3 bg-card/60 shadow-2xs">
                  {/* Top Row: Email & Phone (2 cols) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Email Card */}
                    <div className="rounded-xl bg-muted/30 dark:bg-muted/15 p-3.5 flex items-center gap-3.5 border border-border/40">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-muted-foreground">Email Address</p>
                        <p className="text-xs sm:text-sm font-semibold text-foreground truncate mt-0.5">
                          {selectedProfile?.email || selectedCustomer.email}
                        </p>
                      </div>
                    </div>

                    {/* Phone Card */}
                    <div className="rounded-xl bg-muted/30 dark:bg-muted/15 p-3.5 flex items-center gap-3.5 border border-border/40">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-muted-foreground">Phone Number</p>
                        <p className="text-xs sm:text-sm font-semibold text-foreground truncate mt-0.5">
                          {selectedProfile?.phone || selectedCustomer.phone || "No phone provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Delivery Address Card */}
                  <div className="rounded-xl bg-muted/30 dark:bg-muted/15 p-3.5 flex items-center gap-3.5 border border-border/40">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-muted-foreground">Delivery Address</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5">
                        {selectedProfile?.address ||
                          selectedCustomer.city ||
                          "street 66, abcd, 85685 Ghaziabad (Default)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between bg-card shrink-0 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleToggleStatus(selectedCustomer.id)}
                  className="h-10 px-6 rounded-full border-border text-xs text-foreground hover:bg-muted font-medium cursor-pointer inline-flex items-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{selectedCustomer.status === "Active" ? "Set Inactive" : "Set Active"}</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setSelectedProfile(null);
                  }}
                  className="h-10 px-6 rounded-full bg-[#183626] hover:bg-[#12281c] text-white dark:bg-[#dca038] dark:text-[#0d1a14] dark:hover:bg-[#c58d2e] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </>
          )}</SheetContent>
      </Sheet>
    </div>
  );
}

