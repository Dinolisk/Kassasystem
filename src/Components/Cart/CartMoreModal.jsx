import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Receipt,
  MessageSquare,
  RefreshCcw,
  History,
  ArrowLeft,
  ClipboardList,
  Users,
  Package
} from 'lucide-react';

const CartMoreModal = ({ isOpen, onClose, handleMoreOptions }) => {
  const moreOptions = [
    { id: 1, label: 'Öppna kassalåda', action: 'openDrawer', icon: DollarSign },
    { id: 2, label: 'Visa parkerade köp', action: 'showParked', icon: ShoppingBag },
    { id: 3, label: 'Orderhantering', action: 'orderManagement', icon: ClipboardList },
    { id: 4, label: 'Kundhantering', action: 'customerManagement', icon: Users },
    { id: 5, label: 'Lagerhantering', action: 'inventoryManagement', icon: Package },
    { id: 6, label: 'Kvittoalternativ', action: 'receiptOptions', icon: Receipt },
    { id: 7, label: 'Lägg till kommentar', action: 'addComment', icon: MessageSquare },
    { id: 8, label: 'Returnera vara', action: 'return', icon: RefreshCcw },
    { id: 9, label: 'Historik', action: 'history', icon: History }
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-options" onClick={e => e.stopPropagation()}>
        <h2>Fler alternativ</h2>
        <div className="payment-methods">
          {moreOptions.map(option => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => {
                  handleMoreOptions(option.action);
                  onClose();
                }}
              >
                <span>{option.label}</span>
                <IconComponent size={24} />
              </button>
            );
          })}
          <button
            onClick={onClose}
            className="back-button"
          >
            <span>Tillbaka</span>
            <ArrowLeft size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartMoreModal;