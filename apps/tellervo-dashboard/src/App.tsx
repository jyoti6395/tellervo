import { Routes, Route, Navigate, Outlet } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { DashboardPage } from "@/pages/DashboardPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { ProductManagement } from "@/pages/ProductManagement"
import { OrderManagement } from "@/pages/OrderManagement"
import { CustomerManagement } from "@/pages/CustomerManagement"
import { LoginPage } from "@/pages/LoginPage"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/context/ThemeContext"

/**
 * Shell layout with Sidebar and Header for internal admin views
 */
function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background text-foreground antialiased">
        {/* Tellervo Admin Panel Sidebar */}
        <AdminSidebar />

        <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background">
          {/* Admin Header with search and theme toggle */}
          <AdminHeader />

          {/* Dynamic Page Views */}
          <main className="flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <TooltipProvider delayDuration={0}>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Role-Enforced Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/customers" element={<CustomerManagement />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
