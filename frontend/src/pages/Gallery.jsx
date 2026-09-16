import React, { useState } from 'react';

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const galleryItems = [
    {
      id: 1,
      title: 'Grand Royal Dining Hall',
      category: 'ambiance',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: 'Paneer Tikka Angara Sizzler',
      category: 'food',
      image: 'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      title: 'Royal Gujarati Heritage Thali',
      category: 'food',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      title: 'Clay Tandoor Master Craft',
      category: 'kitchen',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 5,
      title: 'Dum Biryani Earthen Pot',
      category: 'food',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 6,
      title: 'Private Banquet & Terrace Suite',
      category: 'ambiance',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 7,
      title: 'Artisanal Gulab Jamun & Rabdi',
      category: 'food',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 8,
      title: 'Kesariya Mango Lassi Presentation',
      category: 'beverages',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 9,
      title: 'Candlelight Evening Dining',
      category: 'ambiance',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const filteredItems =
    activeFilter === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
          Visual Memories
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          SwadGhar Photo Gallery
        </h1>
        <p className="text-stone-500 text-sm sm:text-base">
          A glimpse into our golden dining ambience, artisan kitchen craft, and signature culinary creations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2">
        {[
          { id: 'all', label: 'All Photos' },
          { id: 'food', label: 'Dishes & Food' },
          { id: 'ambiance', label: 'Ambiance & Seating' },
          { id: 'kitchen', label: 'Kitchen Craft' },
          { id: 'beverages', label: 'Beverages' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeFilter === tab.id
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-stone-900 shadow-md hover:shadow-2xl transition-all duration-500"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <span className="text-white font-serif font-bold text-lg leading-tight">
                {item.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
