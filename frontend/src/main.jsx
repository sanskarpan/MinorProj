import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from '@/components/ThemeProvider'; // Use alias

ReactDOM.createRoot(document.getElementById('root')).render(

    <ThemeProvider defaultTheme="dark" storageKey="finance-tracker-theme">
      <App />
    </ThemeProvider>
);