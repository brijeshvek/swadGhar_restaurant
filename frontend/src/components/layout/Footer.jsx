import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Heart,
  ShieldCheck,
  Store,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const FRANCHISE_CITIES = [
  { city: 'Ahmedabad', name: 'Ahmedabad Flagship', location: 'SG Highway', phone: '+91 98250 11234' },
  { city: 'Surat', name: 'Surat Diamond City', location: 'Ghod Dod Road', phone: '+91 98250 22345' },
  { city: 'Vadodara', name: 'Vadodara Royal', location: 'Alkapuri', phone: '+91 98250 33456' },
  { city: 'Rajkot', name: 'Rajkot Darbar', location: 'Kalawad Road', phone: '+91 98250 44567' },
  { city: 'Mumbai', name: 'Mumbai Express', location: 'Borivali West', phone: '+91 98250 55678' },
];

const Footer = () => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-stone-800/80">
          
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="SwadGhar Logo"
                className="w-12 h-12 rounded-full object-contain bg-white p-0.5 shadow-glow border border-amber-500/40"
              />
              <div>
                <span className="text-2xl font-serif font-bold text-gradient tracking-tight block leading-none">
                  SwadGhar
                </span>
                <span className="text-[10px] tracking-widest text-amber-400 font-semibold uppercase block mt-0.5">
                  Good Food ❤️ Happy People
                </span>
              </div>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Preserving authentic Indian culinary traditions with hand-ground spices, pure ghee cooking, and royal hospitality across Gujarat & Mumbai.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-brand-400 hover:border-brand-500/50 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-brand-400 hover:border-brand-500/50 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-brand-400 hover:border-brand-500/50 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-serif font-semibold text-white tracking-wide border-l-2 border-brand-500 pl-3">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-brand-400 transition-colors">
                  Explore Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="hover:text-brand-400 transition-colors">
                  Table Booking
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-brand-400 transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/franchise" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>🏪 Franchises</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Franchise Cities Section (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-base font-serif font-semibold text-white tracking-wide border-l-2 border-amber-500 pl-3 flex items-center justify-between">
              <span>Franchise Cities</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                5 Locations
              </span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FRANCHISE_CITIES.map((item, idx) => (
                <li key={idx} className="group">
                  <Link
                    to="/franchise"
                    className="flex items-start justify-between text-stone-300 hover:text-amber-400 transition-colors p-1.5 -mx-1.5 rounded-lg hover:bg-stone-900/60"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-bold text-stone-200 group-hover:text-amber-300">{item.city}</p>
                        <p className="text-[11px] text-stone-500">{item.location}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-base font-serif font-semibold text-white tracking-wide border-l-2 border-brand-500 pl-3">
              Head Office
            </h4>
            <div className="space-y-2.5 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  104 Heritage Boulevard, SG Highway, Ahmedabad, Gujarat 380015
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <a href="tel:+919876543210" className="text-xs hover:text-white transition-colors font-mono">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <a href="mailto:admin@swadghar.com" className="text-xs hover:text-white transition-colors font-mono text-amber-400">
                  admin@swadghar.com
                </a>
              </div>
              <div className="flex items-start gap-2.5 pt-1 text-xs">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-300">Open 7 Days a Week</p>
                  <p className="text-[11px] text-stone-500">11:00 AM – 11:30 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive Franchise Cities Quick Strip */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Our Franchise Network
              </span>
              <p className="text-xs text-stone-400">
                Taste authentic SwadGhar flavors in 5 major cities
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {FRANCHISE_CITIES.map((c, idx) => (
              <Link
                key={idx}
                to="/franchise"
                className="px-3 py-1.5 rounded-xl bg-stone-950/80 hover:bg-amber-500/10 border border-stone-800 hover:border-amber-500/40 text-xs font-medium text-stone-300 hover:text-amber-300 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{c.city}</span>
              </Link>
            ))}
            <Link
              to="/contact"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md flex items-center gap-1 ml-1"
            >
              <span>Apply Franchise</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} SwadGhar Restaurant & Franchises. All rights reserved.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Good Food ❤️ Happy People</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

