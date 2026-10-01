import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bike,
  Store,
  Home,
  Navigation,
  Phone,
  MessageSquare,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Locate,
  Layers,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Clock,
  Zap,
} from 'lucide-react';

// City Geo Coordinates Lookup for accurate mapping
const CITY_COORDINATES = {
  ahmedabad: { lat: 23.0338, lng: 72.5850, outletOffset: [0.015, -0.012], destOffset: [-0.020, 0.025] },
  surat: { lat: 21.1702, lng: 72.8311, outletOffset: [0.012, 0.018], destOffset: [-0.018, -0.015] },
  vadodara: { lat: 22.3072, lng: 73.1812, outletOffset: [0.014, -0.010], destOffset: [-0.016, 0.018] },
  rajkot: { lat: 22.3039, lng: 70.8022, outletOffset: [0.010, 0.012], destOffset: [-0.014, -0.012] },
  bhavnagar: { lat: 21.7645, lng: 72.1519, outletOffset: [0.008, -0.009], destOffset: [-0.012, 0.011] },
  gandhinagar: { lat: 23.2156, lng: 72.6369, outletOffset: [0.011, 0.015], destOffset: [-0.015, -0.018] },
  mumbai: { lat: 19.0760, lng: 72.8777, outletOffset: [0.022, -0.018], destOffset: [-0.025, 0.020] },
};

// Generate realistic intermediate curve path waypoints between Restaurant and Destination
const generateRoutePoints = (start, end, numPoints = 14) => {
  const points = [];
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  // Midpoint with natural roadway curvature
  const midLat = (lat1 + lat2) / 2 + (lng2 - lng1) * 0.15;
  const midLng = (lng1 + lng2) / 2 - (lat2 - lat1) * 0.15;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic Bezier curve for natural road trajectory
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * midLat + t * t * lat2;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * midLng + t * t * lng2;
    points.push([lat, lng]);
  }
  return points;
};

// Calculate interpolated point along path given progress (0 to 1)
const interpolatePosition = (routePoints, progress) => {
  if (!routePoints || routePoints.length === 0) return [23.0338, 72.5850];
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalSegments = routePoints.length - 1;
  const rawIndex = clampedProgress * totalSegments;
  const index = Math.floor(rawIndex);
  const remainder = rawIndex - index;

  if (index >= totalSegments) return routePoints[totalSegments];

  const p1 = routePoints[index];
  const p2 = routePoints[index + 1];

  return [
    p1[0] + (p2[0] - p1[0]) * remainder,
    p1[1] + (p2[1] - p1[1]) * remainder,
  ];
};

const LiveTrackingMap = ({ order }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const completedPolylineRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTheme, setMapTheme] = useState('osm'); // 100% Free OpenStreetMap tiles (No API Key Required)
  const [simulatedProgress, setSimulatedProgress] = useState(0.15);

  // Delivery Partner Mock Info (Swiggy / Zomato experience)
  const deliveryPartner = useMemo(() => {
    return {
      name: 'Ramesh Vaghela',
      rating: '4.9',
      totalTrips: '2,480+ deliveries',
      phone: '+91 98251 88472',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      vehicle: 'Electric EV Scooter (GJ-01-ET-4891)',
      safetyBadge: '100% Vaccinated • Sanitized Box',
      otp: order?.orderNumber ? order.orderNumber.replace(/\D/g, '').slice(-4) || '5829' : '5829',
    };
  }, [order?.orderNumber]);

  // Determine city coordinates
  const cityKey = (
    order?.franchiseDetails?.city ||
    order?.deliveryAddress?.city ||
    'ahmedabad'
  ).toLowerCase().trim();

  const cityConfig = CITY_COORDINATES[cityKey] || CITY_COORDINATES.ahmedabad;

  const outletLatLng = useMemo(() => [
    cityConfig.lat + cityConfig.outletOffset[0],
    cityConfig.lng + cityConfig.outletOffset[1],
  ], [cityConfig]);

  const destLatLng = useMemo(() => [
    cityConfig.lat + cityConfig.destOffset[0],
    cityConfig.lng + cityConfig.destOffset[1],
  ], [cityConfig]);

  // Generate full road route waypoints
  const fullRoutePoints = useMemo(() => {
    return generateRoutePoints(outletLatLng, destLatLng, 20);
  }, [outletLatLng, destLatLng]);

  // Determine base target progress based on live order status
  const targetProgress = useMemo(() => {
    if (!order) return 0.1;
    switch (order.orderStatus) {
      case 'pending':
        return 0.05;
      case 'confirmed':
        return 0.15;
      case 'preparing':
        return 0.35;
      case 'ready':
      case 'ready_for_pickup':
        return 0.55;
      case 'out_for_delivery':
        return 0.85;
      case 'delivered':
      case 'completed':
        return 1.0;
      default:
        return 0.2;
    }
  }, [order?.orderStatus]);

  // Smooth progress animation / rider live pulse
  useEffect(() => {
    setSimulatedProgress(targetProgress);

    // If order is out for delivery, simulate live transit progression
    if (order?.orderStatus === 'out_for_delivery') {
      const interval = setInterval(() => {
        setSimulatedProgress((prev) => {
          const next = prev + 0.02;
          return next > 0.94 ? 0.78 : next;
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [targetProgress, order?.orderStatus]);

  // Tile Providers (100% Free - NO API KEY REQUIRED)
  const getTileConfig = (theme) => {
    switch (theme) {
      case 'hot':
        return {
          url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19,
        };
      case 'osm':
      default:
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19,
        };
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const tileConf = getTileConfig(mapTheme);

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [cityConfig.lat, cityConfig.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      tileLayerRef.current = L.tileLayer(tileConf.url, {
        maxZoom: tileConf.maxZoom,
        subdomains: tileConf.subdomains,
      }).addTo(map);

      // 1. Restaurant Marker (SwadGhar Outlet Kitchen)
      const restaurantIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer select-none">
            <div class="px-2.5 py-1 bg-amber-600 text-white font-bold text-[10px] rounded-full shadow-lg border border-amber-300 whitespace-nowrap mb-1 animate-pulse">
              🏬 ${order?.franchiseDetails?.name || 'SwadGhar Kitchen'}
            </div>
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-amber-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m-18 0a2 2 0 012-2h14a2 2 0 012 2v13H3V7z" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [120, 70],
        iconAnchor: [60, 65],
      });

      L.marker(outletLatLng, { icon: restaurantIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <strong style="color: #d97706; font-size: 13px;">🏬 ${order?.franchiseDetails?.name || 'SwadGhar Restaurant'}</strong>
            <p style="font-size: 11px; margin: 4px 0 0; color: #555;">${order?.franchiseDetails?.address || 'Outlet Kitchen'}</p>
          </div>
        `);

      // 2. Destination / Customer Home Marker
      const homeIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer select-none">
            <div class="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-full shadow-lg border border-emerald-300 whitespace-nowrap mb-1">
              🏠 Delivery Destination
            </div>
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-emerald-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [120, 70],
        iconAnchor: [60, 65],
      });

      L.marker(destLatLng, { icon: homeIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <strong style="color: #059669; font-size: 13px;">🏠 ${order?.deliveryAddress?.fullName || 'Your Address'}</strong>
            <p style="font-size: 11px; margin: 4px 0 0; color: #555;">${order?.deliveryAddress?.area || order?.deliveryAddress?.street || 'Delivery Location'}</p>
          </div>
        `);

      // 3. Planned Route Polyline (Dashed Road Track)
      routePolylineRef.current = L.polyline(fullRoutePoints, {
        color: '#64748b',
        weight: 5,
        opacity: 0.6,
        dashArray: '6, 8',
      }).addTo(map);

      // 4. Covered Route Polyline (Vibrant Amber)
      completedPolylineRef.current = L.polyline([], {
        color: '#ea580c',
        weight: 6,
        opacity: 0.95,
      }).addTo(map);

      // 5. Dynamic Live Delivery Rider Marker
      const currentRiderPos = interpolatePosition(fullRoutePoints, simulatedProgress);
      const riderIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex flex-col items-center select-none">
            <!-- Pulsing Radar Circle -->
            <div class="absolute -top-1 w-14 h-14 bg-amber-500/30 rounded-full animate-ping pointer-events-none"></div>
            
            <!-- Rider Label Capsule -->
            <div class="px-2 py-0.5 bg-stone-950 text-amber-300 font-bold text-[9px] rounded-md shadow-md border border-stone-800 whitespace-nowrap mb-1">
              🛵 ${order?.orderStatus === 'out_for_delivery' ? 'Valet On the Way' : 'Valet Assigned'}
            </div>

            <!-- Bike Icon Badge -->
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950 flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-amber-500/40">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-stone-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5V14l-3-3 4-3 2 3h3" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [100, 70],
        iconAnchor: [50, 65],
      });

      riderMarkerRef.current = L.marker(currentRiderPos, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);

      // Fit map bounds
      const bounds = L.latLngBounds([outletLatLng, destLatLng]);
      map.fitBounds(bounds, { padding: [70, 70] });

      mapInstanceRef.current = map;
    } else {
      // If map exists, update tile layer
      if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(tileConf.url);
      }
    }
  }, [mapTheme, cityConfig, outletLatLng, destLatLng, fullRoutePoints]);

  // Update Rider Marker position dynamically whenever simulatedProgress changes
  useEffect(() => {
    if (!mapInstanceRef.current || !riderMarkerRef.current) return;

    const currentRiderPos = interpolatePosition(fullRoutePoints, simulatedProgress);
    riderMarkerRef.current.setLatLng(currentRiderPos);

    // Update the completed route portion
    const totalSegments = fullRoutePoints.length - 1;
    const activeIndex = Math.min(Math.floor(simulatedProgress * totalSegments) + 1, fullRoutePoints.length);
    const coveredPoints = fullRoutePoints.slice(0, activeIndex);
    coveredPoints.push(currentRiderPos);

    if (completedPolylineRef.current) {
      completedPolylineRef.current.setLatLngs(coveredPoints);
    }
  }, [simulatedProgress, fullRoutePoints]);

  // Handle Recenter to Full Route
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([outletLatLng, destLatLng]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
  };

  const outletAddress = order?.franchiseDetails?.address || 'Flagship Kitchen Outlet';
  const customerAddress = order?.deliveryAddress
    ? [order.deliveryAddress.houseNo, order.deliveryAddress.street, order.deliveryAddress.area, order.deliveryAddress.city].filter(Boolean).join(', ')
    : 'Customer Address';

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(outletAddress)}&destination=${encodeURIComponent(customerAddress)}`;

  return (
    <div className={`relative bg-stone-100 rounded-3xl overflow-hidden border border-stone-200/90 shadow-xl transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[520px] sm:h-[580px] w-full'}`}>
      
      {/* 1. Leaflet Interactive Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 2. Top Floating Navigation & Telemetry Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Live ETA Floating Capsule */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white border border-stone-700/70 shadow-2xl">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-400 font-sans">
                {order?.orderStatus === 'out_for_delivery'
                  ? '⚡ Arriving in 15 – 22 mins'
                  : order?.orderStatus === 'preparing'
                  ? '👨‍🍳 Cooking in Kitchen'
                  : order?.orderStatus === 'delivered'
                  ? '🎉 Delivered Successfully'
                  : '🕒 Order Confirmed'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Live GPS
              </span>
            </div>
            <p className="text-[10px] text-stone-400">
              Live Rider Tracking • Speed ~28 km/h
            </p>
          </div>
        </div>

        {/* Map Control Buttons (Recenter, Fullscreen, Google Maps) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Layer switcher */}
          <button
            type="button"
            onClick={() => setMapTheme(mapTheme === 'osm' ? 'hot' : 'osm')}
            title="Toggle Map Style"
            className="w-10 h-10 rounded-xl bg-white hover:bg-stone-50 text-stone-800 flex items-center justify-center shadow-lg border border-stone-200 transition-transform active:scale-95 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-stone-700" />
          </button>

          {/* Recenter button */}
          <button
            type="button"
            onClick={handleRecenter}
            title="Recenter Map View"
            className="w-10 h-10 rounded-xl bg-white hover:bg-stone-50 text-stone-800 flex items-center justify-center shadow-lg border border-stone-200 transition-transform active:scale-95 cursor-pointer"
          >
            <Locate className="w-4 h-4 text-brand-600" />
          </button>

          {/* External Google Maps Button */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps App"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition-transform active:scale-95"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expanded Map View'}
            className="w-10 h-10 rounded-xl bg-stone-900/90 hover:bg-stone-900 text-white flex items-center justify-center shadow-lg border border-stone-700 transition-transform active:scale-95 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Bottom Floating Delivery Partner Card */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xl max-w-2xl mx-auto space-y-3.5">
          
          {/* Top Row: Valet profile, rating, OTP code */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={deliveryPartner.avatar}
                  alt={deliveryPartner.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-500 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-tight">
                    {deliveryPartner.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                    ★ {deliveryPartner.rating}
                  </span>
                </div>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{deliveryPartner.safetyBadge}</span>
                </p>
              </div>
            </div>

            {/* Delivery OTP Badge */}
            <div className="text-right p-2 sm:px-3 sm:py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">
                Delivery OTP
              </span>
              <span className="font-mono text-base sm:text-lg font-black tracking-widest text-brand-800">
                {deliveryPartner.otp}
              </span>
            </div>
          </div>

          {/* Middle Row: Vehicle & Quick Call / Msg Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
            <div className="text-stone-600 flex items-center gap-2">
              <Bike className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-[11px] sm:text-xs">{deliveryPartner.vehicle}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${deliveryPartner.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Valet</span>
              </a>

              <a
                href={`https://wa.me/${deliveryPartner.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all border border-stone-200"
              >
                <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                <span>Message</span>
              </a>
            </div>
          </div>

          {/* Bottom Route Progress Step Indicators */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-stone-500 pt-1">
            <div className={`p-1.5 rounded-lg border ${simulatedProgress >= 0.1 ? 'bg-amber-500/10 border-amber-400 text-amber-900 font-extrabold' : 'bg-stone-50 border-stone-200'}`}>
              1. Kitchen Prep
            </div>
            <div className={`p-1.5 rounded-lg border ${simulatedProgress >= 0.5 ? 'bg-amber-500/10 border-amber-400 text-amber-900 font-extrabold' : 'bg-stone-50 border-stone-200'}`}>
              2. Out For Delivery
            </div>
            <div className={`p-1.5 rounded-lg border ${simulatedProgress >= 0.95 ? 'bg-emerald-500/10 border-emerald-400 text-emerald-900 font-extrabold' : 'bg-stone-50 border-stone-200'}`}>
              3. Doorstep Arrival
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LiveTrackingMap;
