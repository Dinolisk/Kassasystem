import React, { useState, useEffect } from 'react';
import './Payments.css';  // Ändrat från Payments.css till Payment.css
import { 
  CreditCard, 
  Smartphone, 
  FileText, 
  Banknote, 
  Gift, 
  ArrowLeft,
  Split
} from 'lucide-react';

const Payments = ({ 
  isOpen, 
  onClose, 
  total, 
  onPaymentComplete, 
  formatPrice 
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [cardPaymentStatus, setCardPaymentStatus] = useState('idle');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(total);
  const [partialPayments, setPartialPayments] = useState([]);
  const [splitPaymentAmount, setSplitPaymentAmount] = useState('');
  const [splitPaymentMethod, setSplitPaymentMethod] = useState('');

  useEffect(() => {
    if (!isOpen) {
      resetAllStates();
    }
  }, [isOpen, total]);

  const resetAllStates = () => {
    setSelectedPaymentMethod('');
    setCardPaymentStatus('idle');
    setReceivedAmount('');
    setGiftCardNumber('');
    setIsSplitPayment(false);
    setRemainingAmount(total);
    setPartialPayments([]);
    setSplitPaymentAmount('');
    setSplitPaymentMethod('');
  };

  const handleRegularPayment = (method) => {
    if (method === 'card') {
      handleCardPayment();
    } else {
      handleOtherPayment(method);
    }
  };

  const handleCardPayment = () => {
    setCardPaymentStatus('waiting');
    setTimeout(() => {
      const isApproved = Math.random() < 0.9;
      if (isApproved) {
        setCardPaymentStatus('approved');
        setTimeout(() => {
          onPaymentComplete();
          onClose();
        }, 1500);
      } else {
        setCardPaymentStatus('declined');
      }
      setTimeout(() => setCardPaymentStatus('idle'), 1500);
    }, 3000);
  };

  const handleOtherPayment = (method) => {
    onPaymentComplete();
    onClose();
  };

  const handleSplitPayment = () => {
    if (!splitPaymentAmount || !splitPaymentMethod) {
      alert('Vänligen ange både belopp och betalningsmetod');
      return;
    }

    const amount = parseFloat(splitPaymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > remainingAmount) {
      alert('Vänligen ange ett giltigt belopp');
      return;
    }

    switch (splitPaymentMethod) {
      case 'card':
        handleCardSplitPayment(amount);
        break;
      case 'cash':
        handleCashSplitPayment(amount);
        break;
      default:
        handleOtherSplitPayment(amount, splitPaymentMethod);
    }
  };

  const handleCardSplitPayment = (amount) => {
    setCardPaymentStatus('waiting');
    setTimeout(() => {
      const isApproved = Math.random() < 0.9;
      if (isApproved) {
        addPartialPayment('Kort', amount);
        setCardPaymentStatus('approved');
      } else {
        setCardPaymentStatus('declined');
      }
      setTimeout(() => setCardPaymentStatus('idle'), 1500);
    }, 3000);
  };

  const handleCashSplitPayment = (amount) => {
    addPartialPayment('Kontant', amount);
  };

  const handleOtherSplitPayment = (amount, method) => {
    addPartialPayment(method, amount);
  };

  const addPartialPayment = (method, amount) => {
    const newRemainingAmount = remainingAmount - amount;
    setPartialPayments([...partialPayments, { method, amount }]);
    setRemainingAmount(newRemainingAmount);
    setSplitPaymentAmount('');
    
    if (newRemainingAmount === 0) {
      onPaymentComplete();
      onClose();
    }
  };

  if (!isOpen) return null;

  if (isSplitPayment) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content split-payment" onClick={e => e.stopPropagation()}>
          <h2>Dela upp betalning</h2>
          
          <div className="payment-summary">
            <p className="total-amount">Totalbelopp: {formatPrice(total)}</p>
            <p className="remaining-amount">Återstående: {formatPrice(remainingAmount)}</p>
            
            {partialPayments.length > 0 && (
              <div className="partial-payments-summary">
                <h3>Genomförda delbetalningar:</h3>
                {partialPayments.map((payment, index) => (
                  <div key={index} className="partial-payment-item">
                    {payment.method}: {formatPrice(payment.amount)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="split-payment-form">
            <input
              type="number"
              value={splitPaymentAmount}
              onChange={(e) => setSplitPaymentAmount(e.target.value)}
              placeholder="Ange belopp"
              max={remainingAmount}
            />
            
            <select 
              value={splitPaymentMethod}
              onChange={(e) => setSplitPaymentMethod(e.target.value)}
            >
              <option value="">Välj betalningsmetod</option>
              <option value="card">Kort</option>
              <option value="cash">Kontant</option>
              <option value="swish">Swish</option>
              <option value="giftcard">Presentkort</option>
            </select>

            <button 
              className="add-payment-button"
              onClick={handleSplitPayment}
              disabled={cardPaymentStatus === 'waiting'}
            >
              Lägg till betalning
            </button>
          </div>

          <button 
            className="back-button"
            onClick={() => setIsSplitPayment(false)}
          >
            <ArrowLeft size={45} />
            <span>Tillbaka till betalningar</span>
          </button>

          {cardPaymentStatus !== 'idle' && (
            <div className="payment-status">
              {cardPaymentStatus === 'waiting' && (
                <div className="status waiting">
                  <div className="spinner"></div>
                  <p>Väntar på kortbetalning...<br/>
                  Belopp: {formatPrice(parseFloat(splitPaymentAmount))}</p>
                </div>
              )}
              {cardPaymentStatus === 'approved' && (
                <div className="status approved">
                  <div className="checkmark">✓</div>
                  <p>Betalning godkänd!</p>
                </div>
              )}
              {cardPaymentStatus === 'declined' && (
                <div className="status declined">
                  <div className="cross">✕</div>
                  <p>Betalning nekad.<br/>Vänligen försök igen.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Betalningsalternativ</h2>
        
        <div className="payment-grid">
          <button onClick={() => handleRegularPayment('card')}>
            <CreditCard size={45} />
            <span>Kortbetalning</span>
          </button>
          
          <button onClick={() => handleRegularPayment('cash')}>
            <Banknote size={45} />
            <span>Kontant</span>
          </button>
          
          <button onClick={() => handleRegularPayment('swish')}>
            <Smartphone size={45} />
            <span>Swish</span>
          </button>
  
          <button onClick={() => handleRegularPayment('invoice')}>
            <FileText size={45} />
            <span>Faktura</span>
          </button>
          
          <button onClick={() => handleRegularPayment('giftcard')}>
            <Gift size={45} />
            <span>Presentkort</span>
          </button>
          
          <button onClick={() => setIsSplitPayment(true)}>
            <Split size={45} />
            <span>Dela upp betalning</span>
          </button>
  
          <button onClick={onClose} className="back-button">
            <ArrowLeft size={45} />
            <span>Tillbaka</span>
          </button>
        </div>
  
        {cardPaymentStatus !== 'idle' && (
          <div className="payment-status">
            {cardPaymentStatus === 'waiting' && (
              <div className="status waiting">
                <div className="spinner"></div>
                <p>Väntar på kortbetalning...<br/>
                Belopp: {formatPrice(total)}</p>
              </div>
            )}
            {cardPaymentStatus === 'approved' && (
              <div className="status approved">
                <div className="checkmark">✓</div>
                <p>Betalning godkänd!</p>
              </div>
            )}
            {cardPaymentStatus === 'declined' && (
              <div className="status declined">
                <div className="cross">✕</div>
                <p>Betalning nekad.<br/>Vänligen försök igen.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;