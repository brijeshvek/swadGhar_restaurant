import React, { useEffect, useState } from 'react';
import { Calendar, Check, X, Phone, Users, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { showSuccess, showError } = useNotification();

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations?limit=100');
      if (res?.data) {
        setReservations(res.data);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleUpdateStatus = async (id, status, tableNumber) => {
    try {
      await api.put(`/reservations/${id}/status`, { status, tableNumber });
      showSuccess(`Reservation status updated to '${status}'.`);
      fetchReservations();
    } catch (err) {
      showError(err.message || 'Failed to update reservation.');
    }
  };

  const filteredReservations = reservations.filter((r) =>
    statusFilter === 'all' ? true : r.status === statusFilter
  );

  return (
    <div className="space-y-6 animate-fade-in text-stone-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Table Reservations Desk ({reservations.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Confirm seating slots, allocate dining table numbers, and manage party requests
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 border-b border-stone-800 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <tr>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Booking Date & Time</th>
                <th className="py-3.5 px-4">Party Size</th>
                <th className="py-3.5 px-4">Special Requests</th>
                <th className="py-3.5 px-4">Status & Table</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredReservations.map((res) => (
                <tr key={res._id} className="hover:bg-stone-900/50 transition-colors">
                  {/* Guest */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block text-sm">{res.customerName}</span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-brand-500" />
                      {res.phone}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-amber-400 block">
                      {new Date(res.date).toLocaleDateString()}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {res.timeSlot}
                    </span>
                  </td>

                  {/* Party Size */}
                  <td className="py-3.5 px-4 font-bold text-white">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      {res.guests} Guests
                    </span>
                  </td>

                  {/* Special Requests */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="text-stone-400 line-clamp-2 italic">
                      {res.specialRequest || 'No special requests'}
                    </span>
                  </td>

                  {/* Status & Table */}
                  <td className="py-3.5 px-4 space-y-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        res.status === 'confirmed'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                          : res.status === 'rejected' || res.status === 'cancelled'
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                          : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                      }`}
                    >
                      {res.status}
                    </span>
                    {res.tableNumber && (
                      <span className="block text-[10px] text-brand-400 font-semibold">
                        Table #{res.tableNumber}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {res.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(res._id, 'confirmed', 'T-04')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(res._id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {res.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(res._id, 'completed')}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-bold text-[10px] transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;
