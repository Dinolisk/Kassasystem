import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import './Cart.css';
import { 
  Trash2,
  CreditCard 
} from 'lucide-react';

const Cart = forwardRef(({
  cart,
  setCart,
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
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const parkButtonRef = useRef(null);
  const confirmParkRef = useRef(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showParkDialog, setShowParkDialog] = useState(false);
  const totalInclVAT = total;
  const vatRate = 0.25;
  const vatAmount = totalInclVAT * (vatRate / (1 + vatRate));
  const subtotal = totalInclVAT - vatAmount;
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMoreMenu && !event.target.closest('.more-button') && !event.target.closest('.more-dropdown')) {
        setShowMoreMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (showMoreMenu) {
          setShowMoreMenu(false);
        }
        if (showConfirmDialog) {
          setShowConfirmDialog(false);
          cancelButtonRef.current?.focus();
        }
        if (showParkDialog) {
          setShowParkDialog(false);
          parkButtonRef.current?.focus();
        }
      }
    };

    if (showMoreMenu || showConfirmDialog || showParkDialog) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMoreMenu, showConfirmDialog, showParkDialog]);

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
      default:
        break;
    }
  };

  const handleCancelClick = () => {
    if (!showConfirmDialog) {  // Bara visa dialogen om den inte redan visas
      setShowConfirmDialog(true);
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 0);
    }
  };

  const CartItem = ({ item, updateQuantity, removeFromCart, formatPrice, formatProductName }) => {
    const [inputValue, setInputValue] = useState(item.quantity.toString());

    useEffect(() => {
      setInputValue(item.quantity.toString());
    }, [item.quantity]);

    return (
      <div className="cart-row" role="listitem">
        <div className="cart-product">
          <img src={item.thumbnail} alt="" role="presentation" />
          <span>{formatProductName(item.title)}</span>
        </div>
        <div className="cart-price" aria-label={`Pris: ${formatPrice(item.price)}`}>
          {formatPrice(item.price)}
        </div>
        <div className="cart-quantity" role="group" aria-label={`Ändra antal av ${item.title}`}>
          <button 
            onClick={(e) => { 
              e.preventDefault(); 
              updateQuantity(item.id, -1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                updateQuantity(item.id, -1);
              }
            }}
            aria-label="Minska antal"
            tabIndex={0}
          >
            -
          </button>
          <input
            type="text"
            inputMode="numeric"
            aria-label={`Antal av ${item.title}`}
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.target.blur();
              }
            }}
          />
          <button 
            onClick={(e) => { 
              e.preventDefault(); 
              updateQuantity(item.id, 1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                updateQuantity(item.id, 1);
              }
            }}
            aria-label="Öka antal"
            tabIndex={0}
          >
            +
          </button>
        </div>
        <div className="cart-sum" aria-label={`Summa: ${formatPrice(item.price * item.quantity)}`}>
          {formatPrice(item.price * item.quantity)}
        </div>
        <button
          className="cart-remove"
          onClick={() => removeFromCart(item.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              removeFromCart(item.id);
            }
          }}
          aria-label={`Ta bort ${item.title} från kundvagnen`}
          tabIndex={0}
        >
          <Trash2 size={18} color="white" />
        </button>
      </div>
    );
  };

  return (
    <div className="cart-container" role="region" aria-label="Kundvagn">
      <div className="cart-header" role="row">
        <div>Produkt</div>
        <div>Pris</div>
        <div>Antal</div>
        <div>Summa</div>
        <div></div>
      </div>
      
      <div className="cart-items" ref={itemsRef} role="list">
        {(!Array.isArray(cart) || cart.length === 0) ? (
          <div className="cart-empty" role="alert">
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
        <div className="cart-total" role="contentinfo">
          <div>
            <span>Totalt</span>
            <span aria-label={`Totalt belopp: ${formatPrice(totalInclVAT)}`}>
              {formatPrice(totalInclVAT)}
            </span>
          </div>
        </div>
        <div className="button-container" role="group" aria-label="Köpkontroller">
          <button 
            ref={cancelButtonRef}
            className="cancel-button" 
            onClick={handleCancelClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCancelClick();
              }
            }}
            aria-label="Avbryt köp"
            tabIndex={0}
          >
            Avbryt köp
          </button>
          
          <button 
            className="more-button" 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowMoreMenu(!showMoreMenu);
              }
            }}
            aria-expanded={showMoreMenu}
            aria-haspopup="true"
            aria-label="Visa fler alternativ"
            tabIndex={0}
          >
            Mer
          </button>
          
          <button
            ref={parkButtonRef}
            className="park-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowParkDialog(true);
              setTimeout(() => {
                confirmParkRef.current?.focus();
              }, 0);
            }}
            aria-label="Parkera köp"
            tabIndex={0}
          >
            Parkera köp
          </button>
          
          <button 
            className="pay-button" 
            onClick={() => setIsPaymentOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsPaymentOpen(true);
              }
            }}
            aria-label="Betala"
            tabIndex={0}
          >
            Betala
            <CreditCard size={20} />
          </button>

          {showMoreMenu && (
            <div 
              className="more-dropdown" 
              role="menu" 
              aria-label="Fler alternativ"
            >
              <button
                role="menuitem"
                onClick={() => handleMoreOptions('openDrawer')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMoreOptions('openDrawer');
                  }
                }}
                tabIndex={showMoreMenu ? 0 : -1}
              >
                Öppna kassalåda
              </button>
              <button
                role="menuitem"
                onClick={() => handleMoreOptions('showParked')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMoreOptions('showParked');
                  }
                }}
                tabIndex={showMoreMenu ? 0 : -1}
              >
                Visa parkerade köp
              </button>
              <button
                role="menuitem"
                onClick={() => handleMoreOptions('receiptOptions')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMoreOptions('receiptOptions');
                  }
                }}
                tabIndex={showMoreMenu ? 0 : -1}
              >
                Kvittoalternativ
              </button>
              <button
                role="menuitem"
                onClick={() => handleMoreOptions('addComment')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMoreOptions('addComment');
                  }
                }}
                tabIndex={showMoreMenu ? 0 : -1}
              >
                Lägg till kommentar
              </button>
              <button
                role="menuitem"
                onClick={() => handleMoreOptions('return')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMoreOptions('return');
                  }
                }}
                tabIndex={showMoreMenu ? 0 : -1}
              >
                Returnera vara
              </button>
              <button
                role="menuitem"
                onClick={() => handleMoreOptions('history')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMoreOptions('history');
                  }
                }}
                tabIndex={showMoreMenu ? 0 : -1}
              >
                Visa historik
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Avbryt köp dialog */}
      {/* Avbryt köp dialog */}
{showConfirmDialog && (
  <div 
    className="modal-overlay" 
    role="dialog"
    aria-modal="true"
    aria-labelledby="cancel-dialog-title"
    onClick={(e) => {
      e.stopPropagation();
      setShowConfirmDialog(false);
    }}
  >
    <div 
      className="confirmation-dialog"
      onClick={e => e.stopPropagation()}
    >
      <h2 id="cancel-dialog-title">Avbryta köp?</h2>
      <p>Om du avbryter kommer alla varor i kundvagnen att tas bort. Vill du verkligen avbryta köpet?</p>
      <div className="dialog-buttons">
        <button
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirmDialog(false);
            cancelButtonRef.current?.focus();
          }}
        >
          Gå tillbaka
        </button>
        <button
  tabIndex={0}
  ref={confirmButtonRef}
  onClick={(e) => {
    e.stopPropagation();
    cancelPurchase(e);
    setShowConfirmDialog(false);
    // Eventuellt fokusera på någon annan knapp eller element istället
    // Till exempel betalknappen eller mer-knappen
  }}
>
  Avbryt köp
</button>
      </div>
    </div>
  </div>
)}

{/* Parkera köp dialog */}
{showParkDialog && (
  <div 
    className="modal-overlay" 
    role="dialog"
    aria-modal="true"
    aria-labelledby="park-dialog-title"
    onClick={(e) => {
      e.stopPropagation();
      setShowParkDialog(false);
    }}
  >
    <div 
      className="confirmation-dialog"
      onClick={e => e.stopPropagation()}
    >
      <h2 id="park-dialog-title">Parkera köp?</h2>
      <p>Vill du parkera det pågående köpet? Du kan återuppta det senare från "Visa parkerade köp".</p>
      <div className="dialog-buttons">
        <button
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setShowParkDialog(false);
            parkButtonRef.current?.focus();
          }}
        >
          Gå tillbaka
        </button>
        <button
          tabIndex={0}
          ref={confirmParkRef}
          onClick={(e) => {
            e.stopPropagation();
            parkPurchase(e);  // Detta var redan korrekt
            setShowParkDialog(false);
            parkButtonRef.current?.focus();
          }}
        >
          Parkera köp
        </button>
      </div>
    </div>
  </div>
      )}
    </div>
  );
});

Cart.displayName = 'Cart';
export default Cart;