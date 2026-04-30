import React, { useState, useEffect } from 'react';
import { User, Map as MapIcon, Globe, EyeOff, Coins, ShieldAlert, Navigation } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { toast, Toaster } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Ikona gracza
const userIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-6 h-6 bg-[#00f3ff] rounded-full border-2 border-white shadow-[0_0_15px_#00f3ff] animate-pulse"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 16);
  }, [center, map]);
  return null;
};

const App = () => {
  const [view, setView] = useState('menu'); 
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    Geolocation.requestPermissions().then(() => {
      Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
        if (pos) setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    });
  }, []);

  if (view === 'menu') {
    return (
      <div className="h-screen bg-[#050505] text-white font-mono flex flex-col items-center p-6">
        <Toaster richColors />
        <h1 className="text-3xl font-black text-[#00f3ff] mt-12 mb-2 italic">GEOVERSE</h1>
        <p className="text-[10px] tracking-widest text-gray-500 mb-12">CLASSIC EDITION</p>

        <div className="w-full aspect-square bg-[#111] border-2 border-dashed border-[#333] rounded-2xl flex flex-col items-center justify-center mb-8 relative">
          <Navigation className="text-[#00f3ff] animate-bounce" size={48} />
          <p className="text-[10px] mt-4">{userPos ? 'POŁĄCZONO Z SATELITĄ' : 'SZUKANIE SYGNAŁU...'}</p>
        </div>

        <button 
          onClick={() => setView('map')}
          className="w-full bg-[#00f3ff] text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.3)] active:scale-95 transition-all"
        >
          WEJDŹ DO MAPY
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative">
      <div className="absolute top-4 left-4 z-[1000]">
        <button onClick={() => setView('menu')} className="bg-black/80 text-white px-4 py-2 rounded-lg border border-white/20 backdrop-blur-md text-xs">
          POWRÓT
        </button>
      </div>

      {userPos ? (
        <MapContainer center={[userPos.lat, userPos.lng]} zoom={16} zoomControl={false} className="w-full h-full">
          <MapController center={[userPos.lat, userPos.lng]} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <Marker position={[userPos.lat, userPos.lng]} icon={userIcon} />
        </MapContainer>
      ) : (
        <div className="h-full w-full bg-black flex items-center justify-center text-[#00f3ff] text-xs">
          INICJALIZACJA GPS...
        </div>
      )}
    </div>
  );
};

export default App;
