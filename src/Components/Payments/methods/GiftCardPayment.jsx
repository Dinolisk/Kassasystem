import React, { useState, useEffect } from 'react';
import './GiftCardPayment.css';
import { RotateCcw, Plus, Minus, CheckCircle, Loader, Gift, ArrowLeft } from 'lucide-react';

const GiftCardPayment = ({
  remainingTotal,
  paymentStatus: externalPaymentStatus,
  formatPrice,
  completePayment,
  onBack,
}) => {
  const [amount, setAmount] = useState(remainingTotal);
  const [giftCardInfo, setGiftCardInfo] = useState({
    cardNumber: ''
  });
  const [internalPaymentStatus, setInternalPaymentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

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

  const handleGiftCardInfoChange = (e) => {
    const { name, value } = e.target;
    setGiftCardInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };

  // Validering av formulär
  const isFormValid = () => {
    return giftCardInfo.cardNumber && giftCardInfo.cardNumber.length >= 8;
  };

  const processGiftCard = () => {
    if (amount <= 0 || !isFormValid()) {
      return;
    }

    setInternalPaymentStatus('processing');
    setStatusMessage('');
    setShowCustomModal(true);
    
    // Simulera presentkortsbetalning
    setTimeout(() => {
      setStatusMessage('Verifierar presentkortskod...');
      
      setTimeout(() => {
        setStatusMessage('Kontrollerar saldo...');
        
        setTimeout(() => {
          setStatusMessage('Drar belopp från presentkort...');
          
          setTimeout(() => {
            setInternalPaymentStatus('completed');
            setStatusMessage('Betalning godkänd!');
            
            setTimeout(() => {
              setShowCustomModal(false);
              completePayment('giftcard', amount, giftCardInfo);
            }, 1500);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 500);
  };

  return (
    <div className="giftcard-container">
      <h2>Presentkortsbetalning</h2>
      
      <div className="giftcard-amount-section">
        <div className="giftcard-amount-layout">
          <span className="giftcard-amount-label">Belopp att betala:</span>
          <div className="giftcard-amount-controls">
            <button
              onClick={decreaseAmount}
              className="giftcard-amount-button"
              disabled={internalPaymentStatus !== 'idle' || amount <= 0}
              aria-label="Minska belopp med 1 krona"
            >
              <Minus size={16} />
            </button>
            <div className="giftcard-amount-center">
              <div className="giftcard-amount-display">
                <input
                  type="number"
                  value={amount === 0 ? '' : amount}
                  onChange={handleAmountChange}
                  onKeyDown={handleKeyDown}
                  className="giftcard-amount-input"
                  disabled={internalPaymentStatus !== 'idle'}
                  step="0.01"
                />
                <span className="giftcard-currency">kr</span>
              </div>
            </div>
            <button
              onClick={increaseAmount}
              className="giftcard-amount-button"
              disabled={internalPaymentStatus !== 'idle' || amount >= remainingTotal}
              aria-label="Öka belopp med 1 krona"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={resetAmount}
              className="giftcard-reset-button"
              disabled={internalPaymentStatus !== 'idle' || amount === remainingTotal}
              aria-label="Återställ belopp till ursprungligt värde"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <div className="giftcard-amount-spacer"></div>
        </div>
      </div>

      <div className="giftcard-form">
        <div className="giftcard-form-group">
          <label htmlFor="cardNumber">Presentkortskod*</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={giftCardInfo.cardNumber}
            onChange={handleGiftCardInfoChange}
            placeholder="XXXX-XXXX-XXXX"
            disabled={internalPaymentStatus !== 'idle'}
          />
          <small className="giftcard-form-help">Ange koden som finns på baksidan av ditt presentkort eller i ditt e-postmeddelande</small>
        </div>
      </div>

      <div className="giftcard-info-box">
        Presentkortets värde kommer att dras direkt vid betalning.
        Eventuellt kvarvarande saldo kan användas vid nästa köp.
      </div>

      <button
        onClick={processGiftCard}
        className="giftcard-payment-button"
        disabled={internalPaymentStatus !== 'idle' || amount <= 0 || !isFormValid()}
        aria-label="Betala med presentkort"
      >
        <Gift size={18} style={{ marginRight: '8px' }} />
        Betala med presentkort
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

export default GiftCardPayment;