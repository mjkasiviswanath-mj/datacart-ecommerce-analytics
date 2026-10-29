import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ArrowLeft, CreditCard, Banknote, Smartphone, AlertCircle, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, PaymentMethod, User, Order } from '../types';

interface CheckoutViewProps {
  currentUser: User | null;
  cart: CartItem[];
  onPlaceOrder: (formData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    pincode: string;
    paymentMethod: PaymentMethod;
  }) => Order | null;
  onBackToCart: () => void;
  onViewOrderHistory: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  currentUser,
  cart,
  onPlaceOrder,
  onBackToCart,
  onViewOrderHistory,
}) => {
  // Pre-fill with logged-in user profile details if available
  const [name, setName] = useState(currentUser?.name || 'Kasi');
  const [email, setEmail] = useState(currentUser?.email || 'kasi@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98111 22334');
  const [address, setAddress] = useState(currentUser?.address || '42 MG Road, Sector 14');
  const [city, setCity] = useState(currentUser?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(currentUser?.pincode || '560001');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 200 ? 0 : 15;
  const grandTotal = subtotal + shippingFee;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please provide a valid email address';
    }

    if (!phone.trim()) {
      errs.phone = 'Contact phone number is required';
    } else if (phone.trim().length < 8) {
      errs.phone = 'Phone number is too short';
    }

    if (!address.trim()) errs.address = 'Street address is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (pincode.trim().length < 4) {
      errs.pincode = 'Invalid pincode format';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const order = onPlaceOrder({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: address,
      city,
      pincode,
      paymentMethod,
    });

    if (order) {
      setPlacedOrder(order);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // fallback if canvas not available
      }
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              Success
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Order placed successfully!
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Thank you for shopping on DataCart. Your order has been recorded into the SQLite database.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-mono font-bold text-indigo-700">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Amount:</span>
              <span className="font-bold text-slate-900">${placedOrder.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="font-medium text-slate-900">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-semibold text-amber-600">{placedOrder.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery To:</span>
              <span className="font-medium text-slate-900">{placedOrder.city}, {placedOrder.pincode}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onViewOrderHistory}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition shadow-xs cursor-pointer"
            >
              View Order History
            </button>
            <button
              onClick={onBackToCart}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete customer shipping details and select dummy payment method.
          </p>
        </div>
        <button
          onClick={onBackToCart}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Shipping & Payment Details (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Form Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Customer & Shipping Information</span>
              <span className="text-xs font-normal text-slate-400">Step 1 of 2</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Customer Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                  placeholder="e.g. Rahul Sharma"
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
                placeholder="+91 98765 43210"
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
                placeholder="Apartment, building, street address"
              />
              {errors.address && <p className="text-[11px] text-rose-500 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    errors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                  placeholder="e.g. Bengaluru"
                />
                {errors.city && <p className="text-[11px] text-rose-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode / Postal Code *</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    errors.pincode ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                  placeholder="e.g. 560001"
                />
                {errors.pincode && <p className="text-[11px] text-rose-500 mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Dummy Payment Method (Requirement 7) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Select Payment Method (Simulation)</span>
              <span className="text-xs font-normal text-slate-400">Step 2 of 2</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
                { id: 'Card', label: 'Debit / Credit Card', icon: CreditCard, desc: 'Visa, MasterCard, RuPay' },
                { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay cash upon arrival' },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                      <input
                        type="radio"
                        name="payment"
                        checked={isSelected}
                        onChange={() => setPaymentMethod(m.id as PaymentMethod)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{m.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items Preview & Confirm (Right 1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Items in Order ({cart.length})
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <span className="font-bold text-slate-900 w-4">{item.quantity}x</span>
                  <span className="text-slate-700 truncate">{item.product.name}</span>
                </div>
                <span className="font-semibold text-slate-900 shrink-0">
                  ${item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">${subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee:</span>
              <span className="font-semibold text-slate-900">
                {shippingFee === 0 ? 'FREE' : `$${shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-900 text-sm font-bold pt-2 border-t border-slate-100">
              <span>Grand Total:</span>
              <span className="text-indigo-600 font-extrabold text-base">${grandTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Place Order Now</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            Your order will be processed securely with instant tracking and confirmation.
          </p>
        </div>
      </form>
    </div>
  );
};
