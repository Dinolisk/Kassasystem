// src/Components/Payments/components/PaymentStatus.jsx
import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { STATUS_MESSAGES, DECLINE_MESSAGES } from '../../../utils/paymentUtils';

const PaymentStatus = ({ paymentStatus, declineReason }) => {
  if (paymentStatus === 'idle') return null;
  
  return (
    <div className="payment-status">
      {['processing', 'awaiting_card', 'awaiting_scan', 'verifying', 'verifying_card', 'awaiting_card', 'invoice_sent'].includes(paymentStatus) && (
        <>
          <Loader2 className="animate-spin" size={48} />
          <p>{STATUS_MESSAGES[paymentStatus]}</p>
        </>
      )}
      {paymentStatus === 'approved' && (
        <>
          <CheckCircle2 className="text-green-500" size={48} />
          <p>{STATUS_MESSAGES[paymentStatus]}</p>
        </>
      )}
      {paymentStatus === 'declined' && (
        <>
          <XCircle className="text-red-500" size={48} />
          <p>{declineReason ? DECLINE_MESSAGES[declineReason] || DECLINE_MESSAGES.default : DECLINE_MESSAGES.default}</p>
        </>
      )}
    </div>
  );
};

export default PaymentStatus;