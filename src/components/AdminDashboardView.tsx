import React, { useState } from 'react';
import {
  Package,
  Users,
  ShoppingBag,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Search,
  Filter,
  BarChart3,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Product, Order, User, OrderStatus, SalesAnalytics } from '../types';
import { CATEGORIES } from '../sampleData';

interface AdminDashboardViewProps {
  products: Product[];
  orders: Order[];
  users: User[];
  analytics: SalesAnalytics;
  onSaveProduct: (prod: Omit<Product, 'id'> & { id?: string }) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onViewAnalytics: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  products,
  orders,
  users,
  analytics,
  onSaveProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onViewAnalytics,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers'>('overview');

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[1]);
  const [formPrice, setFormPrice] = useState('99');
  const [formStock, setFormStock] = useState('20');
  const [formRating, setFormRating] = useState('4.8');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState('');

  // Search & Filters inside Admin
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const customersList = users.filter((u) => u.role === 'customer');

  const openAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Electronics');
    setFormPrice('99');
    setFormStock('25');
    setFormRating('4.7');
    setFormDescription('High performance device with advanced design.');
    setFormImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
    setFormError('');
    setShowProductModal(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price.toString());
    setFormStock(prod.stock.toString());
    setFormRating(prod.rating.toString());
    setFormDescription(prod.description);
    setFormImage(prod.image);
    setFormError('');
    setShowProductModal(true);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) {
      setFormError('Product Name and Description are required.');
      return;
    }
    const priceNum = parseFloat(formPrice);
    const stockNum = parseInt(formStock, 10);
    const ratingNum = parseFloat(formRating);

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Please enter a valid non-negative stock quantity.');
      return;
    }

    onSaveProduct({
      id: editingProduct?.id,
      name: formName.trim(),
      category: formCategory,
      price: priceNum,
      stock: stockNum,
      rating: isNaN(ratingNum) ? 4.5 : Math.min(5, Math.max(1, ratingNum)),
      description: formDescription.trim(),
      image: formImage.trim() || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
    });

    setShowProductModal(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredCustomers = customersList.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 mb-1">
            Admin Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage product inventory, process customer orders, monitor users, and inspect sales trends.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={openAddProduct}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={onViewAnalytics}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Sales Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Requirement 9) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {products.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {CATEGORIES.length - 1} categories in catalog
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {customersList.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Active registered customer profiles
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {orders.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Database transactions recorded
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${analytics.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            AOV: ${analytics.avgOrderValue}
          </div>
        </div>
      </div>

      {/* Admin Sub Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quick Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'customers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Customers ({customersList.length})
        </button>
      </div>

      {/* Sub-view: Quick Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Recent Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                View all ({orders.length})
              </button>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{o.id}</div>
                    <div className="text-slate-500">{o.customerName} • {o.items.length} items</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">${o.totalAmount}</div>
                    <span className="text-[10px] font-semibold text-indigo-600">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Warning Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Inventory Stock Watch</span>
              </h3>
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                Manage Inventory
              </button>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {products
                .filter((p) => p.stock <= 20)
                .slice(0, 5)
                .map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 line-clamp-1">{p.name}</div>
                      <div className="text-slate-500">{p.category}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700">
                        {p.stock} units left
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-view: Manage Products */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              onClick={openAddProduct}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-9 h-9 rounded object-cover bg-slate-100 shrink-0"
                        />
                        <span className="font-semibold text-slate-900 max-w-xs truncate" title={p.name}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{p.category}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">${p.price}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">★ {p.rating}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditProduct(p)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-view: Manage Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, status..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Updating an order's status instantly updates live analytics.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {o.id}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400">{o.customerEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {o.orderDate.slice(0, 10)}
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {o.items.length} item(s)
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                      ${o.totalAmount}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {o.paymentMethod}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'Shipped'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : o.status === 'Confirmed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : o.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-view: Customers */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Registered customers stored in `users` SQLite table.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">Customer Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">City</th>
                  <th className="py-3 px-3">Orders Placed</th>
                  <th className="py-3 px-3">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => {
                  const custOrders = orders.filter((o) => o.userId === c.id);
                  const custSpend = custOrders.reduce((sum, o) => sum + o.totalAmount, 0);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {c.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{c.email}</td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {c.phone || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{c.city || 'N/A'}</td>
                      <td className="py-3 px-3 font-medium text-indigo-700 whitespace-nowrap">
                        {custOrders.length} orders
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        ${custSpend}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  placeholder="e.g. Sony WH-1000XM5 Headphones"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ($ USD) *</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rating (1 - 5) *</label>
                  <input
                    type="number"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    min="1"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  placeholder="Comprehensive description of product features..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
