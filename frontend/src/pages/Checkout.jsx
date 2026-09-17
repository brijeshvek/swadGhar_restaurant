import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  ShoppingBag,
  CreditCard,
  Banknote,
  MapPin,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  UtensilsCrossed,
  Home,
  Briefcase,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Checkout = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const {
    cartItems,
    subtotal,
    discountAmount,
    tax,
    deliveryFee,
    grandTotal,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();

  // Form State
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'pickup' | 'dine-in'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'razorpay'

  // Saved Addresses State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new'); // 'new' or address ID
  const [saveThisAddress, setSaveThisAddress] = useState(true);
  const [addressLabel, setAddressLabel] = useState('Home');

  // Customer & Address Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('380015');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [processing, setProcessing] = useState(false);

  // Initialize or fetch user addresses
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');

      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/addresses');
      const addrs = res.data || [];
      setAddresses(addrs);

      if (addrs.length > 0) {
        // Find default or use first
        const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
        setSelectedAddressId(defaultAddr._id);
        populateFieldsFromAddress(defaultAddr);
      } else {
        setSelectedAddressId('new');
      }
    } catch (err) {
      console.warn('Could not fetch saved addresses:', err);
      if (user?.addresses && user.addresses.length > 0) {
        setAddresses(user.addresses);
        const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setSelectedAddressId(def._id);
        populateFieldsFromAddress(def);
      }
    }
  };

  const populateFieldsFromAddress = (addr) => {
    setFullName(addr.fullName || user?.name || '');
    setPhone(addr.phone || user?.phone || '');
    setHouseNo(addr.houseNo || '');
    setStreet(addr.street || '');
    setArea(addr.area || '');
    setCity(addr.city || 'Ahmedabad');
    setState(addr.state || 'Gujarat');
    setPincode(addr.pincode || '380015');
    setLandmark(addr.landmark || '');
    setDeliveryInstructions(addr.deliveryInstructions || '');
  };

  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr._id);
    populateFieldsFromAddress(addr);
    showInfo(`Selected ${addr.label || 'Saved'} Address`);
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    setHouseNo('');
    setStreet('');
    setArea('');
    setLandmark('');
    setDeliveryInstructions('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showError('Your plate is empty.');
      navigate('/menu');
      return;
    }

    if (!isAuthenticated) {
      showInfo('Please sign in or register to place your order.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (orderType === 'delivery') {
      if (!fullName || !phone || !street || !city || !pincode) {
        showError('Please complete all required delivery address fields.');
        return;
      }
    }

    setProcessing(true);

    try {
      // 1. Send Order to Backend
      const orderPayload = {
        items: cartItems.map((item) => ({
          food: item.food._id,
          quantity: item.quantity,
        })),
        orderType,
        deliveryAddress:
          orderType === 'delivery'
            ? {
                fullName,
                phone,
                email,
                houseNo,
                street,
                area,
                city,
                state,
                pincode,
                landmark,
                deliveryInstructions,
              }
            : undefined,
        saveAddress: selectedAddressId === 'new' ? saveThisAddress : false,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        paymentMethod,
        specialInstructions,
      };

      const orderRes = await api.post('/orders', orderPayload);
      const createdOrder = orderRes.data;

      // 2. Handle Razorpay Online Payment Flow
      if (paymentMethod === 'razorpay') {
        try {
          const rzpInitRes = await api.post('/payments/razorpay/create-order', {
            orderId: createdOrder._id,
          });

          const rzpData = rzpInitRes.data;

          // Check if Razorpay SDK script is loaded in window
          if (window.Razorpay && rzpData.orderId && !rzpData.orderId.startsWith('order_sim_')) {
            const options = {
              key: rzpData.key,
              amount: rzpData.amount,
              currency: rzpData.currency,
              name: 'SwadGhar Restaurant',
              description: `Order #${createdOrder.orderNumber}`,
              image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80',
              order_id: rzpData.orderId,
              handler: async function (response) {
                try {
                  await api.post('/payments/razorpay/verify', {
                    orderId: createdOrder._id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  });
                  clearCart();
                  showSuccess('Payment Successful! Order Confirmed.');
                  navigate(`/order-success/${createdOrder.orderNumber}`);
                } catch (verifyErr) {
                  showError('Payment verification failed.');
                }
              },
              prefill: {
                name: fullName || user?.name,
                email: email || user?.email,
                contact: phone || user?.phone,
              },
              theme: {
                color: '#ea580c',
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (resp) {
              showError(`Payment failed: ${resp.error?.description || 'Gateway error'}`);
            });
            rzp.open();
            setProcessing(false);
            return;
          } else {
            // Simulated Test Payment Mode
            await api.post('/payments/razorpay/verify', {
              orderId: createdOrder._id,
              razorpay_order_id: rzpData.orderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              razorpay_signature: 'simulated_valid_signature',
            });
          }
        } catch (paymentErr) {
          console.warn('Razorpay initiation fallback, proceeding:', paymentErr);
        }
      }

      // Refresh user to sync any new saved addresses
      if (refreshUser) refreshUser();

      // 3. Clear Cart & Navigate
      clearCart();
      showSuccess('Order Placed Successfully! SMS notification sent to your phone.');
      navigate(`/order-success/${createdOrder.orderNumber}`);
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Cart</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-stone-900 mt-2">
          Secure Order Checkout
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Order Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Dining Method Selection */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              1. Choose Dining Method
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'delivery', label: 'Home Delivery', icon: Truck, desc: 'Hot & fresh in 35m' },
                { id: 'pickup', label: 'Takeaway Pickup', icon: ShoppingBag, desc: 'Ready in 20m' },
                { id: 'dine-in', label: 'Dine-In Plate', icon: UtensilsCrossed, desc: 'Serve at table' },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setOrderType(type.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      orderType === type.id
                        ? 'bg-brand-500/10 border-brand-500 text-stone-900 ring-2 ring-brand-500/20 shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mb-2 ${
                        orderType === type.id ? 'text-brand-600' : 'text-stone-400'
                      }`}
                    />
                    <span className="block font-bold text-xs sm:text-sm">{type.label}</span>
                    <span className="text-[10px] text-stone-400">{type.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Delivery Address Book & Details */}
          {orderType === 'delivery' && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <span>2. Delivery Address</span>
                </h3>
                <Link
                  to="/profile"
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Manage Address Book →
                </Link>
              </div>

              {/* Saved Address Cards */}
              {addresses.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-stone-500 block uppercase tracking-wider">
                    Select Saved Delivery Address
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;
                      return (
                        <div
                          key={addr._id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-sm'
                              : 'border-stone-200 bg-stone-50/60 hover:border-stone-300 hover:bg-stone-100/70'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-200 text-stone-700">
                                {addr.label || 'Home'}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-brand-600 bg-brand-600' : 'border-stone-300 bg-white'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="font-bold text-xs text-stone-900 mt-2 line-clamp-1">
                            {addr.fullName} <span className="text-stone-400 font-normal">({addr.phone})</span>
                          </p>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
                            {addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.street}, {addr.area ? `${addr.area}, ` : ''}{addr.city} - {addr.pincode}
                          </p>
                        </div>
                      );
                    })}

                    {/* New Address Option Button */}
                    <div
                      onClick={handleSelectNewAddress}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-center items-center text-center ${
                        selectedAddressId === 'new'
                          ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-sm'
                          : 'border-dashed border-stone-300 bg-stone-50/50 hover:bg-stone-100'
                      }`}
                    >
                      <Plus className="w-5 h-5 text-brand-600 mb-1" />
                      <span className="font-bold text-xs text-stone-900">Enter New Address</span>
                      <span className="text-[10px] text-stone-400">Fill in the fields below</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields for Address / Delivery */}
              <div className="pt-2 space-y-4">
                <span className="text-xs font-bold text-stone-500 block uppercase tracking-wider">
                  {selectedAddressId === 'new' ? 'New Address Details' : 'Verify Delivery Information'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Recipient Phone (For SMS updates) *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Flat / House / Building No.</label>
                    <input
                      type="text"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="e.g. Flat 402, Block B"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Street / Society Address *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. Shivalik Residency, CG Road"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Area / Sector</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Navrangpura / Bodakdev"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Opposite City Mall / Near Metro Station"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="380015"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-stone-700">Delivery Instructions (Optional)</label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Leave package at security, call before arrival, ring bell twice"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Save address checkbox when entering a new address */}
                  {selectedAddressId === 'new' && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                        <input
                          type="checkbox"
                          checked={saveThisAddress}
                          onChange={(e) => setSaveThisAddress(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
                        />
                        <span>Save this address in my address book for future orders</span>
                      </label>
                      {saveThisAddress && (
                        <div className="flex items-center gap-1.5">
                          {['Home', 'Work', 'Other'].map((lbl) => (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => setAddressLabel(lbl)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                addressLabel === lbl
                                  ? 'bg-brand-600 text-white shadow-xs'
                                  : 'bg-white text-stone-600 border border-stone-200'
                              }`}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dine-In or Pickup contact info */}
          {orderType !== 'delivery' && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-stone-900">
                2. Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Phone Number (For SMS)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cooking Instructions */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h3 className="text-base font-serif font-bold text-stone-900">
              3. Special Cooking Requests
            </h3>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less spicy, Jain preparation, extra napkins, cutlery required..."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500 resize-none"
            ></textarea>
          </div>

          {/* 4. Payment Method */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              4. Select Payment Mode
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === 'cod'
                    ? 'bg-brand-500/10 border-brand-500 text-stone-900 ring-2 ring-brand-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Banknote className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block">
                    Cash on Delivery (COD)
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Pay with cash or UPI on delivery / pickup
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === 'razorpay'
                    ? 'bg-brand-500/10 border-brand-500 text-stone-900 ring-2 ring-brand-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <CreditCard className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block">
                    Online Payment (Razorpay)
                  </span>
                  <span className="text-[11px] text-stone-400">
                    UPI, Cards, NetBanking, Paytm & Wallets
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Place Order */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-md space-y-4 sticky top-24">
            <h4 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-stone-500">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </h4>

            {/* Item list brief */}
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.food._id}
                  className="flex justify-between items-center text-xs text-stone-700"
                >
                  <span className="line-clamp-1 flex-1">
                    {item.food.name} <span className="text-stone-400 font-bold">x{item.quantity}</span>
                  </span>
                  <span className="font-bold font-sans">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900 font-sans">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Savings ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST (5% SGST + CGST)</span>
                <span className="font-bold text-stone-900 font-sans">₹{tax}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {orderType !== 'delivery' || deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span className="font-bold text-stone-900 font-sans">₹{deliveryFee}</span>
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900">Final Payable</span>
                <span className="text-2xl font-bold text-brand-600 font-sans">
                  ₹{orderType !== 'delivery' ? subtotal - discountAmount + tax : grandTotal}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-[11px] text-stone-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-stone-700">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Invoice & SMS Confirmation</span>
              </div>
              <p>You will receive real-time SMS updates and an itemized digital GST invoice upon order placement.</p>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Place Order • ₹
                    {orderType !== 'delivery'
                      ? subtotal - discountAmount + tax
                      : grandTotal}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
