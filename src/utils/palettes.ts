import { ColorPalette } from '../types/game';

export const PALETTES: ColorPalette[] = [
  {
    id: 'pico-8',
    name: 'PICO-8 Classic',
    description: 'Iconic 16-color fantasy console palette',
    colors: [
      '#000000', '#1D2B53', '#7E2553', '#008751',
      '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
      '#FF004D', '#FFA300', '#FFEC27', '#00E436',
      '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'
    ]
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'High-voltage synthwave & neon glow hues',
    colors: [
      '#0d0221', '#0f084b', '#26408b', '#0d0887',
      '#6a00a8', '#b122e5', '#ff007f', '#ff5400',
      '#ffbd00', '#f72585', '#7209b7', '#3a0ca3',
      '#4361ee', '#4cc9f0', '#00f5d4', '#ffffff'
    ]
  },
  {
    id: 'gameboy',
    name: 'GameBoy 4-Tone',
    description: 'Classic 1989 monochrome olive screen',
    colors: [
      '#0f380f',
      '#306230',
      '#8bac0f',
      '#9bbc0f'
    ]
  },
  {
    id: 'pastel',
    name: 'Pastel Dream',
    description: 'Soft, cute candy and kawaii tones',
    colors: [
      '#2b2d42', '#8d99ae', '#edf2f4', '#ffffff',
      '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
      '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff',
      '#f15bb5', '#fee440', '#00bbf9', '#00f5d4'
    ]
  },
  {
    id: 'arcade',
    name: 'Retro Arcade',
    description: 'Punchy 90s quarter-munching vibrant tones',
    colors: [
      '#141115', '#4d243d', '#e0ca3c', '#a63a50',
      '#f26419', '#33658a', '#86bbd8', '#2f4858',
      '#f6ae2d', '#f26419', '#55d6be', '#2e4057',
      '#d72638', '#3f88c5', '#f49d37', '#ffffff'
    ]
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    description: 'Rich fiery oranges, warm ambers, and deep violets',
    colors: [
      '#1b1947', '#392b58', '#683a68', '#a84c62',
      '#dc5a41', '#f68c3c', '#f8c255', '#fef49c',
      '#1a1016', '#3b1424', '#6b1c38', '#9e2a2b',
      '#bd3b1b', '#e07a5f', '#f4f1de', '#ffffff'
    ]
  },
  {
    id: 'mega',
    name: 'Pixel Master 32',
    description: 'Expanded studio spectrum for detailed artwork',
    colors: [
      '#000000', '#222034', '#45283c', '#663931',
      '#8f563b', '#df7126', '#d9a066', '#eec39a',
      '#fbf236', '#99e550', '#6abe30', '#37946e',
      '#4b692f', '#524b24', '#323c39', '#3f3f74',
      '#306082', '#5b6ee1', '#639bff', '#5fcde4',
      '#cbdbfc', '#ffffff', '#9badb7', '#847e87',
      '#696a6a', '#595652', '#76428a', '#ac3232',
      '#d95763', '#d77bba', '#8f974a', '#8a6f30'
    ]
  }
];

export const DEFAULT_PALETTE = PALETTES[0];

export function getPaletteById(id: string): ColorPalette {
  return PALETTES.find(p => p.id === id) || DEFAULT_PALETTE;
}
