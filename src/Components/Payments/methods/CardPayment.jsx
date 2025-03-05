// src/Components/Payments/methods/CardPayment.jsx
import React from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { METHOD_LABELS } from '../../../utils/paymentUtils';

export const CardPayment = ({
    remainingTotal,
    paymentStatus,
    formatPrice,
    completePayment,
    allowPartialPayment = false,
    onPartialPayment = null
  }) => {
  return (
    <div className="payment-method-container">
      <h3>
        <CreditCard size={24} className="mr-2" />
        {METHOD_LABELS.card}
      </h3>
      <p className="amount-display">
        <span>Total att betala:</span>
        <span>{formatPrice(remainingTotal)}</span>
      </p>
      {/* Bekräfta-knapp visas endast om betalningen inte redan pågår */}
      {paymentStatus === 'idle' && (
        <button 
          onClick={() => completePayment('card', remainingTotal)}
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
};

export default CardPayment;
