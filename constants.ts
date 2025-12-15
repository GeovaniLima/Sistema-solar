import { PlanetData } from './types';

// Note: Scales are adjusted for visual clarity, not scientific 1:1 accuracy.
// In a real 1:1 model, planets would be invisible specks at these distances.
export const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercúrio',
    color: '#A5A5A5',
    size: 0.8,
    distance: 12,
    speed: 4.1,
    description: 'O menor planeta do sistema solar e o mais próximo do Sol.',
    moons: 0
  },
  {
    id: 'venus',
    name: 'Vênus',
    color: '#E3BB76',
    size: 1.5,
    distance: 18,
    speed: 2.6,
    description: 'Frequentemente chamado de planeta irmão da Terra devido ao tamanho similar.',
    moons: 0
  },
  {
    id: 'earth',
    name: 'Terra',
    color: '#22A6B3',
    size: 1.6,
    distance: 26,
    speed: 2.0,
    description: 'Nosso lar, o único planeta conhecido a abrigar vida.',
    moons: 1
  },
  {
    id: 'mars',
    name: 'Marte',
    color: '#EB4D4B',
    size: 1.2,
    distance: 34,
    speed: 1.5,
    description: 'O Planeta Vermelho, um mundo deserto e frio.',
    moons: 2
  },
  {
    id: 'jupiter',
    name: 'Júpiter',
    color: '#F9CA24',
    size: 4.5,
    distance: 50,
    speed: 0.8,
    description: 'O maior planeta do nosso sistema solar, um gigante gasoso.',
    moons: 79
  },
  {
    id: 'saturn',
    name: 'Saturno',
    color: '#F0932B',
    size: 3.8,
    distance: 70,
    speed: 0.5,
    description: 'Famoso por seus anéis complexos e impressionantes.',
    ring: { innerRadius: 4.8, outerRadius: 8, color: '#e0cda7' },
    moons: 82
  },
  {
    id: 'uranus',
    name: 'Urano',
    color: '#7ED6DF',
    size: 2.5,
    distance: 90,
    speed: 0.3,
    description: 'Um gigante de gelo que gira de lado.',
    moons: 27
  },
  {
    id: 'neptune',
    name: 'Netuno',
    color: '#4834D4',
    size: 2.4,
    distance: 110,
    speed: 0.2,
    description: 'O planeta mais distante do Sol, ventoso e frio.',
    moons: 14
  }
];
