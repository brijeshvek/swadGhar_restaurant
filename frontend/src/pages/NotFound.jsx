import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <Link to="/" className="inline-block hover:scale-105 transition-transform">
        <img
          src="/logo.png"
          alt="SwadGhar Logo"
          className="w-24 h-24 rounded-full object-contain bg-white p-1.5 mx-auto shadow-glow border border-amber-500/30"
        />
      </Link>
      <div className="space-y-2 max-w-md">
        <h1 className="text-5xl sm:text-6xl font-serif font-bold text-stone-900">
          404
        </h1>
        <h2 className="text-xl font-bold text-stone-800">
          Recipe Not Found
        </h2>
        <p className="text-stone-500 text-sm">
          Oops! The page or delicacy you are looking for has moved or does not exist in our kitchen.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to SwadGhar Home</span>
      </Link>
    </div>
  );
};

export default NotFound;
