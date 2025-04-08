import React from 'react';
import PaymentStatus from './PaymentStatus';

const PaymentStatusHandler = ({ 
  paymentStatus,
  declineReason,
  paymentMessage
}) => {
  return (
    <>
      <PaymentStatus paymentStatus={paymentStatus} declineReason={declineReason} />
      {paymentMessage && <div className="payment-message">{paymentMessage}</div>}
    </>
  );
};

export default PaymentStatusHandler;
