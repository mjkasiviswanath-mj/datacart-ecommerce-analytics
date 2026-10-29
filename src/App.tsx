/**
 * DataCart - E-Commerce Sales & Data Analytics Platform
 * College Data Science Programming Project
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  initStorage,
  getUsers,
  getCurrentUser,
  setCurrentUser,
  getProducts,
  saveProduct,
  deleteProduct,
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  getOrders,
  createOrder,
  updateOrderStatus,
  loginUser,
  registerUser,
  resetToSampleData,
} from './utils/storage';
import { computeSalesAnalytics } from './utils/analyticsEngine';
import { User, Product, Order, CartItem, OrderStatus, PaymentMethod, Role } from './types';
import { INITIAL_USERS } from './sampleData';

import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ProductsView } from './components/ProductsView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { OrdersView } from './components/OrdersView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { AuthModal } from './components/AuthModal';
import { DataScienceProjectHubModal } from './components/DataScienceProjectHubModal';

export default function App() {
  // 1. Core State
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // 2. Navigation & UI state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProjectHubOpen, setIsProjectHubOpen] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Initialize storage on mount
  useEffect(() => {
    initStorage();
    const storedUser = getCurrentUser();
    setCurrentUserState(storedUser);
    setUsers(getUsers());
    setProducts(getProducts());
    setOrders(getOrders());
    if (storedUser) {
      setCart(getCart(storedUser.id));
    }
  }, []);

  // Compute live data science sales analytics
  const analytics = useMemo(() => {
    return computeSalesAnalytics(orders, products, users);
  }, [orders, products, users]);

  // Sync cart when current user changes
  const refreshCart = (userId: string) => {
    setCart(getCart(userId));
  };

  // Handler: Role Switcher (Admin vs Customer for quick testing)
  const handleQuickSwitchRole = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      const adminUser = users.find((u) => u.role === 'admin') || INITIAL_USERS[0];
      setCurrentUser(adminUser);
      setCurrentUserState(adminUser);
      setActiveTab('dashboard');
      showToast('Switched to Admin Mode (admin@datacart.com)');
    } else {
      const custUser = users.find((u) => u.role === 'customer') || INITIAL_USERS[2];
      setCurrentUser(custUser);
      setCurrentUserState(custUser);
      refreshCart(custUser.id);
      setActiveTab('home');
      showToast(`Switched to Customer Mode (${custUser.name})`);
    }
  };

  // Handler: Auth
  const handleLogin = (email: string, pass: string) => {
    const res = loginUser(email, pass);
    if (res.success && res.user) {
      setCurrentUserState(res.user);
      refreshCart(res.user.id);
      setActiveTab(res.user.role === 'admin' ? 'dashboard' : 'home');
      showToast(`Welcome back, ${res.user.name}!`);
    }
    return res;
  };

  const handleRegister = (userData: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    address?: string;
    city?: string;
    pincode?: string;
    role: Role;
  }) => {
    const res = registerUser(userData);
    if (res.success && res.user) {
      setCurrentUserState(res.user);
      setUsers(getUsers());
      refreshCart(res.user.id);
      setActiveTab(res.user.role === 'admin' ? 'dashboard' : 'home');
      showToast(`Account created! Welcome, ${res.user.name}`);
    }
    return res;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    setCart([]);
    setActiveTab('home');
    showToast('Logged out successfully.');
  };

  // Handler: Cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Please log in to add items to your cart.');
      return;
    }
    if (product.stock === 0) {
      showToast('Sorry, this product is currently out of stock.');
      return;
    }
    const updatedCart = addToCart(currentUser.id, product, quantity);
    setCart(updatedCart);
    showToast(`Added ${product.name} to cart.`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    if (!currentUser) return;
    const updatedCart = updateCartQuantity(currentUser.id, productId, delta);
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (productId: string) => {
    if (!currentUser) return;
    const updatedCart = removeFromCart(currentUser.id, productId);
    setCart(updatedCart);
    showToast('Item removed from cart.');
  };

  // Handler: Place Order
  const handlePlaceOrder = (formData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    pincode: string;
    paymentMethod: PaymentMethod;
  }) => {
    if (!currentUser || cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingFee = subtotal > 200 ? 0 : 15;
    const grandTotal = subtotal + shippingFee;

    const orderItems = cart.map((item) => ({
      id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orderId: '',
      productId: item.productId,
      productName: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image,
    }));

    const newOrder = createOrder({
      userId: currentUser.id,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      shippingAddress: formData.shippingAddress,
      city: formData.city,
      pincode: formData.pincode,
      paymentMethod: formData.paymentMethod,
      totalAmount: grandTotal,
      items: orderItems,
    });

    // Update state
    setOrders(getOrders());
    setProducts(getProducts());
    setCart([]);
    showToast(`Order #${newOrder.id} placed successfully!`);

    return newOrder;
  };

  // Handler: Admin product save & delete
  const handleSaveProduct = (prodData: Omit<Product, 'id'> & { id?: string }) => {
    const saved = saveProduct(prodData);
    setProducts(getProducts());
    showToast(`Product "${saved.name}" saved successfully.`);
  };

  const handleDeleteProduct = (productId: string) => {
    const deleted = deleteProduct(productId);
    if (deleted) {
      setProducts(getProducts());
      showToast('Product deleted from database.');
    }
  };

  // Handler: Admin order status update
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = updateOrderStatus(orderId, status);
    if (updated) {
      setOrders(getOrders());
      showToast(`Order #${orderId} marked as ${status}.`);
    }
  };

  // Reset to initial sample data
  const handleResetSampleData = () => {
    if (window.confirm('Reset all DataCart data back to initial 24 products and 30+ sample orders?')) {
      resetToSampleData();
      const storedUser = getCurrentUser();
      setCurrentUserState(storedUser);
      setUsers(getUsers());
      setProducts(getProducts());
      setOrders(getOrders());
      if (storedUser) {
        setCart(getCart(storedUser.id));
      }
      showToast('Sample dataset restored to factory defaults!');
    }
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter orders for current logged in customer
  const customerOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter((o) => o.userId === currentUser.id);
  }, [orders, currentUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setIsCheckingOut(false);
          setActiveTab(tab);
        }}
        cartCount={cartTotalItems}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenProjectHub={() => setIsProjectHubOpen(true)}
        onQuickSwitchRole={handleQuickSwitchRole}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Render Customer Home */}
        {activeTab === 'home' && (
          <HomeView
            products={products}
            analytics={analytics}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveTab('products');
            }}
            onExploreProducts={() => {
              setSelectedCategory('All');
              setActiveTab('products');
            }}
            onViewProduct={(prod) => setViewingProduct(prod)}
            onAddToCart={handleAddToCart}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onExecuteSearch={() => setActiveTab('products')}
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}

        {/* Render Catalog / Products */}
        {activeTab === 'products' && (
          <ProductsView
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onViewProduct={(prod) => setViewingProduct(prod)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Render Shopping Cart or Checkout */}
        {activeTab === 'cart' && (
          isCheckingOut ? (
            <CheckoutView
              currentUser={currentUser}
              cart={cart}
              onPlaceOrder={handlePlaceOrder}
              onBackToCart={() => setIsCheckingOut(false)}
              onViewOrderHistory={() => {
                setIsCheckingOut(false);
                setActiveTab('my-orders');
              }}
            />
          ) : (
            <CartView
              cart={cart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onProceedToCheckout={() => setIsCheckingOut(true)}
              onContinueShopping={() => setActiveTab('products')}
            />
          )
        )}

        {/* Render Customer Orders */}
        {activeTab === 'my-orders' && (
          <OrdersView
            orders={customerOrders}
            onStartShopping={() => setActiveTab('products')}
          />
        )}

        {/* Render Admin Dashboard */}
        {activeTab === 'dashboard' && (
          <AdminDashboardView
            products={products}
            orders={orders}
            users={users}
            analytics={analytics}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}

        {/* Admin Navigation Aliases */}
        {activeTab === 'orders' && (
          <AdminDashboardView
            products={products}
            orders={orders}
            users={users}
            analytics={analytics}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}

        {activeTab === 'customers' && (
          <AdminDashboardView
            products={products}
            orders={orders}
            users={users}
            analytics={analytics}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}

        {/* Render Data Science Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            orders={orders}
            products={products}
            onOpenProjectHub={() => setIsProjectHubOpen(true)}
          />
        )}
      </main>

      {/* Product Detail & Recommendation Modal */}
      <ProductDetailModal
        product={viewingProduct}
        allProducts={products}
        onClose={() => setViewingProduct(null)}
        onAddToCart={(prod, qty) => {
          handleAddToCart(prod, qty);
          setViewingProduct(null);
        }}
        onSelectProduct={(prod) => setViewingProduct(prod)}
      />

      {/* Auth Modal (Login & Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Data Science Project Hub & Viva Guide */}
      <DataScienceProjectHubModal
        isOpen={isProjectHubOpen}
        onClose={() => setIsProjectHubOpen(false)}
        orders={orders}
        products={products}
      />

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900">DataCart</span> – E-Commerce Sales & Data Analytics Platform
            <div className="text-[11px] text-slate-400 mt-0.5">
              © 2026 DataCart. Shop smarter with data-driven insights.
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetSampleData}
              className="text-slate-500 hover:text-slate-800 cursor-pointer"
              title="Restore initial 24 products and 30+ orders"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
