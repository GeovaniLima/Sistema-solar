import React, { useEffect, useState } from 'react';
import { PlanetData, GeminiPlanetInfo } from '../types';
import { fetchPlanetDetails } from '../services/geminiService';
import { X, Loader2, Thermometer, Clock, Info } from 'lucide-react';

interface InfoPanelProps {
  planet: PlanetData | null;
  onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ planet, onClose }) => {
  const [info, setInfo] = useState<GeminiPlanetInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (planet) {
      setLoading(true);
      setInfo(null);
      fetchPlanetDetails(planet.name).then((data) => {
        setInfo(data);
        setLoading(false);
      });
    }
  }, [planet]);

  if (!planet) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-black/90 backdrop-blur-md border-l border-white/10 text-white p-6 z-50 transform transition-transform duration-300 overflow-y-auto shadow-2xl">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={24} />
      </button>

      <div className="mt-8">
        <div className="flex items-center gap-4 mb-2">
            <div 
                className="w-4 h-4 rounded-full shadow-[0_0_10px]" 
                style={{ backgroundColor: planet.color, boxShadow: `0 0 15px ${planet.color}` }}
            ></div>
            <h2 className="text-4xl font-bold font-exo text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {planet.name}
            </h2>
        </div>
        <p className="text-gray-400 mb-6 italic">{planet.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="text-gray-400 text-xs uppercase mb-1">Distância do Sol</div>
                <div className="text-xl font-bold">~{planet.distance * 5}M km</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="text-gray-400 text-xs uppercase mb-1">Luas</div>
                <div className="text-xl font-bold">{planet.moons ?? 0}</div>
            </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-blue-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="animate-pulse">Consultando base de dados estelar...</p>
          </div>
        ) : info ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="flex items-center gap-2 text-blue-300 font-semibold mb-3">
                    <Info size={18} />
                    Curiosidades
                </h3>
                <ul className="space-y-2">
                    {info.funFacts.map((fact, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-200">
                        <span className="text-blue-500">•</span>
                        {fact}
                    </li>
                    ))}
                </ul>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 mt-1">
                        <Thermometer size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300">Temperatura</h4>
                        <p className="text-gray-100">{info.temperature}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 mt-1">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300">Período Orbital</h4>
                        <p className="text-gray-100">{info.orbitPeriod}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400 mt-1">
                        <div className="w-5 h-5 border-2 border-current rounded-full opacity-60"></div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300">Composição</h4>
                        <p className="text-gray-100 text-sm leading-relaxed">{info.composition}</p>
                    </div>
                </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
};
