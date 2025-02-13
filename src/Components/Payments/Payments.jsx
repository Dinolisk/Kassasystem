import React, { useState, useEffect } from 'react';
import './Payments.css';
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
    setIsSplitPayment(false);
    setRemainingAmount(total);
    setPartialPayments([]);
    setSplitPaymentAmount('');
    setSplitPaymentMethod('');
  };

  const handlePayment = (method) => {
    if (method === 'card') {
      handleCardPayment();
    } else {
      completePayment(method, total);
    }
  };

  const handleCardPayment = () => {
    setCardPaymentStatus('waiting');
    setTimeout(() => {
      const isApproved = Math.random() < 0.9;
      if (isApproved) {
        setCardPaymentStatus('approved');
        setTimeout(() => completePayment('card', total), 1500);
      } else {
        setCardPaymentStatus('declined');
        setTimeout(() => setCardPaymentStatus('idle'), 1500);
      }
    }, 3000);
  };

  const completePayment = (method, amount) => {
    setPartialPayments([...partialPayments, { method, amount }]);
    setRemainingAmount(prev => prev - amount);

    if (remainingAmount - amount <= 0) {
      onPaymentComplete();
      onClose();
    }
  };

  const handleSplitPayment = () => {
    const amount = parseFloat(splitPaymentAmount);
    if (!isNaN(amount) && amount > 0 && amount <= remainingAmount) {
      completePayment(splitPaymentMethod, amount);
      setSplitPaymentAmount('');
      setSplitPaymentMethod('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
      {isSplitPayment ? (
  <div className="split-payment-container">
    <h2>Dela upp betalning</h2>
    <div className="split-payment-summary">
      <p>Total: {formatPrice(total)}</p>
      <p>Återstående: {formatPrice(remainingAmount)}</p>
    </div>

    {partialPayments.length > 0 && (
      <ul className="partial-payments-list">
        {partialPayments.map((p, i) => (
          <li key={i}>{formatPrice(p.amount)} - {p.method}</li>
        ))}
      </ul>
    )}

    <input
      type="number"
      className="split-payment-input"
      value={splitPaymentAmount}
      onChange={(e) => setSplitPaymentAmount(e.target.value)}
      placeholder="Ange belopp"
    />

    <select
      value={splitPaymentMethod}
      onChange={(e) => setSplitPaymentMethod(e.target.value)}
      className="split-payment-input"
    >
      <option value="">Välj betalningsmetod</option>
      <option value="card">Kort</option>
      <option value="cash">Kontant</option>
      <option value="swish">Swish</option>
      <option value="giftcard">Presentkort</option>
    </select>

    <button onClick={handleSplitPayment}>Lägg till betalning</button>
    <button className="back-button" onClick={() => setIsSplitPayment(false)}>
      <ArrowLeft /> Tillbaka till betalningar
    </button>
  </div>
) : (
          <>
            <h2>Betalningsalternativ</h2>
            <div className="modal-grid">
              <button onClick={() => handlePayment('card')}>
                <CreditCard /> Kortbetalning
              </button>
              <button onClick={() => handlePayment('cash')}>
                <Banknote /> Kontant
              </button>
              <button onClick={() => handlePayment('swish')}>
                <Smartphone /> Swish
              </button>
              <button onClick={() => handlePayment('invoice')}>
                <FileText /> Faktura
              </button>
              <button onClick={() => handlePayment('giftcard')}>
                <Gift /> Presentkort
              </button>
              <button onClick={() => setIsSplitPayment(true)}>
                <Split /> Dela upp betalning
              </button>
              <button onClick={onClose} className="back-button">
                <ArrowLeft /> Tillbaka
              </button>
            </div>

            {cardPaymentStatus !== 'idle' && (
              <div className="payment-status">
                {cardPaymentStatus === 'waiting' && <p>Väntar på kortbetalning...</p>}
                {cardPaymentStatus === 'approved' && <p>Betalning godkänd!</p>}
                {cardPaymentStatus === 'declined' && <p>Betalning nekad. Försök igen.</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;
