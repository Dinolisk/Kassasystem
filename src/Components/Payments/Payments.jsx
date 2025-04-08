import React, { useState, useEffect } from 'react';
import './Payments.css';
import { simulatePayment, getPaymentMethodLabel } from './utils/paymentUtils';
import CardPayment from './methods/CardPayment';
import CashPayment from './methods/CashPayment';
import SwishPayment from './methods/SwishPayment';
import InvoicePayment from './methods/InvoicePayment';
import GiftCardPayment from './methods/GiftCardPayment';
import KlarnaPayment from './methods/KlarnaPayment';
import OrderSummary from './components/OrderSummary';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import PaymentCompletedView from './components/PaymentCompletedView';
import PaymentStatusHandler from './components/PaymentStatusHandler';

const BASE_URL = import.meta.env.VITE_API_URL;

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

  const handleCompletePayment = (method, amount, details) => {
    const result = simulatePayment(
      amount,
      currentRemainingTotal,
      method,
      details,
      formatPrice
    );

    if (result.status === 'declined') {
      setPaymentStatus('declined');
      setDeclineReason(result.declineReason);
      return;
    }

    const updatedPayments = [...partialPayments, result.payment];
    setPartialPayments(updatedPayments);
    setCurrentRemainingTotal(result.remainingTotal);
    setPaymentMessage(result.message);
    setPaymentStatus('success');

    if (result.remainingTotal <= 0.01) {
      finishPayment(updatedPayments);
    } else {
      setSelectedPaymentMethod('');
      setPaymentStatus('idle');
    }
  };

  const finishPayment = (finalPayments) => {
    const finalPaymentData = finalPayments || [...partialPayments];
    const paidTotal = finalPaymentData.reduce((sum, payment) => sum + Number(payment.amount), 0);
    
    fetch(`${BASE_URL}/receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethods: finalPaymentData, total }),
    })
      .then(response => response.json())
      .then(data => {
        setPaymentMessage(`Betalning slutförd! ${data.message}`);
      })
      .catch(error => {
        console.error('Fel vid skick till servern:', error);
        setPaymentMessage('Betalning slutförd, men fel vid kommunikation med servern');
      });

    if (typeof onPaymentComplete === 'function') {
      onPaymentComplete(finalPaymentData);
    }
    
    setPartialPayments([]);
    setCurrentRemainingTotal(0);
    onClose();
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentStatus('idle');
    setDeclineReason('');
    setPaymentMessage('');
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
      case 'card': return <CardPayment {...sharedProps} />;
      case 'cash': return <CashPayment {...sharedProps} />;
      case 'swish': return <SwishPayment {...sharedProps} />;
      case 'invoice': return <InvoicePayment {...sharedProps} />;
      case 'giftcard': return <GiftCardPayment {...sharedProps} />;
      case 'klarna': return <KlarnaPayment {...sharedProps} />;
      default: return null;
    }
  };

  const renderContent = () => {
    if (paymentStatus === 'success' && currentRemainingTotal === 0) {
      return <PaymentCompletedView total={total} formatPrice={formatPrice} />;
    }
    
    if (selectedPaymentMethod) {
      return (
        <>
          <div className="payment-method-view">
            {renderPaymentMethod()}
          </div>
          <PaymentStatusHandler 
            paymentStatus={paymentStatus}
            declineReason={declineReason}
            paymentMessage={paymentMessage}
          />
        </>
      );
    }

    return (
      <>
        <PaymentMethodSelector
          partialPayments={partialPayments}
          currentRemainingTotal={currentRemainingTotal}
          formatPrice={formatPrice}
          handlePaymentMethodSelect={handlePaymentMethodSelect}
          onClose={onClose}
        />
        <PaymentStatusHandler 
          paymentStatus={paymentStatus}
          declineReason={declineReason}
          paymentMessage={paymentMessage}
        />
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget && paymentStatus === 'idle' && partialPayments.length === 0) {
        onClose();
      }
    }}>
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
