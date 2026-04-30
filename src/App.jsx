import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { toast, Toaster } from 'sonner';
import { User, Map as MapIcon, Compass, Settings, Zap, Coins, LogIn, ChevronRight, PaintBucket } from 'lucide-react';

// TWÓJ KLUCZ API MAPBOX
mapboxgl.accessToken = 'Pk.eyJ1IjoiYWRvbmlzOTIiLCJhIjoiY21rNGkxZ3BtMDZoZTNlcjJ5dDhoaTdrbCJ9.Fk1LHVOLPIhapC6WZR4iBw';

const App = () => {
  // STANY APLIKACJI: 'LOGIN' -> 'AVATAR' -> 'MAP'
  const [currentScreen, setCurrentScreen] = useState('LOGIN');
  
  // Dane Użytkownika
  const [username, setUsername] = useState('');
  const [avatarColor, setAvatarColor] = useState('#00f3ff');
  const [balance, setBalance] = useState(0);

  // LOGOWANIE UI
  if (currentScreen === 'LOGIN') {
    return (
      <div className="h-screen w-screen bg-geo-bg flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <h1 className="text-4xl font-pixel text-transparent bg-clip-text bg-gradient-to-r from-geo-cyan to-geo-purple mb-2 drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">GEOVERSE</h1>
        <p className="text-[10px] text-gray-400 font-pixel mb-12 tracking-widest">ENTER THE NETWORK</p>
        
        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-geo-cyan font-pixel">ID UŻYTKOWNIKA</label>
            <input 
              type="text" 
              className="w-full bg-geo-panel pixel-border p-4 text-white focus:outline-none focus:border-geo-cyan transition-colors font-sans"
              placeholder="Wpisz swój nick..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-geo-cyan font-pixel">HASŁO KRYPTOGRAFICZNE</label>
            <input 
              type="password" 
              className="w-full bg-geo-panel pixel-border p-4 text-white focus:outline-none focus:border-geo-cyan transition-colors font-sans"
              placeholder="••••••••"
            />
          </div>
          <button 
            onClick={() => username ? setCurrentScreen('AVATAR') : toast.error("Wpisz ID Użytkownika!")}
            className="w-full bg-geo-cyan text-black font-pixel text-[12px] p-4 mt-6 hover:bg-white active:scale-95 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]"
          >
            ZALOGUJ <LogIn size={16} className="inline ml-2 mb-1" />
          </button>
          <p className="text-[8px] text-center text-gray-500 font-pixel mt-4 underline cursor-pointer">STWÓRZ NOWY WĘZEŁ (ZAREJESTRUJ)</p>
        </div>
        <Toaster richColors theme="dark" />
      </div>
    );
  }

  // KREATOR AWATARA UI
  if (currentScreen === 'AVATAR') {
    const colors = ['#00f3ff', '#b535f6', '#ff003c', '#00ff66', '#ffb700'];
    
    return (
      <div className="h-screen w-screen bg-geo-bg flex flex-col items-center p-6">
        <h2 className="text-xl font-pixel text-white mt-12 mb-8">KREATOR AWATARA</h2>
        
        {/* Podgląd postaci Pixel Art */}
        <div className="w-48 h-48 bg-geo-panel pixel-border mb-8 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
          <div className="w-20 h-24 border-4 border-black relative shadow-2xl" style={{ backgroundColor: avatarColor }}>
            {/* Oczy */}
            <div className="absolute top-4 left-3 w-4 h-4 bg-white border-2 border-black flex items-center justify-center">
              <div className="w-1 h-1 bg-black"></div>
            </div>
            <div className="absolute top-4 right-3 w-4 h-4 bg-white border-2 border-black flex items-center justify-center">
              <div className="w-1 h-1 bg-black"></div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 font-pixel mb-4"><PaintBucket size={12} className="inline mr-2"/>KOLOR BAZOWY</p>
        <div className="flex gap-4 mb-12">
          {colors.map(c => (
            <div 
              key={c} 
              onClick={() => setAvatarColor(c)}
              className={`w-10 h-10 cursor-pointer border-2 ${avatarColor === c ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-black'} transition-all`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <button 
          onClick={() => {
            setBalance(500); // Bonus na start
            setCurrentScreen('MAP');
            toast.success("Synchronizacja zakończona.");
          }}
          className="w-full max-w-sm bg-purple-600 text-white font-pixel text-[12px] p-4 active:scale-95 transition-transform flex justify-center items-center gap-2 border-b-4 border-purple-900"
        >
          WEJDŹ DO ŚWIATA <ChevronRight size={18} />
        </button>
        <Toaster richColors theme="dark" />
      </div>
    );
  }

  // GŁÓWNA APLIKACJA (MAPBOX)
  return <GeoMap username={username} avatarColor={avatarColor} balance={balance} />;
};

// --- KOMPONENT MAPY (Odizolowany, by Mapbox ładował się poprawnie) ---
const GeoMap = ({ username, avatarColor, balance }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const [activeMenu, setActiveMenu] = useState('EXPLORE');

  useEffect(() => {
    if (map.current) return; // Inicjalizuj tylko raz

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Ciemny styl bazowy
      center: [19.2150, 50.0413],
      zoom: 16,
      pitch: 60,
      bearing: -20
    });

    // Śledzenie GPS
    const watchId = Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
      if (pos) {
        const { latitude, longitude } = pos.coords;
        
        // Kamera podąża za graczem
        map.current.flyTo({ center: [longitude, latitude], speed: 0.5 });
        
        // Rysowanie awatara na mapie
        if (!userMarker.current) {
          const el = document.createElement('div');
          el.className = 'w-6 h-6 rounded-sm border-2 border-white shadow-xl rotate-45 animate-pulse';
          el.style.backgroundColor = avatarColor;
          el.style.boxShadow = `0 0 20px ${avatarColor}`;
          
          userMarker.current = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map.current);
        } else {
          userMarker.current.setLngLat([longitude, latitude]);
        }
      }
    });

    return () => Geolocation.clearWatch({ id: watchId });
  }, [avatarColor]);

  return (
    <div className="h-screen w-screen bg-geo-bg flex flex-col relative overflow-hidden select-none">
      {/* HUD GÓRNY */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="px-3 py-2 bg-geo-panel/90 border border-white/10 rounded-lg flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-sm border-2 border-black flex items-center justify-center" style={{ backgroundColor: avatarColor }}>
              <User className="text-black" size={18} />
            </div>
            <div>
              <h2 className="text-[10px] font-pixel text-white uppercase">{username}</h2>
              <div className="flex items-center gap-1 mt-1 text-yellow-400">
                <Coins size={10} />
                <span className="font-bold text-xs">{balance} GV</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KONTENER MAPY MAPBOX */}
      <div ref={mapContainer} className="flex-1 w-full" />

      {/* DOLNY PASEK NAWIGACJI (MENU APLIKACJI) */}
      <div className="absolute bottom-6 left-4 right-4 z-50">
        <nav className="bg-geo-panel/95 border-2 border-white/10 rounded-2xl p-2 flex justify-between items-center backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <MenuButton 
            icon={<MapIcon size={24} />} label="MAPA" 
            isActive={activeMenu === 'EXPLORE'} onClick={() => setActiveMenu('EXPLORE')} color={avatarColor} 
          />
          <MenuButton 
            icon={<Compass size={24} />} label="MISJE" 
            isActive={activeMenu === 'QUESTS'} onClick={() => setActiveMenu('QUESTS')} color={avatarColor} 
          />
          
          {/* Przycisk Akcji (Skanowanie) */}
          <button className="w-16 h-16 rounded-full border-4 border-geo-bg flex items-center justify-center text-black -translate-y-6 shadow-2xl active:scale-90 transition-transform" style={{ backgroundColor: avatarColor, boxShadow: `0 0 25px ${avatarColor}66` }}>
            <Zap size={28} />
          </button>

          <MenuButton 
            icon={<Coins size={24} />} label="GIEŁDA" 
            isActive={activeMenu === 'MARKET'} onClick={() => setActiveMenu('MARKET')} color={avatarColor} 
          />
          <MenuButton 
            icon={<Settings size={24} />} label="OPCJE" 
            isActive={activeMenu === 'SETTINGS'} onClick={() => setActiveMenu('SETTINGS')} color={avatarColor} 
          />
        </nav>
      </div>

      {/* Nakładka efektów wizualnych */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/80"></div>
    </div>
  );
};

// Pomocniczy komponent przycisku menu
const MenuButton = ({ icon, label, isActive, onClick, color }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
    <div style={{ color: isActive ? color : '' }}>{icon}</div>
    <span className="text-[8px] font-pixel mt-1 opacity-80">{label}</span>
  </button>
);

export default App;
