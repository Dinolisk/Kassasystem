import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import CardBrand from '../shared/CardBrand';
import { 
  simulatePaymentProcess,
  STATUS_MESSAGES,
  handleAmountChange as handleAmountChangeUtil,
  increaseAmount,
  decreaseAmount
} from '../../../utils/paymentUtils';
import AmountControls from '../shared/AmountControls';
import PaymentStatusModal from '../shared/PaymentStatusModal';
import { CreditCard, ArrowLeft } from 'lucide-react';
import './Cardpayment.css';
import '../shared/AmountControls.css';

const CardPayment = ({
  remainingTotal,
  formatPrice,
  completePayment,
  onBack,
}) => {
  const [amount, setAmount] = useState(remainingTotal);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const cancelRef = useRef(false);

  const updateAmount = (newAmount) => {
    // Validate amount is a number and within valid range
    if (typeof newAmount !== 'number' || isNaN(newAmount)) return;
    if (newAmount < 0) newAmount = 0;
    if (newAmount > remainingTotal) newAmount = remainingTotal;
    
    setAmount(parseFloat(newAmount.toFixed(2)));
  };

  const handleQuickAmount = (percent) => {
    const newAmount = Math.round(remainingTotal * percent * 100) / 100;
    setAmount(newAmount);
  };

  const handlePayment = async () => {
    if (amount <= 0) return;

    cancelRef.current = false;
    setPaymentStatus('processing');
    setStatusMessage(STATUS_MESSAGES.awaiting_card);
    setShowStatusModal(true);

    const { success } = await simulatePaymentProcess(
      'card',
      (status, messageKey) => {
        setPaymentStatus(status);
        setStatusMessage(messageKey ? STATUS_MESSAGES[messageKey] || messageKey : '');
      },
      () => cancelRef.current
    );

    if (success) {
      setTimeout(() => {
        completePayment('card', amount);
        setShowStatusModal(false);
      }, 1000);
    } else if (!cancelRef.current) {
      setTimeout(() => setShowStatusModal(false), 2000);
    }
  };

  return (
    <div className="card-payment-container">
      <h2>Kortbetalning</h2>
      
      <div className="card-amount-total">
        <div className="card-amount-layout">
          <span className="card-amount-label">Belopp att betala:</span>
          <div className="card-amount-controls">
            <AmountControls
              amount={amount}
              remainingTotal={remainingTotal}
              currentPaymentStatus={paymentStatus}
              onAmountChange={updateAmount}
              onIncrease={() => updateAmount(increaseAmount(amount, remainingTotal))}
              onDecrease={() => updateAmount(decreaseAmount(amount))}
              onReset={() => updateAmount(remainingTotal)}
            />
          </div>
        </div>
      </div>

      <div className="quick-amount-buttons">
        <button 
          className={`quick-amount-btn ${Math.abs(amount - remainingTotal) < 0.01 ? 'active' : ''}`} 
          onClick={() => handleQuickAmount(1.0)}
          disabled={paymentStatus !== 'idle'}
        >
          100%
        </button>
        <button 
          className={`quick-amount-btn ${Math.abs(amount - (remainingTotal * 0.75)) < 0.01 ? 'active' : ''}`} 
          onClick={() => handleQuickAmount(0.75)}
          disabled={paymentStatus !== 'idle'}
        >
          75%
        </button>
        <button 
          className={`quick-amount-btn ${Math.abs(amount - (remainingTotal * 0.5)) < 0.01 ? 'active' : ''}`} 
          onClick={() => handleQuickAmount(0.5)}
          disabled={paymentStatus !== 'idle'}
        >
          50%
        </button>
        <button 
          className={`quick-amount-btn ${Math.abs(amount - (remainingTotal * 0.25)) < 0.01 ? 'active' : ''}`} 
          onClick={() => handleQuickAmount(0.25)}
          disabled={paymentStatus !== 'idle'}
        >
          25%
        </button>
      </div>

      <div className="card-brands-container">
        <div className="accepted-cards-label">Accepterade kort:</div>
        <div className="card-brands">
          <CardBrand type="visa" />
          <CardBrand type="mastercard" />
          <CardBrand type="amex" />
        </div>
      </div>

      <div className="terminal-instructions">
        Vänligen följ instruktionerna på kortterminalen
      </div>

      <button
        onClick={handlePayment}
        className="card-payment-button"
        disabled={paymentStatus !== 'idle' || amount <= 0}
        aria-label="Genomför kortbetalning"
      >
        <CreditCard size={18} style={{ marginRight: '8px' }} />
        Betala med kort
      </button>
      
      <button 
        onClick={onBack} 
        className="payment-method-back-button"
        disabled={paymentStatus !== 'idle'}
      >
        <ArrowLeft size={18} />
        Tillbaka
      </button>

      <PaymentStatusModal
        show={showStatusModal}
        status={paymentStatus}
        message={statusMessage}
        onClose={() => setShowStatusModal(false)}
      />
    </div>
  );
};

CardPayment.propTypes = {
  remainingTotal: PropTypes.number.isRequired,
  formatPrice: PropTypes.func.isRequired,
  completePayment: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

export default CardPayment;
