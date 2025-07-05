// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode> // Закомментируйте или удалите эту строку
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode> // Закомментируйте или удалите эту строку
);