import React, { useState, useEffect } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector.jsx';
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

// Importera komponenter
import { CardPayment } from './methods/CardPayment';
import CashPayment from './methods/CashPayment';
import SwishPayment from './methods/SwishPayment';
import InvoicePayment from './methods/InvoicePayment';
import GiftCardPayment from './methods/GiftCardPayment';
import PaymentStatus from './components/PaymentStatus';
import InsufficientBalanceModal from './components/InsufficientBalanceModal';

// Importera utility-funktioner
import { 
  METHOD_LABELS,
  createPaymentObject,
  simulatePaymentProcess,
  formatPartialPaymentMessage,
  processPayment,
  verifyGiftCard,
  GIFT_CARD_DATABASE
} from '../../utils/paymentUtils';

const Payments = ({ 
  isOpen, 
  onClose, 
  total, 
  onPaymentComplete, 
  formatPrice,
  cartItems
}) => {
  // Gift card database hämtas nu från utils

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
    setDeclineReason('');
  };
  
  const handleSplitPaymentComplete = (splitPayments) => {
    setIsSplitPaymentOpen(false);
    
    // Create a local variable to store the payment methods we'll pass forward
    let methodsToPass = [];
    
    if (splitPayments) {
      if (Array.isArray(splitPayments)) {
        methodsToPass = splitPayments;
      } else if (splitPayments.paymentMethods && Array.isArray(splitPayments.paymentMethods)) {
        methodsToPass = splitPayments.paymentMethods;
      } else {
        methodsToPass = [{ 
          method: 'split', 
          amount: total, 
          label: 'Delad betalning',
          timestamp: new Date().toISOString()
        }];
      }
    } else {
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
        return {
          ...method,
          label: METHOD_LABELS[method.method] || method.method,
          timestamp: method.timestamp || new Date().toISOString()
        };
      }
      return {
        ...method,
        timestamp: method.timestamp || new Date().toISOString()
      };
    });
    
    // Kör direkt utan fördröjningar
    onPaymentComplete(methodsToPass);
    onClose();
  };

  const completePayment = (method, amount) => {
    // Callback för att hantera statusuppdateringar
    const handleStatusChange = (status, reason = '') => {
      setPaymentStatus(status);
      if (reason) setDeclineReason(reason);
    };
    
    // Callback när betalningen är klar
    const onSuccess = (updatedPayments) => {
      onPaymentComplete(updatedPayments);
      resetAllStates();
      onClose();
    };
    
    // Callback för delbetalning
    const onPartialSuccess = (updatedPayments, newRemainingAmount, message) => {
      setPartialPayments(updatedPayments);
      setRemainingTotal(newRemainingAmount);
      setPaymentStatus('idle');
      setPaymentMessage(message);
      setSelectedPaymentMethod('');
    };
    
    // Använd processPayment-funktionen från utils
    processPayment(
      method,
      amount,
      remainingTotal,
      partialPayments,
      handleStatusChange,
      onSuccess,
      onPartialSuccess,
      formatPrice
    );
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
      // Verify gift card balance med verifyGiftCard från utils
      const balance = verifyGiftCard(giftCardNumber);
      
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
        const balance = verifyGiftCard(giftCardNumber);
        
        // Skapa betalningsobjektet med utility-funktionen
        const newPayment = createPaymentObject('giftcard', balance);
        
        // Lägg till presentkortsbetalningen i partialPayments
        setPartialPayments([newPayment]);
        
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
        
        // Visa ett meddelande om använt presentkort med utility-funktionen
        setPaymentMessage(formatPartialPaymentMessage('giftcard', balance, remainingToPay, formatPrice));
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

  // Rendera InsufficientBalanceModal
  const renderInsufficientBalanceModal = () => {
    return (
      <InsufficientBalanceModal 
        insufficientBalanceModal={insufficientBalanceModal}
        formatPrice={formatPrice}
        handleInsufficientBalanceOption={handleInsufficientBalanceOption}
        completePayment={completePayment}
        setInsufficientBalanceModal={setInsufficientBalanceModal}
      />
    );
  };

  // Uppdatera renderPaymentMethod i Payments.jsx
  const renderPaymentMethod = () => {
    switch (selectedPaymentMethod) {
      case 'card':
        return (
          <CardPayment
            remainingTotal={remainingTotal}
            paymentStatus={paymentStatus}
            formatPrice={formatPrice}
            completePayment={completePayment}
          />
        );
        
      case 'cash':
        return (
          <CashPayment
            remainingTotal={remainingTotal}
            paymentStatus={paymentStatus}
            formatPrice={formatPrice}
            cashAmount={cashAmount}
            setCashAmount={setCashAmount}
            change={change}
            handleCashAmount={handleCashAmount}
            handleCashPayment={handleCashPayment}
          />
        );

      case 'swish':
        return (
          <SwishPayment
            remainingTotal={remainingTotal}
            paymentStatus={paymentStatus}
            formatPrice={formatPrice}
            handleSwishPayment={handleSwishPayment}
          />
        );
      
      case 'invoice':
        return (
          <InvoicePayment
            remainingTotal={remainingTotal}
            paymentStatus={paymentStatus}
            formatPrice={formatPrice}
            handleInvoicePayment={handleInvoicePayment}
            personnummer={personnummer}
            setPersonnummer={setPersonnummer}
            email={email}
            setEmail={setEmail}
          />
        );

      case 'giftcard':
        return (
          <GiftCardPayment
            remainingTotal={remainingTotal}
            paymentStatus={paymentStatus}
            formatPrice={formatPrice}
            handleGiftCardPayment={handleGiftCardPayment}
            giftCardNumber={giftCardNumber}
            setGiftCardNumber={setGiftCardNumber}
          />
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
          <PaymentStatus paymentStatus={paymentStatus} declineReason={declineReason} />
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
        <PaymentStatus paymentStatus={paymentStatus} declineReason={declineReason} />
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