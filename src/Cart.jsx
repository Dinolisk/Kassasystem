import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import './Cart.css';

const CartItem = ({ item, updateQuantity, removeFromCart, formatPrice, formatProductName }) => {
  const [inputValue, setInputValue] = useState(item.quantity.toString());

  // Uppdatera inputValue när item.quantity ändras (från pilknappar)
  useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  return (
    <div className="cart-row">
      <div className="cart-product">
        <img src={item.thumbnail} alt={item.title} />
        <span>{formatProductName(item.title)}</span>
      </div>
      <div className="cart-price">{formatPrice(item.price)}</div>
      <div className="cart-quantity">
        <button onClick={(e) => { 
          e.preventDefault(); 
          updateQuantity(item.id, -1); 
        }}>-</button>
        <input
          type="text" // Ändrat från "number" till "text" för bättre kontroll
          inputMode="numeric" 
          value={inputValue}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');// Filtrerar bort allt som inte är siffror
            setInputValue(value);
            
            if (/^[0-9]+$/.test(value)) {
              const newQuantity = parseInt(value, 10);
              if (!isNaN(newQuantity) && newQuantity > 0) {
                updateQuantity(item.id, newQuantity - item.quantity);
              }
            }
          }}
          onBlur={(e) => {
            if (e.target.value === '' || e.target.value === '0') {
              setInputValue(item.quantity.toString());
            }
          }}
        />
        <button onClick={(e) => { 
          e.preventDefault(); 
          updateQuantity(item.id, 1); 
        }}>+</button>
      </div>
      <div className="cart-sum">{formatPrice(item.price * item.quantity)}</div>
      <button
        className="cart-remove"
        onClick={() => removeFromCart(item.id)}
        title="Ta bort"
      >
        ×
      </button>
    </div>
  );
};

const Cart = forwardRef(({
  cart,
  removeFromCart,
  updateQuantity,
  total,
  setIsPaymentOpen,
  formatPrice,
  formatProductName
}, ref) => {
  const itemsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (itemsRef.current) {
        itemsRef.current.scrollTop = 0;
      }
    },
    scrollToBottom: () => {
      if (itemsRef.current) {
        itemsRef.current.scrollTop = itemsRef.current.scrollHeight;
      }
    }
  }), []);

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="cart-empty">
        <p>Kundvagnen är tom</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div>Produkt</div>
        <div>Pris</div>
        <div>Antal</div>
        <div>Summa</div>
        <div></div>
      </div>
      <div className="cart-items" ref={itemsRef}>
        {cart.map((item) => (
          <CartItem 
            key={item.id}
            item={item}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            formatPrice={formatPrice}
            formatProductName={formatProductName}
          />
        ))}
      </div>
      <div className="cart-footer">
        <div className="cart-total">
          <span>Totalt:</span>
          <span>{formatPrice(total)}</span>
        </div>
        <button onClick={() => setIsPaymentOpen(true)}>
          Betala
        </button>
      </div>
    </div>
  );
});

Cart.displayName = 'Cart';
export default Cart;