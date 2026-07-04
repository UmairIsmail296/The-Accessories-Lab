import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const { user } = useAuth();

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${user?.token}` },
  });

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    try {
      setCartLoading(true);
      const { data } = await axios.get('/api/auth/cart', getAuthHeader());
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return false;
    try {
      const { data } = await axios.post('/api/auth/cart', { productId, quantity }, getAuthHeader());
      setCart(data);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await axios.delete(`/api/auth/cart/${productId}`, getAuthHeader());
      setCart(data);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await axios.put(`/api/auth/cart/${productId}`, { quantity }, getAuthHeader());
      setCart(data);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/auth/cart', getAuthHeader());
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => {
    if (item.product) {
      return acc + item.product.price * item.quantity;
    }
    return acc;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};