import React from 'react';

const PaymentCompletedView = ({ total, formatPrice }) => {
  return (
    <div className="payment-completed-view">
      <div className="payment-success-icon">✓</div>
      <h2>Betalning slutförd</h2>
      <div className="payment-summary">
        Totalt: {formatPrice(total)}
      </div>
    </div>
  );
};

export default PaymentCompletedView;
