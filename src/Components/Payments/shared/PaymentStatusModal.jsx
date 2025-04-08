import React from 'react';
import { CheckCircle, Loader, XCircle } from 'lucide-react';

const PaymentStatusModal = ({
  show,
  status,
  message,
  onClose
}) => {
  if (!show) return null;

  const getStatusIcon = () => {
    switch(status) {
      case 'processing':
        return <Loader className="status-icon spinning" size={36} />;
      case 'completed':
        return <CheckCircle className="status-icon" size={36} />;
      case 'declined':
        return <XCircle className="status-icon" size={36} />;
      default:
        return null;
    }
  };

  return (
    <div className="payment-overlay" role="dialog" aria-modal="true" aria-labelledby="payment-status-title">
      <div className="payment-modal">
        <div className={`payment-status-modal ${status}`}>
          {getStatusIcon()}
          <h2 id="payment-status-title" className="status-title">
            {status === 'processing' ? 'Processing' : 
             status === 'completed' ? 'Completed' : 'Payment Failed'}
          </h2>
          <div className="status-message">
            {message}
          </div>
          {status !== 'processing' && (
            <button 
              onClick={onClose}
              className="status-close-button"
              aria-label="Close payment status"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusModal;
