import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import './Cart.css';

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
    }
  }), []);

  // Kontrollera att cart är en array och har element
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
          <div key={item.id} className="cart-row">
            <div className="cart-product">
              <img src={item.thumbnail} alt={item.title} />
              <span>{formatProductName(item.title)}</span>
            </div>
            
            <div className="cart-price">{formatPrice(item.price)}</div>
            
            <div className="cart-quantity">
              <button onClick={() => updateQuantity(item.id, -1)}>-</button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    updateQuantity(item.id, parseInt(value, 10));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === '0') {
                    updateQuantity(item.id, 1);
                  }
                }}
              />
              <button onClick={() => updateQuantity(item.id, 1)}>+</button>
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