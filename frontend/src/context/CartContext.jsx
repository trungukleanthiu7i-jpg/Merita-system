// src/context/CartContext.jsx
import { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient"; // ← FOARTE IMPORTANT

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [productsStock, setProductsStock] = useState({});
  const [cart, setCart] = useState([]);

  // --------------------
  // Fetch products
  // --------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosClient.get("/products");
        setProducts(res.data);

        // Build stock map
        const stockMap = {};
        res.data.forEach((p) => {
          stockMap[p._id] = p.stoc || "in stoc";
        });
        setProductsStock(stockMap);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // --------------------
  // Add to cart
  // --------------------
  const addToCart = (product) => {
    const stock = productsStock[product._id] || "in stoc";
    if (stock === "out of stoc") return;

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
          price: product.price || 0,
          customPrice: product.price || 0,
          unitsPerBox: product.unitsPerBox || 1,
          image: product.image || "",
        },
      ]);
    }
  };

  // --------------------
  // Update boxes
  // --------------------
  const updateBoxes = (id, boxes) => {
    const stock = productsStock[id] || "in stoc";
    if (stock === "out of stoc") return;

    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, boxes: Number(boxes) } : item
      )
    );
  };

  // --------------------
  // Update quantity
  // --------------------
  const updateQuantity = (id, quantity) =>
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: Number(quantity) } : item
      )
    );

  // --------------------
  // Update price override
  // --------------------
  const updatePrice = (id, price) =>
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, customPrice: Number(price) } : item
      )
    );

  // --------------------
  // Remove from cart
  // --------------------
  const removeFromCart = (id) =>
    setCart(cart.filter((item) => item._id !== id));

  const clearCart = () => setCart([]);

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
