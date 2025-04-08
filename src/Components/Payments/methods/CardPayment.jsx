import React, { useState, useRef } from 'react';
import { 
  simulatePaymentProcess,
  STATUS_MESSAGES,
  handleAmountChange as handleAmountChangeUtil,
  increaseAmount,
  decreaseAmount
} from '../../../utils/paymentUtils';
import AmountControls from '../shared/AmountControls';
import PaymentStatusModal from '../shared/PaymentStatusModal';
import { CreditCard, ArrowLeft } from 'lucide-react';
import './Cardpayment.css';
import '../shared/AmountControls.css';

const CardPayment = ({
  remainingTotal,
  formatPrice,
  completePayment,
  onBack,
}) => {
  const [amount, setAmount] = useState(remainingTotal);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const cancelRef = useRef(false);

  const updateAmount = (newAmount) => {
    setAmount(newAmount);
  };

  const handleQuickAmount = (percent) => {
    const newAmount = Math.round(remainingTotal * percent * 100) / 100;
    setAmount(newAmount);
  };

  const handlePayment = async () => {
    if (amount <= 0) return;

    cancelRef.current = false;
    setPaymentStatus('processing');
    setStatusMessage(STATUS_MESSAGES.awaiting_card);
    setShowStatusModal(true);

    const { success } = await simulatePaymentProcess(
      'card',
      (status, messageKey) => {
        setPaymentStatus(status);
        setStatusMessage(messageKey ? STATUS_MESSAGES[messageKey] || messageKey : '');
      },
      () => cancelRef.current
    );

    if (success) {
      setTimeout(() => {
        completePayment('card', amount);
        setShowStatusModal(false);
      }, 1000);
    } else if (!cancelRef.current) {
      setTimeout(() => setShowStatusModal(false), 2000);
    }
  };

  return (
    <div className="card-payment-container">
      <h2>Kortbetalning</h2>
      
      <div className="card-amount-total">
        <div className="card-amount-layout">
          <span className="card-amount-label">Belopp att betala:</span>
          <div className="card-amount-controls">
            <AmountControls
              amount={amount}
              remainingTotal={remainingTotal}
              currentPaymentStatus={paymentStatus}
              onAmountChange={updateAmount}
              onIncrease={() => updateAmount(increaseAmount(amount, remainingTotal))}
              onDecrease={() => updateAmount(decreaseAmount(amount))}
              onReset={() => updateAmount(remainingTotal)}
            />
          </div>
        </div>
      </div>

      <div className="quick-amount-buttons">
        <button 
          className={`quick-amount-btn ${Math.abs(amount - remainingTotal) < 0.01 ? 'active' : ''}`} 
          onClick={() => handleQuickAmount(1.0)}
          disabled={paymentStatus !== 'idle'}
        >
          100%
        </button>
        <button 
          className={`quick-amount-btn ${Math.abs(amount - (remainingTotal * 0.75)) < 0.01 ? 'active' : ''}`} 
          onClick={() => handleQuickAmount(0.75)}
          disabled={paymentStatus !== 'idle'}
        >
          75%
        </button>
        <button 
          className={`quick-amount-btn ${Math.abs(amount - (remainingTotal * 0.5)) < 0.01 ? 'active' : ''}`} 
          onClick={() => handleQuickAmount(0.5)}
          disabled={paymentStatus !== 'idle'}
        >
          50%
        </button>
        <button 
          className={`quick-amount-btn ${Math.abs(amount - (remainingTotal * 0.25)) < 0.01 ? 'active' : ''}`} 
          onClick={() => handleQuickAmount(0.25)}
          disabled={paymentStatus !== 'idle'}
        >
          25%
        </button>
      </div>

      <div className="card-brands-container">
        <div className="accepted-cards-label">Accepterade kort:</div>
        <div className="card-brands">
          <div className="card-brand visa" aria-label="Visa">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="25">
              <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
              <path fill="#FFF" d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 19h2.948l-2.882 11H17.689zM24.92 19.285c.667-.678.979-1.283 1.774-1.285 1.218-.003 1.751 1.285 1.751 1.285L32.206 30h-3.162l-.572-6c.608 1.354.811 2.401-1.484 2.401H25.5L24.92 19.285zM40.77 25.29v.983c0 .553-.238 1.095-.665 1.506-.398.383-1.06.703-2.099.703-.614 0-1.071-.17-1.368-.332-.297-.166-.507-.391-.376-.391h-.044l.448-1.865c0-.127.119-.127.136-.127.018 0 .053.01.119.063.037.593.354 1.054 1.093 1.054.534 0 .809-.259.809-.664 0-.414-.275-.676-.943-.958-.666-.287-1.677-.819-1.677-1.891 0-.498.239-.992.67-1.363.433-.371 1.061-.574 1.854-.574 1.457 0 1.844.868 1.627.868h.01l-.438 1.861c-.01.053-.037.074-.081.074-.044 0-.044-.021-.063-.074-.165-.362-.404-.735-.955-.735-.404 0-.697.224-.697.584 0 .341.248.585.615.779C39.727 24.086 40.77 24.372 40.77 25.29z"/>
            </svg>
          </div>
          <div className="card-brand mastercard" aria-label="Mastercard">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="25">
              <path fill="#3F51B5" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
              <path fill="#FFC107" d="M30,24c0,3.314-2.686,6-6,6s-6-2.686-6-6s2.686-6,6-6S30,20.686,30,24"/>
              <path fill="#FF3D00" d="M22.001,24c0-1.658,0.672-3.156,1.761-4.242C22.674,18.673,21.171,18,19.501,18c-3.314,0-6,2.686-6,6s2.686,6,6,6c1.67,0,3.174-0.673,4.261-1.758C22.673,27.156,22.001,25.658,22.001,24"/>
              <path fill="#F44336" d="M34.413,18.001h-0.82v0.016h-0.016l-1.634,3.699l-1.634-3.699h-0.835v3.796l-1.572-3.796h-0.699l-1.619,3.931h0.646l0.346-0.9h1.916l0.356,0.9h1.303v-2.879l1.604,3.806l0.341-0.002l1.604-3.788v2.863h0.617v-3.947H34.413z"/>
              <path fill="#F44336" d="M23.999 21.448c-.126-.196-.375-.294-.747-.294h-1.279v1.47h1.279c.345 0 .595-.118.747-.354.099-.158.149-.335.149-.529C24.148 21.511 24.098 21.398 23.999 21.448zM23.907 22.04c-.101.137-.271.205-.51.205h-.596v-1.006h.596c.239 0 .409.069.51.21.68.88.102.188.102.301C24.01 21.86 23.976 21.958 23.907 22.04z"/>
              <path fill="#F44336" d="M24.147,20.868c-0.122-0.186-0.345-0.279-0.67-0.279h-1.279v2.625h1.279c0.325,0,0.548-0.104,0.67-0.31c0.078-0.139,0.118-0.292,0.118-0.459v-1.07C24.265,21.163,24.225,21.011,24.147,20.868z M23.907,22.04c-0.101,0.137-0.271,0.205-0.51,0.205h-0.596v-1.006h0.596c0.239,0,0.409,0.069,0.51,0.21c0.068,0.088,0.102,0.188,0.102,0.301C24.01,21.86,23.976,21.958,23.907,22.04z"/>
              <path fill="#F44336" d="M25.171,20.589h-0.448l-0.897,1.097l-0.897-1.097h-0.464l1.158,1.416v1.208h0.389v-1.213L25.171,20.589z"/>
            </svg>
          </div>
          <div className="card-brand amex" aria-label="American Express">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="25">
              <path fill="#1976D2" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
              <path fill="#FFF" d="M22.471 30.894l-.7-1.599h-3.77l-.716 1.599h-2.166l3.905-8.634h1.945l3.748 8.634H22.471zM19.818 24.606l-1.169 2.639h2.3L19.818 24.606zM25.607 30.894v-8.634h3.268c2.193 0 3.346 1.203 3.346 2.786 0 1.02-.496 1.848-1.314 2.254 1.352.465 1.873 1.533 1.873 2.475 0 1.397-.974 3.12-3.307 3.12h-3.866v-.001zm2.049-6.879v1.532h1.314c.535 0 .974-.349.974-.776 0-.465-.323-.756-.934-.756h-1.354zm0 3.1v2.021h1.393c.933 0 1.236-.581 1.236-1.048 0-.484-.323-1.048-1.139-1.048h-1.49v.075zM11.1 30.894l-3.073-4.147v4.147H6V22.26h2.049l2.98 4.109V22.26h2.027v8.634H11.1z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="terminal-instructions">
        Vänligen följ instruktionerna på kortterminalen
      </div>

      <button
        onClick={handlePayment}
        className="card-payment-button"
        disabled={paymentStatus !== 'idle' || amount <= 0}
        aria-label="Genomför kortbetalning"
      >
        <CreditCard size={18} style={{ marginRight: '8px' }} />
        Betala med kort
      </button>
      
      <button 
        onClick={onBack} 
        className="payment-method-back-button"
        disabled={paymentStatus !== 'idle'}
      >
        <ArrowLeft size={18} />
        Tillbaka
      </button>

      <PaymentStatusModal
        show={showStatusModal}
        status={paymentStatus}
        message={statusMessage}
        onClose={() => setShowStatusModal(false)}
      />
    </div>
  );
};

export default CardPayment;
