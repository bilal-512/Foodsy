import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Auth/Profile";
import NotFound from "./pages/NotFound";

import Menu from "./pages/Customer/Menu";
import Cart from "./pages/Customer/Cart";
import Orders from "./pages/Customer/Orders";

import AssignedOrders from "./pages/Employee/AssignedOrders";

import Dashboard from "./pages/Admin/Dashboard";
import MenuManagement from "./pages/Admin/MenuManagement";
import EmployeeManagement from "./pages/Admin/EmployeeManagement";
import AdminOrders from "./pages/Admin/AdminOrders";
import CustomerManagement from "./pages/Admin/CustomerManagement";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <div className="app-shell">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register role="customer" />} />
              <Route path="/register/rider" element={<Register role="rider" />} />
              <Route path="/register/admin" element={<Register role="admin" />} />

              <Route path="/menu" element={<ProtectedRoute roles={["customer"]}><Menu /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute roles={["customer"]}><Cart /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute roles={["customer"]}><Orders /></ProtectedRoute>} />

              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              <Route path="/employee/orders" element={<ProtectedRoute roles={["employee", "rider"]}><AssignedOrders /></ProtectedRoute>} />

              <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/menu" element={<ProtectedRoute roles={["admin"]}><MenuManagement /></ProtectedRoute>} />
              <Route path="/admin/employees" element={<ProtectedRoute roles={["admin"]}><EmployeeManagement /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute roles={["admin"]}><CustomerManagement /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute roles={["admin"]}><AdminOrders /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
