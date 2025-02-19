import React from 'react';
import { CreditCard, Banknote, Smartphone, Gift, ArrowLeft } from 'lucide-react';
import './Payments.css';

const PaymentMethodSelector = ({ onSelect, onClose, isOpen }) => {
  if (!isOpen) return null;
  
  const methods = [
    { id: 'card', icon: CreditCard, label: 'Kort' },
    { id: 'cash', icon: Banknote, label: 'Kontant' },
    { id: 'swish', icon: Smartphone, label: 'Swish' },
    { id: 'giftcard', icon: Gift, label: 'Presentkort' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-selector" onClick={e => e.stopPropagation()}>
        <h3>Välj betalningsmetod</h3>
        
        <div className="payment-method-options">
          {methods.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                onSelect(id);
                onClose();
              }}
              className="payment-method-option"
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <button className="method-back-button" onClick={onClose}>
          <ArrowLeft size={20} />
          <span>Tillbaka</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;