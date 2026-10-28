import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export function AdminHeader() {
  const [globalSearch, setGlobalSearch] = React.useState("")

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6 gap-4 shadow-xs">
      {/* Left: Sidebar Collapse + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <SidebarTrigger className="text-foreground hover:bg-muted h-9 w-9 shrink-0 cursor-pointer" />

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search products, categories, or SKU..."
            className="pl-10 h-10 bg-card border border-border shadow-2xs text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-xl w-full"
          />
        </div>
      </div>

      {/* Right: Theme Toggle  */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  )
}
