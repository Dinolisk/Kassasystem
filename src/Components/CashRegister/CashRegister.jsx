// Del 1: Imports och grundläggande state
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CashRegister.css';
import Cart from '../Cart/Cart.jsx';
import Products from '../Products/Products';
import { 
  CreditCard, 
  Smartphone, 
  Receipt, 
  FileText, 
  Banknote, 
  Gift, 
  Calendar, 
  ArrowLeft 
} from 'lucide-react';

function CashRegister() {
  // State-hantering
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const cartContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isExistingCustomerOpen, setIsExistingCustomerOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    personnummer: ''
  });

  // Meny-alternativ
  const menuOptions = [
    { id: 1, label: 'Öppna kassalåda', action: () => alert('Kassalåda öppnad') },
    { id: 2, label: 'Dagsavslut', action: () => alert('Dagsavslut') },
    { id: 3, label: 'Z-rapport', action: () => alert('Z-rapport genererad') },
    { id: 4, label: 'X-rapport', action: () => alert('X-rapport genererad') },
    { id: 5, label: 'Returnera vara', action: () => alert('Returnera vara') },
    { id: 6, label: 'Pausförsäljning', action: () => alert('Försäljning pausad') },
    { id: 7, label: 'Parkeraköp', action: () => alert('Köp parkerat') },
    { id: 8, label: 'Inställningar', action: () => alert('Inställningar') },
  ];
  // Formatterings-funktioner
  const formatProductName = (text) => {
    const maxLength = 18;
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
  
    for (let word of words) {
      if (currentLine.length + word.length + 1 <= maxLength) {
        currentLine += (currentLine.length === 0 ? '' : ' ') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines.join('\n');
  };

  const formatProductPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
  };
  
  const formatCartPrice = (price) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
  };

  const formatPrice = (price) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Effects
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products?limit=60');
        const data = await response.json();
        const updatedProducts = data.products.map(product => ({
          ...product,
          price: Math.floor(product.price * 5),
          thumbnail: product.images[0]
        }));
        setProductsData(updatedProducts);
      } catch (error) {
        console.error('Fel vid hämtning av produkter:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
      const isNewProductAdded = cart.length > (JSON.parse(localStorage.getItem('previousCart') || '[]')).length;
      
      if (isNewProductAdded) {
        const timer = setTimeout(() => {
          if (cartContainerRef.current instanceof HTMLElement) {
            const cartItemsContainer = cartContainerRef.current.querySelector('.cart-items');
            if (cartItemsContainer) {
              cartItemsContainer.scrollTop = cartItemsContainer.scrollHeight;
            }
          } 
          else if (cartContainerRef.current && typeof cartContainerRef.current.scrollToBottom === 'function') {
            cartContainerRef.current.scrollToBottom();
          }
        }, 100);
        return () => clearTimeout(timer);
      }
      localStorage.setItem('previousCart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('previousCart');
    }
  }, [cart]);
  // Kundvagnshantering
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.id === productId) {
          if (typeof newQuantity === 'number') {
            const updatedQuantity = item.quantity + newQuantity;
            if (updatedQuantity <= 0) return null;
            return { ...item, quantity: updatedQuantity };
          }
          const directQuantity = parseInt(newQuantity);
          if (directQuantity <= 0) return null;
          return { ...item, quantity: directQuantity };
        }
        return item;
      });
      return updatedCart.filter(item => item !== null);
    });
  };

  // Betalningshantering
  const handleCashPayment = () => {
    const received = parseFloat(receivedAmount);
    if (isNaN(received) || received < total) {
      alert('Vänligen ange ett giltigt belopp som är större än eller lika med totalbeloppet');
      return;
    }
    const change = received - total;
    alert(`Växel att ge tillbaka: ${formatPrice(change)}`);
    generateReceipt();
    setIsPaymentOpen(false);
    setSelectedPaymentMethod('');
    setReceivedAmount('');
    setCart([]);
  };

  const handleGiftCardPayment = () => {
    if (giftCardNumber.length < 8) {
      alert('Vänligen ange ett giltigt presentkortsnummer');
      return;
    }
    generateReceipt();
    setIsPaymentOpen(false);
    setSelectedPaymentMethod('');
    setGiftCardNumber('');
    setCart([]);
  };

  const cancelPurchase = () => {
    setCart([]);
  };

  const parkPurchase = (e) => {
    try {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
  
      if (cart.length === 0) {
        alert('Kundvagnen är tom');
        return;
      }
  
      const parkedPurchase = {
        id: Date.now(),
        cart: cart,
        timestamp: new Date().toISOString()
      };
  
      const parkedPurchases = JSON.parse(localStorage.getItem('parkedPurchases') || '[]');
      parkedPurchases.push(parkedPurchase);
      localStorage.setItem('parkedPurchases', JSON.stringify(parkedPurchases));
  
      setCart([]);
    } catch (error) {
      console.error('Error in parkPurchase:', error);
      alert('Ett fel uppstod när köpet skulle parkeras');
    }
    return false;
  };
  // Kundhantering
  const validatePersonnummer = (pnr) => {
    const regex = /^\d{8}-\d{4}$/;
    if (!regex.test(pnr)) {
      return false;
    }
    const year = parseInt(pnr.substring(0, 4));
    const month = parseInt(pnr.substring(4, 6));
    const day = parseInt(pnr.substring(6, 8));
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  const handleRegisterCustomer = (e) => {
    e.preventDefault();
    if (!validatePersonnummer(customerInfo.personnummer)) {
      alert('Vänligen ange ett giltigt personnummer i formatet ÅÅÅÅMMDD-XXXX');
      return;
    }
    console.log('Registering customer:', customerInfo);
    alert('Kund registrerad!');
    setIsNewCustomerOpen(false);
    setCustomerInfo({
      name: '',
      email: '',
      phone: '',
      address: '',
      personnummer: ''
    });
  };
  // Kvittogenerering
  const generateReceipt = () => {
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString();
    const timeString = currentDate.toLocaleTimeString();
    const momssats = 0.25;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const moms = total * momssats;
    const netto = total - moms;
    const brutto = total;
    
    const receiptContent = `
      <html>
        <head>
          <style>
            .receipt-container {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
              background: white;
              font-size: 14px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 10px;
            }
            .company-info {
              text-align: center;
              margin-bottom: 20px;
            }
            .date-time {
              text-align: center;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .separator {
              border-top: 1px dashed #000;
              margin: 15px 0;
            }
            .item-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .item-list li {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .price-info {
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
            }
            .thank-you {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="company-name">GARDECO</div>
            <div class="company-info">
              <div>Storgatan 12, 123 45 Stockholm</div>
              <div>Tel: 08-123 45 67</div>
              <div>Org. nr: 556123-4567</div>
            </div>
            <div class="date-time">
              ${dateString} ${timeString}
            </div>
            <div class="separator"></div>
            <ul class="item-list">
              ${cart.map(item => `
                <li>
                  <span>${item.title} x${item.quantity}</span>
                  <span>${formatPrice(item.price * item.quantity)}</span>
                </li>
              `).join('')}
            </ul>
            <div class="separator"></div>
            <div class="price-info">
              <span>Netto:</span>
              <span>${formatPrice(netto)}</span>
            </div>
            <div class="price-info">
              <span>Moms (25%):</span>
              <span>${formatPrice(moms)}</span>
            </div>
            <div class="price-info" style="font-weight: bold; margin-top: 10px;">
              <span>Totalt:</span>
              <span>${formatPrice(brutto)}</span>
            </div>
            <div class="separator"></div>
            <div class="thank-you">
              <div>Tack för ditt köp!</div>
              <div>Välkommen åter!</div>
            </div>
          </div>
        </body>
      </html>
    `;
   
    const newWindow = window.open('', '', 'width=400,height=600');
    newWindow.document.write(receiptContent);
    newWindow.document.close();
  };
  return (
    <div className="cash-register">
      <div className="cash-register-content"></div>
      <div className="logo-container">
        <img src="https://www.gardeco.se/images/logos/Logo_gardeco.png" alt="Gardeco Logo" className="logo" />
      </div>
      
      <div className="main-section">
        <div className="left-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Sök efter produktnamn eller artikelnummer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>
          <div className="products-column">
            <Products 
              productsData={productsData}
              searchTerm={searchTerm}
              addToCart={addToCart}
              formatProductPrice={formatProductPrice}
            />
          </div>
        </div>

        <div className="right-section">
          <div className="top-button-container">
            <div className="menu-container">
              <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                ☰ Meny
              </button>
              {isMenuOpen && (
                <div className="menu-dropdown">
                  {menuOptions.map(option => (
                    <button 
                      key={option.id}
                      className="menu-option"
                      onClick={option.action}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="customer-button" onClick={() => setIsNewCustomerOpen(true)}>
              Registrera kund
            </button>
            <button className="customer-button existing" onClick={() => setIsExistingCustomerOpen(true)}>
              Existerande kund
            </button>
          </div>
          <div className="cart-column">
            <Cart
              ref={cartContainerRef}
              cart={cart}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
              total={total}
              setIsPaymentOpen={setIsPaymentOpen}
              formatPrice={formatCartPrice} 
              formatProductName={formatProductName}
              parkPurchase={parkPurchase}
              cancelPurchase={cancelPurchase}
            />
          </div>
        </div>
      </div>
      {/* Betalningsmodal */}
      {isPaymentOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentOpen(false)}>
          <div className="payment-options" onClick={e => e.stopPropagation()}>
            <h2>Betalningsalternativ</h2>
            <div className="payment-methods">
              {selectedPaymentMethod === 'cash' ? (
                <div className="payment-input-container">
                  <input
                    type="number"
                    placeholder="Mottaget belopp"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                  />
                  <button onClick={handleCashPayment}>
                    <span>Slutför kontant betalning</span>
                    <Banknote size={24} />
                  </button>
                  <button onClick={() => setSelectedPaymentMethod('')}>
                    <span>Tillbaka</span>
                    <ArrowLeft size={24} />
                  </button>
                </div>
              ) : selectedPaymentMethod === 'giftcard' ? (
                <div className="payment-input-container">
                  <input
                    type="text"
                    placeholder="Presentkortsnummer"
                    value={giftCardNumber}
                    onChange={(e) => setGiftCardNumber(e.target.value)}
                  />
                  <button onClick={handleGiftCardPayment}>
                    <span>Använd presentkort</span>
                    <Gift size={24} />
                  </button>
                  <button onClick={() => setSelectedPaymentMethod('')}>
                    <span>Tillbaka</span>
                    <ArrowLeft size={24} />
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => {
                    alert('Betalning med kreditkort');
                    generateReceipt();
                    setIsPaymentOpen(false);
                    setSelectedPaymentMethod('');
                    setCart([]);
                  }}>
                    <span>Kort</span>
                    <CreditCard size={24} />
                  </button>
                  <button onClick={() => {
                    generateReceipt();
                    setIsPaymentOpen(false);
                    setSelectedPaymentMethod('');
                    setCart([]);
                  }}>
                    <span>Swish</span>
                    <Smartphone size={24} />
                  </button>
                  <button onClick={() => {
                    generateReceipt();
                    setIsPaymentOpen(false);
                    setSelectedPaymentMethod('');
                    setCart([]);
                  }}>
                    <span>Klarna</span>
                    <span style={{
                      fontSize: '70px',
                      fontWeight: 'bold',
                      fontFamily: 'Arial'
                    }}>K</span>
                  </button>
                  <button onClick={() => {
                    generateReceipt();
                    setIsPaymentOpen(false);
                    setSelectedPaymentMethod('');
                    setCart([]);
                  }}>
                    <span>Faktura</span>
                    <FileText size={24} />
                  </button>
                  <button onClick={() => {
                    setSelectedPaymentMethod('cash');
                    setReceivedAmount('');
                  }}>
                    <span>Kontant</span>
                    <Banknote size={24} />
                  </button>
                  <button onClick={() => {
                    setSelectedPaymentMethod('giftcard');
                    setGiftCardNumber('');
                  }}>
                    <span>Presentkort</span>
                    <Gift size={24} />
                  </button>
                  <button onClick={() => {
                    generateReceipt();
                    setIsPaymentOpen(false);
                    setSelectedPaymentMethod('');
                    setCart([]);
                  }}>
                    <span>Delbetalning</span>
                    <Calendar size={24} />
                  </button>
                  <button
                    onClick={() => setIsPaymentOpen(false)}
                    className="back-button"
                  >
                    <span>Tillbaka</span>
                    <ArrowLeft size={24} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Ny kund Modal */}
      {isNewCustomerOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true"
          aria-labelledby="register-dialog-title" onClick={() => setIsNewCustomerOpen(false)}>
          <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
            <h2 id="register-dialog-title">Registrera ny kund</h2>
            <form onSubmit={handleRegisterCustomer}>
              <div className="form-fields">
                <input type="text" placeholder="Namn" value={customerInfo.name}
                  onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} required />
                <input type="email" placeholder="E-post" value={customerInfo.email}
                  onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} required />
                <input type="tel" placeholder="Telefon" value={customerInfo.phone}
                  onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} required />
                <input type="text" placeholder="Personnummer (ÅÅÅÅMMDD-XXXX)" value={customerInfo.personnummer}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || /^[\d-]*$/.test(value)) {
                      if (value.length <= 13) {
                        setCustomerInfo({...customerInfo, personnummer: value});
                      }
                    }
                  }}
                  pattern="\d{8}-\d{4}"
                  title="Ange personnummer i formatet ÅÅÅÅMMDD-XXXX"
                  required
                />
              </div>
              <div className="dialog-buttons">
                <button type="button" onClick={() => {
                  setIsNewCustomerOpen(false);
                  setCustomerInfo({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    personnummer: ''
                  });
                }}>
                  Avbryt
                </button>
                <button type="submit" className="primary-button">
                  Registrera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Existerande kund Modal */}
      {isExistingCustomerOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true"
          aria-labelledby="search-dialog-title" onClick={() => setIsExistingCustomerOpen(false)}>
          <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
            <h2 id="search-dialog-title">Hitta kund</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const searchValue = customerInfo.personnummer || customerInfo.phone;
              if (!searchValue) {
                alert('Vänligen ange antingen personnummer eller telefonnummer');
                return;
              }
              console.log('Söker efter existerande kund:', customerInfo);
              alert('Kund registrerad på kassan!');
              setIsExistingCustomerOpen(false);
              setCustomerInfo({
                name: '',
                email: '',
                phone: '',
                address: '',
                personnummer: ''
              });
            }}>
              <div className="form-fields">
                <input
                  type="tel"
                  placeholder="Telefonnummer"
                  value={customerInfo.phone}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || /^[\d-+\s]*$/.test(value)) {
                      setCustomerInfo({...customerInfo, phone: value, personnummer: ''});
                    }
                  }}
                />
                <div className="search-separator">
                  <span>eller</span>
                </div>
                <input
                  type="text"
                  placeholder="Personnummer (ÅÅÅÅMMDD-XXXX)"
                  value={customerInfo.personnummer}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || /^[\d-]*$/.test(value)) {
                      if (value.length <= 13) {
                        setCustomerInfo({...customerInfo, personnummer: value, phone: ''});
                      }
                    }
                  }}
                  pattern="\d{8}-\d{4}"
                  title="Ange personnummer i formatet ÅÅÅÅMMDD-XXXX"
                />
              </div>
              <div className="dialog-buttons">
                <button type="button" onClick={() => {
                  setIsExistingCustomerOpen(false);
                  setCustomerInfo({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    personnummer: ''
                  });
                }}>
                  Avbryt
                </button>
                <button type="submit" className="primary-button">
                  Sök kund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashRegister;