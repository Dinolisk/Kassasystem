// src/Components/Payments/methods/InvoicePayment.jsx
import React from 'react';
import { FileText } from 'lucide-react';

export const InvoicePayment = ({
  remainingTotal,
  paymentStatus,
  formatPrice,
  handleInvoicePayment,
  personnummer,
  setPersonnummer,
  email,
  setEmail
}) => {
  return (
    <div className="payment-method-container">
      <h3>
        <FileText size={24} className="mr-2" />
        Faktura
      </h3>
      <p className="amount-display">
        <span>Total att betala:</span>
        <span>{formatPrice(remainingTotal)}</span>
      </p>
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
};

export default InvoicePayment;

