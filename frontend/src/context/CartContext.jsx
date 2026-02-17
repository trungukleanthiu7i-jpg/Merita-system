// src/context/CartContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

// --------------------
// Client Axios (local + production)
// --------------------
const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

export function CartProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [productsStock, setProductsStock] = useState({});
  const [cart, setCart] = useState([]);

  // --------------------
  // Preia produsele din backend
  // --------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosClient.get("/products");

        const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
        setProducts(list);

        // Creează un map productId -> stoc
        const stockMap = {};
        list.forEach((p) => {
          stockMap[p._id] = p.stoc || "in stoc";
        });
        setProductsStock(stockMap);
      } catch (err) {
        console.error("Eroare la preluarea produselor:", err?.response?.data || err);
      }
    };

    fetchProducts();
  }, []);

  // --------------------
  // Adaugă produs în coș
  // --------------------
  const addToCart = (product) => {
    if (!product?._id) return;

    const stock = productsStock[product._id] || "in stoc";
    if (String(stock).toLowerCase().trim() === "out of stoc") return;

    const exists = cart.find((item) => item._id === product._id);

    if (exists) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, boxes: (item.boxes || 0) + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          _id: product._id,
          name: product.name,
          boxes: 1,
          quantity: 0,
          price: product.price || 0,       // preț în RON
          customPrice: product.price || 0, // preț personalizat în RON
          unitsPerBox: product.unitsPerBox || 1,
          image: product.image || "",
        },
      ]);
    }
  };

  // --------------------
  // Actualizează numărul de cutii
  // --------------------
  const updateBoxes = (id, boxes) => {
    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, boxes: boxes === "" ? 0 : Number(boxes) }
          : item
      )
    );
  };

  // --------------------
  // Actualizează cantitatea pe unități
  // --------------------
  const updateQuantity = (id, quantity) => {
    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, quantity: quantity === "" ? 0 : Number(quantity) }
          : item
      )
    );
  };

  // --------------------
  // Actualizează prețul personalizat pe unitate (în RON)
  // --------------------
  const updatePrice = (id, price) => {
    setCart(
      cart.map((item) =>
        item._id === id
          ? { ...item, customPrice: price === "" ? 0 : Number(price) }
          : item
      )
    );
  };

  // --------------------
  // Elimină produsul din coș
  // --------------------
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  // --------------------
  // Golește întregul coș
  // --------------------
  const clearCart = () => setCart([]);

  // --------------------
  // Total cutii din coș
  // --------------------
  const totalBoxes = cart.reduce((sum, item) => sum + (item.boxes || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalBoxes,
        products,
        productsStock,
        addToCart,
        updateBoxes,
        updateQuantity,
        updatePrice,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
