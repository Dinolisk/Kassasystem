// src/Components/Payments/methods/GiftCardPayment.jsx
import React from 'react';
import { Gift, CheckCircle2, Loader2 } from 'lucide-react';

export const GiftCardPayment = ({
  remainingTotal,
  paymentStatus,
  formatPrice,
  handleGiftCardPayment,
  giftCardNumber,
  setGiftCardNumber
}) => {
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
};
export default GiftCardPayment;