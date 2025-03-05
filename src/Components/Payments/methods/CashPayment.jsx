// src/Components/Payments/methods/CashPayment.jsx
import React from 'react';
import { Banknote, CheckCircle2 } from 'lucide-react';

export const CashPayment = ({
  remainingTotal,
  paymentStatus,
  formatPrice,
  completePayment,
  cashAmount,
  setCashAmount,
  change,
  handleCashAmount,
  handleCashPayment
}) => {
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
};

export default CashPayment;