// src/context/CartContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

// --------------------
// Axios client
// --------------------
const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

export function CartProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [productsStock, setProductsStock] = useState({});
  const [cart, setCart] = useState([]);

  // --------------------
  // Fetch products from backend
  // --------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosClient.get("/products");
        setProducts(res.data);

        // Map productId -> stock status
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
  // Add product to cart
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
  // Update number of boxes
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
  // Update single-unit quantity
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
  // Update custom price per unit
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
  // Remove product from cart
  // --------------------
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  // --------------------
  // Clear entire cart
  // --------------------
  const clearCart = () => setCart([]);

  // --------------------
  // Total boxes in cart
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
