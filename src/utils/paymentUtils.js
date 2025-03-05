// src/utils/paymentUtils.js

// ---------- KONSTANTER ----------

// Mappning för betalningsmetodetiketter
export const METHOD_LABELS = {
    'card': 'Kort',
    'cash': 'Kontanter',
    'swish': 'Swish',
    'invoice': 'Faktura',
    'giftcard': 'Presentkort',
    'split': 'Delad betalning'
  };
  
  // Statusmeddelanden för betalningsprocesser
  export const STATUS_MESSAGES = {
    awaiting_card: 'Väntar på kortbetalning...',
    verifying_card: 'Verifierar presentkort...',
    processing: 'Behandlar betalning...',
    approved: 'Betalning godkänd!',
    declined: 'Betalning nekad. Försök igen.',
    awaiting_scan: 'Väntar på QR-kod scanning...',
    verifying: 'Verifierar kundinformation...',
    invoice_sent: 'Faktura skickad!'
  };
  
  // Nekningsmeddelanden
  export const DECLINE_MESSAGES = {
    insufficient_funds: 'Betalning nekad: Otillräckligt saldo på kortet.',
    card_expired: 'Betalning nekad: Kortet har gått ut.',
    default: 'Betalning nekad. Försök igen.'
  };
  
  // Betalningssteg för olika metoder
  export const PAYMENT_STAGES = {
    'giftcard': [
      { status: 'verifying_card', message: 'Verifierar presentkort...', duration: 2000 },
      { status: 'processing', message: 'Behandlar betalning...', duration: 2000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ],
    'cash': [
      { status: 'processing', message: 'Räknar kontanter...', duration: 2000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ],
    'card': [
      { status: 'awaiting_card', message: 'Väntar på kortbetalning...', duration: 2000 },
      { status: 'processing', message: 'Behandlar betalning...', duration: 2000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ],
    'swish': [
      { status: 'processing', message: 'Slutför Swish-betalning...', duration: 2000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ],
    'invoice': [
      { status: 'processing', message: 'Skapar faktura...', duration: 2000 },
      { status: 'approved', message: 'Faktura skickad!', duration: 1500 }
    ],
    'default': [
      { status: 'processing', message: 'Behandlar betalning...', duration: 3000 },
      { status: 'approved', message: 'Betalning godkänd!', duration: 1500 }
    ]
  };
  
  // Presentkortsdatabas för verifiering
  export const GIFT_CARD_DATABASE = {
    '1234': 100,
    '5678': 50,
    '9012': 250
  };
  
  // ---------- HJÄLPFUNKTIONER ----------
  
  // Skapa betalningsobjekt
  export const createPaymentObject = (method, amount) => {
    return { 
      method: method, 
      amount: amount,
      label: METHOD_LABELS[method] || method,
      timestamp: new Date().toISOString()
    };
  };
  
  // Kontrollera om totalt betalat belopp täcker hela köpet
  export const isTotalPaid = (payments, totalAmount) => {
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    // Tillåt små avrundningsskillnader
    return totalPaid >= (totalAmount - 0.01);
  };
  
  // Beräkna återstående belopp att betala
  export const calculateRemainingAmount = (payments, totalAmount) => {
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    return Math.max(0, totalAmount - totalPaid);
  };
  
  // Simulera en betalningsprocess med callback för statusuppdateringar
  export const simulatePaymentProcess = async (method, onStatusChange) => {
    try {
      // Simulera slumpmässigt avslag för kortbetalningar (10% chans)
      if (method === 'card' && Math.random() < 0.1) {
        // Simulera betalningsförsök innan den nekas
        onStatusChange('awaiting_card');
        await new Promise(resolve => setTimeout(resolve, 2000));
        onStatusChange('processing');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Neka betalningen med meddelande om otillräckligt saldo
        onStatusChange('declined', 'insufficient_funds');
        return false;
      }
  
      // Hämta steg för vald betalningsmetod eller använd standardsteg
      const stages = PAYMENT_STAGES[method] || PAYMENT_STAGES['default'];
      
      // Processera varje steg
      for (const stage of stages) {
        onStatusChange(stage.status);
        await new Promise(resolve => setTimeout(resolve, stage.duration));
      }
      
      return true;
    } catch (error) {
      console.error("Error during payment processing:", error);
      onStatusChange('declined');
      return false;
    }
  };
  
  // Verifierar presentkort och returnerar saldo
  export const verifyGiftCard = (cardNumber) => {
    return GIFT_CARD_DATABASE[cardNumber] || 0;
  };
  
  // Validera betalningsbelopp
  export const validatePaymentAmount = (amount, remainingAmount) => {
    const paymentAmount = parseFloat(amount);
    return !isNaN(paymentAmount) && paymentAmount > 0 && paymentAmount <= remainingAmount;
  };
  
  // Formatera delbetalningsmeddelande
  export const formatPartialPaymentMessage = (method, amount, remaining, formatPrice) => {
    return `${METHOD_LABELS[method] || method} betalning: ${formatPrice(amount)}. Återstående: ${formatPrice(remaining)}`;
  };
  
  // Formatera slutligt betalningsmeddelande
  export const formatFinalPaymentMessage = (payments, formatPrice) => {
    if (!payments.length) return '';
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const methodsSummary = payments
      .map(p => `${p.label}: ${formatPrice(p.amount)}`)
      .join(', ');
    
    return `Betalning slutförd: ${formatPrice(totalPaid)} (${methodsSummary})`;
  };
  
  // Hantera och processera en ny betalning
  export const processPayment = async (
    method, 
    amount, 
    remainingAmount, 
    partialPayments, 
    onStatusChange,
    onSuccess,
    onPartialSuccess,
    formatPrice
  ) => {
    if (!validatePaymentAmount(amount, remainingAmount)) {
      return false;
    }
  
    const paymentAmount = parseFloat(amount);
    
    // Simulera betalningsprocessen
    const success = await simulatePaymentProcess(method, onStatusChange);
    
    if (!success) {
      return false;
    }
    
    // Skapa nytt betalningsobjekt
    const newPayment = createPaymentObject(method, paymentAmount);
    
    // Lägg till i befintliga betalningar
    const updatedPayments = [...partialPayments, newPayment];
    
    // Beräkna nytt återstående belopp
    const newRemainingAmount = remainingAmount - paymentAmount;
    
    if (newRemainingAmount <= 0.01) {
      // Betalning är färdig
      onSuccess(updatedPayments);
    } else {
      // Delbetalning, fortsätt processen
      const message = formatPartialPaymentMessage(method, paymentAmount, newRemainingAmount, formatPrice);
      onPartialSuccess(updatedPayments, newRemainingAmount, message);
    }
    
    return true;
  };