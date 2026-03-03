import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import AdminOrdersPage from './AdminOrdersPage.jsx';
import ShopPage from './ShopPage.jsx';
import LuxgearCategoryPage from './LuxgearCategoryPage.jsx';
import AboutUsPage from './AboutUsPage.jsx';
import ContactPage from './ContactPage.jsx';
import CheckoutPage from './CheckoutPage.jsx';
import OrderConfirmationPage from './OrderConfirmationPage.jsx';
import { CartProvider } from './hooks/useCart.jsx';
import './index.css';

const path = window.location.pathname;

let RootComponent = App;
if (path.includes('/admin/orders')) {
  RootComponent = AdminOrdersPage;
} else if (path.includes('/admin')) {
  RootComponent = AdminDashboard;
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
    <CartProvider>
      <RootComponent />
    </CartProvider>
  </React.StrictMode>
);

