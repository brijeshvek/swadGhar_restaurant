import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Mail,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Calendar,
  Building2,
  DollarSign,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { BlurText, AnimatedContent, SpotlightCard, CountUp } from '../components/animations';

const Franchise = () => {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');
  const { showSuccess, showError } = useNotification();

  // Inquiry Form State
  const [submitting, setSubmitting] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    investmentBudget: '₹30 - ₹50 Lakhs',
    experience: 'Food & Hospitality Business',
    message: '',
  });

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const res = await api.get('/franchises');
        if (res?.data) {
          setFranchises(res.data);
        }
      } catch (err) {
        console.error('Error fetching franchise locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFranchises();
  }, []);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryData.name || !inquiryData.phone || !inquiryData.city) {
      showError('Please fill in your Name, Phone Number, and Target City.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/franchises/inquiry', inquiryData);
      showSuccess(res.message || 'Franchise inquiry submitted successfully! Our team will contact you.');
      setInquiryData({
        name: '',
        email: '',
        phone: '',
        city: '',
        investmentBudget: '₹30 - ₹50 Lakhs',
        experience: 'Food & Hospitality Business',
        message: '',
      });
    } catch (err) {
      showError(err.message || 'Failed to submit franchise inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  const cities = ['all', ...new Set(franchises.map((f) => f.city))];

  const filteredFranchises = franchises.filter((f) => {
    if (selectedCity === 'all') return true;
    return f.city.toLowerCase() === selectedCity.toLowerCase();
  });

  // Modal State for Viewing Branch Staff Team
  const [selectedBranchForStaff, setSelectedBranchForStaff] = useState(null);

  return (
    <div className="space-y-16 sm:space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. HERO BANNER */}
      <section className="relative rounded-3xl overflow-hidden bg-stone-950 text-white p-8 sm:p-14 lg:p-20 shadow-2xl border border-stone-800">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
            alt="SwadGhar Restaurant Ambience"
            className="w-full h-full object-cover opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Store className="w-3.5 h-3.5" />
            <span>5 Active Branches • 50+ Professional Culinary & Floor Staff</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
            SwadGhar <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-brand-500">Restaurant Franchises</span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Experience our 25-year culinary legacy of authentic Gujarati thalis and royal Punjabi curries. Visit one of our 5 premier locations, meet our dedicated branch teams, or partner with us to bring SwadGhar to your city.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#branches"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all"
            >
              Explore Our 5 Branches
            </a>
            <a
              href="#partner"
              className="px-6 py-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-200 hover:text-white font-semibold text-sm transition-all"
            >
              Franchise Partnership Form
            </a>
          </div>
        </div>
      </section>

      {/* 2. STATS & WHY PARTNER */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            <CountUp to={5} duration={1} suffix=" Outlets" />
          </h3>
          <p className="text-xs text-stone-500 font-medium">Operating Franchise Branches</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            <CountUp to={50} duration={1.5} suffix=" Staff" />
          </h3>
          <p className="text-xs text-stone-500 font-medium">10 Trained Staff per Branch</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            <CountUp to={100} duration={1.5} suffix="%" />
          </h3>
          <p className="text-xs text-stone-500 font-medium">Authentic Ghee & Quality Spices</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            <CountUp to={35} duration={1.5} suffix="% ROI" />
          </h3>
          <p className="text-xs text-stone-500 font-medium">Average Annual Franchise ROI</p>
        </div>
      </section>

      {/* 3. 5 FRANCHISE LOCATIONS LIST */}
      <section id="branches" className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
              Flagship & Regional Outlets
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
              Our 5 Official Branches
            </h2>
          </div>

          {/* City Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-500 font-semibold">City:</span>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedCity === city
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {city === 'all' ? `All Cities (${franchises.length})` : city}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
            <span>Loading franchise locations...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredFranchises.map((branch, idx) => (
              <div
                key={branch._id || idx}
                className="rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Branch Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-stone-950">
                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-bold shadow-md">
                      {branch.branchType}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                      👥 10 Staff Members
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                      Branch #{idx + 1} • {branch.city}, {branch.state}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                      {branch.name}
                    </h3>
                  </div>
                </div>

                {/* Branch Content */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-stone-600">
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </div>

                    {/* Phone & Timings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-semibold text-stone-900">{branch.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                        <span>{branch.timings}</span>
                      </div>
                    </div>

                    {/* Features Badges */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        Branch Highlights & Amenities:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {branch.features?.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700 font-medium"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Staff Team Preview Trigger Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedBranchForStaff(branch)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>View Branch Staff Team (10 Staff Members)</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100">
                    <Link
                      to="/reservations"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs text-center transition-colors shadow-md shadow-brand-500/20"
                    >
                      Book Table Here
                    </Link>
                    <Link
                      to="/menu"
                      className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-colors"
                    >
                      View Menu
                    </Link>
                    <a
                      href={branch.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="Get Directions"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. BRANCH STAFF TEAM MODAL */}
      {selectedBranchForStaff && (
        <div
          onClick={() => setSelectedBranchForStaff(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl relative text-white"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Users className="w-3.5 h-3.5" />
                  <span>10 Staff Members</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {selectedBranchForStaff.name} – Staff Team
                </h3>
                <p className="text-xs text-stone-400">
                  {selectedBranchForStaff.address}
                </p>
              </div>

              <button
                onClick={() => setSelectedBranchForStaff(null)}
                className="text-stone-400 hover:text-white p-2 rounded-xl hover:bg-stone-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedBranchForStaff.staffTeam?.map((member, sIdx) => (
                <div
                  key={sIdx}
                  className="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 transition-all flex items-start gap-3.5"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-700 shrink-0 bg-stone-900"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-white truncate">{member.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 text-amber-400 border border-stone-800 font-mono font-bold shrink-0">
                        #{sIdx + 1}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-brand-400 leading-snug">
                      {member.designation}
                    </p>

                    <p className="text-[11px] text-stone-400 leading-tight pt-0.5">
                      ★ {member.specialty}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-400 border-t border-stone-900 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-amber-500" />
                        <span className="text-stone-300 font-mono">{member.email}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span className="text-stone-300">{member.phone}</span>
                      </span>
                      <span className="text-stone-500">
                        Exp: <strong className="text-stone-300">{member.experience}</strong> • Shift: <strong className="text-stone-300">{member.shift}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setSelectedBranchForStaff(null)}
                className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PARTNERSHIP / FRANCHISE INQUIRY FORM */}
      <section id="partner" className="rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 text-white p-6 sm:p-12 lg:p-16 border border-stone-800 shadow-2xl space-y-8">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Expansion Opportunities
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
            Open a SwadGhar Franchise in Your City
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Join India’s most beloved Gujarati & Punjabi culinary brand. We provide end-to-end support including chef training, authentic spice supply, interior architecture, and digital point-of-sale systems.
          </p>
        </div>

        <form onSubmit={handleInquirySubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">Your Full Name *</label>
            <input
              type="text"
              required
              value={inquiryData.name}
              onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
              placeholder="e.g. Ramesh Patel"
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">Contact Phone Number *</label>
            <input
              type="tel"
              required
              value={inquiryData.phone}
              onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">Email Address</label>
            <input
              type="email"
              value={inquiryData.email}
              onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
              placeholder="e.g. ramesh@example.com"
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Proposed City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">Proposed City / Location *</label>
            <input
              type="text"
              required
              value={inquiryData.city}
              onChange={(e) => setInquiryData({ ...inquiryData, city: e.target.value })}
              placeholder="e.g. Gandhinagar, Bhavnagar, Pune..."
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Investment Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">Investment Budget Capacity</label>
            <select
              value={inquiryData.investmentBudget}
              onChange={(e) => setInquiryData({ ...inquiryData, investmentBudget: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="₹20 - ₹30 Lakhs (Express Outlet)">₹20 - ₹30 Lakhs (Express Outlet)</option>
              <option value="₹30 - ₹50 Lakhs (Standard Dine-In)">₹30 - ₹50 Lakhs (Standard Dine-In)</option>
              <option value="₹50 Lakhs - ₹1 Crore (Royal Flagship)">₹50 Lakhs - ₹1 Crore (Royal Flagship)</option>
              <option value="₹1 Crore+ (Multi-Unit Franchise)">₹1 Crore+ (Multi-Unit Franchise)</option>
            </select>
          </div>

          {/* Experience */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">Prior Business Experience</label>
            <select
              value={inquiryData.experience}
              onChange={(e) => setInquiryData({ ...inquiryData, experience: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Food & Hospitality Business">Food & Hospitality Business Owner</option>
              <option value="Retail / FMCG Franchisee">Retail / FMCG Franchisee</option>
              <option value="Corporate Professional / Investor">Corporate Professional / Investor</option>
              <option value="First-Time Entrepreneur">First-Time Entrepreneur</option>
            </select>
          </div>

          {/* Additional Notes */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">Message / Commercial Space Details (Optional)</label>
            <textarea
              rows={3}
              value={inquiryData.message}
              onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
              placeholder="Tell us about your property area (sq. ft), preferred location, or timeline..."
              className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-brand-600 hover:from-amber-400 hover:to-brand-500 text-white font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Franchise Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Franchise;
