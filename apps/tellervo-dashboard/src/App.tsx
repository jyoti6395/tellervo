import { Routes, Route, Navigate } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { DashboardPage } from "@/pages/DashboardPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { ProductManagement } from "@/pages/ProductManagement"
import { OrderManagement } from "@/pages/OrderManagement"
import { CustomerManagement } from "@/pages/CustomerManagement"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/context/ThemeContext"

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider delayDuration={0}>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full bg-background text-foreground antialiased">
            {/* Tellervo Admin Panel Sidebar */}
            <AdminSidebar />

            <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background">
              {/* Admin Header with search and theme toggle */}
              <AdminHeader />

              {/* Dynamic Page Views inside pages folder */}
              <main className="flex-1 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
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
    </ThemeProvider>
  )
}
