import React, { useState, useEffect } from 'react';
import PaymentMethodSelector from '../Payments/PaymentMethodSelector.jsx';
import './Payments.css';
import { 
 CreditCard, 
 Smartphone, 
 FileText, 
 Banknote, 
 Gift, 
 ArrowLeft,
 CheckCircle2,
 XCircle,
 Loader2
} from 'lucide-react';

const Payments = ({ 
 isOpen, 
 onClose, 
 total, 
 onPaymentComplete, 
 formatPrice,
 cartItems
}) => {
 // Gift card database for verification
 const giftCardDatabase = {
   '1234': 100,
   '5678': 50,
   '9012': 250
 };

 const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
 const [paymentStatus, setPaymentStatus] = useState('idle');
 const [cashAmount, setCashAmount] = useState('');
 const [change, setChange] = useState(0);
 const [personnummer, setPersonnummer] = useState('');
 const [email, setEmail] = useState('');
 const [giftCardNumber, setGiftCardNumber] = useState('');
 const [isSplitPaymentOpen, setIsSplitPaymentOpen] = useState(false);
 const [insufficientBalanceModal, setInsufficientBalanceModal] = useState(null);
 const [remainingTotal, setRemainingTotal] = useState(total);
 const [paymentMessage, setPaymentMessage] = useState('');
 const [partialPayments, setPartialPayments] = useState([]);
 const [declineReason, setDeclineReason] = useState('');



 // Uppdatera remainingTotal när total ändras
 useEffect(() => {
   if (isOpen && total > 0) {
     setRemainingTotal(total);
   }
 }, [total, isOpen]);

 // VIKTIGT: Fixat villkoret i useEffect - endast återställ när dialogrutan öppnas
 useEffect(() => {
   if (isOpen) {
     resetAllStates();
   }
 }, [isOpen]); // Ta bort 'total' beroendet för att förhindra återställningar under betalning

 const resetAllStates = () => {
   setSelectedPaymentMethod('');
   setPaymentStatus('idle');
   setCashAmount('');
   setChange(0);
   setPersonnummer('');
   setEmail('');
   setGiftCardNumber('');
   setInsufficientBalanceModal(null);
   setRemainingTotal(total); // Återställ till ursprungligt belopp
   setPaymentMessage(''); // Rensa eventuella meddelanden
   setPartialPayments([]); 
 };
 const handleSplitPaymentComplete = (splitPayments) => {
  setIsSplitPaymentOpen(false);
  
  console.log("handleSplitPaymentComplete received:", splitPayments);
  
  // Create a local variable to store the payment methods we'll pass forward
  let methodsToPass = [];
  
  if (splitPayments) {
    if (Array.isArray(splitPayments)) {
      console.log("Received array directly:", splitPayments);
      methodsToPass = splitPayments;
    } else if (splitPayments.paymentMethods && Array.isArray(splitPayments.paymentMethods)) {
      console.log("Extracting paymentMethods from object:", splitPayments.paymentMethods);
      methodsToPass = splitPayments.paymentMethods;
    } else {
      console.log("Unknown format, using fallback");
      methodsToPass = [{ 
        method: 'split', 
        amount: total, 
        label: 'Delad betalning',
        timestamp: new Date().toISOString()
      }];
    }
  } else {
    console.log("No payment data received");
    methodsToPass = [{ 
      method: 'split', 
      amount: total, 
      label: 'Delad betalning',
      timestamp: new Date().toISOString()
    }];
  }
  
  // Ensure all payment methods have labels
  methodsToPass = methodsToPass.map(method => {
    if (!method.label) {
      const methodLabels = {
        'card': 'Kort',
        'cash': 'Kontanter',
        'swish': 'Swish',
        'invoice': 'Faktura',
        'giftcard': 'Presentkort',
        'split': 'Delad betalning'
      };
      return {
        ...method,
        label: methodLabels[method.method] || method.method,
        timestamp: method.timestamp || new Date().toISOString()
      };
    }
    return {
      ...method,
      timestamp: method.timestamp || new Date().toISOString()
    };
  });
  
  console.log("Final methods being passed to parent:", methodsToPass);
  
  // Kör direkt utan fördröjningar
  onPaymentComplete(methodsToPass);
  onClose();
};

const completePayment = (method, amount) => {
  // Start payment simulation process
  setPaymentStatus('processing');
  
  const paymentStages = {
    'giftcard': [
      { status: 'verifying_card', message: 'Verifierar presentkort...', duration: 2000 },
      { status: 'processing', message: 'Behandlar betalning...', duration: 2000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ],
    'cash': [
      { status: 'processing', message: 'Räknar kontanter...', duration: 2000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ],
    'card': [
      { status: 'awaiting_card', message: 'Väntar på kortbetalning...', duration: 2000 },
      { status: 'processing', message: 'Behandlar betalning...', duration: 2000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ],
    'swish': [
      { status: 'processing', message: 'Slutför Swish-betalning...', duration: 2000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ],
    'invoice': [
      { status: 'processing', message: 'Skapar faktura...', duration: 2000 },
      { status: 'approved', message: 'Faktura skickad!', duration: 1500 }
    ],
    'default': [
      { status: 'processing', message: 'Behandlar betalning...', duration: 3000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ]
  };

  const stages = paymentStages[method] || paymentStages['default'];

  // Mappning för korrekta betalningsmetodnamn
  const methodLabels = {
    'card': 'Kort',
    'cash': 'Kontanter',
    'swish': 'Swish',
    'invoice': 'Faktura',
    'giftcard': 'Presentkort'
  };

  // Uppdaterad simulatePaymentProcess funktion med bättre felhantering men utan fördröjningar
  const simulatePaymentProcess = async () => {
    try {
      if (method === 'card' && Math.random() < 0.1) {
        // Simulera betalningsförsök innan den nekas
        setPaymentStatus('awaiting_card');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPaymentStatus('processing');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Neka betalningen med meddelande om otillräckligt saldo
        setPaymentStatus('declined');
        setDeclineReason('insufficient_funds');
        
        // Återställ status efter 3 sekunder
        setTimeout(() => {
          setPaymentStatus('idle');
          setDeclineReason('');
        }, 3000);
        
        return; // Avbryt fortsatt betalningsprocess
      }
      // Process each stage
      for (const stage of stages) {
        setPaymentStatus(stage.status);
        await new Promise(resolve => setTimeout(resolve, stage.duration));
      }

      console.log("Current partialPayments:", partialPayments);
      console.log("Adding new payment:", method, amount);

      // Create the payment object
      const newPayment = { 
        method: method, 
        amount: amount,
        label: methodLabels[method] || method,
        timestamp: new Date().toISOString()
      };
      
      if (partialPayments.length > 0) {
        // We have previous payments, handle multiple payment scenario
        console.log("Multiple payments scenario:");
        console.log("- Existing payments:", partialPayments);
        console.log("- New payment:", newPayment);

        const newRemainingTotal = remainingTotal - amount;
        
        if (newRemainingTotal <= 0) {
          // When everything is paid, collect all payments
          const updatedPayments = [...partialPayments, newPayment];
          console.log("Completing payment with all payments:", updatedPayments);
          
          // Direct completion without delays
          onPaymentComplete(updatedPayments);
          resetAllStates();
          onClose();
        } else {
          setPartialPayments(prev => [...prev, newPayment]);
          setRemainingTotal(newRemainingTotal);
          setPaymentStatus('idle');
          setPaymentMessage(`${methodLabels[method] || method} betalning: ${formatPrice(amount)}. Återstående: ${formatPrice(newRemainingTotal)}`);
          setSelectedPaymentMethod('');
        }
      } else {
        // First payment, simple payment
        console.log("Single payment scenario");
        if (amount >= remainingTotal) {
          // Direct completion without delays
          onPaymentComplete([newPayment]);
          resetAllStates();
          onClose();
        } else {
          setPartialPayments([newPayment]);
          setRemainingTotal(remainingTotal - amount);
          setPaymentStatus('idle');
          setPaymentMessage(`${methodLabels[method] || method} betalning: ${formatPrice(amount)}. Återstående: ${formatPrice(remainingTotal - amount)}`);
          setSelectedPaymentMethod('');
        }
      }
    } catch (error) {
      console.error("Error during payment processing:", error);
      setPaymentStatus('declined');
      setTimeout(() => {
        setPaymentStatus('idle');
      }, 2000);
    }
  };

  simulatePaymentProcess();
};
const handlePaymentMethodSelect = (method) => {
  if (!cartItems || cartItems.length === 0) {
    alert('Kundvagnen är tom');
    return;
  }

  if (method === 'card') {
    completePayment('card', remainingTotal);
  } else {
    setSelectedPaymentMethod(method);
  }
};

const handleCashAmount = (e) => {
  const inputAmount = e.target.value;
  setCashAmount(inputAmount);
  
  const cashAmountNum = parseFloat(inputAmount);
  if (!isNaN(cashAmountNum) && cashAmountNum >= remainingTotal) {
    setChange(cashAmountNum - remainingTotal);
  } else {
    setChange(0);
  }
};

const handleCashPayment = () => {
  const cashAmountNum = parseFloat(cashAmount);
  if (isNaN(cashAmountNum) || cashAmountNum < remainingTotal) {
    alert('Ogiltigt belopp');
    return;
  }
  completePayment('cash', remainingTotal);
};

const handleSwishPayment = () => {
  completePayment('swish', remainingTotal);
};

const handleInvoicePayment = () => {
  completePayment('invoice', remainingTotal);
};

const handleGiftCardPayment = () => {
  setPaymentStatus('verifying_card');
  setTimeout(() => {
    // Verify gift card balance
    const balance = giftCardDatabase[giftCardNumber];
    
    if (!balance) {
      // Invalid gift card
      alert('Ogiltigt presentkortsnummer');
      setPaymentStatus('idle');
      return;
    }

    if (balance < remainingTotal) {
      // Insufficient balance
      setInsufficientBalanceModal({
        cardBalance: balance,
        totalAmount: remainingTotal,
        remainingAmount: remainingTotal - balance
      });
      setPaymentStatus('idle');
      return;
    }

    // Sufficient balance, show confirmation modal
    setInsufficientBalanceModal({
      cardBalance: balance,
      totalAmount: remainingTotal,
      remainingBalance: balance - remainingTotal,
      isConfirmation: true
    });
    setPaymentStatus('idle');
  }, 2000);
};

const handleInsufficientBalanceOption = (option) => {
 switch(option) {
   case 'partial':
     // Använd hela presentkortets saldo
     const balance = giftCardDatabase[giftCardNumber];
     
     // Lägg till presentkortsbetalningen i partialPayments
     setPartialPayments([{
      method: 'giftcard',
      amount: balance,
      label: 'Presentkort', 
      timestamp: new Date().toISOString()
    }]);
     
     // Beräkna återstående belopp att betala
     const remainingToPay = remainingTotal - balance;
     
     // Stäng modalen för otillräckligt saldo
     setInsufficientBalanceModal(null);
     
     // Återställ presentkortsfältet eftersom det nu är använt
     setGiftCardNumber('');
     
     // Återgå till betalningsmenyn istället för att stänga
     setSelectedPaymentMethod('');
     
     // Uppdatera totalbeloppet som återstår att betala
     setRemainingTotal(remainingToPay);
     
     // Visa ett meddelande om använt presentkort
     setPaymentMessage(`Presentkort använt: ${formatPrice(balance)}. Återstående att betala: ${formatPrice(remainingToPay)}`);
     break;
     
   case 'new_method':
     // Reset gift card and return to payment method selection
     setGiftCardNumber('');
     setSelectedPaymentMethod('');
     setInsufficientBalanceModal(null);
     break;
     
   case 'cancel':
     // Close the payment modal
     resetAllStates();
     onClose();
     break;
 }
};
const renderPaymentStatus = () => {
  if (paymentStatus === 'idle') return null;
  
  const statusMessages = {
    awaiting_card: 'Väntar på kortbetalning...',
    verifying_card: 'Verifierar presentkort...',
    processing: 'Behandlar betalning...',
    approved: 'Betalning godkänd!',
    declined: 'Betalning nekad. Försök igen.',
    awaiting_scan: 'Väntar på QR-kod scanning...',
    verifying: 'Verifierar kundinformation...',
    invoice_sent: 'Faktura skickad!'
  };
    // Hantera specifika nekningsorsaker
  const declineMessages = {
    insufficient_funds: 'Betalning nekad: Otillräckligt saldo på kortet.',
    card_expired: 'Betalning nekad: Kortet har gått ut.',
    default: 'Betalning nekad. Försök igen.'
  };
  
  
  return (
    <div className="payment-status">
      {['processing', 'awaiting_card', 'awaiting_scan', 'verifying', 'verifying_card', 'awaiting_card', 'invoice_sent'].includes(paymentStatus) && (
        <>
          <Loader2 className="animate-spin" size={48} />
          <p>{statusMessages[paymentStatus]}</p>
        </>
      )}
      {paymentStatus === 'approved' && (
        <>
          <CheckCircle2 className="text-green-500" size={48} />
          <p>{statusMessages[paymentStatus]}</p>
        </>
      )}
      {paymentStatus === 'declined' && (
        <>
          <XCircle className="text-red-500" size={48} />
          <p>{declineReason ? declineMessages[declineReason] || declineMessages.default : declineMessages.default}</p>
        </>
      )}
    </div>
  );
};

const renderInsufficientBalanceModal = () => {
  if (!insufficientBalanceModal) return null;

  const { 
    cardBalance, 
    totalAmount, 
    remainingAmount, 
    remainingBalance, 
    isConfirmation 
  } = insufficientBalanceModal;

  return (
    <div className="modal-overlay">
    <div className="modal-content giftcard-dialog" onClick={e => e.stopPropagation()}>
      <h2>
        <Gift size={28} />
        {isConfirmation ? 'Bekräfta presentkort' : 'Otillräckigt presentkortssaldo'}
      </h2>
        
        {isConfirmation ? (
          <div className="giftcard-confirmation">
            <div className="giftcard-info-container">
              <div className="giftcard-info-row">
                <span className="info-label">Presentkortets saldo:</span>
                <span className="info-value">{formatPrice(cardBalance)}</span>
              </div>
              <div className="giftcard-info-row">
                <span className="info-label">Total att betala:</span>
                <span className="info-value">{formatPrice(totalAmount)}</span>
              </div>
              <div className="giftcard-info-row highlight">
                <span className="info-label">Återstående saldo:</span>
                <span className="info-value positive">{formatPrice(remainingBalance)}</span>
              </div>
            </div>
            
            <div className="giftcard-button-group">
              <button 
                onClick={() => {
                  // Stäng bekräftelsemodalen
                  setInsufficientBalanceModal(null);
                  // Initiera betalningsprocessen
                  completePayment('giftcard', totalAmount);
                }}
                className="primary-button confirm-button"
              >
                <div className="button-with-icon">
                  <CheckCircle2 size={20} />
                  <span>Bekräfta betalning</span>
                </div>
              </button>
              
              <button 
                onClick={() => setInsufficientBalanceModal(null)}
                className="cancel-button"
              >
                <div className="button-with-icon">
                  <XCircle size={20} />
                  <span>Avbryt</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="giftcard-insufficient">
            <div className="giftcard-info-container">
              <div className="giftcard-info-row">
                <span className="info-label">Presentkortets saldo:</span>
                <span className="info-value">{formatPrice(cardBalance)}</span>
              </div>
              <div className="giftcard-info-row">
                <span className="info-label">Total att betala:</span>
                <span className="info-value">{formatPrice(totalAmount)}</span>
              </div>
              <div className="giftcard-info-row highlight">
                <span className="info-label">Saknas:</span>
                <span className="info-value negative">{formatPrice(remainingAmount)}</span>
              </div>
            </div>

            <div className="giftcard-button-group">
              <button 
                onClick={() => handleInsufficientBalanceOption('partial')}
                className="primary-button split-button"
              >
                <div className="button-with-icon">
                  <CreditCard size={20} />
                  <span>Använd saldo + annat betalsätt</span>
                </div>
                <div className="button-subtext">
                  Använd {formatPrice(cardBalance)} från presentkortet och betala resterande {formatPrice(remainingAmount)} med annat betalsätt
                </div>
              </button>
              
              <button 
                onClick={() => handleInsufficientBalanceOption('new_method')}
                className="primary-button alt-button"
              >
                <div className="button-with-icon">
                  <ArrowLeft size={20} />
                  <span>Välj ett nytt betalsätt</span>
                </div>
              </button>
              
              <button 
                onClick={() => handleInsufficientBalanceOption('cancel')}
                className="cancel-button"
              >
                <div className="button-with-icon">
                  <XCircle size={20} />
                  <span>Avbryt</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const renderPaymentMethod = () => {
  switch (selectedPaymentMethod) {
    case 'cash':
  return (
    <div className="payment-method-container">
      <h3>
        <Banknote size={24} className="mr-2" />
        Kontanter
      </h3>
      <p className="amount-display">
        <span>Total att betala:</span>
        <span>{formatPrice(remainingTotal)}</span>
      </p>
      <input
        type="number"
        className="payment-input"
        value={cashAmount}
        onChange={handleCashAmount}
        placeholder="Ange mottaget belopp"
        disabled={paymentStatus !== 'idle'}
      />
      {cashAmount && (
        <div className="cash-summary">
          <div className="received-amount">
            <span>Mottaget belopp:</span>
            <span>{formatPrice(parseFloat(cashAmount) || 0)}</span>
          </div>
          <div className="change-amount">
            {parseFloat(cashAmount) >= remainingTotal ? (
              <>
                <span>Växel att ge tillbaka:</span> 
                <span>{formatPrice(change)}</span>
              </>
            ) : (
              <>
                <span>Status:</span>
                <span className="negative">Otillräckligt belopp</span>
              </>
            )}
          </div>
        </div>
      )}
      {parseFloat(cashAmount) >= remainingTotal && (
        <button 
          onClick={handleCashPayment}
          disabled={paymentStatus !== 'idle'}
          className="primary-button confirm-button"
        >
          <div className="button-with-icon">
            <CheckCircle2 size={20} />
            <span>Bekräfta betalning</span>
          </div>
        </button>
      )}
    </div>
  );


  case 'swish':
    return (
      <div className="payment-method-container">
        <h3>
  <Smartphone size={24} className="mr-2" /> {/* margin right */}
  Swish
</h3>
        <p className="amount-display">
          <span>Total att betala:</span>
          <span>{formatPrice(remainingTotal)}</span>
        </p>
        <div className="swish-qr-placeholder" style={{textAlign: 'center'}}>
        <p>Skanna QR-kod för att betala</p>
      </div>
        <button 
          onClick={handleSwishPayment}
          disabled={paymentStatus !== 'idle'}
          className="primary-button"
        >
          Bekräfta Swish-betalning
        </button>
      </div>
    );
  
  case 'invoice':
    return (
      <div className="payment-method-container">
         <h3>
        <FileText size={24} className="mr-2" />
         Faktura
      </h3>
        <p className="amount-display">
          <span>Total att betala:</span>
          <span>{formatPrice(remainingTotal)}</span>
        </p>
        <input
          type="text"
          className="payment-input"
          placeholder="Personnummer"
          value={personnummer}
          onChange={(e) => setPersonnummer(e.target.value)}
          disabled={paymentStatus !== 'idle'}
        />
        <input
          type="email"
          className="payment-input"
          placeholder="E-postadress"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={paymentStatus !== 'idle'}
        />
        {personnummer && email && (
          <button 
            onClick={handleInvoicePayment}
            disabled={paymentStatus !== 'idle'}
            className="primary-button"
          >
            Skicka faktura
          </button>
        )}
      </div>
    );

      case 'giftcard':
        return (
          <div className="payment-method-container">
            <h3>
        <Gift size={24} className="mr-2" /> 
        Presentkort
      </h3>
            <p className="amount-display">
              <span>Total att betala:</span>
              <span>{formatPrice(remainingTotal)}</span>
            </p>
            
            {/* Input för presentkortsnummer */}
            <div className="gift-card-input-container">
              <Gift className="input-icon" size={20} />
              <input
                type="text"
                className="payment-input"
                placeholder="Ange presentkortsnummer"
                value={giftCardNumber}
                onChange={(e) => {
                  // Endast siffror tillåts
                  const value = e.target.value.replace(/[^\d]/g, '');
                  setGiftCardNumber(value);
                }}
                maxLength={4}
                disabled={paymentStatus !== 'idle'}
              />
            </div>
            
            {/* Verifiera presentkort knapp */}
            {giftCardNumber && giftCardNumber.length === 4 && (
              <button 
                onClick={handleGiftCardPayment}
                disabled={paymentStatus !== 'idle'}
                className="primary-button gift-card-button"
              >
                {paymentStatus === 'verifying_card' ? (
                  <div className="button-with-icon">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Verifierar...</span>
                  </div>
                ) : (
                  <div className="button-with-icon">
                    <CheckCircle2 size={20} />
                    <span>Verifiera presentkort</span>
                  </div>
                )}
              </button>
            )}
          </div>
        );
    default:
      return null;
  }
};
// Uppdatera renderContent-funktionen för att få konsekvent styling på huvudmenyn
const renderContent = () => {
  if (selectedPaymentMethod) {
    return (
      <>
        <div className="payment-method-view">
          {renderPaymentMethod()}
          <button 
            className="method-back-button"
            onClick={() => setSelectedPaymentMethod('')}
            disabled={paymentStatus !== 'idle'}
          >
            <ArrowLeft size={20} />
            <span>Tillbaka</span>
          </button>
        </div>
        {renderPaymentStatus()}
      </>
    );
  }

  return (
    <>
      <h2>
        Betalningsalternativ
      </h2>
      <div className="total-amount">
        <p className="amount-display">
          <span>Totalt att betala:</span>
          <span>{formatPrice(remainingTotal)}</span>
        </p>
        {paymentMessage && (
          <div className="payment-message">
            {paymentMessage}
          </div>
        )}
      </div>
      <div className="modal-grid">
        <button 
          className="soft-menu-button payment-card-button" 
          onClick={() => handlePaymentMethodSelect('card')}
        >
          <CreditCard /> Kortbetalning
        </button>

        <button 
          className="soft-menu-button payment-cash-button" 
          onClick={() => handlePaymentMethodSelect('cash')}
        >
          <Banknote /> Kontanter
        </button>

        <button 
          className="soft-menu-button payment-swish-button" 
          onClick={() => handlePaymentMethodSelect('swish')}
        >
          <Smartphone /> Swish
        </button>

        <button 
          className="soft-menu-button payment-invoice-button" 
          onClick={() => handlePaymentMethodSelect('invoice')}
        >
          <FileText /> Faktura
        </button>

        <button 
          className="soft-menu-button payment-gift-button" 
          onClick={() => handlePaymentMethodSelect('giftcard')}
        >
          <Gift /> Presentkort
        </button>

        <button 
          className="soft-menu-button payment-split-button" 
          onClick={() => setIsSplitPaymentOpen(true)}
        >
          <CreditCard /> Blandad betalning
        </button>
        
        <button 
          className="modal-back-button" 
          onClick={onClose}
        >
          <ArrowLeft size={16} />
          <span>Tillbaka</span>
        </button>
      </div>
      {renderPaymentStatus()}
    </>
  );
};


if (!isOpen) return null;

return (
  <div className="modal-overlay" onClick={(e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      {renderContent()}
      {renderInsufficientBalanceModal()}
    </div>
    <PaymentMethodSelector
      isOpen={isSplitPaymentOpen}
      onClose={() => setIsSplitPaymentOpen(false)}
      total={total}
      onPaymentComplete={handleSplitPaymentComplete}
      formatPrice={formatPrice}
    />
  </div>
);
};

export default Payments;