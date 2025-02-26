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
  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [giftCardBalance, setGiftCardBalance] = useState(null);
  const [giftCardError, setGiftCardError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulera en databas med presentkort
  const giftCardDatabase = {
    '1234': 500,
    '5678': 1000,
    '9012': 250
  };

  const resetPaymentStates = () => {
    setRemainingAmount(total);
    setPartialPayments([]);
    setSelectedMethod(null);
    setCustomAmount('');
    setPaymentStatus('idle');
    setGiftCardNumber('');
    setGiftCardBalance(null);
    setGiftCardError('');
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetPaymentStates();
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const methods = [
    { id: 'card', icon: CreditCard, label: 'Kort' },
    { id: 'cash', icon: Banknote, label: 'Kontanter' },
    { id: 'swish', icon: Smartphone, label: 'Swish' },
    { id: 'giftcard', icon: Gift, label: 'Presentkort' },
  ];

  const handleMethodSelection = (methodId) => {
    setSelectedMethod(methods.find(m => m.id === methodId));
    setCustomAmount('');
    setGiftCardNumber('');
    setGiftCardBalance(null);
    setGiftCardError('');
    setShowDeleteConfirm(false);
  };

  const verifyGiftCard = async () => {
    setPaymentStatus('verifying_giftcard');
    
    // Simulera en verklig verifiering med fördröjning
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const balance = giftCardDatabase[giftCardNumber];
    if (balance) {
      setGiftCardBalance(balance);
      setGiftCardError('');
      setPaymentStatus('idle');
      return balance;
    } else {
      setGiftCardError('Ogiltigt presentkortsnummer');
      setGiftCardBalance(null);
      setPaymentStatus('idle');
      return null;
    }
  };

  const handleGiftCardPayment = async () => {
    const balance = giftCardBalance;
    if (!balance) return;
  
    const paymentAmount = parseFloat(customAmount);
    if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > balance || paymentAmount > remainingAmount) return;
  
    const remainingBalance = balance - paymentAmount;
    const success = await simulatePayment('giftcard', paymentAmount);
    
    if (success) {
      setPartialPayments(prev => [...prev, { 
        method: 'giftcard',
        amount: paymentAmount,
        label: 'Presentkort',
        cardNumber: giftCardNumber,
        remainingBalance: remainingBalance
      }]);
      setRemainingAmount(prev => prev - paymentAmount);
      setSelectedMethod(null);
      setGiftCardNumber('');
      setGiftCardBalance(null);
      setCustomAmount('');
      setPaymentStatus('idle');  // Direkt återställning som med andra metoder
      
      if (remainingBalance > 0) {
        alert(`Presentkortet har ${formatPrice(remainingBalance)} kvar i saldo efter köpet.`);
      }
  
      if (remainingAmount - paymentAmount <= 0) {
        // Pass the complete payment information to the callback
        completePayment();
      }
    }
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
    if (!steps) return true;

    for (const step of steps) {
      setPaymentStatus(step.status);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    return true;
  };

  // New function to handle payment completion and send all payment methods to receipt
  const completePayment = () => {
    // Log what we're about to send
    console.log("completePayment called with partialPayments:", partialPayments);
    
    // Verify that we have payment methods
    if (!partialPayments.length) {
      console.error("No payment methods found!");
      return;
    }
    
    // Check total paid amount
    const totalPaid = partialPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    console.log(`Total paid: ${totalPaid}, Total required: ${total}`);
    
    if (totalPaid < total - 0.01) { // Allow small rounding differences
      console.warn(`Warning: Total paid (${totalPaid}) is less than cart total (${total})`);
      alert("Betalat belopp täcker inte hela köpet. Lägg till ytterligare betalning.");
      return;
    }
    
    // Make sure we have a deep copy of partialPayments to avoid any reference issues
    const finalPayments = JSON.parse(JSON.stringify(partialPayments));
    
    // Add timestamp to each payment method if missing
    const paymentsWithTimestamps = finalPayments.map(payment => ({
      ...payment,
      timestamp: payment.timestamp || new Date().toISOString()
    }));
    
    // Send the payments array to the parent
    console.log("Sending final payments:", paymentsWithTimestamps);
    onPaymentComplete(paymentsWithTimestamps);
    
    // Reset component state and close
    resetPaymentStates();
    onClose();
  };
      
const handleAddPayment = async (amount) => {
  if (selectedMethod.id === 'giftcard') {
    await handleGiftCardPayment();
    return;
  }

  const paymentAmount = parseFloat(amount || customAmount);
  if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > remainingAmount) return;

  const success = await simulatePayment(selectedMethod.id, paymentAmount);
  if (!success) {
    setPaymentStatus('declined');
    setTimeout(() => setPaymentStatus('idle'), 2000);
    return;
  }

  // Create new payment object
  const newPayment = { 
    method: selectedMethod.id, 
    amount: paymentAmount,
    label: selectedMethod.label,
    timestamp: new Date().toISOString()
  };

  // Update partialPayments state with the new payment
  const updatedPayments = [...partialPayments, newPayment];
  setPartialPayments(updatedPayments);
  
  console.log("Updated payments after adding new payment:", updatedPayments);
  
  // Calculate new remaining amount
  const newRemainingAmount = remainingAmount - paymentAmount;
  setRemainingAmount(newRemainingAmount);
  
  // Reset UI state
  setPaymentStatus('idle');
  setSelectedMethod(null);
  setCustomAmount('');

  // If we've paid exactly or more than the remaining amount, complete the payment
  if (newRemainingAmount <= 0.01) { // Use small threshold for floating point issues
    // Important: Use the updated payments array directly here
    console.log("Payment complete. All payment methods:", updatedPayments);
    
    // Instead of calling completePayment(), we'll handle it right here to ensure we use the most up-to-date array
    onPaymentComplete(updatedPayments);
    resetPaymentStates();
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

  const renderGiftCardInput = () => (
    <div className="gift-card-input">
      {!giftCardBalance ? (
        <div className="gift-card-verification">
          <div className="verification-input">
            <Gift className="gift-icon" size={20} />
            <input
              type="text"
              className="payment-input"
              value={giftCardNumber}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/[^\d]/g, '');
                setGiftCardNumber(value);
              }}
              placeholder="Ange presentkortsnummer"
              maxLength={4}
              disabled={paymentStatus === 'verifying_giftcard'}
            />
          </div>
          {giftCardError && (
            <div className="error-message">
              <XCircle size={16} className="mr-1" />
              <p className="text-red-500 text-sm">{giftCardError}</p>
            </div>
          )}
          <button 
            onClick={verifyGiftCard}
            className="payment-button mt-4"
            disabled={giftCardNumber.length !== 4 || paymentStatus === 'verifying_giftcard'}
          >
            {paymentStatus === 'verifying_giftcard' ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                <span>Kontrollerar...</span>
              </div>
            ) : (
              'Verifiera presentkort'
            )}
          </button>
        </div>
      ) : (
        <div className="gift-card-confirmed">
          {/* Improved gift card info row */}
          <div className="gift-card-info-row">
            <div className="card-details">
              <Gift size={20} className="text-green-600" />
              <p className="card-label">Presentkort</p>
              <p className="card-number">{giftCardNumber}</p>
              {showDeleteConfirm ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setGiftCardNumber('');
                      setGiftCardBalance(null);
                      setShowDeleteConfirm(false);
                    }}
                    className="text-xs bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                  >
                    Ta bort
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs bg-gray-200 text-gray-700 py-1 px-2 rounded hover:bg-gray-300"
                  >
                    Avbryt
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="card-delete-btn"
                  title="Ta bort presentkort"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="balance">
              <span>Saldo: {formatPrice(giftCardBalance)}</span>
            </div>
          </div>

          <div className="section-separator">
            <span className="label">Välj belopp</span>
          </div>

          {/* Payment amount selection section */}
          <div className="amount-options">
            <button
              onClick={() => {
                const fiftyPercentAmount = Math.min(calculatePercentageAmount(50), giftCardBalance, remainingAmount);
                setCustomAmount(fiftyPercentAmount.toFixed(2));
              }}
              className="split-option-button"
            >
              50% ({formatPrice(Math.min(calculatePercentageAmount(50), giftCardBalance, remainingAmount))})
            </button>
            <button
              onClick={() => {
                const twentyFivePercentAmount = Math.min(calculatePercentageAmount(25), giftCardBalance, remainingAmount);
                setCustomAmount(twentyFivePercentAmount.toFixed(2));
              }}
              className="split-option-button"
            >
              25% ({formatPrice(Math.min(calculatePercentageAmount(25), giftCardBalance, remainingAmount))})
            </button>
            {partialPayments.length > 0 && (
  <button
    onClick={async () => {
      const remainingPaymentAmount = Math.min(remainingAmount, giftCardBalance);
      
      // Verify amount is valid
      if (remainingPaymentAmount <= 0) return;

      // Validate and process payment
      if (remainingPaymentAmount > giftCardBalance || remainingPaymentAmount > remainingAmount) return;

      const success = await simulatePayment('giftcard', remainingPaymentAmount);
      
      if (success) {
        const remainingBalance = giftCardBalance - remainingPaymentAmount;
        
        // Create new payment object
        const newPayment = { 
          method: 'giftcard',
          amount: remainingPaymentAmount,
          label: 'Presentkort',
          cardNumber: giftCardNumber,
          remainingBalance: remainingBalance,
          timestamp: new Date().toISOString()
        };
        
        // Update partial payments with the new payment
        const updatedPayments = [...partialPayments, newPayment];
        
        console.log("Final payments (including gift card):", updatedPayments);
        
        // Instead of updating state and then completing payment, send the updated array directly
        onPaymentComplete(updatedPayments);
        resetPaymentStates();
        onClose();
        
        if (remainingBalance > 0) {
          alert(`Presentkortet har ${formatPrice(remainingBalance)} kvar i saldo efter köpet.`);
        }
      }
    }}
    className="split-option-button remaining"
    disabled={paymentStatus !== 'idle'}
  >
    Betala resterande ({formatPrice(Math.min(remainingAmount, giftCardBalance))})
  </button>
)}
          </div>

          <div className="section-separator">
            <span className="label">eller</span>
          </div>

          <div className="custom-amount">
            <label htmlFor="custom-amount" className="text-sm text-gray-600 mb-1 block">Ange valfritt belopp:</label>
            <input
              id="custom-amount"
              type="number"
              className="payment-input"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0.00"
              max={Math.min(giftCardBalance, remainingAmount)}
              min={0}
              disabled={paymentStatus !== 'idle'}
            />

            <button 
              onClick={handleGiftCardPayment}
              className="payment-button mt-4"
              disabled={!customAmount || customAmount <= 0 || 
                parseFloat(customAmount) > giftCardBalance || 
                parseFloat(customAmount) > remainingAmount || 
                paymentStatus !== 'idle'}
            >
              {!customAmount || customAmount <= 0 ? (
                'Använd presentkort'
              ) : (
                `Använd ${formatPrice(parseFloat(customAmount))} från presentkortet`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentStatus = () => {
    if (paymentStatus === 'idle') return null;
    
    const statusMessages = {
      awaiting_card: 'Väntar på kortbetalning...',
      verifying_card: 'Verifierar kort...',
      processing: 'Behandlar betalning...',
      approved: 'Betalning godkänd!',
      declined: 'Betalning nekad. Försök igen.',
      awaiting_scan: 'Väntar på QR-kod scanning...',
      verifying_giftcard: 'Kontrollerar presentkort...'
    };
    
    return (
      <div className="payment-status">
        {['processing', 'awaiting_card', 'awaiting_scan', 'verifying_card', 'verifying_giftcard'].includes(paymentStatus) && (
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
            
            {/* Add a complete payment button when partial payments exist */}
            {partialPayments.length > 0 && remainingAmount === 0 && (
              <button 
                onClick={completePayment}
                className="complete-payment-button mt-4"
              >
                Slutför betalning
              </button>
            )}
          </div>
        ) : (
          <div className="split-payment-options">
            <h3>Betalningsmetod: <strong>{selectedMethod.label}</strong></h3>
            
            {selectedMethod.id === 'giftcard' ? (
              renderGiftCardInput()
            ) : (
              <>
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
              </>
            )}

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