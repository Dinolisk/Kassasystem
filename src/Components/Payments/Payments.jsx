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

 // Uppdatera remainingTotal när total ändras
 useEffect(() => {
   setRemainingTotal(total);
 }, [total]);

 useEffect(() => {
  // Återställ när dialogrutan stängs ELLER när ett nytt totalt belopp sätts (nytt köp)
  if (!isOpen || isOpen) {
    resetAllStates();
  }
}, [isOpen, total]);

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

 const handleSplitPaymentComplete = () => {
   setIsSplitPaymentOpen(false);
   onPaymentComplete();
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

  const simulatePaymentProcess = async () => {
   for (const stage of stages) {
     setPaymentStatus(stage.status);
     await new Promise(resolve => setTimeout(resolve, stage.duration));
   }

   // Om detta är en delbetalning och det fortfarande finns belopp kvar att betala
   if (partialPayments.length > 0 && amount < remainingTotal) {
     // Lägg till denna betalning i partialPayments-arrayen
     setPartialPayments(prev => [...prev, { 
       method: method, 
       amount: amount,
       timestamp: new Date().toISOString()
     }]);
     
     // Beräkna nytt återstående belopp
     const newRemainingTotal = remainingTotal - amount;
     
     if (newRemainingTotal <= 0) {
       // Om allt är betalt, slutför köpet
       const allPayments = [...partialPayments, { 
         method: method, 
         amount: amount,
         timestamp: new Date().toISOString()
       }];
       
       // Här kan du skicka med alla delbetalningar till onPaymentComplete
       // så att de kan visas på kvittot
       onPaymentComplete(allPayments);
       resetAllStates(); // Viktigt för att rensa alla tillstånd
       onClose();
     } else {
       // Om det fortfarande finns belopp kvar att betala, uppdatera UI
       setRemainingTotal(newRemainingTotal);
       setPaymentStatus('idle');
       setPaymentMessage(`${method} betalning: ${formatPrice(amount)}. Återstående: ${formatPrice(newRemainingTotal)}`);
       
       // Återgå till betalningsmenyn för att välja nästa betalningsmetod
       setSelectedPaymentMethod('');
     }
   } else {
     // Om detta är en fullständig betalning (original eller sista delbetalningen)
     // slutför köpet som vanligt
     
     // Om vi har delbetalningar, lägg till den här sista betalningen
     if (partialPayments.length > 0) {
       const allPayments = [...partialPayments, { 
         method: method, 
         amount: amount,
         timestamp: new Date().toISOString()
       }];
       onPaymentComplete(allPayments);
     } else {
       // Annars skicka endast denna betalning
       onPaymentComplete(method, amount);
     }
     
     resetAllStates(); // Viktigt för att rensa alla tillstånd
     onClose();
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
    completePayment('card', remainingTotal); // Använd remainingTotal istället för total
  } else {
    setSelectedPaymentMethod(method);
  }
};

const handleCashAmount = (e) => {
  const inputAmount = e.target.value;
  setCashAmount(inputAmount);
  
  const cashAmountNum = parseFloat(inputAmount);
  if (!isNaN(cashAmountNum) && cashAmountNum >= remainingTotal) {
    setChange(cashAmountNum - remainingTotal); // Använd remainingTotal istället för total
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
  completePayment('cash', remainingTotal); // Använd remainingTotal istället för total
};

const handleSwishPayment = () => {
  completePayment('swish', remainingTotal); // Använd remainingTotal istället för total
};

const handleInvoicePayment = () => {
  completePayment('invoice', remainingTotal); // Använd remainingTotal istället för total
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
          <p>{statusMessages[paymentStatus]}</p>
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
        <h2>{isConfirmation ? 'Bekräfta presentkort' : 'Otillräckigt presentkortssaldo'}</h2>
        
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
// Resten av koden (renderPaymentMethod, renderContent, return) förblir oförändrad
const renderPaymentMethod = () => {
  switch (selectedPaymentMethod) {
    case 'cash':
      return (
        <div className="payment-method-container">
          <h3>Kontant</h3>
          <p>Total att betala: {formatPrice(remainingTotal)}</p>
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
                Mottaget belopp: {formatPrice(parseFloat(cashAmount) || 0)}
              </div>
              <div className="change-amount">
                {parseFloat(cashAmount) >= remainingTotal ? (
                  `Växel att ge tillbaka: ${formatPrice(change)}`
                ) : (
                  'Otillräckligt belopp'
                )}
              </div>
            </div>
          )}
          {parseFloat(cashAmount) >= remainingTotal && (
            <button 
              onClick={handleCashPayment}
              disabled={paymentStatus !== 'idle'}
              className="primary-button"
            >
              Bekräfta betalning
            </button>
          )}
        </div>
      );

    case 'swish':
      return (
        <div className="payment-method-container">
          <h3>Swish</h3>
          <p>Total att betala: {formatPrice(remainingTotal)}</p>
          <div className="swish-qr-placeholder">
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
          <h3>Faktura</h3>
          <p>Total att betala: {formatPrice(remainingTotal)}</p>
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
      <h3>Presentkort</h3>
      <p>Total att betala: {formatPrice(remainingTotal)}</p>
      
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
      <h2>Betalningsalternativ</h2>
      <div className="total-amount">
        <p>Totalt att betala: {formatPrice(remainingTotal)}</p>
        {paymentMessage && (
          <div className="payment-message">
            {paymentMessage}
          </div>
        )}
      </div>
      <div className="modal-grid">
        <button onClick={() => handlePaymentMethodSelect('card')}>
          <CreditCard /> Kortbetalning
        </button>
        <button onClick={() => handlePaymentMethodSelect('cash')}>
          <Banknote /> Kontanter
        </button>
        <button onClick={() => handlePaymentMethodSelect('swish')}>
          <Smartphone /> Swish
        </button>
        <button onClick={() => handlePaymentMethodSelect('invoice')}>
          <FileText /> Faktura
        </button>
        <button onClick={() => handlePaymentMethodSelect('giftcard')}>
          <Gift /> Presentkort
        </button>
        <button onClick={() => setIsSplitPaymentOpen(true)}>
          <CreditCard /> Delad betalning
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