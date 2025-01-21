import React, { useState } from 'react';
import './App.css';
import CashRegister from './CashRegister';  // Importera CashRegister
import Cart from './Cart';  // Importera Cart

function App() {
  return (
    <>
      <h1>Välkommen till Kassasystemet</h1>
      <CashRegister />  {/* Rendera CashRegister-komponenten */}
      <Cart />  {/* Rendera Cart-komponenten */}
    </>
  );
}

export default App;