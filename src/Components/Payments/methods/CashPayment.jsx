import React, { useState, useEffect } from 'react';
import './CashPayment.css';
import { RotateCcw, Plus, Minus, CheckCircle, Loader, Banknote, ArrowLeft } from 'lucide-react';

const CashPayment = ({
  remainingTotal,
  paymentStatus: externalPaymentStatus,
  formatPrice,
  completePayment,
  onBack,
}) => {
  const [amount, setAmount] = useState(remainingTotal);
  const [receivedAmount, setReceivedAmount] = useState('');
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

  const handleReceivedAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setReceivedAmount(value);
    }
  };

  // Beräkna växel
  const calculateChange = () => {
    const received = parseFloat(receivedAmount) || 0;
    const toPay = amount;
    return Math.max(0, received - toPay);
  };

  // Validering
  const isFormValid = () => {
    const received = parseFloat(receivedAmount) || 0;
    return amount > 0 && received >= amount;
  };

  const processCashPayment = () => {
    if (!isFormValid()) {
      return;
    }

    setInternalPaymentStatus('processing');
    setStatusMessage('');
    setShowCustomModal(true);
    
    // Simulera kontantbetalningsprocess
    setTimeout(() => {
      setStatusMessage('Registrerar betalning...');
      
      setTimeout(() => {
        setInternalPaymentStatus('completed');
        setStatusMessage('Betalning registrerad!');
        
        setTimeout(() => {
          setShowCustomModal(false);
          completePayment('cash', amount, { 
            receivedAmount: parseFloat(receivedAmount),
            change: calculateChange() 
          });
        }, 1500);
      }, 1500);
    }, 500);
  };

  // Formatera växelpriset
  const formattedChange = () => {
    return formatPrice ? formatPrice(calculateChange()) : `${calculateChange().toFixed(2)} kr`;
  };

  return (
    <div className="cash-container">
      <h2>Kontantbetalning</h2>
      
      <div className="cash-amount-total">
        <div className="cash-amount-layout">
          <span className="cash-amount-label">Belopp att betala:</span>
          <div className="cash-amount-center-controls">
            <button
              onClick={decreaseAmount}
              className="cash-amount-button"
              disabled={internalPaymentStatus !== 'idle' || amount <= 0}
            >
              <Minus size={16} />
            </button>
            <div className="cash-amount-display">
              <input
                type="number"
                value={amount === 0 ? '' : amount}
                onChange={handleAmountChange}
                onKeyDown={handleKeyDown}
                className="cash-amount-input"
                disabled={internalPaymentStatus !== 'idle'}
                step="0.01"
              />
              <span className="cash-currency">kr</span>
            </div>
            <button
              onClick={increaseAmount}
              className="cash-amount-button"
              disabled={internalPaymentStatus !== 'idle' || amount >= remainingTotal}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={resetAmount}
              className="cash-reset-button"
              disabled={internalPaymentStatus !== 'idle' || amount === remainingTotal}
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <div className="cash-amount-spacer"></div>
        </div>
      </div>

      <div className="cash-form">
        <label htmlFor="receivedAmount" className="cash-form-label">Mottaget belopp</label>
        <div className="cash-received-input-container">
          <input
            type="text"
            id="receivedAmount"
            name="receivedAmount"
            value={receivedAmount}
            onChange={handleReceivedAmountChange}
            placeholder="0.00"
            disabled={internalPaymentStatus !== 'idle'}
            className="cash-received-input"
          />
          <span className="cash-received-currency">kr</span>
        </div>
      </div>
      
      {parseFloat(receivedAmount) > 0 && (
        <div className="cash-change-container">
          <div className="cash-change-label">Växel att återlämna</div>
          <div className="cash-change-amount">{formattedChange()}</div>
        </div>
      )}

      <div className="cash-info-box">
        Kontrollera noggrant att rätt belopp har mottagits innan betalningen bekräftas.
      </div>

      <button
        onClick={processCashPayment}
        className="cash-payment-button"
        disabled={internalPaymentStatus !== 'idle' || !isFormValid()}
      >
        <Banknote size={18} style={{ marginRight: '8px' }} />
        Bekräfta kontantbetalning
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

export default CashPayment;