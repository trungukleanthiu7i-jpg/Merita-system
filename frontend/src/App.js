import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Header from "./components/Header";

// Client Pages
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import AgentInfo from "./pages/AgentInfo";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminStats from "./pages/AdminStats";
import AddProduct from "./pages/AddProduct";   // <-- NEW

function AppWrapper() {
  const location = useLocation();

  // Hide header on admin routes
  const hideHeader = location.pathname.startsWith("/admin");

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/agent-info" element={<AgentInfo />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/add-product" element={<AddProduct />} />  {/* NEW */}

        {/* 404 */}
        <Route path="*" element={<p style={{ textAlign: "center", marginTop: "50px" }}>Page not found</p>} />
      </Routes>

      {/* Toast notifications */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
