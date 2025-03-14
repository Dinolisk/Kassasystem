import React from 'react';
import ReactDOM from 'react-dom/client';
import CashRegister from './Components/CashRegister/CashRegister';
import './index.css';
import './styles/buttons.css'; // Lägg till import för buttons.css

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CashRegister />
  </React.StrictMode>
);