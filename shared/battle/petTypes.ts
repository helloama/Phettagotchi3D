/**
 * Pet type definitions for battle system
 * Maps 2D pet types to 3D VRM models
 */

export type PetType =
  // VRM pets from 2D game (examples - expand with all 40+ later)
  | 'cutephetta'
  | 'lovebug'
  | 'meep'
  | 'pizzalotl'
  | 'alienfella'
  | 'redfox'
  | 'griffin'
  | 'sparky'
  // 3D GLB animals (existing)
  | 'cat'
  | 'dog'
  | 'wolf';

export interface PetConfig {
  name: string;
  modelUrl: string;
  modelType: 'vrm' | 'glb';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Pet model mappings
export const PET_CONFIGS: Record<PetType, PetConfig> = {
  // VRM pets (from 2D game)
  cutephetta: {
    name: 'Cute Phetta',
    modelUrl: '/assets/avatars/phettav5.vrm', // Reuse existing VRM
    modelType: 'vrm',
    rarity: 'common',
  },
  lovebug: {
    name: 'Lovebug',
    modelUrl: '/assets/pets/lovebug_1.vrm',
    modelType: 'vrm',
    rarity: 'common',
  },
  meep: {
    name: 'Meep',
    modelUrl: '/assets/pets/meep_1.vrm',
    modelType: 'vrm',
    rarity: 'uncommon',
  },
  pizzalotl: {
    name: 'Pizzalotl',
    modelUrl: '/assets/pets/pizzalotl_1.vrm',
    modelType: 'vrm',
    rarity: 'rare',
  },
  alienfella: {
    name: 'Alien Fella',
    modelUrl: '/assets/pets/alienfella_1.vrm',
    modelType: 'vrm',
    rarity: 'rare',
  },
  redfox: {
    name: 'Red Fox',
    modelUrl: '/assets/pets/redfox_1.vrm',
    modelType: 'vrm',
    rarity: 'uncommon',
  },
  griffin: {
    name: 'Griffin',
    modelUrl: '/assets/pets/blufella_1.vrm', // Use blufella since griffin didn't copy
    modelType: 'vrm',
    rarity: 'legendary',
  },
  sparky: {
    name: 'Sparky',
    modelUrl: '/assets/pets/sparky_1.vrm',
    modelType: 'vrm',
    rarity: 'common',
  },

  // Existing 3D GLB models
  cat: {
    name: 'Cat',
    modelUrl: 'https://notbloxo.fra1.cdn.digitaloceanspaces.com/Notblox-Assets/animal/Cat.glb',
    modelType: 'glb',
    rarity: 'common',
  },
  dog: {
    name: 'Dog',
    modelUrl: 'https://notbloxo.fra1.cdn.digitaloceanspaces.com/Notblox-Assets/animal/Dog.glb',
    modelType: 'glb',
    rarity: 'uncommon',
  },
  wolf: {
    name: 'Wolf',
    modelUrl: 'https://notbloxo.fra1.cdn.digitaloceanspaces.com/Notblox-Assets/animal/Wolf.glb',
    modelType: 'glb',
    rarity: 'epic',
  },
};

// Simple element system for battles
export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'spirit';

// Element configuration with type effectiveness
export const ELEMENT_CONFIG: Record<ElementType, {
  name: string;
  color: string;
  strong: ElementType; // This element is strong against
  weak: ElementType;   // This element is weak against
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
