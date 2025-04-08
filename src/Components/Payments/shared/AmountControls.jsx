import React from 'react';
import { RotateCcw, Plus, Minus } from 'lucide-react';
import { validatePaymentAmount } from '../../../utils/paymentUtils';
import './AmountControls.css';

const AmountControls = ({
  amount,
  remainingTotal,
  currentPaymentStatus,
  onAmountChange,
  onIncrease,
  onDecrease,
  onReset,
  disabled = false
}) => {
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      onAmountChange(0);
      return;
    }

    const newAmount = parseFloat(value);
    if (!isNaN(newAmount)) {
      const adjustedAmount = Math.min(Math.max(newAmount, 0), remainingTotal);
      onAmountChange(adjustedAmount);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selectionStart = e.target.selectionStart;
      const selectionEnd = e.target.selectionEnd;
      const value = e.target.value;

      if (selectionStart === 0 && selectionEnd === value.length) {
        onAmountChange(0);
        e.preventDefault();
      }
    }
  };

  return (
    <div className="amount-controls">
      <button
        onClick={onDecrease}
        className="amount-button"
        disabled={disabled || currentPaymentStatus !== 'idle' || amount <= 0}
        aria-label="Decrease amount by 1"
      >
        <Minus size={18} />
      </button>
      <div className="amount-display">
        <input
          type="number"
          value={amount === 0 ? '' : amount}
          onChange={handleAmountChange}
          onKeyDown={handleKeyDown}
          className="amount-input"
          disabled={disabled || currentPaymentStatus !== 'idle'}
          aria-label="Amount to pay"
          step="0.01"
        />
        <span className="currency">kr</span>
      </div>
      <button
        onClick={onIncrease}
        className="amount-button"
        disabled={disabled || currentPaymentStatus !== 'idle' || amount >= remainingTotal}
        aria-label="Increase amount by 1"
      >
        <Plus size={18} />
      </button>
      <button
        onClick={onReset}
        className="reset-button"
        disabled={disabled || currentPaymentStatus !== 'idle' || amount === remainingTotal}
        aria-label="Reset amount to original value"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
};

export default AmountControls;
