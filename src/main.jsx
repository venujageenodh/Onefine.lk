import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ShopPage from './ShopPage.jsx';
import LuxgearCategoryPage from './LuxgearCategoryPage.jsx';
import CollectionDetailPage from './CollectionDetailPage.jsx';
import AboutUsPage from './AboutUsPage.jsx';
import ContactPage from './ContactPage.jsx';
import CheckoutPage from './CheckoutPage.jsx';
import OrderConfirmationPage from './OrderConfirmationPage.jsx';
import AdminApp from './admin/AdminApp.jsx';
import { AdminAuthProvider } from './admin/AdminAuthContext.jsx';
import { CartProvider } from './hooks/useCart.jsx';
import './index.css';

const path = window.location.pathname;

// Redirect old /luxgear-bottles → new dynamic /collection page
if (path === '/luxgear-bottles' || path.startsWith('/luxgear-bottles')) {
  window.location.replace('/collection?slug=luxgear-bottles');
}

let RootComponent = App;
let useAdminAuth = false;

if (path.startsWith('/biz-admin')) {
  RootComponent = AdminApp;
  useAdminAuth = true;
} else if (path.includes('/collection')) {
  RootComponent = CollectionDetailPage;
} else if (path.includes('/luxgear-bottles')) {
  RootComponent = LuxgearCategoryPage;
} else if (path.includes('/about')) {
  RootComponent = AboutUsPage;
} else if (path.includes('/contact-us')) {
  RootComponent = ContactPage;
} else if (path.includes('/shop')) {
  RootComponent = ShopPage;
} else if (path.includes('/checkout')) {
  RootComponent = CheckoutPage;
} else if (path.includes('/order-confirmation')) {
  RootComponent = OrderConfirmationPage;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {useAdminAuth ? (
      <AdminAuthProvider>
        <RootComponent />
      </AdminAuthProvider>
    ) : (
      <CartProvider>
        <RootComponent />
      </CartProvider>
    )}
  </React.StrictMode>
);
