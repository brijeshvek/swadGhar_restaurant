import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { showSuccess, showInfo, showCartToast } = useNotification();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('swadghar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('swadghar_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('swadghar_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('swadghar_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('swadghar_applied_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (food, quantity = 1) => {
    if (!food.isAvailable) {
      return false;
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.food._id === food._id);
      const effectivePrice = food.discountPrice > 0 ? food.discountPrice : food.price;

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            food,
            quantity,
            price: effectivePrice,
          },
        ];
      }
    });

    showCartToast(food, `Added ${food.name} (${quantity}x) to your plate.`);
    return true;
  };

  const updateQuantity = (foodId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(foodId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.food._id === foodId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (foodId) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.food._id === foodId);
      if (item) {
        showInfo(`Removed ${item.food.name} from your cart.`);
      }
      return prevItems.filter((i) => i.food._id !== foodId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Coupon discount calculation
  let discountAmount = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.minOrderAmount || 0)) {
    if (appliedCoupon.discountType === 'percentage') {
      const calculated = (subtotal * appliedCoupon.discountValue) / 100;
      discountAmount = appliedCoupon.maxDiscount
        ? Math.min(calculated, appliedCoupon.maxDiscount)
        : calculated;
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxableAmount * 0.05); // 5% GST
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 40;
  const grandTotal = Math.max(0, taxableAmount + tax + deliveryFee);

  const applyCoupon = (coupon) => {
    if (subtotal < (coupon.minOrderAmount || 0)) {
      return {
        success: false,
        message: `Minimum order of ₹${coupon.minOrderAmount} required for coupon ${coupon.code}.`,
      };
    }
    setAppliedCoupon(coupon);
    showSuccess(`Coupon ${coupon.code} applied successfully!`);
    return { success: true };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showInfo('Coupon removed.');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        subtotal,
        discountAmount,
        tax,
        deliveryFee,
        grandTotal,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
