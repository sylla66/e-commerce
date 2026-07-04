import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/toaster'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProductsPage from '@/pages/ProductsPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrderSuccessPage from '@/pages/OrderSuccessPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import PaymentSimulationPage from '@/pages/PaymentSimulationPage'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminActivities from '@/pages/admin/AdminActivities'
import ManagerOrders from '@/pages/manager/ManagerOrders'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/success" element={<OrderSuccessPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/payment/simulate" element={<PaymentSimulationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="activities" element={<AdminActivities />} />
            </Route>
            <Route path="/manager" element={<ManagerOrders />} />
          </Routes>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
