/**
 * Battle configuration adapter for 3D environment
 * Maps 2D battle system types to 3D types
 */

import type { PetType } from './petTypes.js';

// Re-export PetType for convenience
export type { PetType };

// Simplified element type
export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'spirit';

// Element effectiveness configuration
export const ELEMENT_CONFIG: Record<ElementType, {
  name: string;
  color: string;
  strong: ElementType;
  weak: ElementType;
}> = {
  fire: {
    name: 'Fire',
    color: '#ff4400',
    strong: 'earth',
    weak: 'water',
  },
  water: {
    name: 'Water',
    color: '#0088ff',
    strong: 'fire',
    weak: 'earth',
  },
  earth: {
    name: 'Earth',
    color: '#88aa44',
    strong: 'air',
    weak: 'fire',
  },
  air: {
    name: 'Air',
    color: '#aaddff',
    strong: 'water',
    weak: 'earth',
  },
  spirit: {
    name: 'Spirit',
    color: '#dd88ff',
    strong: 'spirit',
    weak: 'spirit',
  },
};

// Stub out Pet3D component (not needed for 3D battles)
export const PET_NAMES: Record<PetType, string> = {
  cutephetta: 'Cute Phetta',
  lovebug: 'Lovebug',
  meep: 'Meep',
  pizzalotl: 'Pizzalotl',
  alienfella: 'Alien Fella',
  redfox: 'Red Fox',
  griffin: 'Griffin',
  sparky: 'Sparky',
  cat: 'Cat',
  dog: 'Dog',
  wolf: 'Wolf',
};
