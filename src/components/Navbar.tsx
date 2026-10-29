import React from 'react';
import { ShoppingCart, BarChart3, Package, User as UserIcon, LogOut, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenProjectHub: () => void;
  onQuickSwitchRole: (role: 'admin' | 'customer') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenAuth,
  onLogout,
  onOpenProjectHub,
  onQuickSwitchRole,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab(isAdmin ? 'dashboard' : 'home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                  DataCart
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Store & Analytics
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {isAdmin ? (
                // Admin Navigation: DataCart | Dashboard | Products | Orders | Customers | Analytics | Logout
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                      activeTab === 'products'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                      activeTab === 'customers'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Customers
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>Analytics</span>
                  </button>
                </>
              ) : (
                // Customer Navigation: DataCart | Home | Products | Cart | My Orders | Analytics | Login
                <>
                  <button
                    onClick={() => setActiveTab('home')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                      activeTab === 'home'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                      activeTab === 'products'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setActiveTab('cart')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition relative cursor-pointer ${
                      activeTab === 'cart'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  {currentUser && (
                    <button
                      onClick={() => setActiveTab('my-orders')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                        activeTab === 'my-orders'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      My Orders
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>Analytics</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* User info / Auth & Actions */}
          <div className="flex items-center gap-3">
            {/* Quick clean role toggle */}
            <button
              onClick={() => onQuickSwitchRole(isAdmin ? 'customer' : 'admin')}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer hidden sm:flex items-center gap-1 border border-slate-200"
              title="Toggle between Admin and Customer account"
            >
              <span className="text-slate-400">Mode:</span>
              <span className="font-semibold text-indigo-700">{isAdmin ? 'Admin' : 'Customer'}</span>
              <span className="text-slate-400">(switch)</span>
            </button>

            {!isAdmin && (
              <button
                onClick={() => setActiveTab('cart')}
                className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="View Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 flex items-center justify-end gap-1">
                    {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 inline" />}
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {currentUser.role}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-xs cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
