import * as React from "react"
import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export function AdminHeader() {
  const [globalSearch, setGlobalSearch] = React.useState("")

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e8e4dc] bg-white px-4 md:px-6 shadow-2xs gap-4">
      {/* Left: Sidebar Collapse + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <SidebarTrigger className="text-[#153424] hover:bg-[#153424]/10 h-9 w-9 shrink-0" />

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a9f91]" />
          <Input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search products, categories, or SKU..."
            className="pl-10 h-10 bg-[#faf8f4]/80 border-[#e5dfd5] text-xs text-[#132c1e] placeholder:text-[#889e90] focus-visible:ring-[#143926] rounded-xl w-full"
          />
        </div>
      </div>

      {/* Right: Notifications + Admin Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => toast.info("You have 3 unread low-stock notifications")}
          className="relative p-2 rounded-xl text-[#5b7264] hover:text-[#12281c] hover:bg-[#f3efe8] transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 p-1 rounded-full hover:bg-[#f6f2ea] transition-colors focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#163826] to-[#2e5d42] border border-white text-white font-serif font-bold text-xs flex items-center justify-center shadow-xs">
                A
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-[#112a1d]">Admin</span>
                <span className="text-[10.5px] text-[#698173] mt-0.5 font-medium">Super Admin</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border-[#e8e4dc] p-1.5 rounded-xl shadow-lg">
            <DropdownMenuLabel className="text-xs font-bold text-[#112a1d]">
              Admin Session
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#e8e4dc]" />
            <DropdownMenuItem
              onClick={() => toast.info("Super Admin Settings")}
              className="text-xs cursor-pointer rounded-lg p-2 focus:bg-[#f6f2ea]"
            >
              Settings & Roles
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.success("Signed out")}
              className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg p-2 focus:bg-rose-50"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
