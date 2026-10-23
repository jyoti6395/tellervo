import { Routes, Route, Navigate } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { DashboardPage } from "@/pages/DashboardPage"
import { ProductManagement } from "@/pages/ProductManagement"
import { OrderManagement } from "@/pages/OrderManagement"
import { CustomerManagement } from "@/pages/CustomerManagement"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-[#f8f7f4] text-[#12281c] antialiased">
          {/* Tellervo Admin Panel Sidebar */}
          <AdminSidebar />

          <SidebarInset className="flex flex-col flex-1 min-w-0 bg-[#f8f7f4]">
            {/* Admin Header with search, notifications and profile */}
            <AdminHeader />

            {/* Dynamic Page Views inside pages folder */}
            <main className="flex-1 overflow-x-hidden">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/customers" element={<CustomerManagement />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </SidebarInset>

          {/* Toast Notifications */}
          <Toaster richColors position="top-right" />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
