import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import AgentInfo from "./pages/AgentInfo";
import Header from "./components/Header";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import AdminStats from "./pages/AdminStats";
import AdminLayout from "./pages/AdminLayout"; // ← new layout

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Login />;

  return (
    <Routes>
      {user.role === "admin" ? (
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />          {/* /admin */}
          <Route path="stats" element={<AdminStats />} />      {/* /admin/stats */}
          <Route path="add-product" element={<AddProduct />} />{/* /admin/add-product */}
          <Route path="*" element={<Navigate to="/admin" />} />
        </Route>
      ) : (
        <>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/agent-info" element={<AgentInfo />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}
