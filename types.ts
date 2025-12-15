export interface PlanetData {
  id: string;
  name: string;
  color: string;
  size: number; // Relative size
  distance: number; // Distance from Sun
  speed: number; // Orbit speed
  description: string;
  ring?: {
    innerRadius: number;
    outerRadius: number;
    color: string;
  };
  moons?: number;
}

export interface GeminiPlanetInfo {
  funFacts: string[];
  composition: string;
  temperature: string;
  orbitPeriod: string;
}

export type TimeScale = number;
