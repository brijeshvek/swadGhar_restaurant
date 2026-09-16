import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Sparkles,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Reservations = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('19:30');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [specialRequest, setSpecialRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myReservations, setMyReservations] = useState([]);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  const fetchMyReservations = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/reservations/my-reservations');
      if (res?.data) {
        setMyReservations(res.data);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  };

  useEffect(() => {
    fetchMyReservations();
  }, [isAuthenticated]);

  const lunchSlots = ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM'];
  const dinnerSlots = ['07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM'];

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/reservations', {
        customerName,
        phone,
        email,
        date,
        timeSlot,
        guests,
        specialRequest,
      });

      setBookingSuccessData(res.data);
      showSuccess('Table reservation requested successfully!');
      fetchMyReservations();
    } catch (err) {
      showError(err.message || 'Failed to book table. Slot may be occupied.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this table reservation?')) return;
    try {
      await api.put(`/reservations/${id}/cancel`);
      showSuccess('Reservation cancelled.');
      fetchMyReservations();
    } catch (err) {
      showError(err.message || 'Cannot cancel reservation.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
          Fine Dining Table Booking
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          Reserve Your Table at SwadGhar
        </h1>
        <p className="text-stone-500 text-sm sm:text-base">
          Celebrate intimate dinners, family gatherings, and corporate luncheons with authentic royal hospitality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Reservation Form (Left 2 Cols) */}
        <div className="lg:col-span-2 p-6 sm:p-10 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-8">
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Guest Count Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-600" />
                <span>Number of Guests</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuests(num)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      guests === num
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Slot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-brand-600" />
                  <span>Reservation Date</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>Preferred Seating Time</span>
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500 font-medium"
                >
                  <optgroup label="Lunch Hours">
                    {lunchSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Dinner Hours">
                    {dinnerSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Contact Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Special Request */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Seating & Occasion Request (Optional)</label>
              <textarea
                rows={2}
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="e.g. Anniversary candlelight table, baby high-chair needed, quiet corner..."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-500/25 hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UtensilsCrossed className="w-5 h-5" />
                  <span>Confirm Table Reservation Request</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Reservation Policy & User Active Bookings */}
        <div className="space-y-6">
          {/* Reservation Policy Box */}
          <div className="p-6 rounded-3xl bg-stone-900 text-stone-200 border border-stone-800 shadow-md space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Dining Guidelines</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero reservation or cancellation fees.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Tables are held for up to 15 minutes past your booked slot.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Special banquet setup available for parties above 15 guests.</span>
              </li>
            </ul>
          </div>

          {/* User Active Bookings (If logged in) */}
          {isAuthenticated && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-stone-900">
                Your Upcoming Bookings
              </h3>

              {myReservations.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {myReservations.map((res) => (
                    <div
                      key={res._id}
                      className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">
                          {new Date(res.date).toLocaleDateString()} at {res.timeSlot}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            res.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : res.status === 'rejected' || res.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>

                      <p className="text-stone-500">
                        Party of {res.guests} Guests {res.tableNumber ? `(Table #${res.tableNumber})` : ''}
                      </p>

                      {res.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(res._id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-[11px]"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400">
                  No upcoming table reservations found for this account.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {bookingSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-3xl bg-white p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-glow">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                Reservation Confirmed!
              </h3>
              <p className="text-xs text-stone-500">
                We have registered your table request for {bookingSuccessData.guests} guests on{' '}
                {new Date(bookingSuccessData.date).toLocaleDateString()} at {bookingSuccessData.timeSlot}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1">
              <p><strong>Guest Name:</strong> {bookingSuccessData.customerName}</p>
              <p><strong>Contact:</strong> {bookingSuccessData.phone}</p>
              <p><strong>Status:</strong> <span className="text-amber-600 font-bold uppercase">{bookingSuccessData.status}</span></p>
            </div>

            <button
              onClick={() => setBookingSuccessData(null)}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
