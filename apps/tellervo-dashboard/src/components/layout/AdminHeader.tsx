import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6 gap-4 shadow-xs">
      {/* Left: Sidebar Collapse */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-foreground hover:bg-muted h-9 w-9 shrink-0 cursor-pointer" />
      </div>

      {/* Right: Theme Toggle */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  )
}
