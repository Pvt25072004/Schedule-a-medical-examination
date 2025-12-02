import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppointmentProvider } from './contexts/AppointmentContext';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';

import { PAGES } from './utils/constants';
import './index.css';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState(PAGES.WELCOME);
  const { isAuthenticated } = useAuth();

  // Navigation handler
  const navigate = (page) => {
    setCurrentPage(page);
  };

  // Redirect to welcome if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && ![PAGES.WELCOME, PAGES.LOGIN, PAGES.REGISTER].includes(currentPage)) {
      setCurrentPage(PAGES.WELCOME);
    }
  }, [isAuthenticated, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case PAGES.WELCOME:
        return <BookingPage navigate={navigate} />;
      case PAGES.LOGIN:
        return <LoginPage navigate={navigate} />;
      case PAGES.REGISTER:
        return <RegisterPage navigate={navigate} />;
      case PAGES.HOME:
        return <HomePage navigate={navigate} />;
      case PAGES.BOOKING:
        return <BookingPage navigate={navigate} />;
      case PAGES.APPOINTMENTS:
        return <AppointmentsPage navigate={navigate} />;
      case PAGES.CHAT:
        return <ChatPage navigate={navigate} />;
      case PAGES.YOUR_PAGE:
        return ;
      case PAGES.SETTINGS:
        return <SettingsPage navigate={navigate} />;
      default:
        return <BookingPage navigate={navigate} />;
    }
  };

  return (
    <div className="font-sans">
      {renderPage()}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <AppContent />
      </AppointmentProvider>
    </AuthProvider>
  );
}

export default App;