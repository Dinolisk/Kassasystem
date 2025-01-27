import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CashRegister.css';
import Cart from './Cart.jsx';


function CashRegister() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const cartContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isExistingCustomerOpen, setIsExistingCustomerOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    
    name: '',
    email: '',
    phone: '',
    address: '',
    personnummer: ''
  });
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

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {  // Visar knappen efter 300px scroll
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      
      // Kolla om en ny produkt har lagts till genom att jämföra antalet produkter
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
      
      // Spara nuvarande cart för framtida jämförelse
      localStorage.setItem('previousCart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('previousCart');
    }
  }, [cart]);

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

  const validatePersonnummer = (pnr) => {
    const regex = /^\d{8}-\d{4}$/;
    if (!regex.test(pnr)) {
      return false;
    }

    const year = parseInt(pnr.substring(0, 4));
    const month = parseInt(pnr.substring(4, 6));
    const day = parseInt(pnr.substring(6, 8));

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      return false;
    }

    return true;
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
    setCart([]);
  };

  const handleGiftCardPayment = () => {
    if (giftCardNumber.length < 8) {
      alert('Vänligen ange ett giltigt presentkortsnummer');
      return;
    }
    generateReceipt();
    setIsPaymentOpen(false);
    setCart([]);
  };
  const parkPurchase = (e) => {
    try {
      // Förhindra standardbeteende
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
  
      if (cart.length === 0) {
        alert('Kundvagnen är tom');
        return;
      }
  
      if (window.confirm('Vill du parkera detta köp?')) {
        // Spara köpet
        const parkedPurchase = {
          id: Date.now(),
          cart: cart,
          timestamp: new Date().toISOString()
        };
  
        // Spara i localStorage
        const parkedPurchases = JSON.parse(localStorage.getItem('parkedPurchases') || '[]');
        parkedPurchases.push(parkedPurchase);
        localStorage.setItem('parkedPurchases', JSON.stringify(parkedPurchases));
  
        // Töm kundvagnen
        setCart([]);
        alert('Köpet har parkerats');
      }
    } catch (error) {
      console.error('Error in parkPurchase:', error);
      alert('Ett fel uppstod när köpet skulle parkeras');
    }
    
    // Säkerställ att funktionen alltid returnerar false
    return false;
  };
  
  const cancelPurchase = () => {
    if (window.confirm('Är du säker på att du vill avbryta köpet?')) {
      setCart([]);
    }
  };
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
            .receipt-container { font-family: Arial, sans-serif; padding: 20px; }
            .company-name { font-size: 24px; font-weight: bold; }
            .company-info, .tax-info, .thank-you { margin-top: 20px; }
            .item-list { list-style: none; padding: 0; }
            .item-list li { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <h1 class="company-name">Gardeco</h1>
            <div class="company-info">
              <p>Storgatan 12, 123 45 Stockholm</p>
              <p>Telefon: 08-123 45 67</p>
              <p>Org. nr: 556123-4567</p>
            </div>
            <div class="date-time">
              <p>${dateString} ${timeString}</p>
            </div>
            <ul class="item-list">
              ${cart.map(item => `
                <li>
                  <span>${item.title} x${item.quantity}</span>
                  <span>${formatPrice(item.price * item.quantity)}</span>
                </li>
              `).join('')}
            </ul>
            <div class="tax-info">
              <p>Netto: ${formatPrice(netto)}</p>
              <p>Moms (25%): ${formatPrice(moms)}</p>
              <p>Brutto: ${formatPrice(brutto)}</p>
            </div>
            <div class="thank-you">
              <p>Tack för ditt köp!</p>
              <p>Vi uppskattar ditt stöd för Gardeco.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const newWindow = window.open('', '', 'width=600,height=800');
    newWindow.document.write(receiptContent);
    newWindow.document.close();
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const filteredProducts = productsData.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="cash-register">
      <div className="cash-register-content"></div>
      <div className="logo-container">
  <img src="https://www.gardeco.se/images/logos/Logo_gardeco.png" alt="Gardeco Logo" className="logo" />
</div>
      <div className="top-section">
        <div className="menu-container">
          <button 
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              {menuOptions.map(option => (
                <button 
                  key={option.id} 
                  className="menu-option"
                  onClick={() => {
                    option.action();
                    setIsMenuOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Sök efter produktnamn eller artikelnummer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="products-list">
          {filteredProducts.map(product => (
            <div 
            key={product.id} 
            className="product-card"
            onClick={() => addToCart(product)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                addToCart(product);
              }
            }}
          >
            <img src={product.thumbnail} alt={product.title} />
            <div className="product-info">
              <h3>{product.title}</h3>
              <p className="description">{product.description}</p>
              <p className="price">{formatPrice(product.price)}</p>
            </div>
          </div>
          ))}
        </div>

        <div className="cart-section">
  <div className="customer-registration">
    <button className="register-button existing-customer">
      Existerande kund
    </button>
    <button className="register-button">
      Registrera kund
    </button>
  </div>
  {showScrollTop && (
  <button 
    className="scroll-top-button"
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  >
    ↑
  </button>
)}
  <Cart 
  ref={cartContainerRef}
  cart={cart}
  removeFromCart={removeFromCart}
  updateQuantity={updateQuantity}
  total={total}
  setIsPaymentOpen={setIsPaymentOpen}
  formatPrice={formatPrice}
  formatProductName={formatProductName}
  parkPurchase={parkPurchase}
  cancelPurchase={cancelPurchase}
/>
</div>
      </div>

      {isNewCustomerOpen && (
        <div className="modal-overlay" onClick={() => setIsNewCustomerOpen(false)}>
          <div className="registration-form" onClick={e => e.stopPropagation()}>
            <h2>Registrera ny kund</h2>
            <form onSubmit={handleRegisterCustomer}>
              <input
                type="text"
                placeholder="Namn"
                value={customerInfo.name}
                onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="E-post"
                value={customerInfo.email}
                onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                required
              />
              <input
                type="tel"
                placeholder="Telefon"
                value={customerInfo.phone}
                onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Personnummer (ÅÅÅÅMMDD-XXXX)"
                value={customerInfo.personnummer}
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
              <div className="form-buttons">
                <button type="submit">Registrera</button>
                <button type="button" onClick={() => setIsNewCustomerOpen(false)}>
                Avbryt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExistingCustomerOpen && (
        <div className="modal-overlay" onClick={() => setIsExistingCustomerOpen(false)}>
          <div className="registration-form" onClick={e => e.stopPropagation()}>
            <h2>Hitta kund</h2>
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
              <div className="search-option">
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
              <div className="form-buttons">
                <button type="submit">Sök kund</button>
                <button type="button" onClick={() => {
                  setIsExistingCustomerOpen(false);
                  setCustomerInfo({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    personnummer: ''
                  });
                }}>Avbryt</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <button onClick={handleCashPayment}>Slutför kontant betalning</button>
                  <button onClick={() => setSelectedPaymentMethod('')}>Tillbaka</button>
                </div>
              ) : selectedPaymentMethod === 'giftcard' ? (
                <div className="payment-input-container">
                  <input
                    type="text"
                    placeholder="Presentkortsnummer"
                    value={giftCardNumber}
                    onChange={(e) => setGiftCardNumber(e.target.value)}
                  />
                  <button onClick={handleGiftCardPayment}>Använd presentkort</button>
                  <button onClick={() => setSelectedPaymentMethod('')}>Tillbaka</button>
                </div>
              ) : (
                <>
                  <button onClick={() => alert('Betalning med kreditkort')}>Kort</button>
                  <button onClick={() => { generateReceipt(); setIsPaymentOpen(false); }}>Swish</button>
                  <button onClick={() => { generateReceipt(); setIsPaymentOpen(false); }}>Klarna</button>
                  <button onClick={() => setSelectedPaymentMethod('cash')}>Kontant</button>
                  <button onClick={() => setSelectedPaymentMethod('giftcard')}>Presentkort</button>
                  <button onClick={() => setIsPaymentOpen(false)} className="back-button">Avbryt</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashRegister;