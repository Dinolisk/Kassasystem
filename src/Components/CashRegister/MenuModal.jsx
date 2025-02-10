// MenuModal.jsx
import './MenuModal.css';
import React from 'react';
import { 
  FileText, 
  ArrowLeft,
  DollarSign,
  BarChart2,
  RefreshCcw,
  PauseCircle,
  Save,
  Settings
} from 'lucide-react';

const MenuModal = ({ isOpen, onClose, menuOptions }) => {
  // Map of menu actions to icons
  const getIconForOption = (label) => {
    switch (label.toLowerCase()) {
      case 'öppna kassalåda':
        return <DollarSign size={24} />;
      case 'dagsavslut':
        return <BarChart2 size={24} />;
      case 'z-rapport':
      case 'x-rapport':
        return <FileText size={24} />;
      case 'returnera vara':
        return <RefreshCcw size={24} />;
      case 'pausförsäljning':
        return <PauseCircle size={24} />;
      case 'parkeraköp':
        return <Save size={24} />;
      case 'inställningar':
        return <Settings size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="menu-modal" onClick={e => e.stopPropagation()}>
        <h2>Meny</h2>
        <div className="menu-grid">
          {menuOptions.map(option => (
            <button
              className="menu-item"
              key={option.id}
              onClick={() => {
                option.action();
                onClose();
              }}
            >
              <span>{option.label}</span>
              {getIconForOption(option.label)}
            </button>
          ))}
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

export default MenuModal;