import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
}) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? (subtotal > 200 ? 0 : 15) : 0;
  const grandTotal = subtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Explore our product catalog, add items to your cart, and see real-time data calculations during checkout.
        </p>
        <button
          onClick={onContinueShopping}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Products</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your selected products, adjust quantities, and proceed to checkout.
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items Table / List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4 text-center">Quantity</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((item) => {
                  const lineTotal = item.product.price * item.quantity;
                  const isMaxStock = item.quantity >= item.product.stock;

                  return (
                    <tr key={item.productId} className="hover:bg-slate-50/50 transition">
                      {/* Product column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 text-sm line-clamp-1">
                              {item.product.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.product.category}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Stock: {item.product.stock}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price column */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-900">
                        ${item.product.price}
                      </td>

                      {/* Quantity column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onUpdateQuantity(item.productId, -1)}
                            className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.productId, 1)}
                            disabled={isMaxStock}
                            className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 flex items-center justify-center transition cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Total column */}
                      <td className="py-4 px-4 whitespace-nowrap text-right font-bold text-slate-900">
                        ${lineTotal}
                      </td>

                      {/* Action column */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => onRemoveItem(item.productId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary & Totals */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Total Items</span>
              <span className="font-semibold text-slate-900">{totalItems} units</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${subtotal}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-medium text-slate-900">
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE (Orders &gt; $200)</span>
                ) : (
                  `$${shippingFee}`
                )}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <div>
                <div className="text-base font-bold text-slate-900">Grand Total</div>
                <div className="text-[11px] text-slate-400">Includes dummy sales tax</div>
              </div>
              <div className="text-2xl font-black text-indigo-600">${grandTotal}</div>
            </div>
          </div>

          <button
            onClick={onProceedToCheckout}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure 256-bit Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
