import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Login from "./components/Login";
import ProductsPage from "./pages/ProductsPage";
import AdminDashboard from "./pages/AdminDashboard";
import CartPage from "./pages/CartPage";
import AgentInfo from "./pages/AgentInfo";
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
            {/* Dashboard route */}
            <Route path="/admin" element={<AdminDashboard key={Date.now()} />} />
            
            {/* Statistics route */}
            <Route path="/admin/stats" element={<AdminStats key={Date.now()} />} />

            {/* Add product route */}
            <Route path="/admin/add-product" element={<AddProduct key={Date.now()} />} />

            {/* Fallback for unknown admin routes */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/agent-info" element={<AgentInfo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </>
  );
}
