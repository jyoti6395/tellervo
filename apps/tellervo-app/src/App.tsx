import React from 'react';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
      <ToastContainer />
    </AppProvider>
  );
}
