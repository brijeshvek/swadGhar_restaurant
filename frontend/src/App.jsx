import React, { useEffect, useState } from 'react';
import { UtensilsCrossed, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import api from './services/api';

function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const data = await api.get('/health');
        setHealthStatus(data);
      } catch (err) {
        setHealthStatus({ success: false, message: 'Backend is booting or offline' });
      } finally {
        setLoading(false);
      }
    };
    checkApiHealth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 text-stone-100 relative overflow-hidden">
      {/* Decorative ambient backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl w-full text-center z-10 space-y-8 animate-fade-in">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>SwadGhar Architecture Ready (Phase 1)</span>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gradient tracking-tight">
            SwadGhar Restaurant
          </h1>
          <p className="text-stone-400 text-lg max-w-lg mx-auto">
            Authentic Taste, Handcrafted Delicacies & Modern Dining Experience.
          </p>
        </div>

        {/* Server Status Box */}
        <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-lg shadow-2xl text-left space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <span className="text-sm font-medium text-stone-400 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-brand-500" />
              System Connectivity Check
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-stone-800 text-stone-300">
              Vite + Express + Mongo
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              ) : healthStatus?.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-sm font-medium">
                {loading
                  ? 'Connecting to backend API (/api/health)...'
                  : healthStatus?.message || 'Backend API connected successfully'}
              </span>
            </div>

            {healthStatus?.timestamp && (
              <p className="text-xs text-stone-500 pl-8">
                Server Time: {new Date(healthStatus.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Next Step Info */}
        <div className="pt-2 text-xs text-stone-500 flex items-center justify-center gap-1.5">
          <span>Ready to proceed to Phase 2 (Database Models & Seed Data)</span>
          <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
        </div>
      </div>
    </div>
  );
}

export default App;
