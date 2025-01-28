  import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
  import './Cart.css';
  import { Trash2 } from 'lucide-react';
  
  const Cart = forwardRef(({
    cart,
    removeFromCart,
    updateQuantity,
    total,
    setIsPaymentOpen,
    formatPrice,
    formatProductName,
    parkPurchase,
    cancelPurchase
  }, ref) => {
    const itemsRef = useRef(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const totalInclVAT = total;
    const vatRate = 0.25;
    const vatAmount = totalInclVAT * (vatRate / (1 + vatRate));
    const subtotal = totalInclVAT - vatAmount;

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

    const handleMoreOptions = (action) => {
      setShowMoreMenu(false);
      switch(action) {
        case 'openDrawer':
          alert('Öppnar kassalåda...');
          break;
        case 'showParked':
          alert('Visar parkerade köp...');
          break;
        case 'receiptOptions':
          alert('Visar kvittoalternativ...');
          break;
        case 'addComment':
          alert('Lägg till kommentar...');
          break;
        case 'return':
          alert('Returnera vara...');
          break;
        case 'history':
          alert('Visar historik...');
          break;
        case 'help':
          alert('Visar hjälp...');
          break;
      }
    };

    const CartItem = ({ item, updateQuantity, removeFromCart, formatPrice, formatProductName }) => {
      const [inputValue, setInputValue] = useState(item.quantity.toString());

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
  type="text"
  inputMode="numeric" 
  value={inputValue}
  onChange={(e) => {
    const value = e.target.value.split('')
      .filter(char => char >= '0' && char <= '9')
      .join('');
    setInputValue(value);
  }}
  onBlur={(e) => {
    const value = e.target.value;
    if (value === '' || value === '0') {
      setInputValue(item.quantity.toString());
    } else {
      const newQuantity = parseInt(value, 10);
      if (!isNaN(newQuantity) && newQuantity > 0) {
        updateQuantity(item.id, newQuantity - item.quantity);
      } else {
        setInputValue(item.quantity.toString());
      }
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
           <Trash2 size={18} color="white" />
        </button>
        </div>
      );
    };

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
      {(!Array.isArray(cart) || cart.length === 0) ? (
        <div className="cart-empty">
          <p>Kundvagnen är tom</p>
        </div>
      ) : (
        cart.map((item) => (
          <CartItem 
            key={item.id}
            item={item}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            formatPrice={formatPrice}
            formatProductName={formatProductName}
          />
        ))
      )}
    </div>
    <div className="payment-footer">
    <div className="cart-total">
    <div>
      <span>Totalt</span>
      <span>{formatPrice(totalInclVAT)}</span>
    </div>
  </div>
  <div className="button-container">
          <button className="cancel-button" onClick={cancelPurchase}>
              Avbryt köp
            </button>
            <button className="more-button" onClick={() => setShowMoreMenu(!showMoreMenu)}>
              Mer
            </button>
            <button 
              className="park-button" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                parkPurchase(e);
                return false;
              }}
            >
              Parkera köp
            </button>
            <button className="pay-button" onClick={() => setIsPaymentOpen(true)}>
              Betala
            </button>
            {showMoreMenu && (
              <div className="more-dropdown">
                <button onClick={() => handleMoreOptions('openDrawer')}>Öppna kassalåda</button>
                <button onClick={() => handleMoreOptions('showParked')}>Visa parkerade köp</button>
                <button onClick={() => handleMoreOptions('receiptOptions')}>Kvittoalternativ</button>
                <button onClick={() => handleMoreOptions('addComment')}>Lägg till kommentar</button>
                <button onClick={() => handleMoreOptions('return')}>Returnera vara</button>
                <button onClick={() => handleMoreOptions('history')}>Visa historik</button>
                <button onClick={() => handleMoreOptions('help')}>Hjälp</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  Cart.displayName = 'Cart';
  export default Cart;