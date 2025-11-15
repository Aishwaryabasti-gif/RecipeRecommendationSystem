import React, { useState, useEffect, useCallback } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';

type Page = 'home' | 'login' | 'signup' | 'dashboard';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // useEffect(() => {
  //   const loggedInStatus = localStorage.getItem('isLoggedIn');
  //   if (loggedInStatus === 'true') {
  //     setIsLoggedIn(true);
  //     setCurrentPage('dashboard');
  //   }
  // }, []);

  const handleLogin = useCallback(() => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setCurrentPage('home');
  }, []);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUpPage onSignUp={handleLogin} onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage />;
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100/50 via-teal-50/50 to-white font-sans text-stone-900">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} onNavigate={handleNavigate} />
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {renderPage()}
      </main>
      <footer className="text-center p-6 mt-12 text-sm text-stone-500 border-t border-stone-200/80">
          <p>&copy; {new Date().getFullYear()} Gemini Food Recommender. All rights reserved.</p>
          <p className="mt-1">Crafted with ❤️ and powered by the Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;