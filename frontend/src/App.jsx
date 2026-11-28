import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Profile from './pages/Profile.jsx'
import Orders from './pages/Orders.jsx'
import AdminOrders from './pages/AdminOrders.jsx'
import AdminOverview from './pages/AdminOverview.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import AdminPayroll from './pages/AdminPayroll.jsx'
import AdminRiders from './pages/AdminRiders.jsx'
import AdminReports from './pages/AdminReports.jsx'
import RiderToday from './pages/RiderToday.jsx'
import RiderDeliveries from './pages/RiderDeliveries.jsx'
import RiderHistory from './pages/RiderHistory.jsx'
import RiderProfile from './pages/RiderProfile.jsx'

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')
  if (!token) return <Navigate to="/login" replace />
  if (role && userRole !== role) return <Navigate to={`/${userRole}`} replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/shop" element={<PrivateRoute role="customer"><Home /></PrivateRoute>} />
        <Route path="/shop/catalog" element={<PrivateRoute role="customer"><Shop /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute role="customer"><Profile /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute role="customer"><Orders /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminOverview /></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute role="admin"><AdminOrders /></PrivateRoute>} />
        <Route path="/admin/products" element={<PrivateRoute role="admin"><AdminProducts /></PrivateRoute>} />
        <Route path="/admin/riders" element={<PrivateRoute role="admin"><AdminRiders /></PrivateRoute>} />
        <Route path="/admin/payroll" element={<PrivateRoute role="admin"><AdminPayroll /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute role="admin"><AdminReports /></PrivateRoute>} />
        <Route path="/rider" element={<PrivateRoute role="delivery"><RiderToday /></PrivateRoute>} />
        <Route path="/rider/deliveries" element={<PrivateRoute role="delivery"><RiderDeliveries /></PrivateRoute>} />
        <Route path="/rider/history" element={<PrivateRoute role="delivery"><RiderHistory /></PrivateRoute>} />
        <Route path="/rider/profile" element={<PrivateRoute role="delivery"><RiderProfile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
