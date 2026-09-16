import React from 'react';
import { ChefHat, ShieldCheck, Award, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in">
      {/* Hero Intro */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
          Our Heritage & Passion
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 leading-tight">
          Crafting Unforgettable Culinary Memories Since 1999
        </h1>
        <p className="text-stone-600 text-base leading-relaxed">
          SwadGhar was born out of an uncompromised desire to bring royal ancestral Indian recipes, pure cold-pressed oils, and farm-fresh spices back to the center of dining tables.
        </p>
      </div>

      {/* Story with Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-stone-700 text-sm sm:text-base leading-relaxed">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            The Philosophy of Pure "Swad"
          </h2>
          <p>
            In Indian culinary tradition, <em>"Swad"</em> translates not just to flavor on the tongue, but to wholesome nourishment for the soul. At SwadGhar, we refuse pre-packaged pastes, artificial coloring, or shortcuts.
          </p>
          <p>
            From our golden, hand-patted Gujarati Bajra Rotlas to slow-cooked charcoal Dal Makhani, every recipe is crafted using copper brass utensils and clay ovens passed down through culinary maestros.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-2xl font-bold text-amber-700 font-serif block">100%</span>
              <span className="text-xs text-amber-900 font-medium">Stone-Ground Spices</span>
            </div>
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200">
              <span className="text-2xl font-bold text-brand-700 font-serif block">Pure</span>
              <span className="text-xs text-brand-900 font-medium">Gir Cow A2 Desi Ghee</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80"
            alt="Chefs in kitchen"
            className="rounded-3xl shadow-lg object-cover h-80 w-full"
          />
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
            alt="Dining hall"
            className="rounded-3xl shadow-lg object-cover h-80 w-full mt-8"
          />
        </div>
      </div>

      {/* Core Values */}
      <div className="pt-8 space-y-8">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-center text-stone-900">
          Our Four Culinary Pillars
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900">Authentic Sourcing</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              We source Kashmiri Kesar, Saurashtra sesame, and Punjabi dairy directly from certified local farmers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900">Heritage Craftsmanship</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Our executive chefs carry over two decades of fine dining and ancestral royal banquet expertise.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900">Gold Standard Hygiene</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Daily sanitization, temperature logs, and automated stainless steel prep stations ensure total safety.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900">Warm Hospitality</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              We welcome every guest as divine family, upholding India’s ancient <em>"Atithi Devo Bhava"</em> spirit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
