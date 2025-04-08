// Payment method labels
export const getPaymentMethodLabel = (method) => {
  const labels = {
    'card': 'Kort',
    'cash': 'Kontant',
    'swish': 'Swish',
    'invoice': 'Faktura',
    'giftcard': 'Presentkort',
    'klarna': 'Klarna',
  };
  return labels[method] || method;
};

// Simulate payment processing
export const simulatePayment = (amount, currentRemainingTotal, method, details, formatPrice) => {
  if (amount > currentRemainingTotal + 0.01) {
    return {
      status: 'declined',
      declineReason: `Beloppet överstiger resterande summa, max ${formatPrice(currentRemainingTotal)}`,
      payment: null
    };
  }

  const numericAmount = Number(amount.toFixed(2));
  const methodLabel = getPaymentMethodLabel(method);
  
  const newPayment = { 
    method, 
    amount: numericAmount, 
    label: methodLabel,
    details: details,
    timestamp: new Date().toISOString()
  };

  const newRemainingTotal = Math.max(0, Number((currentRemainingTotal - numericAmount).toFixed(2)));
  
  let successMessage = `Betalning på ${formatPrice(numericAmount)} genomförd med ${methodLabel}!`;
  
  if (method === 'invoice') {
    const destination = details?.email ? `e-post (${details.email})` : 'postadress';
    successMessage = `Faktura på ${formatPrice(numericAmount)} har skickats till ${destination}!`;
    if (details?.reference) {
      successMessage += ` Referens: ${details.reference}`;
    }
  }
  
  if (method === 'giftcard') {
    const cardCount = details?.cards?.length || 0;
    const cardWord = cardCount === 1 ? 'presentkort' : 'presentkort';
    successMessage = `Betalning på ${formatPrice(numericAmount)} genomförd med ${cardCount} ${cardWord}!`;
  }
  
  if (method === 'klarna') {
    successMessage = `Betalning på ${formatPrice(numericAmount)} har initierats med Klarna!`;
    if (details?.email) {
      successMessage += ` Bekräftelse skickas till ${details.email}.`;
    }
  }

  return {
    status: 'success',
    message: successMessage,
    payment: newPayment,
    remainingTotal: newRemainingTotal
  };
};
