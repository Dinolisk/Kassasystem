// src/Components/Payments/methods/SwishPayment.jsx
import React from 'react';
import { Smartphone } from 'lucide-react';

export const SwishPayment = ({
  remainingTotal,
  paymentStatus,
  formatPrice,
  handleSwishPayment
}) => {
  return (
    <div className="payment-method-container">
      <h3>
        <Smartphone size={24} className="mr-2" />
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
};

export default SwishPayment;