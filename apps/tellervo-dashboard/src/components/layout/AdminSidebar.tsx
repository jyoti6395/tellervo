import {
  LayoutDashboard,
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  LogOut,
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface NavItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
}

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Products", icon: Package, path: "/products" },
  { title: "Orders", icon: ShoppingBag, path: "/orders" },
  { title: "Customers", icon: Users, path: "/customers" },
  { title: "Analytics", icon: BarChart3, path: "/analytics" },
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname
  const isDashboard = currentPath === "/" || currentPath === "/dashboard"
  const isAnalytics = currentPath === "/analytics"
  const isProducts = currentPath === "/products"
  const isOrders = currentPath === "/orders"
  const isCustomers = currentPath === "/customers"

  const handleNavClick = (item: NavItem) => {
    if (item.path) {
      navigate(item.path)
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#193228] bg-[#13251f] text-[#d9e1e1]"
    >
      {/* Brand Header */}
      <SidebarHeader className="p-5 border-b border-[#1b352a] group-data-[collapsible=icon]:p-2.5">
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 cursor-pointer select-none group-data-[collapsible=icon]:justify-center"
        >
          {/* Tellervo Brand Logo Image */}
          <div className="w-9 h-9 rounded-full bg-white/95 border border-[#dca038]/40 p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            <img
              src="/tellervo-logo.png"
              alt="Tellervo Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-serif text-[17px] font-bold tracking-[0.14em] text-[#fdfeff] leading-none">
              TELLERVO
            </span>
            <span className="text-[9.5px] font-medium tracking-[0.24em] text-[#c0c7bd] uppercase mt-1 leading-none">
              ADMIN PANEL
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav Menu */}
      <SidebarContent className="px-3 py-3.5 flex flex-col justify-between overflow-y-auto">
        <SidebarMenu className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              item.title === "Dashboard"
                ? isDashboard
                : item.title === "Analytics"
                ? isAnalytics
                : item.title === "Products"
                ? isProducts
                : item.title === "Orders"
                ? isOrders
                : item.title === "Customers"
                ? isCustomers
                : false

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => handleNavClick(item)}
                  tooltip={item.title}
                  className={`h-10 px-3 rounded-xl transition-colors font-medium text-xs ${
                    isActive
                      ? "bg-[#3f5745] text-white shadow-xs font-semibold hover:bg-[#3f5745]"
                      : "text-[#d9e1e1] hover:text-white hover:bg-[#1a3328]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#d9e1e1]"}`} />
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Bottom Footer: Admin User Profile (Matching Image 3) */}
      <SidebarFooter className="p-3 border-t border-[#1b352a]">
        <DropdownMenu>
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#1a3328] transition-colors group-data-[collapsible=icon]:justify-center">
            {/* User Avatar + Details */}
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 text-left min-w-0 flex-1 focus:outline-hidden cursor-pointer"
              >
                {/* Avatar with Online Green Dot */}
                <div className="w-9 h-9 rounded-xl bg-[#0f241c] border border-[#1e3b2e] text-[#55b382] font-semibold text-xs flex items-center justify-center relative shrink-0 shadow-xs">
                  MA
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#13251f] absolute -bottom-0.5 -right-0.5" />
                </div>

                <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    Master Admin
                  </span>
                  <span className="text-[10.5px] text-[#789384] leading-tight mt-0.5">
                    Super Admin
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            {/* Logout Icon Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toast.success("Signed out successfully")
              }}
              className="p-1.5 text-[#789384] hover:text-white hover:bg-[#234234] rounded-lg transition-colors group-data-[collapsible=icon]:hidden cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <DropdownMenuContent
            align="end"
            side="right"
            className="w-48 bg-[#13251f] border-[#1b352a] text-[#d9e1e1] p-1.5 rounded-xl shadow-xl"
          >
            <DropdownMenuLabel className="text-xs font-bold text-white">
              Master Admin Session
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1b352a]" />
            <DropdownMenuItem
              onClick={() => toast.info("Super Admin Settings & Roles")}
              className="text-xs cursor-pointer rounded-lg p-2 focus:bg-[#1a3328] focus:text-white"
            >
              Settings & Roles
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.success("Signed out successfully")}
              className="text-xs font-semibold text-rose-400 cursor-pointer rounded-lg p-2 focus:bg-rose-950/40 focus:text-rose-300"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
