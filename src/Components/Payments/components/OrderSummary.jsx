// OrderSummary.jsx (uppdaterad med kompakt design)
import React from 'react';
import './OrderSummary.css';

const OrderSummary = ({ cartItems, total, partialPayments, remainingTotal, formatPrice, formatProductName }) => {
  return (
    <div className="order-summary">
      <div className="order-summary-header">
        <h3>Ordersammanfattning</h3>
      </div>
      
      <div className="order-header">
        <span className="column-product">Artiklar</span>
        <span className="column-quantity">Antal</span>
        <span className="column-price">Pris</span>
      </div>
      
      <div className="order-items">
        <div className="order-items-list">
          {cartItems && cartItems.length > 0 && cartItems.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-name">
                {formatProductName ? formatProductName(item.title) : item.title}
              </span>
              <span className="item-quantity">
                {item.quantity}×
              </span>
              <span className="item-price">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="order-total">
        <span>Totalt:</span>
        <span>{formatPrice(total)}</span>
      </div>
      
      {partialPayments && partialPayments.length > 0 && (
        <div className="payment-status-section">
          <h4>Betalningsstatus</h4>
          <div className="payment-details">
            <div className="payment-row">
              <span>Totalt belopp:</span>
              <span>{formatPrice(total)}</span>
            </div>
            {partialPayments.map((payment, index) => (
              <div key={index} className="payment-row paid">
                <span>{payment.label || 'Betalning'}</span>
                <span>-{formatPrice(payment.amount)}</span>
              </div>
            ))}
            <div className="payment-row remaining">
              <span>Återstår:</span>
              <span>{formatPrice(remainingTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;