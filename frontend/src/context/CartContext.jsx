import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Add product to cart
  const addToCart = (product) => {
    const exists = cart.find((item) => item._id === product._id);

    if (exists) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, boxes: item.boxes + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          boxes: 1, // Start with 1 box for new product
          customPrice: product.price || 0,
        },
      ]);
    }
  };

  // Update number of boxes
  const updateBoxes = (id, boxCount) => {
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, boxes: Number(boxCount) } : item
      )
    );
  };

  // Update price override
  const updatePrice = (id, price) => {
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, customPrice: Number(price) } : item
      )
    );
  };

  // Remove one product
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Total boxes (sum of all products)
  const totalBoxes = cart.reduce((sum, item) => sum + (item.boxes || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalBoxes, // Expose total boxes for badge
        addToCart,
        updateBoxes,
        updatePrice,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
