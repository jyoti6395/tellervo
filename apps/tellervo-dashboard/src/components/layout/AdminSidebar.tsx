import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

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
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname
  const isDashboard = currentPath === "/" || currentPath === "/dashboard"
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

      <SidebarRail />
    </Sidebar>
  )
}
