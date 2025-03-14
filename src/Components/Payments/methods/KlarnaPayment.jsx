import React, { useState, useEffect } from 'react';
import './KlarnaPayment.css';
import { RotateCcw, Plus, Minus, CheckCircle, Loader, ArrowLeft, CreditCard, Clock, Receipt } from 'lucide-react';

const KlarnaPayment = ({
  remainingTotal,
  paymentStatus: externalPaymentStatus,
  formatPrice,
  completePayment,
  onBack,
}) => {
  const [amount, setAmount] = useState(remainingTotal);
  const [customerInfo, setCustomerInfo] = useState({
    personalNumber: '',
    email: '',
    phone: ''
  });
  const [internalPaymentStatus, setInternalPaymentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [klarnaMethod, setKlarnaMethod] = useState('invoice');

  useEffect(() => {
    setAmount(remainingTotal);
  }, [remainingTotal]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setAmount(0);
      return;
    }

    const newAmount = parseFloat(value);
    if (!isNaN(newAmount)) {
      const adjustedAmount = Math.min(Math.max(newAmount, 0), remainingTotal);
      setAmount(adjustedAmount);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selectionStart = e.target.selectionStart;
      const selectionEnd = e.target.selectionEnd;
      const value = e.target.value;

      if (selectionStart === 0 && selectionEnd === value.length) {
        setAmount(0);
        e.preventDefault();
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

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return customerInfo.personalNumber && 
           customerInfo.personalNumber.length >= 10 && 
           customerInfo.email && 
           customerInfo.email.includes('@') && 
           customerInfo.phone && 
           customerInfo.phone.length >= 8;
  };

  const getKlarnaMethodLabel = () => {
    switch(klarnaMethod) {
      case 'invoice': return 'Klarna Faktura';
      case 'installment': return 'Klarna Delbetalning';
      case 'direct': return 'Klarna Direktbetalning';
      default: return 'Klarna';
    }
  };

  const processKlarnaPayment = () => {
    if (amount <= 0 || !isFormValid()) {
      return;
    }

    setInternalPaymentStatus('processing');
    setStatusMessage('');
    setShowCustomModal(true);

    setTimeout(() => {
      setStatusMessage('Kontaktar Klarna...');

      setTimeout(() => {
        setStatusMessage('Verifierar personuppgifter...');

        setTimeout(() => {
          if (klarnaMethod === 'direct') {
            setStatusMessage('Omdirigerar till Klarna...');
          } else {
            setStatusMessage('Genomför kreditprövning...');
          }

          setTimeout(() => {
            setInternalPaymentStatus('completed');
            setStatusMessage(klarnaMethod === 'direct' 
              ? 'Betalning genomförd!' 
              : 'Betalning godkänd!');

            setTimeout(() => {
              setShowCustomModal(false);
              completePayment('klarna', amount, { 
                ...customerInfo, 
                method: klarnaMethod 
              });
            }, 1500);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 500);
  };

  return (
    <div className="klarna-container">
      <h2>Klarna</h2>
      
      <div className="klarna-amount-total">
        <div className="klarna-amount-layout">
          <span className="klarna-amount-label">Belopp att betala:</span>
          <div className="klarna-amount-center-controls">
            <button
              onClick={decreaseAmount}
              className="klarna-amount-button"
              disabled={internalPaymentStatus !== 'idle' || amount <= 0}
            >
              <Minus size={16} />
            </button>
            <div className="klarna-amount-display">
              <input
                type="number"
                value={amount === 0 ? '' : amount}
                onChange={handleAmountChange}
                onKeyDown={handleKeyDown}
                className="klarna-amount-input"
                disabled={internalPaymentStatus !== 'idle'}
                step="0.01"
              />
              <span className="klarna-currency">kr</span>
            </div>
            <button
              onClick={increaseAmount}
              className="klarna-amount-button"
              disabled={internalPaymentStatus !== 'idle' || amount >= remainingTotal}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={resetAmount}
              className="klarna-reset-button"
              disabled={internalPaymentStatus !== 'idle' || amount === remainingTotal}
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <div className="klarna-amount-spacer"></div>
        </div>
      </div>

      <div className="klarna-method-tabs">
        <button 
          className={`klarna-method-tab ${klarnaMethod === 'invoice' ? 'active' : ''}`}
          onClick={() => setKlarnaMethod('invoice')}
          disabled={internalPaymentStatus !== 'idle'}
        >
          <Receipt size={16} />
          <span>Faktura</span>
        </button>
        <button 
          className={`klarna-method-tab ${klarnaMethod === 'installment' ? 'active' : ''}`}
          onClick={() => setKlarnaMethod('installment')}
          disabled={internalPaymentStatus !== 'idle'}
        >
          <Clock size={16} />
          <span>Delbetalning</span>
        </button>
        <button 
          className={`klarna-method-tab ${klarnaMethod === 'direct' ? 'active' : ''}`}
          onClick={() => setKlarnaMethod('direct')}
          disabled={internalPaymentStatus !== 'idle'}
        >
          <CreditCard size={16} />
          <span>Direktbetalning</span>
        </button>
      </div>

      <div className="klarna-form">
        <div className="klarna-form-row">
          <div className="klarna-form-group">
            <label htmlFor="personalNumber">Personnummer*</label>
            <input
              type="text"
              id="personalNumber"
              name="personalNumber"
              value={customerInfo.personalNumber}
              onChange={handleCustomerInfoChange}
              placeholder="ÅÅÅÅMMDD-XXXX"
              disabled={internalPaymentStatus !== 'idle'}
            />
          </div>
          
          <div className="klarna-form-group">
            <label htmlFor="phone">Mobilnummer*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={handleCustomerInfoChange}
              placeholder="07XXXXXXXX"
              disabled={internalPaymentStatus !== 'idle'}
            />
          </div>
        </div>
        
        <div className="klarna-form-group">
          <label htmlFor="email">E-postadress*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleCustomerInfoChange}
            placeholder="exempel@mail.se"
            disabled={internalPaymentStatus !== 'idle'}
          />
          <small className="klarna-form-help">Du får bekräftelse och kvitto till denna e-post</small>
        </div>
      </div>

      <div className="klarna-info-box">
        {klarnaMethod === 'invoice' && (
          <>Fakturan skickas till din e-post. Betala inom 14 dagar.</>
        )}
        {klarnaMethod === 'installment' && (
          <>Dela upp din betalning. Från {(amount / 3).toFixed(0)} kr/mån.</>
        )}
        {klarnaMethod === 'direct' && (
          <>Säker direktbetalning via din internetbank.</>
        )}
      </div>

      <button
        onClick={processKlarnaPayment}
        className="klarna-payment-button"
        disabled={internalPaymentStatus !== 'idle' || amount <= 0 || !isFormValid()}
        aria-label={`Betala med ${getKlarnaMethodLabel()}`}
      >
        {klarnaMethod === 'invoice' ? 'Få faktura via Klarna' : 
         klarnaMethod === 'installment' ? 'Delbetala via Klarna' : 
         'Direktbetala via Klarna'}
      </button>
      
      <button 
        onClick={onBack} 
        className="payment-method-back-button"
        disabled={internalPaymentStatus !== 'idle'}
      >
        <ArrowLeft size={18} />
        Tillbaka
      </button>

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

export default KlarnaPayment;