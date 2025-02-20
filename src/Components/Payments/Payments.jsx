import React, { useState, useEffect } from 'react';
import PaymentMethodSelector from '../Payments/PaymentMethodSelector.jsx';
import './Payments.css';
import { 
 CreditCard, 
 Smartphone, 
 FileText, 
 Banknote, 
 Gift, 
 ArrowLeft,
 CheckCircle2,
 XCircle,
 Loader2
} from 'lucide-react';

const Payments = ({ 
 isOpen, 
 onClose, 
 total, 
 onPaymentComplete, 
 formatPrice,
 cartItems
}) => {
 const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
 const [paymentStatus, setPaymentStatus] = useState('idle');
 const [cashAmount, setCashAmount] = useState('');
 const [change, setChange] = useState(0);
 const [personnummer, setPersonnummer] = useState('');
 const [email, setEmail] = useState('');
 const [giftCardNumber, setGiftCardNumber] = useState('');
 const [isSplitPaymentOpen, setIsSplitPaymentOpen] = useState(false);

 useEffect(() => {
   if (!isOpen) {
     resetAllStates();
   }
 }, [isOpen, total]);

 const resetAllStates = () => {
   setSelectedPaymentMethod('');
   setPaymentStatus('idle');
   setCashAmount('');
   setChange(0);
   setPersonnummer('');
   setEmail('');
   setGiftCardNumber('');
 };

 const handleSplitPaymentComplete = () => {
   setIsSplitPaymentOpen(false); // Stäng split-betalningsmodulen
   onPaymentComplete();  // Hantera den ursprungliga betalningsfunktionen
   onClose();  // Stäng huvudbetalningsmodulen
 };

 const handlePaymentMethodSelect = (method) => {
   if (!cartItems || cartItems.length === 0) {
     alert('Kundvagnen är tom');
     return;
   }

   if (method === 'card') {
     setPaymentStatus('awaiting_card');
     simulateCardPayment();
   } else {
     setSelectedPaymentMethod(method);
   }
 };

 const simulateCardPayment = () => {
   setTimeout(() => {
     setPaymentStatus('processing');
     setTimeout(() => {
       setPaymentStatus('approved');
       setTimeout(() => {
         completePayment('card', total);
         setPaymentStatus('idle');
       }, 1500);
     }, 3000);
   }, 2000);
 };

 const handleCashAmount = (e) => {
   const inputAmount = e.target.value;
   setCashAmount(inputAmount);
   
   const cashAmountNum = parseFloat(inputAmount);
   if (!isNaN(cashAmountNum) && cashAmountNum >= total) {
     setChange(cashAmountNum - total);
   } else {
     setChange(0);
   }
 };

 const handleCashPayment = () => {
   const cashAmountNum = parseFloat(cashAmount);
   if (isNaN(cashAmountNum) || cashAmountNum < total) {
     alert('Ogiltigt belopp');
     return;
   }
   setPaymentStatus('approved');
   setTimeout(() => {
     completePayment('cash', total);
     setPaymentStatus('idle');
   }, 1500);
 };

 const handleSwishPayment = () => {
   setPaymentStatus('awaiting_scan');
   setTimeout(() => {
     setPaymentStatus('processing');
     setTimeout(() => {
       setPaymentStatus('approved');
       setTimeout(() => {
         completePayment('swish', total);
         setPaymentStatus('idle');
       }, 1500);
     }, 2000);
   }, 2000);
 };

 const handleInvoicePayment = () => {
   setPaymentStatus('verifying');
   setTimeout(() => {
     setPaymentStatus('invoice_sent');
     setTimeout(() => {
       completePayment('invoice', total);
       setPaymentStatus('idle');
     }, 1500);
   }, 2000);
 };

 const handleGiftCardPayment = () => {
   setPaymentStatus('verifying_card');
   setTimeout(() => {
     setPaymentStatus('approved');
     setTimeout(() => {
       completePayment('giftcard', total);
       setPaymentStatus('idle');
     }, 1500);
   }, 2000);
 };

 const completePayment = () => {
   onPaymentComplete();
   onClose();
 };

 const renderPaymentStatus = () => {
   if (paymentStatus === 'idle') return null;
   
   const statusMessages = {
     awaiting_card: 'Väntar på kortbetalning...',
     verifying_card: 'Verifierar kort...',
     processing: 'Behandlar betalning...',
     approved: 'Betalning godkänd!',
     declined: 'Betalning nekad. Försök igen.',
     awaiting_scan: 'Väntar på QR-kod scanning...',
     verifying: 'Verifierar kundinformation...',
     invoice_sent: 'Faktura skickad!'
   };
   
   return (
     <div className="payment-status">
       {['processing', 'awaiting_card', 'awaiting_scan', 'verifying', 'verifying_card'].includes(paymentStatus) && (
         <>
           <Loader2 className="animate-spin" size={48} />
           <p>{statusMessages[paymentStatus]}</p>
         </>
       )}
       {(paymentStatus === 'approved' || paymentStatus === 'invoice_sent') && (
         <>
           <CheckCircle2 className="text-green-500" size={48} />
           <p>{statusMessages[paymentStatus]}</p>
         </>
       )}
       {paymentStatus === 'declined' && (
         <>
           <XCircle className="text-red-500" size={48} />
           <p>{statusMessages[paymentStatus]}</p>
         </>
       )}
     </div>
   );
 };

 const renderPaymentMethod = () => {
   switch (selectedPaymentMethod) {
     case 'card':
       return null;

     case 'cash':
       return (
         <div className="payment-method-container">
           <h3>Kontant</h3>
           <p>Total att betala: {formatPrice(total)}</p>
           <input
             type="number"
             className="payment-input"
             value={cashAmount}
             onChange={handleCashAmount}
             placeholder="Ange mottaget belopp"
             disabled={paymentStatus !== 'idle'}
           />
           {cashAmount && (
             <div className="cash-summary">
               <div className="received-amount">
                 Mottaget belopp: {formatPrice(parseFloat(cashAmount) || 0)}
               </div>
               <div className="change-amount">
                 {parseFloat(cashAmount) >= total ? (
                   `Växel att ge tillbaka: ${formatPrice(change)}`
                 ) : (
                   'Otillräckligt belopp'
                 )}
               </div>
             </div>
           )}
           {parseFloat(cashAmount) >= total && (
             <button 
               onClick={handleCashPayment}
               disabled={paymentStatus !== 'idle'}
               className="primary-button"
             >
               Bekräfta betalning
             </button>
           )}
         </div>
       );

     case 'swish':
       return (
         <div className="payment-method-container">
           <h3>Swish</h3>
           <p>Total att betala: {formatPrice(total)}</p>
           <div className="swish-qr-placeholder">
             <p>Skanna QR-kod för att betala</p>
           </div>
           <button 
             onClick={handleSwishPayment}
             disabled={paymentStatus !== 'idle'}
             className="primary-button"
           >
             Bekräfta Swish-betalning
           </button>
         </div>
       );

     case 'invoice':
       return (
         <div className="payment-method-container">
           <h3>Faktura</h3>
           <p>Total att betala: {formatPrice(total)}</p>
           <input
             type="text"
             className="payment-input"
             placeholder="Personnummer"
             value={personnummer}
             onChange={(e) => setPersonnummer(e.target.value)}
             disabled={paymentStatus !== 'idle'}
           />
           <input
             type="email"
             className="payment-input"
             placeholder="E-postadress"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             disabled={paymentStatus !== 'idle'}
           />
           {personnummer && email && (
             <button 
               onClick={handleInvoicePayment}
               disabled={paymentStatus !== 'idle'}
               className="primary-button"
             >
               Skicka faktura
             </button>
           )}
         </div>
       );

     case 'giftcard':
       return (
         <div className="payment-method-container">
           <h3>Presentkort</h3>
           <p>Total att betala: {formatPrice(total)}</p>
           <input
             type="text"
             className="payment-input"
             placeholder="Presentkortsnummer"
             value={giftCardNumber}
             onChange={(e) => setGiftCardNumber(e.target.value)}
             disabled={paymentStatus !== 'idle'}
           />
           {giftCardNumber && (
             <button 
               onClick={handleGiftCardPayment}
               disabled={paymentStatus !== 'idle'}
               className="primary-button"
             >
               Lös in presentkort
             </button>
           )}
         </div>
       );

     default:
       return null;
   }
 };

 const renderContent = () => {
   if (selectedPaymentMethod) {
     return (
       <>
         <div className="payment-method-view">
           {renderPaymentMethod()}
           <button 
             className="method-back-button"
             onClick={() => setSelectedPaymentMethod('')}
             disabled={paymentStatus !== 'idle'}
           >
             <ArrowLeft size={20} />
             <span>Tillbaka</span>
           </button>
         </div>
         {renderPaymentStatus()}
       </>
     );
   }

   return (
     <>
       <h2>Betalningsalternativ</h2>
       <div className="total-amount">
         <p>Totalt att betala: {formatPrice(total)}</p>
       </div>
       <div className="modal-grid">
         <button onClick={() => handlePaymentMethodSelect('card')}>
           <CreditCard /> Kortbetalning
         </button>
         <button onClick={() => handlePaymentMethodSelect('cash')}>
           <Banknote /> Kontant
         </button>
         <button onClick={() => handlePaymentMethodSelect('swish')}>
           <Smartphone /> Swish
         </button>
         <button onClick={() => handlePaymentMethodSelect('invoice')}>
           <FileText /> Faktura
         </button>
         <button onClick={() => handlePaymentMethodSelect('giftcard')}>
           <Gift /> Presentkort
         </button>
         <button onClick={() => setIsSplitPaymentOpen(true)}>
           <CreditCard /> Dela betalning
         </button>
         <button 
           className="modal-back-button" 
           onClick={onClose}
         >
           <ArrowLeft size={16} />
           <span>Tillbaka</span>
         </button>
       </div>
       {renderPaymentStatus()}
     </>
   );
 };
 
 if (!isOpen) return null;
 
 return (
   <div className="modal-overlay" onClick={(e) => {
     if (e.target === e.currentTarget) {
       onClose();
     }
   }}>
     <div className="modal-content" onClick={e => e.stopPropagation()}>
       {renderContent()}
     </div>
     <PaymentMethodSelector
       isOpen={isSplitPaymentOpen}
       onClose={() => setIsSplitPaymentOpen(false)}
       total={total}
       onPaymentComplete={handleSplitPaymentComplete}
       formatPrice={formatPrice}
     />
   </div>
 );
};

export default Payments;