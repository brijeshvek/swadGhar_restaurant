import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  X,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showSuccess, showError } = useNotification();

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/orders?limit=100');
      if (res?.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 15000); // 15s live polling
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showSuccess(`Order status updated to '${newStatus}'.`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      showError(err.message || 'Failed to update order status.');
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'all' || ord.orderStatus === statusFilter;
    const matchesSearch =
      ord.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      ord.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      ord.deliveryAddress?.fullName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-stone-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Order Management Desk ({orders.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Real-time kitchen orders, takeaway pickup tickets, and live delivery dispatches
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # or Customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'preparing', label: 'Cooking' },
            { id: 'out_for_delivery', label: 'In Transit' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 border-b border-stone-800 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <tr>
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-4">Customer & Type</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-stone-900/50 transition-colors">
                  {/* Order Ref */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-amber-400 text-sm block">
                      #{ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>

                  {/* Customer & Type */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">
                      {ord.deliveryAddress?.fullName || ord.customer?.name || 'Guest Diner'}
                    </span>
                    <span className="text-[10px] text-brand-400 capitalize font-medium">
                      {ord.orderType}
                    </span>
                  </td>

                  {/* Items */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-stone-200 block">
                      {ord.items?.length || 0} Delicacies
                    </span>
                    <span className="text-[10px] text-stone-500 line-clamp-1">
                      {ord.items?.map((i) => i.name).join(', ')}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white text-sm font-sans block">
                      ₹{ord.pricing?.total}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold ${
                        ord.paymentInfo.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {ord.paymentInfo.method} ({ord.paymentInfo.status})
                    </span>
                  </td>

                  {/* Order Status Selector */}
                  <td className="py-3.5 px-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                      className="py-1.5 px-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-semibold text-white focus:outline-none focus:border-brand-500 capitalize"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready / Packed</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  {/* Quick Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-brand-400 transition-colors"
                      title="View Order Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-lg w-full rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  #{selectedOrder.orderNumber}
                </span>
                <p className="text-[10px] text-stone-400">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            {selectedOrder.deliveryAddress && (
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <span className="font-bold text-white block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>Delivery Address</span>
                </span>
                <p className="font-semibold text-stone-200">{selectedOrder.deliveryAddress.fullName}</p>
                <p className="text-stone-400">{selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.city}</p>
                <p className="text-stone-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-brand-500" />
                  {selectedOrder.deliveryAddress.phone}
                </p>
              </div>
            )}

            {/* Dishes */}
            <div className="space-y-2">
              <span className="font-bold text-white block">Order Items</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-stone-950">
                    <span className="text-stone-200">
                      {item.name} <strong className="text-amber-400">x{item.quantity}</strong>
                    </span>
                    <span className="font-bold text-white font-sans">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="pt-2 border-t border-stone-800 space-y-1 text-stone-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-sans">₹{selectedOrder.pricing?.subtotal}</span>
              </div>
              {selectedOrder.pricing?.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-₹{selectedOrder.pricing.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST Tax</span>
                <span className="text-white font-sans">₹{selectedOrder.pricing?.tax}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-white font-sans">₹{selectedOrder.pricing?.deliveryFee}</span>
              </div>
              <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-sm text-white">
                <span>Grand Total</span>
                <span className="text-brand-400 font-sans">₹{selectedOrder.pricing?.total}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`/orders/${selectedOrder._id || selectedOrder.orderNumber}/invoice`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs text-center transition-colors shadow-sm"
              >
                Print / View GST Invoice
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
