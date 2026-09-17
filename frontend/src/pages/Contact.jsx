import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  UtensilsCrossed,
  Store,
  Sparkles,
  Award,
  Users,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BRANCH_OPTIONS = [
  { city: 'Ahmedabad', name: 'Ahmedabad Flagship (SG Highway)', managerEmail: 'ahmedabad.manager@swadghar.com', phone: '+91 98250 11234' },
  { city: 'Surat', name: 'Surat Diamond City (Ghod Dod Road)', managerEmail: 'surat.manager@swadghar.com', phone: '+91 98250 22345' },
  { city: 'Vadodara', name: 'Vadodara Royal Heritage (Alkapuri)', managerEmail: 'vadodara.manager@swadghar.com', phone: '+91 98250 33456' },
  { city: 'Rajkot', name: 'Rajkot Kathiyawad Darbar (Kalawad Rd)', managerEmail: 'rajkot.manager@swadghar.com', phone: '+91 98250 44567' },
  { city: 'Mumbai', name: 'Mumbai Express (Borivali West)', managerEmail: 'mumbai.manager@swadghar.com', phone: '+91 98250 55678' },
];

const Contact = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState('restaurant'); // 'restaurant' | 'franchise'
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState(null);

  // Restaurant Inquiry Form State
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    email: '',
    phone: '',
    branchCity: 'Ahmedabad',
    eventType: 'dining',
    subject: '',
    message: '',
  });

  // Franchise Inquiry Form State
  const [franchiseForm, setFranchiseForm] = useState({
    name: '',
    email: '',
    phone: '',
    branchCity: 'Ahmedabad',
    investmentBudget: '₹35 - 50 Lakhs (Standard Dine-In)',
    experience: '5+ Years Business / Retail Experience',
    propertyStatus: 'Commercial Space Available on Rent/Own',
    message: '',
  });

  useEffect(() => {
    if (user) {
      setRestaurantForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
      setFranchiseForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Submit Restaurant Dining Inquiry
  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantForm.name || !restaurantForm.phone || !restaurantForm.message) {
      showError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedBranch = BRANCH_OPTIONS.find((b) => b.city === restaurantForm.branchCity) || BRANCH_OPTIONS[0];
      const payload = {
        name: restaurantForm.name,
        email: restaurantForm.email || 'guest@gmail.com',
        phone: restaurantForm.phone,
        inquiryCategory: 'restaurant',
        branchCity: restaurantForm.branchCity,
        branchName: selectedBranch.name,
        eventType: restaurantForm.eventType,
        subject: restaurantForm.subject || `${restaurantForm.eventType.toUpperCase()} Inquiry - ${selectedBranch.name}`,
        message: restaurantForm.message,
      };

      const res = await api.post('/inquiries', payload);
      setSubmittedInfo({
        category: 'restaurant',
        branch: selectedBranch.name,
        city: selectedBranch.city,
        managerEmail: selectedBranch.managerEmail,
        adminEmail: 'admin@swadghar.com',
        name: restaurantForm.name,
      });
      setSubmitted(true);
      showSuccess(res.message || 'Restaurant inquiry submitted successfully!');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Franchise Inquiry
  const handleFranchiseSubmit = async (e) => {
    e.preventDefault();
    if (!franchiseForm.name || !franchiseForm.phone || !franchiseForm.branchCity || !franchiseForm.message) {
      showError('Please fill out all required franchise fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: franchiseForm.name,
        email: franchiseForm.email || 'franchise.lead@gmail.com',
        phone: franchiseForm.phone,
        inquiryCategory: 'franchise',
        branchCity: franchiseForm.branchCity,
        investmentBudget: franchiseForm.investmentBudget,
        experience: `${franchiseForm.experience} (${franchiseForm.propertyStatus})`,
        subject: `New Franchise Partnership Application for ${franchiseForm.branchCity}`,
        message: franchiseForm.message,
      };

      const res = await api.post('/inquiries', payload);
      setSubmittedInfo({
        category: 'franchise',
        city: franchiseForm.branchCity,
        adminEmail: 'admin@swadghar.com',
        name: franchiseForm.name,
      });
      setSubmitted(true);
      showSuccess(res.message || 'Franchise inquiry submitted to Super Admin!');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to submit franchise application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmittedInfo(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">

      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold uppercase tracking-wider text-amber-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>SwadGhar Inquiries & Support</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          Connect With SwadGhar
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Select below to submit a <strong>Restaurant Branch Inquiry</strong> (dispatched to the Branch Manager & Admin) or a <strong>Franchise Partnership Application</strong> (dispatched to Super Admin).
        </p>
      </div>

      {/* Two Tab Toggle Buttons */}
      <div className="max-w-xl mx-auto bg-stone-100 p-1.5 rounded-2xl grid grid-cols-2 gap-2 border border-stone-200 shadow-sm">
        <button
          type="button"
          onClick={() => { setActiveTab('restaurant'); setSubmitted(false); }}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'restaurant'
              ? 'bg-white text-stone-900 shadow-md ring-2 ring-brand-500/20'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
        >
          <UtensilsCrossed className="w-4 h-4 text-brand-600" />
          <span>1. Restaurant Inquiries</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('franchise'); setSubmitted(false); }}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'franchise'
              ? 'bg-white text-stone-900 shadow-md ring-2 ring-amber-500/20'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
        >
          <Store className="w-4 h-4 text-amber-600" />
          <span>2. Franchise Inquiries</span>
        </button>
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Quick Info & Branch Contacts */}
        <div className="lg:col-span-4 space-y-6">

          {/* 5 Operating Branches Quick Directory */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>5 Branch Locations</span>
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Live & Active
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-stone-100">
              {BRANCH_OPTIONS.map((b, idx) => (
                <div key={idx} className="pt-2 first:pt-0">
                  <p className="font-bold text-stone-800">{b.name}</p>
                  <p className="text-stone-500 font-mono text-[11px] mt-0.5 flex items-center gap-2">
                    <span>📞 {b.phone}</span>
                    <span>•</span>
                    <span className="text-amber-700">{b.managerEmail}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Central Support Card */}
          <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-600" />
              <span>Head Office Support</span>
            </h4>
            <p className="text-stone-600">
              General / Admin Email: <strong className="font-mono text-stone-900">admin@swadghar.com</strong>
            </p>
            <p className="text-stone-600">
              Response Time: <strong>Within 2-4 Hours</strong>
            </p>
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">

          {submitted ? (
            /* SUCCESS CONFIRMATION BOX */
            <div className="text-center py-8 space-y-5 animate-scale-up">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Inquiry Submitted Successfully!
                </h3>
                <p className="text-xs text-stone-500">
                  Notification and email alerts have been dispatched.
                </p>
              </div>

              {submittedInfo?.category === 'restaurant' ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-left max-w-lg mx-auto space-y-2.5">
                  <p className="font-bold text-amber-950 text-sm">
                    ✅ Notifications Sent to Branch & Admin:
                  </p>
                  <ul className="space-y-1 text-stone-700 font-medium">
                    <li>• <strong>Target Branch:</strong> {submittedInfo.branch}</li>
                    <li>• <strong>Branch Manager Mail:</strong> <span className="font-mono text-amber-900">{submittedInfo.managerEmail}</span></li>
                    <li>• <strong>Super Admin Mail:</strong> <span className="font-mono text-amber-900">{submittedInfo.adminEmail}</span></li>
                  </ul>
                  <p className="text-[11px] text-stone-500 pt-1 border-t border-amber-200/60">
                    The {submittedInfo.city} branch management team will contact you shortly regarding your dining inquiry.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-stone-900 text-white text-xs text-left max-w-lg mx-auto space-y-2.5">
                  <p className="font-bold text-amber-400 text-sm">
                    ✅ Franchise Application Dispatched:
                  </p>
                  <ul className="space-y-1 text-stone-300">
                    <li>• <strong>Proposed City:</strong> {submittedInfo?.city}</li>
                    <li>• <strong>Recipient:</strong> Head Administration (<span className="font-mono text-amber-300">{submittedInfo?.adminEmail}</span>)</li>
                  </ul>
                  <p className="text-[11px] text-stone-400 pt-1 border-t border-stone-800">
                    Our Head of Franchise Expansions will review your business proposal and contact you within 24 hours.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: RESTAURANT INQUIRIES */}
              {activeTab === 'restaurant' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-serif font-bold text-stone-900">
                        Restaurant Dining & Event Inquiry
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Choose your preferred branch. Notifications will be sent directly to <strong>that Branch Manager & Admin</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleRestaurantSubmit} className="space-y-4">
                    {/* Branch Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        <span>Select Target Restaurant Branch *</span>
                      </label>
                      <select
                        required
                        value={restaurantForm.branchCity}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, branchCity: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold focus:outline-none focus:border-brand-500 focus:bg-white"
                      >
                        {BRANCH_OPTIONS.map((b) => (
                          <option key={b.city} value={b.city}>
                            {b.name} (Manager: {b.managerEmail})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Patel"
                          value={restaurantForm.name}
                          onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Phone Number (For Call / SMS) *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98250 12345"
                          value={restaurantForm.phone}
                          onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono focus:outline-none focus:border-brand-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Email Address (Optional)</label>
                        <input
                          type="email"
                          placeholder="name@gmail.com"
                          value={restaurantForm.email}
                          onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Inquiry Purpose</label>
                        <select
                          value={restaurantForm.eventType}
                          onChange={(e) => setRestaurantForm({ ...restaurantForm, eventType: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                        >
                          <option value="dining">Table & Family Dining Reservation</option>
                          <option value="banquet">Grand Banquet & Party Hall Booking</option>
                          <option value="catering">Outdoor Catering & Live Chula Counter</option>
                          <option value="corporate">Corporate Dining & Bulk Meals</option>
                          <option value="feedback">Customer Feedback & Compliment</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Detailed Message / Requirement *</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Please specify preferred date, number of guests, catering menu choices, or special dietary requirements..."
                        value={restaurantForm.message}
                        onChange={(e) => setRestaurantForm({ ...restaurantForm, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-98 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit & Dispatch to {restaurantForm.branchCity} Branch & Admin</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* SECTION 2: FRANCHISE INQUIRIES */}
              {activeTab === 'franchise' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2">

                      <h3 className="text-xl font-serif font-bold text-stone-900">
                        Franchise & Business Partnership Application
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Apply to launch a SwadGhar franchise in your city. All inquiries go directly to <strong>Super Admin</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleFranchiseSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Applicant / Company Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ketan Shah / Shreeji Hospitality LLP"
                          value={franchiseForm.name}
                          onChange={(e) => setFranchiseForm({ ...franchiseForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98250 99887"
                          value={franchiseForm.phone}
                          onChange={(e) => setFranchiseForm({ ...franchiseForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="name@business.com"
                          value={franchiseForm.email}
                          onChange={(e) => setFranchiseForm({ ...franchiseForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Proposed City & Location *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Gandhinagar / Bhavnagar / Pune / Jamnagar"
                          value={franchiseForm.branchCity}
                          onChange={(e) => setFranchiseForm({ ...franchiseForm, branchCity: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Planned Investment Budget</label>
                        <select
                          value={franchiseForm.investmentBudget}
                          onChange={(e) => setFranchiseForm({ ...franchiseForm, investmentBudget: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                        >
                          <option value="₹25 - 35 Lakhs (Express & Takeaway)">₹25 - 35 Lakhs (Express & Takeaway)</option>
                          <option value="₹35 - 50 Lakhs (Standard Dine-In)">₹35 - 50 Lakhs (Standard Dine-In)</option>
                          <option value="₹50 - 75 Lakhs (Premium Family Restaurant)">₹50 - 75 Lakhs (Premium Family Restaurant)</option>
                          <option value="₹1 Crore+ (Grand Royal Flagship / Multi-Unit)">₹1 Crore+ (Grand Royal Flagship / Multi-Unit)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Commercial Space Availability</label>
                        <select
                          value={franchiseForm.propertyStatus}
                          onChange={(e) => setFranchiseForm({ ...franchiseForm, propertyStatus: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                        >
                          <option value="Commercial Space Available on Rent/Own">Commercial Space Available (Owned/Rented)</option>
                          <option value="Identified 2-3 Prime Locations">Identified 2-3 Prime Locations</option>
                          <option value="Looking for Location with SwadGhar Team">Looking for Location with SwadGhar Team</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Business Proposal / Relevant Background *</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Tell us about your background, business experience, proposed market potential, or any specific questions for the SwadGhar expansions team..."
                        value={franchiseForm.message}
                        onChange={(e) => setFranchiseForm({ ...franchiseForm, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-amber-500 focus:bg-white resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-stone-900 to-amber-950 hover:from-stone-800 hover:to-amber-900 active:scale-98 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Briefcase className="w-4 h-4 text-amber-400" />
                          <span>Submit Franchise Application to Super Admin</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
};

export default Contact;

