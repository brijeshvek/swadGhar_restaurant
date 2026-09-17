import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, MessageSquareQuote, Sparkles } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Contact = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    eventType: 'general',
    message: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
      showError('Please fill out all required inquiry fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/inquiries', formData);
      setSubmitted(true);
      setSubmittedInquiry(res.data.inquiry || res.data);
      showSuccess('Inquiry Submitted! Our restaurant manager will reach out shortly.');
    } catch (err) {
      console.error('Inquiry submission error:', err);
      showError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmittedInquiry(null);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      subject: 'General Inquiry',
      eventType: 'general',
      message: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          Restaurant Inquiry & Contact Desk
        </h1>
        <p className="text-stone-500 text-sm sm:text-base">
          Have an inquiry for banquets, live catering, table celebrations, or private dining? Our team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info & Map Box */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <Phone className="w-5 h-5 text-brand-600" />
              <h4 className="font-bold text-sm text-stone-900">Direct Phone & WhatsApp</h4>
              <p className="text-xs text-stone-700 font-medium">+91 98765 43210</p>
              <p className="text-xs text-stone-400">Available Daily: 10:00 AM – 11:30 PM</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <Mail className="w-5 h-5 text-brand-600" />
              <h4 className="font-bold text-sm text-stone-900">Email Support</h4>
              <p className="text-xs text-stone-700 font-medium">contact@swadghar.com</p>
              <p className="text-xs text-stone-400">Response within 2-4 business hours</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2 sm:col-span-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <h4 className="font-bold text-sm text-stone-900">Dining Location & Headquarters</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                104 Heritage Boulevard, Near SG Highway & Bodakdev, Ahmedabad, Gujarat - 380015
              </p>
            </div>
          </div>

          {/* Map Preview Container */}
          <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-md h-64 bg-stone-200 relative flex items-center justify-center text-center p-6">
            <iframe
              title="SwadGhar Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117498.41113063554!2d72.49326462719728!3d23.030040713062637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>

        {/* Message Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-md space-y-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4 animate-scale-up">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                Inquiry Received!
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Thank you, <span className="font-bold text-stone-900">{formData.name}</span>. Your inquiry regarding <span className="font-bold text-brand-600">"{formData.subject}"</span> has been logged directly in our Restaurant Owner & Kitchen Management dashboard.
              </p>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 max-w-sm mx-auto space-y-1">
                <p>We will contact you via phone (<span className="font-mono text-stone-800">{formData.phone}</span>) or email.</p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-md"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Send Restaurant Inquiry
                </h3>
                <p className="text-xs text-stone-500">
                  Fill in your details below and our management team will assist you promptly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Phone Number (For Callback/SMS) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Subject / Occasion *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Birthday Party for 25 Guests"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Inquiry Category</label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                    >
                      <option value="general">General Dining Inquiry</option>
                      <option value="banquet">Banquet & Hall Booking</option>
                      <option value="catering">Outdoor Catering Service</option>
                      <option value="birthday">Birthday & Private Celebration</option>
                      <option value="franchise">Franchise & Business Partnership</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Detailed Message / Requirements *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details such as preferred dates, number of guests, catering menu preferences, or special dietary requirements..."
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry to Management</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
