// src/Components/Payments/components/PaymentStatus.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { STATUS_MESSAGES, DECLINE_MESSAGES } from '../../../utils/paymentUtils';

const LOADING_STATUSES = [
  'processing',
  'awaiting_card', 
  'awaiting_scan',
  'verifying',
  'verifying_card',
  'invoice_sent'
];

const PaymentStatus = ({ paymentStatus = 'idle', declineReason = '' }) => {
  if (paymentStatus === 'idle') return null;
  
  return (
    <div className="payment-status">
      {LOADING_STATUSES.includes(paymentStatus) && (
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

PaymentStatus.propTypes = {
  paymentStatus: PropTypes.oneOf([
    'idle',
    ...LOADING_STATUSES,
    'approved',
    'declined'
  ]),
  declineReason: PropTypes.string
};

export default PaymentStatus;
