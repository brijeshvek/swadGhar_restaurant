import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Receipt,
  Utensils,
  CreditCard,
  Banknote,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const OrderInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useNotification();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/${id}/invoice`);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to load invoice:', err);
      const msg = err.response?.data?.message || 'Invoice could not be retrieved or you are not authorized to view it.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-stone-500">Generating Official Tax Invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Invoice Unavailable</h2>
        <p className="text-stone-600 text-sm max-w-md mx-auto">{error || 'Could not locate the requested order invoice.'}</p>
        <div className="pt-4">
          <button
            onClick={() => navigate('/my-orders')}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Return to My Orders
          </button>
        </div>
      </div>
    );
  }

  const invoiceNum = order.invoiceNumber || `INV-${new Date(order.createdAt).getFullYear()}-${order.orderNumber || order._id.slice(-6).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = order.totalAmount || order.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const discount = order.discountAmount || 0;
  const tax = order.tax || Math.round(subtotal * 0.05);
  const cgst = order.cgst || (tax / 2);
  const sgst = order.sgst || (tax / 2);
  const deliveryFee = order.deliveryFee || 0;
  const finalAmount = order.finalAmount || (subtotal - discount + tax + deliveryFee);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Print Invoice</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Paper Document */}
      <div
        id="invoice-printable"
        className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8 print:shadow-none print:border-none print:p-0 print:rounded-none"
      >
        {/* Header: Restaurant Branding & Invoice Identifier */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-stone-200 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">SwadGhar</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-brand-600">Authentic Heritage Dining</p>
              </div>
            </div>
            <div className="text-xs text-stone-500 space-y-0.5 pt-1">
              <p>SwadGhar Fine Dine & Hospitality Pvt. Ltd.</p>
              <p>12, Heritage Boulevard, SG Highway, Ahmedabad, Gujarat - 380015</p>
              <p>GSTIN: <span className="font-mono font-medium text-stone-700">24AAACS1234F1Z8</span> | FSSAI: <span className="font-mono font-medium text-stone-700">10723001000456</span></p>
              <p>Phone: +91 79 4000 8888 | Email: billing@swadghar.com</p>
            </div>
          </div>

          <div className="sm:text-right space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-stone-900 text-white">
              TAX INVOICE
            </span>
            <div className="space-y-1">
              <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Invoice No.</p>
              <p className="text-sm font-mono font-bold text-brand-600">{invoiceNum}</p>
            </div>
            <div className="text-xs text-stone-500 space-y-0.5">
              <p>Order ID: <span className="font-mono font-semibold text-stone-800">#{order.orderNumber}</span></p>
              <p>Date: <span className="text-stone-800 font-medium">{orderDate} at {orderTime}</span></p>
              <p>Dining Mode: <span className="capitalize font-semibold text-stone-800">{order.orderType || 'Delivery'}</span></p>
            </div>
          </div>
        </div>

        {/* Billed To & Payment Status Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-stone-200 pb-8 text-xs">
          {/* Customer Delivery Information */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Billed To (Customer)</h4>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1 text-stone-700">
              <p className="font-bold text-sm text-stone-900">{order.deliveryAddress?.fullName || order.customer?.name || 'Customer'}</p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{order.deliveryAddress?.phone || order.customer?.phone || 'N/A'}</span>
              </p>
              {order.deliveryAddress?.email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{order.deliveryAddress.email}</span>
                </p>
              )}
              {order.orderType === 'delivery' && order.deliveryAddress && (
                <div className="pt-2 border-t border-stone-200 mt-2">
                  <p className="text-stone-500 font-medium">Delivery Destination:</p>
                  <p className="text-stone-800">
                    {order.deliveryAddress.houseNo ? `${order.deliveryAddress.houseNo}, ` : ''}
                    {order.deliveryAddress.street || order.deliveryAddress.address || ''}
                    {order.deliveryAddress.area ? `, ${order.deliveryAddress.area}` : ''}
                  </p>
                  <p className="text-stone-800">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state || 'Gujarat'} - {order.deliveryAddress.pincode}
                  </p>
                  {order.deliveryAddress.landmark && (
                    <p className="text-stone-500 italic mt-0.5">Landmark: {order.deliveryAddress.landmark}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Payment & Status</h4>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2 text-stone-700">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Payment Mode:</span>
                <span className="font-bold text-stone-900 uppercase">
                  {order.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery (COD)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Payment Status:</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.paymentStatus === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{order.paymentStatus?.toUpperCase() || 'PENDING'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Order Status:</span>
                <span className="font-bold text-stone-900 capitalize">{order.orderStatus?.replace('_', ' ') || 'Confirmed'}</span>
              </div>
              {order.paymentDetails?.razorpay_payment_id && (
                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-[10px]">
                  <span className="text-stone-500">Transaction ID:</span>
                  <span className="font-mono text-stone-800">{order.paymentDetails.razorpay_payment_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Foods Table */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Itemized Order Details</h4>
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Dish Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4 text-stone-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{item.name || item.food?.name || 'Dish Item'}</div>
                      {item.food?.category && (
                        <div className="text-[10px] text-stone-400">{item.food.category}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-stone-800">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono text-stone-600">₹{item.price}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Breakdown & Calculation */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
          <div className="text-xs text-stone-500 max-w-sm space-y-2">
            <p className="font-bold text-stone-800">Terms & Conditions:</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
              <li>Goods once sold and delivered cannot be returned.</li>
              <li>GST included as applicable under restaurant hospitality composition.</li>
              <li>For billing queries or support, contact support@swadghar.com.</li>
            </ul>
          </div>

          <div className="w-full sm:w-72 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Item Subtotal:</span>
              <span className="font-mono font-semibold text-stone-900">₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({order.couponCode || 'Promo'}):</span>
                <span className="font-mono">-₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>CGST (2.5%):</span>
              <span className="font-mono">₹{cgst}</span>
            </div>
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>SGST (2.5%):</span>
              <span className="font-mono">₹{sgst}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-mono">
                {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="pt-2.5 border-t border-stone-200 flex justify-between items-baseline font-bold">
              <span className="text-sm text-stone-900">Total Payable:</span>
              <span className="text-xl font-mono text-brand-600">₹{finalAmount}</span>
            </div>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="pt-8 border-t border-dashed border-stone-200 flex flex-col sm:flex-row justify-between items-end gap-4 text-xs text-stone-400">
          <div>
            <p>Thank you for choosing SwadGhar!</p>
            <p className="text-[10px]">This is a computer-generated official tax invoice.</p>
          </div>
          <div className="text-right">
            <div className="w-32 h-10 border-b border-stone-300 mb-1 ml-auto flex items-end justify-center font-serif italic text-stone-600">
              SwadGhar Auth.
            </div>
            <p className="text-[10px] uppercase tracking-wider font-bold">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
