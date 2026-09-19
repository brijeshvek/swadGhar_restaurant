import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import PageLoader, { TopProgressBar } from './components/common/PageLoader';
import AppRoutes from './routes/AppRoutes';

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Show cooking splash loader on page refresh / initial mount
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 850);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      {initialLoading && (
        <PageLoader
          text="Firing Up SwadGhar Kitchen..."
          subtext="Setting the royal ambience & simmering authentic flavors..."
        />
      )}
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <TopProgressBar />
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
