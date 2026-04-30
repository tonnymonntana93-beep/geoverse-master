import React, { useState, useEffect } from 'react';
import { User, Map as MapIcon, Globe, EyeOff, Coins, ShieldAlert, Navigation } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { toast, Toaster } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const userIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-6 h-6 bg-[#00f3ff] rounded-full border-2 border-white shadow-[0_0_15px_#00f3ff] animate-pulse flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const getNodeIcon = (type) => L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-6 h-6 border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] ${type === 'HANDEL' ? 'bg-orange-500' : 'bg-[#b535f6]'} hover:scale-110 transition-transform"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 16, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
};

const App = () => {
  const [view, setView] = useState('menu'); 
  const [ghostMode, setGhostMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState('TOWARZYSKI');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [userPos, setUserPos] = useState(null);
  const [mapNodes, setMapNodes] = useState([]);

  useEffect(() => {
    const startGPS = async () => {
      try {
        await Geolocation.requestPermissions();
        Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
          if (pos) {
            const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserPos(newPos);
            
            setMapNodes(prev => prev.length === 0 ? [
              { id: 1, name: 'Lokalny Partner', status: 'Zniżka 10%', type: 'HANDEL', lat: newPos.lat + 0.002, lng: newPos.lng + 0.001, rep: 5 },
              { id: 2, name: 'Odkrywca_99', status: 'Szukam gildii', type: 'TOWARZYSKI', lat: newPos.lat - 0.001, lng: newPos.lng - 0.002, rep: 3 },
              { id: 3, name: 'Złoty Quest', status: 'Nagroda 500 GV', type: 'USLUGI', lat: newPos.lat + 0.001, lng: newPos.lng + 0.003, rep: 4 },
            ] : prev);
          }
        });
      } catch (e) {
        toast.error("Błąd GPS. Upewnij się, że lokalizacja jest włączona.");
      }
    };
    startGPS();
  }, []);

  const toggleGhostMode = () => {
    setGhostMode(!ghostMode);
    toast(ghostMode ? "Jesteś widoczny na mapie" : "Tryb Ducha: Ukryto Twoją pozycję", {
      style: { fontFamily: '"Press Start 2P"', fontSize: '10px' }
    });
  };

  if (view === 'menu') {
    return (
      <div className="h-screen bg-[#050505] text-white font-pixel flex flex-col items-center p-4 overflow-y-auto">
        <Toaster richColors />
        
        <div className="mt-8 mb-6 text-center">
          <h1 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#b535f6] mb-2 drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">GEOVERSE</h1>
          <p className="text-[10px] tracking-widest text-gray-400">TWOJE MIASTO, TWOJA GRA.</p>
        </div>

        <div className="w-full h-64 bg-[#111] pixel-border rounded-lg relative overflow-hidden mb-6 group flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          
          {userPos ? (
            <div className="z-10 text-center">
              <Navigation className="text-[#00f3ff] animate-pulse mx-auto mb-2" size={40} />
              <p className="text-[10px] text-[#00f3ff] mt-2">GPS AKTYWNY</p>
              <p className="text-[8px] text-white mt-1">{userPos.lat.toFixed(4)}, {userPos.lng.toFixed(4)}</p>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 z-10 animate-pulse">ŁĄCZENIE Z SATELITĄ...</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <button onClick={() => setView('map')} className="bg-purple-900 text-[10px] py-4 pixel-border active:scale-95 transition-transform text-[#00f3ff]">GRAJ!</button>
          <button className="bg-purple-900 text-[10px] py-4 pixel-border active:scale-95 transition-transform">KONTO</button>
          <button className="bg-purple-900 text-[10px] py-4 pixel-border active:scale-95 transition-transform">EKWIPUNEK</button>
          <button className="bg-purple-900 text-[10px] py-4 pixel-border active:scale-95 transition-transform">USTAWIENIA</button>
        </div>

        <div className="w-full">
          <p className="text-[10px] mb-3 text-[#00f3ff]">FILTRY</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {['HANDEL', 'TOWARZYSKI', 'USLUGI', 'BAMICI'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} 
                className={`text-[8px] py-3 pixel-border flex items-center justify-center gap-2 ${activeFilter === f ? 'bg-[#00f3ff] text-black' : 'bg-[#111] text-gray-400'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-auto">
            <button onClick={toggleGhostMode} className={`text-[8px] py-3 px-4 pixel-border flex items-center gap-2 ${ghostMode ? 'bg-red-900' : 'bg-gray-800'}`}>
              <EyeOff size={12} /> TRYB DUCHA
            </button>
            <div className="flex flex-col items-center cursor-pointer" onClick={() => setView('map')}>
              <Globe size={24} className="text-gray-400 mb-1" />
              <span className="text-[8px] text-gray-400">MAPA ŚWIATA</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1a1025] text-white font-pixel flex flex-col relative overflow-hidden">
      <Toaster richColors />
      
      <div className="absolute top-0 left-0 right-0 p-4 bg-[#111]/90 backdrop-blur-md flex justify-between items-center z-[1000] border-b-4 border-black">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('menu')}>
          <div className="bg-[#00f3ff] text-black p-1 pixel-border text-[8px]">MENU</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] flex items-center gap-1 text-yellow-400"><Coins size={12}/> 1010</span>
          <span className="text-[10px] bg-[#b535f6] px-2 py-1 border-2 border-black">Lvl 80</span>
        </div>
      </div>

      <div className="flex-1 w-full h-full z-[0]">
        {userPos ? (
          <MapContainer 
            center={[userPos.lat, userPos.lng]} 
            zoom={16} 
            zoomControl={false}
            className="w-full h-full"
            onClick={() => setSelectedUser(null)}
          >
            <MapController center={[userPos.lat, userPos.lng]} />
            
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CartoDB'
            />

            {!ghostMode && (
              <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                <Popup className="font-pixel text-[10px]">To Twoja pozycja!</Popup>
              </Marker>
            )}

            {mapNodes.filter(n => n.type === activeFilter || activeFilter === 'TOWARZYSKI').map(node => (
              <Marker 
                key={node.id} 
                position={[node.lat, node.lng]} 
                icon={getNodeIcon(node.type)}
                eventHandlers={{ click: () => setSelectedUser(node) }}
              />
            ))}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#050505]">
            <p className="text-[10px] text-[#00f3ff] animate-pulse">ŁĄCZENIE Z SATELITĄ GPS...</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
        {selectedUser && (
          <div className="bg-[#111] pixel-border p-4 animate-in slide-in-from-bottom-10 pointer-events-auto">
            <div className="flex gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-900 border-2 border-[#00f3ff] flex items-center justify-center">
                 <User className="text-[#00f3ff]" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] text-[#00f3ff] mb-2">NAZWA: {selectedUser.name}</h3>
                <p className="text-[8px] text-gray-300 mb-2">STATUS: {selectedUser.status}</p>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-[10px]">{i < selectedUser.rep ? '★' : '☆'}</span>)}
                </div>
              </div>
              <button className="bg-gray-800 text-[8px] px-2 h-8 border-2 border-gray-600 self-end" onClick={() => setSelectedUser(null)}>ZAMKNIJ</button>
            </div>
            <div className="flex justify-between gap-2">
              <button className="flex-1 bg-purple-900 text-[8px] py-2 border-2 border-purple-500">PROFIL</button>
              <button className="flex-1 bg-[#00f3ff] text-black text-[8px] py-2 border-2 border-black">CZAT</button>
              <button className="flex-1 bg-purple-900 text-[8px] py-2 border-2 border-purple-500">AKCJA</button>
              <button className="bg-red-900 text-white text-[8px] px-4 py-2 border-2 border-red-500"><ShieldAlert size={12}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
