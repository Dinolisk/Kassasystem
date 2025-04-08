import React from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  FileText, 
  Gift, 
  Wallet 
} from 'lucide-react';

const PaymentMethodSelector = ({
  partialPayments,
  currentRemainingTotal,
  formatPrice,
  handlePaymentMethodSelect,
  onClose
}) => {
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
            <ArrowLeft size={16} />
            <span>Tillbaka</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentMethodSelector;
