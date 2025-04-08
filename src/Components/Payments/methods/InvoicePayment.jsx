import React, { useState, useEffect } from 'react';
import './InvoicePayment.css';
import { RotateCcw, Plus, Minus, CheckCircle, Loader, FileText, ArrowLeft, Mail, Phone } from 'lucide-react';

const InvoicePayment = ({
  remainingTotal,
  paymentStatus: externalPaymentStatus,
  formatPrice,
  completePayment,
  onBack,
}) => {
  const [amount, setAmount] = useState(remainingTotal);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [internalPaymentStatus, setInternalPaymentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [invoiceMethod, setInvoiceMethod] = useState('email'); // 'email' eller 'sms'

  useEffect(() => {
    setAmount(remainingTotal);
  }, [remainingTotal]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Om fältet är tomt, sätt amount till 0
    if (value === '') {
      setAmount(0);
      return;
    }

    const newAmount = parseFloat(value);
    // Om värdet är ett giltigt nummer, uppdatera amount
    if (!isNaN(newAmount)) {
      const adjustedAmount = Math.min(Math.max(newAmount, 0), remainingTotal);
      setAmount(adjustedAmount);
    }
  };

  const handleKeyDown = (e) => {
    // Hantera backspace och delete för att säkerställa att radering fungerar
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selectionStart = e.target.selectionStart;
      const selectionEnd = e.target.selectionEnd;
      const value = e.target.value;

      // Om hela värdet är markerat och användaren trycker på backspace/delete, töm fältet
      if (selectionStart === 0 && selectionEnd === value.length) {
        setAmount(0);
        e.preventDefault(); // Förhindra standardbeteende om det behövs
      }
    }
  };

  const increaseAmount = () => {
    const newAmount = Math.round((amount + 1) * 100) / 100;
    const adjustedAmount = Math.min(newAmount, remainingTotal);
    setAmount(adjustedAmount);
  };

  const decreaseAmount = () => {
    const newAmount = Math.max(0, Math.round((amount - 1) * 100) / 100);
    setAmount(newAmount);
  };

  const resetAmount = () => {
    setAmount(remainingTotal);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZåäöÅÄÖ\s]+$/;
    if (!nameRegex.test(name)) {
      return 'Namn får endast innehålla bokstäver';
    }
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Ange en giltig e-postadress';
    }
    return '';
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^07[\d]{8}$/;
    if (!phoneRegex.test(phone)) {
      return 'Ange ett giltigt telefonnummer (07XXXXXXXX)';
    }
    return '';
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));

    // Validate fields on change
    if (name === 'name') {
      setErrors(prev => ({
        ...prev,
        name: validateName(value)
      }));
    } else if (name === 'email') {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value)
      }));
    } else if (name === 'phone') {
      setErrors(prev => ({
        ...prev,
        phone: validatePhone(value)
      }));
    }
  };

  // Validering av formulär
  const isFormValid = () => {
    if (invoiceMethod === 'email') {
      return customerInfo.name && 
             customerInfo.email && 
             !errors.name && 
             !errors.email;
    } else {
      return customerInfo.name && 
             customerInfo.phone && 
             !errors.name &&
             !errors.phone;
    }
  };

  const sendInvoice = () => {
    if (amount <= 0 || !isFormValid()) {
      return;
    }

    setInternalPaymentStatus('processing');
    setStatusMessage('');
    setShowCustomModal(true);
    
    // Simulera fakturautskick
    setTimeout(() => {
      setStatusMessage('Skapar faktura...');
      
      setTimeout(() => {
        setStatusMessage(invoiceMethod === 'email' 
          ? 'Skickar faktura via e-post...' 
          : 'Skickar faktura via SMS...');
        
        setTimeout(() => {
          setInternalPaymentStatus('completed');
          setStatusMessage('Faktura skickad!');
          
          setTimeout(() => {
            setShowCustomModal(false);
            completePayment('invoice', amount, { 
              ...customerInfo, 
              method: invoiceMethod 
            });
          }, 1500);
        }, 1500);
      }, 1500);
    }, 500);
  };

  return (
    <div className="invoice-container">
      <h2>Fakturabetalning</h2>
      
      <div className="invoice-amount-section">
        <div className="invoice-amount-layout">
          <span className="invoice-amount-label">Belopp att betala:</span>
          <div className="invoice-amount-controls">
            <button
              onClick={decreaseAmount}
              className="invoice-amount-button"
              disabled={internalPaymentStatus !== 'idle' || amount <= 0}
              aria-label="Minska belopp med 1 krona"
            >
              <Minus size={16} />
            </button>
            <div className="invoice-amount-center">
              <div className="invoice-amount-display">
                <input
                  type="number"
                  value={amount === 0 ? '' : amount}
                  onChange={handleAmountChange}
                  onKeyDown={handleKeyDown}
                  className="invoice-amount-input"
                  disabled={internalPaymentStatus !== 'idle'}
                  step="0.01"
                />
                <span className="invoice-currency">kr</span>
              </div>
            </div>
            <button
              onClick={increaseAmount}
              className="invoice-amount-button"
              disabled={internalPaymentStatus !== 'idle' || amount >= remainingTotal}
              aria-label="Öka belopp med 1 krona"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={resetAmount}
              className="invoice-reset-button"
              disabled={internalPaymentStatus !== 'idle' || amount === remainingTotal}
              aria-label="Återställ belopp till ursprungligt värde"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <div className="invoice-amount-spacer"></div>
        </div>
      </div>

      <div className="invoice-method-tabs">
        <button 
          className={`invoice-method-tab ${invoiceMethod === 'email' ? 'active' : ''}`}
          onClick={() => setInvoiceMethod('email')}
          disabled={internalPaymentStatus !== 'idle'}
        >
          <Mail size={16} />
          <span>E-post</span>
        </button>
        <button 
          className={`invoice-method-tab ${invoiceMethod === 'sms' ? 'active' : ''}`}
          onClick={() => setInvoiceMethod('sms')}
          disabled={internalPaymentStatus !== 'idle'}
        >
          <Phone size={16} />
          <span>SMS</span>
        </button>
      </div>

      <div className="invoice-form">
        <div className="invoice-form-group">
          <label htmlFor="name">Namn*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleCustomerInfoChange}
            placeholder="Kundens namn"
            disabled={internalPaymentStatus !== 'idle'}
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        {invoiceMethod === 'email' ? (
          <div className="invoice-form-group">
            <label htmlFor="email">E-postadress*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={customerInfo.email}
              onChange={handleCustomerInfoChange}
              placeholder="exempel@mail.se"
              disabled={internalPaymentStatus !== 'idle'}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
        ) : (
          <div className="invoice-form-group">
            <label htmlFor="phone">Telefonnummer*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={handleCustomerInfoChange}
              placeholder="07XXXXXXXX"
              disabled={internalPaymentStatus !== 'idle'}
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
        )}
      </div>

      <div className="invoice-info-box">
        Fakturan skickas via {invoiceMethod === 'email' ? 'e-post' : 'SMS'} 
        och har 14 dagars betalningsvillkor
      </div>

      <button
        onClick={sendInvoice}
        className="invoice-payment-button"
        disabled={internalPaymentStatus !== 'idle' || amount <= 0 || !isFormValid()}
        aria-label="Skapa och skicka faktura"
      >
        <FileText size={18} style={{ marginRight: '8px' }} />
        Skapa faktura
      </button>
      
      {/* Tillbakaknapp placerad längst ner */}
      <button 
        onClick={onBack} 
        className="payment-method-back-button"
        disabled={internalPaymentStatus !== 'idle'}
      >
        <ArrowLeft size={18} />
        Tillbaka
      </button>

      {/* Modal för betalningsstatusar */}
      {showCustomModal && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <div className={`payment-status-modal ${
              internalPaymentStatus === 'completed' ? 'success' : 
              internalPaymentStatus === 'processing' ? 'processing' : ''
            }`}>
              {internalPaymentStatus === 'processing' ? (
                <Loader className="status-icon spinning" size={36} />
              ) : internalPaymentStatus === 'completed' ? (
                <CheckCircle className="status-icon" size={36} />
              ) : null}
              
              <div className="status-message">
                {statusMessage}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePayment;