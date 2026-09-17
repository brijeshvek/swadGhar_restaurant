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
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
          {/* Brand Info */}
          <div className="space-y-4">
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
              Preserving culinary traditions with hand-ground spices, clay tandoors, and heirloom Indian recipes cooked with pure passion and authentic hygiene.
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

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-serif font-semibold text-white tracking-wide border-l-2 border-brand-500 pl-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-brand-400 transition-colors">
                  Explore Full Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="hover:text-brand-400 transition-colors">
                  Reserve a Banquet / Table
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">
                  Our Culinary Heritage
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-brand-400 transition-colors">
                  Ambiance & Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/franchise" className="hover:text-amber-400 font-semibold text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>🏪 5 Restaurant Franchises</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-400 transition-colors">
                  Contact & Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h4 className="text-base font-serif font-semibold text-white tracking-wide border-l-2 border-brand-500 pl-3">
              Dining Hours
            </h4>
            <div className="space-y-2 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-300">Mon – Fri</p>
                  <p className="text-xs">11:00 AM – 11:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-300">Sat – Sun (Weekend Special)</p>
                  <p className="text-xs">10:30 AM – 11:30 PM</p>
                </div>
              </div>
              <p className="text-xs text-brand-400/90 pt-2 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Hygienic Kitchen & Fresh Ingredients
              </p>
            </div>
          </div>

          {/* Contact & Address */}
          <div className="space-y-4">
            <h4 className="text-base font-serif font-semibold text-white tracking-wide border-l-2 border-brand-500 pl-3">
              Visit SwadGhar
            </h4>
            <div className="space-y-2.5 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  104 Heritage Boulevard, Ring Road, Ahmedabad, Gujarat 380015
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <a href="tel:+919876543210" className="text-xs hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <a href="mailto:contact@swadghar.com" className="text-xs hover:text-white transition-colors">
                  contact@swadghar.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} SwadGhar Restaurant. All rights reserved.</p>
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
