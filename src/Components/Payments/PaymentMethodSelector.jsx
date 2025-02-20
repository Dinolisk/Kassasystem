import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Gift, 
  ArrowLeft,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import './PaymentMethodSelector.css';

const PaymentMethodSelector = ({
  isOpen,
  onClose,
  total,
  onPaymentComplete,
  formatPrice
}) => {
  const [remainingAmount, setRemainingAmount] = useState(total);
  const [partialPayments, setPartialPayments] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  
  const resetPaymentStates = () => {
    setRemainingAmount(total);
    setPartialPayments([]);
    setSelectedMethod(null);
    setCustomAmount('');
    setPaymentStatus('idle');
  };

  useEffect(() => {
    if (!isOpen) {
      resetPaymentStates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const methods = [
    { id: 'card', icon: CreditCard, label: 'Kort' },
    { id: 'cash', icon: Banknote, label: 'Kontant' },
    { id: 'swish', icon: Smartphone, label: 'Swish' },
    { id: 'giftcard', icon: Gift, label: 'Presentkort' },
  ];

  const handleMethodSelection = (methodId) => {
    setSelectedMethod(methods.find(m => m.id === methodId));
    setCustomAmount('');
  };

  const simulatePayment = async (methodId, amount) => {
    const simulationSteps = {
      card: [
        { status: 'awaiting_card', message: 'Väntar på kortbetalning...', duration: 2000 },
        { status: 'verifying_card', message: 'Verifierar kort...', duration: 2000 },
        { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
      ],
      swish: [
        { status: 'awaiting_scan', message: 'Väntar på QR-kod scanning...', duration: 2000 },
        { status: 'processing', message: 'Behandlar betalning...', duration: 2000 },
        { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
      ],
      giftcard: [
        { status: 'verifying_card', message: 'Verifierar presentkort...', duration: 2000 },
        { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
      ]
    };

    const steps = simulationSteps[methodId];
    if (!steps) return true; // För kontant, ingen simulering

    for (const step of steps) {
      setPaymentStatus(step.status);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    return true;
  };

  const handleAddPayment = async (amount) => {
    const paymentAmount = parseFloat(amount || customAmount);
    if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > remainingAmount) return;

    const success = await simulatePayment(selectedMethod.id, paymentAmount);
    if (!success) {
      setPaymentStatus('declined');
      setTimeout(() => setPaymentStatus('idle'), 2000);
      return;
    }

    setPartialPayments(prev => [...prev, { 
      method: selectedMethod.id, 
      amount: paymentAmount,
      label: selectedMethod.label
    }]);
    setRemainingAmount(prev => prev - paymentAmount);
    setSelectedMethod(null);
    setCustomAmount('');
    setPaymentStatus('idle');

    if (remainingAmount - paymentAmount <= 0) {
      resetPaymentStates();
      onPaymentComplete();
      onClose();
    }
  };

  const handleRemoveLastPayment = () => {
    const lastPayment = partialPayments[partialPayments.length - 1];
    setPartialPayments(prev => prev.slice(0, -1));
    setRemainingAmount(prev => prev + lastPayment.amount);
  };

  const calculatePercentageAmount = (percentage) => {
    return remainingAmount * (percentage / 100);
  };

  const handlePercentageClick = (percentage) => {
    const amount = calculatePercentageAmount(percentage);
    setCustomAmount(amount.toFixed(2));
  };

  const renderPaymentStatus = () => {
    if (paymentStatus === 'idle') return null;
    
    const statusMessages = {
      awaiting_card: 'Väntar på kortbetalning...',
      verifying_card: 'Verifierar kort...',
      processing: 'Behandlar betalning...',
      approved: 'Betalning godkänd!',
      declined: 'Betalning nekad. Försök igen.',
      awaiting_scan: 'Väntar på QR-kod scanning...'
    };
    
    return (
      <div className="payment-status">
        {['processing', 'awaiting_card', 'awaiting_scan', 'verifying_card'].includes(paymentStatus) && (
          <>
            <Loader2 className="animate-spin h-8 w-8" />
            <p>{statusMessages[paymentStatus]}</p>
          </>
        )}
        {paymentStatus === 'approved' && (
          <>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p>{statusMessages[paymentStatus]}</p>
          </>
        )}
        {paymentStatus === 'declined' && (
          <>
            <XCircle className="h-8 w-8 text-red-500" />
            <p>{statusMessages[paymentStatus]}</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-selector" onClick={e => e.stopPropagation()}>
        <div className="split-payment-summary">
          <h2>Att betala</h2>
          <p>Total: {formatPrice(total)}</p>
          <p>Återstående: {formatPrice(remainingAmount)}</p>
          {partialPayments.length > 0 && (
            <div className="payments-list">
              {partialPayments.map((payment, index) => (
                <div key={index} className="payment-item">
                  <span>{formatPrice(payment.amount)} - {payment.label}</span>
                  {index === partialPayments.length - 1 && (
                    <button 
                      onClick={handleRemoveLastPayment}
                      className="remove-payment-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!selectedMethod ? (
          <div className="payment-methods-container">
            <h3>{partialPayments.length > 0 ? 'Välj ny betalningsmetod' : 'Välj betalningsmetod'}</h3>
            <div className="payment-method-options">
              {methods.map(method => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelection(method.id)}
                  className="payment-method-option"
                >
                  <method.icon />
                  <span>{method.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="split-payment-options">
            <h3>Betalningsmetod vald: {selectedMethod.label}</h3>
            
            <div className="amount-options">
              <button
                onClick={() => handlePercentageClick(50)}
                className="split-option-button"
              >
                50% ({formatPrice(calculatePercentageAmount(50))})
              </button>
              <button
                onClick={() => handlePercentageClick(25)}
                className="split-option-button"
              >
                25% ({formatPrice(calculatePercentageAmount(25))})
              </button>
              {partialPayments.length > 0 && (
                <button
                  onClick={() => handleAddPayment(remainingAmount)}
                  className="split-option-button remaining"
                >
                  Betala resterande ({formatPrice(remainingAmount)})
                </button>
              )}
            </div>

            <p className="or-divider">eller</p>

            <div className="custom-amount">
              <input
                type="number"
                className="payment-input"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Ange valfritt belopp"
                disabled={paymentStatus !== 'idle'}
              />

              <button 
                onClick={() => handleAddPayment()}
                className="payment-button"
                disabled={!customAmount || paymentStatus !== 'idle'}
              >
                Lägg till betalning {customAmount ? formatPrice(parseFloat(customAmount)) : ''}
              </button>
            </div>

            <button 
              className="payment-back-button"
              onClick={() => {
                setSelectedMethod(null);
                setPaymentStatus('idle');
              }}
              disabled={paymentStatus !== 'idle'}
            >
              <X />
              <span>Avbryt</span>
            </button>
          </div>
        )}

        {!selectedMethod && (
          <button 
            className="payment-back-button"
            onClick={onClose}
          >
            <ArrowLeft />
            <span>Tillbaka</span>
          </button>
        )}

        {renderPaymentStatus()}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;