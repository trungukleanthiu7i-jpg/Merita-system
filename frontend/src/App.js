import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Login from "./components/Login";
import ProductsPage from "./pages/ProductsPage";
import AdminDashboard from "./pages/AdminDashboard";
import CartPage from "./pages/CartPage";
import AgentInfo from "./pages/AgentInfo"; // ← import
import AddProduct from "./pages/AddProduct";
import AdminStats from "./pages/AdminStats";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Login />;

  return (
    <>
      <Header />
      <Routes>
        {user.role === "admin" ? (
    <>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/add-product" element={<AddProduct />} /> {/* ← noua pagină */}
        <Route path="*" element={<Navigate to="/admin" />} />
    </>
          ) : (
          <>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/agent-info" element={<AgentInfo />} /> {/* ← new route */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </>
  );
}
