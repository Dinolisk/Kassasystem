import React, { useState, useEffect } from 'react';
import './Payments.css';
import { ArrowLeft, CreditCard, Banknote, Smartphone, FileText, Gift, Wallet } from 'lucide-react';
import CardPayment from './methods/CardPayment';
import CashPayment from './methods/CashPayment';
import SwishPayment from './methods/SwishPayment';
import InvoicePayment from './methods/InvoicePayment';
import GiftCardPayment from './methods/GiftCardPayment';
import KlarnaPayment from './methods/KlarnaPayment.jsx';
import OrderSummary from './components/OrderSummary';
import PaymentStatus from './components/PaymentStatus';

export const Payments = ({
  isOpen,
  onClose,
  total,
  remainingTotal,
  cartItems,
  formatPrice,
  formatProductName,
  onPaymentComplete,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [declineReason, setDeclineReason] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [partialPayments, setPartialPayments] = useState([]);
  const [currentRemainingTotal, setCurrentRemainingTotal] = useState(total);

  useEffect(() => {
    if (isOpen) {
      setSelectedPaymentMethod('');
      setPaymentStatus('idle');
      setDeclineReason('');
      setPaymentMessage('');
      setPartialPayments([]);
      setCurrentRemainingTotal(remainingTotal || total);
    }
  }, [isOpen, remainingTotal, total]);

  const simulatePayment = (method, amount, details) => {
    if (amount > currentRemainingTotal) {
      setPaymentStatus('declined');
      setDeclineReason(`Beloppet överstiger resterande summa, max ${formatPrice(currentRemainingTotal)}`);
      return;
    }

    const numericAmount = Number(amount);
    
    setPaymentStatus('processing');
    setTimeout(() => {
      const randomOutcome = Math.random();
      if (randomOutcome < 0.9) {
        const methodLabel = getPaymentMethodLabel(method);
        const updatedPayments = [
          ...partialPayments,
          { 
            method, 
            amount: numericAmount, 
            label: methodLabel,
            details: details
          },
        ];
        setPartialPayments(updatedPayments);
        
        const newRemainingTotal = Math.max(0, Number((currentRemainingTotal - numericAmount).toFixed(2)));
        setCurrentRemainingTotal(newRemainingTotal);
        
        let successMessage = `Betalning på ${formatPrice(numericAmount)} genomförd med ${methodLabel}!`;
        
        if (method === 'invoice') {
          const destination = details && details.email 
            ? `e-post (${details.email})` 
            : 'postadress';
          
          successMessage = `Faktura på ${formatPrice(numericAmount)} har skickats till ${destination}!`;
          
          if (details && details.reference) {
            successMessage += ` Referens: ${details.reference}`;
          }
        }
        
        if (method === 'giftcard') {
          const cardCount = details && details.cards ? details.cards.length : 0;
          const cardWord = cardCount === 1 ? 'presentkort' : 'presentkort';
          
          successMessage = `Betalning på ${formatPrice(numericAmount)} genomförd med ${cardCount} ${cardWord}!`;
        }
        
        if (method === 'klarna') {
          successMessage = `Betalning på ${formatPrice(numericAmount)} har initierats med Klarna!`;
          if (details && details.email) {
            successMessage += ` Bekräftelse skickas till ${details.email}.`;
          }
        }

        setPaymentMessage(successMessage);
        
        setPaymentStatus('success');
        
        if (newRemainingTotal > 0) {
          setTimeout(() => {
            setSelectedPaymentMethod('');
            setPaymentStatus('idle');
            setPaymentMessage('');
          }, 1500);
        } else {
          setTimeout(() => {
            finishPayment();
          }, 2000);
        }
      } else {
        setPaymentStatus('declined');
        setDeclineReason('Betalningen avvisades. Försök igen.');
      }
    }, 1500);
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'card': 'Kort',
      'cash': 'Kontant',
      'swish': 'Swish',
      'invoice': 'Faktura',
      'giftcard': 'Presentkort',
      'klarna': 'Klarna',
    };
    return labels[method] || method;
  };

  const finishPayment = () => {
    setPaymentStatus('success');
    setPaymentMessage(`Betalning slutförd! Totalt: ${formatPrice(total)}`);
    
    let finalPaymentData = [...partialPayments];
    
    const paidTotal = finalPaymentData.reduce((sum, payment) => sum + Number(payment.amount), 0);
    
    if (Math.abs(paidTotal - total) > 0.01) {
      console.log(`Betalat belopp (${paidTotal}) matchar inte total (${total}), lägger till justering`);
      
      const lastPayment = finalPaymentData[finalPaymentData.length - 1];
      const method = lastPayment ? lastPayment.method : 'card';
      const label = lastPayment ? lastPayment.label : 'Kort';
      
      finalPaymentData.push({
        method,
        amount: Number((total - paidTotal).toFixed(2)),
        label,
        isAdjustment: true
      });
    }
    
    setTimeout(() => {
      if (typeof onPaymentComplete === 'function') {
        console.log("Calling onPaymentComplete with:", finalPaymentData);
        onPaymentComplete(finalPaymentData);
      } else {
        console.warn("onPaymentComplete function is not provided");
      }
      
      setPartialPayments([]);
      setCurrentRemainingTotal(0);
      
      onClose();
    }, 2500);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentStatus('idle');
    setDeclineReason('');
    setPaymentMessage('');
  };

  const handleCompletePayment = (method, amount, details) => {
    simulatePayment(method, amount, details);
  };

  const renderPaymentMethod = () => {
    const sharedProps = {
      remainingTotal: currentRemainingTotal,
      paymentStatus: paymentStatus,
      formatPrice: formatPrice,
      completePayment: handleCompletePayment,
      onBack: () => setSelectedPaymentMethod(''),
    };

    switch (selectedPaymentMethod) {
      case 'card':
        return <CardPayment {...sharedProps} />;
      case 'cash':
        return <CashPayment {...sharedProps} />;
      case 'swish':
        return <SwishPayment {...sharedProps} />;
      case 'invoice':
        return <InvoicePayment {...sharedProps} />;
      case 'giftcard':
        return <GiftCardPayment {...sharedProps} />;
      case 'klarna':
        return <KlarnaPayment {...sharedProps} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (paymentStatus === 'success' && currentRemainingTotal === 0) {
      return (
        <div className="payment-completed-view">
          <div className="payment-success-icon">✓</div>
          <h2>Betalning slutförd</h2>
          <div className="payment-message">
            {paymentMessage}
          </div>
          <div className="payment-summary">
            Totalt: {formatPrice(total)}
          </div>
        </div>
      );
    }
    
    if (selectedPaymentMethod) {
      return (
        <>
          <div className="payment-method-view">
            {renderPaymentMethod()}
          </div>
          <PaymentStatus paymentStatus={paymentStatus} declineReason={declineReason} />
          {paymentMessage && <div className="payment-message">{paymentMessage}</div>}
        </>
      );
    }

    const paymentTitle = partialPayments.length > 0
      ? 'Välj nästa betalningsmetod'
      : 'Betalningsalternativ';

    return (
      <>
        <h2>{paymentTitle}</h2>

        {partialPayments.length > 0 && (
          <div className="partial-payments-summary">
            <div className="partial-payments-info">
              <span>Betalat hittills:</span>
              <span className="partial-amount">
                {formatPrice(total - currentRemainingTotal)}
              </span>
              <span className="partial-remaining">
                Återstående: {formatPrice(currentRemainingTotal)}
              </span>
            </div>
            <div className="partial-payments-methods">
              {partialPayments.map((payment, index) => (
                <div key={index} className="partial-payment-tag">
                  {payment.label}: {formatPrice(payment.amount)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="payment-options-container">
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
              className="soft-menu-button payment-klarna-button"
              onClick={() => handlePaymentMethodSelect('klarna')}
            >
              <Wallet /> Klarna
            </button>

            <button 
              className="modal-back-button" 
              onClick={onClose}
              disabled={partialPayments.length > 0}
            >
              <ArrowLeft size={16} /> {/* Uppdatera till 16px för att matcha gamla designen */}
              <span>Tillbaka</span>
            </button>
          </div>
        </div>
        <PaymentStatus paymentStatus={paymentStatus} declineReason={declineReason} />
        {paymentMessage && <div className="payment-message">{paymentMessage}</div>}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && paymentStatus === 'idle' && partialPayments.length === 0) {
          onClose();
        }
      }}
    >
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`payment-main-content ${selectedPaymentMethod ? 'center-content' : ''}`}>
          {renderContent()}
        </div>
        <div className="order-summary-sidebar">
          <OrderSummary
            cartItems={cartItems}
            total={total}
            partialPayments={partialPayments}
            remainingTotal={currentRemainingTotal}
            formatPrice={formatPrice}
            formatProductName={formatProductName}
          />
        </div>
      </div>
    </div>
  );
};

export default Payments;