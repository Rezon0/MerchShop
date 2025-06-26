import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Возможно, вы захотите удалить или оставить, если у вас есть глобальные стили
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);