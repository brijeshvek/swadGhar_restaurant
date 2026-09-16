import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Contact = () => {
  const { showSuccess } = useNotification();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showSuccess('Thank you! Your message has been dispatched to our restaurant manager.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
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
          Contact & Dining Locations
        </h1>
        <p className="text-stone-500 text-sm sm:text-base">
          Have an inquiry for banquets, catering, feedback, or table booking? We are delighted to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info & Map Box */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <Phone className="w-5 h-5 text-brand-600" />
              <h4 className="font-bold text-sm text-stone-900">Direct Phone</h4>
              <p className="text-xs text-stone-500">+91 98765 43210</p>
              <p className="text-xs text-stone-400">Available 10 AM – 11 PM</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <Mail className="w-5 h-5 text-brand-600" />
              <h4 className="font-bold text-sm text-stone-900">Email Support</h4>
              <p className="text-xs text-stone-500">contact@swadghar.com</p>
              <p className="text-xs text-stone-400">Quick response within 2 hrs</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2 sm:col-span-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <h4 className="font-bold text-sm text-stone-900">Restaurant Location</h4>
              <p className="text-xs text-stone-600">
                104 Heritage Boulevard, Ring Road, Ahmedabad, Gujarat 380015
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
          <h3 className="text-2xl font-serif font-bold text-stone-900">
            Send Us a Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Your Full Name</label>
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
                <label className="text-xs font-bold text-stone-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. name@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Banquet & Party Booking">Banquet & Party Booking</option>
                <option value="Catering Service">Outdoor Catering Service</option>
                <option value="Feedback & Compliment">Feedback & Compliment</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Message</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us how we can serve you best..."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
