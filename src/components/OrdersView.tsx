import React from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft, Calendar, CreditCard } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onStartShopping: () => void;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  Pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
  },
  Confirmed: {
    label: 'Confirmed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: CheckCircle,
  },
  Shipped: {
    label: 'Shipped',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Truck,
  },
  Delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  Cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
  },
};

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onStartShopping }) => {
  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No Orders Placed Yet</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          When you place orders, your order records, status tracking, and delivery timelines will appear here.
        </p>
        <button
          onClick={onStartShopping}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Order History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tracking your past purchases recorded in the platform database.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto font-medium">
          Total Orders: <span className="font-bold text-slate-900">{orders.length}</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
          const StatusIcon = statusInfo.icon;
          const formattedDate = new Date(order.orderDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-sm transition"
            >
              {/* Order Header */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                    {order.id}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusInfo.label}</span>
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    ${order.totalAmount}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Ordered Products:
                </div>
                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                          {item.quantity}x
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 line-clamp-1">
                            {item.productName}
                          </div>
                          <div className="text-xs text-slate-500">
                            Category: {item.category} • Unit: ${item.price}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 shrink-0">
                        ${item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="font-medium text-slate-700">Delivery Address: </span>
                    {order.shippingAddress}, {order.city} ({order.pincode})
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Recipient: </span>
                    {order.customerName} ({order.customerPhone})
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
