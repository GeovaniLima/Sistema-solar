import React, { useState } from 'react';
import { SolarSystem } from './components/SolarSystem';
import { InfoPanel } from './components/InfoPanel';
import { PLANETS } from './constants';
import { Play, Pause, Search } from 'lucide-react';

export default function App() {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [timeScale, setTimeScale] = useState(1);
  const [paused, setPaused] = useState(false);

  const selectedPlanet = PLANETS.find(p => p.id === selectedPlanetId) || null;

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden font-sans text-white">
      
      {/* Header / Title */}
      <div className="absolute top-0 left-0 p-6 z-10 pointer-events-none">
        <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 drop-shadow-sm">
          COSMOVIEW 3D
        </h1>
        <p className="text-blue-200/60 text-sm mt-1">Explorador Interativo do Sistema Solar</p>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <SolarSystem 
            timeScale={timeScale} 
            selectedPlanetId={selectedPlanetId} 
            onSelectPlanet={setSelectedPlanetId}
            paused={paused}
        />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-6 z-20 shadow-2xl">
        <button 
            onClick={() => setPaused(!paused)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/50"
        >
            {paused ? <Play fill="white" size={18} /> : <Pause fill="white" size={18} />}
        </button>

        <div className="flex flex-col gap-1 w-48">
            <div className="flex justify-between text-xs text-gray-400 uppercase tracking-wider font-semibold">
                <span>Velocidade Orbital</span>
                <span>{timeScale.toFixed(1)}x</span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="5" 
                step="0.1" 
                value={timeScale} 
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
        </div>
      </div>

      {/* Planet Quick Select (Bottom Desktop or Hidden Mobile) */}
      <div className="absolute bottom-8 right-8 hidden md:flex gap-2 z-20">
          {PLANETS.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedPlanetId(p.id)}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 ${selectedPlanetId === p.id ? 'border-blue-500 scale-110 shadow-[0_0_10px_#3b82f6]' : 'border-transparent bg-white/10 hover:bg-white/20'}`}
                title={p.name}
              >
                <div 
                    className="w-full h-full rounded-full opacity-80" 
                    style={{ backgroundColor: p.color }}
                />
              </button>
          ))}
      </div>

      {/* Guide/Instruction Overlay (Disappears after interaction) */}
      {!selectedPlanetId && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center opacity-50 animate-pulse z-0">
              <Search className="w-12 h-12 mx-auto mb-2 text-white/50" />
              <p className="text-white/70 text-lg">Clique em um planeta para explorar</p>
          </div>
      )}

      {/* Info Panel Sidebar */}
      <InfoPanel 
        planet={selectedPlanet} 
        onClose={() => setSelectedPlanetId(null)} 
      />
      
    </div>
  );
}
