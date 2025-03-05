// src/Components/Payments/components/InsufficientBalanceModal.jsx
import React from 'react';
import { Gift, CreditCard, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export const InsufficientBalanceModal = ({
  insufficientBalanceModal,
  formatPrice,
  handleInsufficientBalanceOption,
  completePayment,
  setInsufficientBalanceModal
}) => {
  if (!insufficientBalanceModal) return null;

  const { 
    cardBalance, 
    totalAmount, 
    remainingAmount, 
    remainingBalance, 
    isConfirmation 
  } = insufficientBalanceModal;

  return (
    <div className="modal-overlay">
      <div className="modal-content giftcard-dialog" onClick={e => e.stopPropagation()}>
        <h2>
          <Gift size={28} />
          {isConfirmation ? 'Bekräfta presentkort' : 'Otillräckigt presentkortssaldo'}
        </h2>
          
          {isConfirmation ? (
            <div className="giftcard-confirmation">
              <div className="giftcard-info-container">
                <div className="giftcard-info-row">
                  <span className="info-label">Presentkortets saldo:</span>
                  <span className="info-value">{formatPrice(cardBalance)}</span>
                </div>
                <div className="giftcard-info-row">
                  <span className="info-label">Total att betala:</span>
                  <span className="info-value">{formatPrice(totalAmount)}</span>
                </div>
                <div className="giftcard-info-row highlight">
                  <span className="info-label">Återstående saldo:</span>
                  <span className="info-value positive">{formatPrice(remainingBalance)}</span>
                </div>
              </div>
              
              <div className="giftcard-button-group">
                <button 
                  onClick={() => {
                    // Stäng bekräftelsemodalen
                    setInsufficientBalanceModal(null);
                    // Initiera betalningsprocessen
                    completePayment('giftcard', totalAmount);
                  }}
                  className="primary-button confirm-button"
                >
                  <div className="button-with-icon">
                    <CheckCircle2 size={20} />
                    <span>Bekräfta betalning</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => setInsufficientBalanceModal(null)}
                  className="cancel-button"
                >
                  <div className="button-with-icon">
                    <XCircle size={20} />
                    <span>Avbryt</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="giftcard-insufficient">
              <div className="giftcard-info-container">
                <div className="giftcard-info-row">
                  <span className="info-label">Presentkortets saldo:</span>
                  <span className="info-value">{formatPrice(cardBalance)}</span>
                </div>
                <div className="giftcard-info-row">
                  <span className="info-label">Total att betala:</span>
                  <span className="info-value">{formatPrice(totalAmount)}</span>
                </div>
                <div className="giftcard-info-row highlight">
                  <span className="info-label">Saknas:</span>
                  <span className="info-value negative">{formatPrice(remainingAmount)}</span>
                </div>
              </div>

              <div className="giftcard-button-group">
                <button 
                  onClick={() => handleInsufficientBalanceOption('partial')}
                  className="primary-button split-button"
                >
                  <div className="button-with-icon">
                    <CreditCard size={20} />
                    <span>Använd saldo + annat betalsätt</span>
                  </div>
                  <div className="button-subtext">
                    Använd {formatPrice(cardBalance)} från presentkortet och betala resterande {formatPrice(remainingAmount)} med annat betalsätt
                  </div>
                </button>
                
                <button 
                  onClick={() => handleInsufficientBalanceOption('new_method')}
                  className="primary-button alt-button"
                >
                  <div className="button-with-icon">
                    <ArrowLeft size={20} />
                    <span>Välj ett nytt betalsätt</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleInsufficientBalanceOption('cancel')}
                  className="cancel-button"
                >
                  <div className="button-with-icon">
                    <XCircle size={20} />
                    <span>Avbryt</span>
                  </div>
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default InsufficientBalanceModal;