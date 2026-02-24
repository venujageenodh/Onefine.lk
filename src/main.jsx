import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import ShopPage from './ShopPage.jsx';
import LuxgearCategoryPage from './LuxgearCategoryPage.jsx';
import './index.css';

const path = window.location.pathname;

let RootComponent = App;
if (path.startsWith('/admin')) {
  RootComponent = AdminDashboard;
} else if (path.startsWith('/shop/luxgear-bottles')) {
  RootComponent = LuxgearCategoryPage;
} else if (path.startsWith('/shop')) {
  RootComponent = ShopPage;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
