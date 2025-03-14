import React, { useState, useEffect } from 'react';
import './SwishPayment.css';
import { RotateCcw, Plus, Minus, CheckCircle, Loader, Phone, ArrowLeft } from 'lucide-react';

// Definiera en enkel mockup-QR-kod som en komponent
const MockQrCode = () => (
  <svg
    width="140"
    height="140"
    viewBox="0 0 29 29"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="29" height="29" fill="white" />
    <rect x="0" y="0" width="9" height="9" fill="black" />
    <rect x="0" y="10" width="9" height="1" fill="black" />
    <rect x="0" y="12" width="9" height="1" fill="black" />
    <rect x="0" y="14" width="9" height="1" fill="black" />
    <rect x="0" y="16" width="9" height="1" fill="black" />
    <rect x="0" y="18" width="9" height="9" fill="black" />
    <rect x="10" y="0" width="1" height="9" fill="black" />
    <rect x="12" y="0" width="1" height="9" fill="black" />
    <rect x="14" y="0" width="1" height="9" fill="black" />
    <rect x="16" y="0" width="1" height="9" fill="black" />
    <rect x="18" y="0" width="1" height="9" fill="black" />
    <rect x="10" y="18" width="1" height="9" fill="black" />
    <rect x="12" y="18" width="1" height="9" fill="black" />
    <rect x="14" y="18" width="1" height="9" fill="black" />
    <rect x="16" y="18" width="1" height="9" fill="black" />
    <rect x="18" y="18" width="1" height="9" fill="black" />
    <rect x="20" y="0" width="9" height="9" fill="black" />
    <rect x="20" y="10" width="9" height="1" fill="black" />
    <rect x="20" y="12" width="9" height="1" fill="black" />
    <rect x="20" y="14" width="9" height="1" fill="black" />
    <rect x="20" y="16" width="9" height="1" fill="black" />
    <rect x="20" y="18" width="9" height="9" fill="black" />
    <rect x="10" y="10" width="1" height="1" fill="black" />
    <rect x="12" y="12" width="1" height="1" fill="black" />
    <rect x="14" y="14" width="1" height="1" fill="black" />
    <rect x="16" y="16" width="1" height="1" fill="black" />
    <rect x="10" y="16" width="1" height="1" fill="black" />
    <rect x="12" y="14" width="1" height="1" fill="black" />
    <rect x="14" y="12" width="1" height="1" fill="black" />
    <rect x="16" y="10" width="1" height="1" fill="black" />
    <rect x="11" y="11" width="1" height="1" fill="black" />
    <rect x="13" y="13" width="1" height="1" fill="black" />
    <rect x="15" y="15" width="1" height="1" fill="black" />
  </svg>
);

const SwishPayment = ({
  remainingTotal,
  paymentStatus: externalPaymentStatus,
  formatPrice,
  completePayment,
  onBack,
}) => {
  const [amount, setAmount] = useState(remainingTotal);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [usePhoneNumber, setUsePhoneNumber] = useState(false);
  const [internalPaymentStatus, setInternalPaymentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

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

  const toggleInputMethod = () => {
    setUsePhoneNumber(!usePhoneNumber);
    setPhoneNumber('');
  };

  const simulatePayment = () => {
    if (amount <= 0) return;
    if (usePhoneNumber && !phoneNumber) return;

    setInternalPaymentStatus('idle');
    setStatusMessage('');
    setShowCustomModal(true);

    setTimeout(() => {
      setInternalPaymentStatus('processing');
      setStatusMessage(usePhoneNumber ? 'Skickar betalningsförfrågan...' : 'QR-kod visas för kunden – vänta på betalning');

      setTimeout(() => {
        setStatusMessage('Verifierar betalning...');

        setTimeout(() => {
          setInternalPaymentStatus('completed');
          setStatusMessage('Betalning godkänd!');

          setTimeout(() => {
            setShowCustomModal(false);
            setTimeout(() => {
              completePayment('swish', amount, usePhoneNumber ? phoneNumber : null);
            }, 300);
          }, 1500);
        }, 3000);
      }, 2000);
    }, 100);
  };

  const currentPaymentStatus = internalPaymentStatus;

  return (
    <div className="swish-payment-container">
      <h2>Swish-betalning</h2>
      
      <div className="swish-amount-total">
        <div className="swish-amount-layout">
          <span className="swish-amount-label">Belopp att betala:</span>
          <div className="swish-amount-controls">
            <button
              onClick={decreaseAmount}
              className="swish-amount-button"
              disabled={currentPaymentStatus !== 'idle' || amount <= 0}
              aria-label="Minska belopp med 1 krona"
            >
              <Minus size={18} />
            </button>
            <div className="swish-amount-center">
              <div className="swish-amount-display">
                <input
                  type="number"
                  value={amount === 0 ? '' : amount}
                  onChange={handleAmountChange}
                  onKeyDown={handleKeyDown}
                  className="swish-amount-input"
                  disabled={currentPaymentStatus !== 'idle'}
                  aria-label="Belopp att betala i kronor"
                  step="0.01"
                />
                <span className="swish-currency">kr</span>
              </div>
            </div>
            <button
              onClick={increaseAmount}
              className="swish-amount-button"
              disabled={currentPaymentStatus !== 'idle' || amount >= remainingTotal}
              aria-label="Öka belopp med 1 krona"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={resetAmount}
              className="swish-reset-button"
              disabled={currentPaymentStatus !== 'idle' || amount === remainingTotal}
              aria-label="Återställ belopp till ursprungligt värde"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <div className="swish-amount-spacer"></div>
        </div>
      </div>

      <div className="swish-payment-method">
        {!usePhoneNumber ? (
          <div className="qr-code-section">
            <h3>Skanna QR-koden med Swish-appen</h3>
            <div className="qr-code-container">
              <div className="qr-code-placeholder">
                <MockQrCode />
              </div>
            </div>
          </div>
        ) : (
          <div className="phone-number-section">
            <h3>Ange kundens telefonnummer</h3>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="07XXXXXXXX"
              className="phone-input"
              disabled={currentPaymentStatus !== 'idle'}
              aria-label="Telefonnummer för Swish"
            />
          </div>
        )}

        <button
          onClick={toggleInputMethod}
          className="toggle-method-button"
          disabled={currentPaymentStatus !== 'idle'}
        >
          <Phone size={16} />
          {usePhoneNumber ? 'Byt till QR-kod' : 'Använd telefonnummer'}
        </button>
      </div>

      <button
        onClick={simulatePayment}
        className="swish-payment-button"
        disabled={currentPaymentStatus !== 'idle' || amount <= 0 || (usePhoneNumber && !phoneNumber)}
        aria-label="Skicka betalningsbegäran"
      >
        <Phone size={18} style={{ marginRight: '8px' }} />
        {usePhoneNumber ? 'Skicka Swish-begäran' : 'Registrera Swish-betalning'}
      </button>

      <button 
        onClick={onBack} 
        className="payment-method-back-button"
        disabled={currentPaymentStatus !== 'idle'}
      >
        <ArrowLeft size={18} />
        Tillbaka
      </button>

      {showCustomModal && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <div className={`payment-status-modal ${
              currentPaymentStatus === 'completed' ? 'success' : 
              currentPaymentStatus === 'processing' ? 'processing' : ''
            }`}>
              {currentPaymentStatus === 'processing' ? (
                <Loader className="status-icon spinning" size={36} />
              ) : currentPaymentStatus === 'completed' ? (
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

export default SwishPayment;