import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { fetchMenu } from './api';

// Fallback menu shown on Landing page if backend is offline
const FALLBACK_MENU = [
  { id: 1, itemName: 'Espresso', price: 120, category: 'Coffee' },
  { id: 2, itemName: 'Cappuccino', price: 160, category: 'Coffee' },
  { id: 3, itemName: 'Cold Brew', price: 200, category: 'Coffee' },
  { id: 4, itemName: 'Latte', price: 180, category: 'Coffee' },
  { id: 5, itemName: 'Americano', price: 140, category: 'Coffee' },
  { id: 6, itemName: 'Croissant', price: 90, category: 'Food' },
  { id: 7, itemName: 'Blueberry Muffin', price: 80, category: 'Food' },
  { id: 8, itemName: 'Avocado Toast', price: 220, category: 'Food' },
];

function App() {
  // page can be: 'landing' | 'auth' | 'dashboard'
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState(FALLBACK_MENU);

  // Load menu when app starts (for landing page preview)
  useEffect(() => {
    fetchMenu()
      .then(data => { if (data && data.length > 0) setMenuItems(data); })
      .catch(() => {}); // silently use fallback if backend is offline
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('landing');
  };

  return (
    <>
      {page === 'landing' && (
        <Landing
          menuItems={menuItems}
          onGetStarted={() => setPage('auth')}
        />
      )}
      {page === 'auth' && (
        <Auth onLogin={handleLogin} />
      )}
      {page === 'dashboard' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;