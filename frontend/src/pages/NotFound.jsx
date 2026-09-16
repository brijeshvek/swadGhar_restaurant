import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
        <UtensilsCrossed className="w-10 h-10" />
      </div>
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
