import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import ShopPage from './ShopPage.jsx';
import LuxgearCategoryPage from './LuxgearCategoryPage.jsx';
import './index.css';

const path = window.location.pathname;

let RootComponent = App;
if (path.includes('/admin')) {
  RootComponent = AdminDashboard;
} else if (path.includes('/shop/luxgear-bottles')) {
  RootComponent = LuxgearCategoryPage;
} else if (path.includes('/shop')) {
  RootComponent = ShopPage;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
