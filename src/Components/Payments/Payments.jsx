import React, { useState, useEffect } from 'react';
import './Payments.css';
import { 
  CreditCard, 
  Smartphone, 
  FileText, 
  Banknote, 
  Gift, 
  Calendar, 
  ArrowLeft 
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

  // Reset states when modal is closed or opened
  useEffect(() => {
    if (!isOpen) {
      setSelectedPaymentMethod('');
      setCardPaymentStatus('idle');
      setReceivedAmount('');
      setGiftCardNumber('');
    }
  }, [isOpen]);

  // Kortbetalningshantering
  const handleCardPayment = () => {
    setCardPaymentStatus('waiting');
    
    // Simulera terminal-respons efter 3 sekunder
    setTimeout(() => {
      // Simulerar att betalningen lyckas 90% av gångerna
      const isApproved = Math.random() < 0.9;
      
      if (isApproved) {
        setCardPaymentStatus('approved');
        setTimeout(() => {
          onPaymentComplete();
          onClose();
          setCardPaymentStatus('idle');
        }, 1500);
      } else {
        setCardPaymentStatus('declined');
        setTimeout(() => {
          setCardPaymentStatus('idle');
        }, 2000);
      }
    }, 3000);
  };

  // Kontantbetalningshantering
  const handleCashPayment = () => {
    const received = parseFloat(receivedAmount);
    if (isNaN(received) || received < total) {
      alert('Vänligen ange ett giltigt belopp som är större än eller lika med totalbeloppet');
      return;
    }
    const change = received - total;
    alert(`Växel att ge tillbaka: ${formatPrice(change)}`);
    onPaymentComplete();
    onClose();
    setSelectedPaymentMethod('');
    setReceivedAmount('');
  };

  // Presentkortshantering
  const handleGiftCardPayment = () => {
    if (giftCardNumber.length < 8) {
      alert('Vänligen ange ett giltigt presentkortsnummer');
      return;
    }
    onPaymentComplete();
    onClose();
    setSelectedPaymentMethod('');
    setGiftCardNumber('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
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
              <button 
                onClick={handleCardPayment}
                disabled={cardPaymentStatus === 'waiting'}
              >
                <span>Kort</span>
                <CreditCard size={24} />
              </button>
              <button onClick={() => {
                onPaymentComplete();
                onClose();
              }}>
                <span>Swish</span>
                <Smartphone size={24} />
              </button>
              <button onClick={() => {
                onPaymentComplete();
                onClose();
              }}>
                <span>Klarna</span>
                <span style={{
                  fontSize: '70px',
                  fontWeight: 'bold',
                  fontFamily: 'Arial'
                }}>K</span>
              </button>
              <button onClick={() => {
                onPaymentComplete();
                onClose();
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
                onPaymentComplete();
                onClose();
              }}>
                <span>Delbetalning</span>
                <Calendar size={24} />
              </button>
              <button
                onClick={onClose}
                className="back-button"
              >
                <span>Tillbaka</span>
                <ArrowLeft size={24} />
              </button>
            </>
          )}
        </div>

        {/* Kortbetalningsstatus */}
        {cardPaymentStatus !== 'idle' && (
          <div className="payment-status">
            {cardPaymentStatus === 'waiting' && (
              <div className="status waiting">
                <div className="spinner"></div>
                <p>Väntar på kortbetalning...<br/>Belopp: {formatPrice(total)}</p>
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