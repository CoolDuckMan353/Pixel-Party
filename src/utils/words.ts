export interface WordPrompt {
  word: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
}

export const WORD_PROMPTS: WordPrompt[] = [
  // Animals
  { word: 'Cat', category: 'Animals', difficulty: 'easy', hints: ['Has whiskers', 'Meows', 'Chases mice'] },
  { word: 'Duck', category: 'Animals', difficulty: 'easy', hints: ['Swims in ponds', 'Quacks', 'Yellow feathers'] },
  { word: 'Frog', category: 'Animals', difficulty: 'easy', hints: ['Amphibian', 'Jumps high', 'Eats flies'] },
  { word: 'Penguin', category: 'Animals', difficulty: 'easy', hints: ['Waddles on ice', 'Flightless bird', 'Wears a tuxedo'] },
  { word: 'Axolotl', category: 'Animals', difficulty: 'medium', hints: ['Pink aquatic creature', 'Feathery gills', 'Regenerates limbs'] },
  { word: 'Red Panda', category: 'Animals', difficulty: 'medium', hints: ['Fluffy striped tail', 'Climbs trees', 'Cute small mammal'] },
  { word: 'Octopus', category: 'Animals', difficulty: 'medium', hints: ['Eight tentacles', 'Squirts ink', 'Undersea creature'] },
  { word: 'Chameleon', category: 'Animals', difficulty: 'hard', hints: ['Changes colors', 'Curled tail', 'Long tongue'] },
  { word: 'Narwhal', category: 'Animals', difficulty: 'medium', hints: ['Unicorn of the sea', 'Has a tusk', 'Arctic swimmer'] },
  { word: 'Shiba Inu', category: 'Animals', difficulty: 'medium', hints: ['Famous dog breed', 'Curled tail', 'Doge meme'] },

  // Food & Drinks
  { word: 'Pizza', category: 'Food', difficulty: 'easy', hints: ['Cheesy slice', 'Pepperoni toppings', 'Italian favorite'] },
  { word: 'Donut', category: 'Food', difficulty: 'easy', hints: ['Hole in middle', 'Pink frosting', 'Sprinkles'] },
  { word: 'Boba Tea', category: 'Food', difficulty: 'medium', hints: ['Tapioca pearls', 'Big straw', 'Sweet milk drink'] },
  { word: 'Sushi', category: 'Food', difficulty: 'easy', hints: ['Rice and fish', 'Nori seaweed wrap', 'Japanese delicacy'] },
  { word: 'Ice Cream', category: 'Food', difficulty: 'easy', hints: ['Frozen dessert', 'Waffle cone', 'Melts in sun'] },
  { word: 'Ramen', category: 'Food', difficulty: 'medium', hints: ['Noodle soup bowl', 'Chopsticks', 'Boiled egg on top'] },
  { word: 'Taco', category: 'Food', difficulty: 'easy', hints: ['Crispy shell', 'Mexican dish', 'Lettuce & meat'] },
  { word: 'Hamburger', category: 'Food', difficulty: 'easy', hints: ['Sesame seed bun', 'Beef patty & cheese', 'Fast food classic'] },
  { word: 'Cupcake', category: 'Food', difficulty: 'easy', hints: ['Mini cake', 'Swirl of frosting', 'Cherry on top'] },
  { word: 'Watermelon', category: 'Food', difficulty: 'easy', hints: ['Green rind', 'Red juicy fruit', 'Black seeds'] },

  // Gaming & Retro
  { word: 'Sword', category: 'Gaming', difficulty: 'easy', hints: ['Sharp blade', 'Knight weapon', 'Steel or diamond'] },
  { word: 'Potion', category: 'Gaming', difficulty: 'easy', hints: ['Glass vial', 'Restores health/mana', 'Glowing liquid'] },
  { word: 'Chest', category: 'Gaming', difficulty: 'easy', hints: ['Holds loot', 'Wooden box with lock', 'RPG treasure'] },
  { word: 'Arcade', category: 'Gaming', difficulty: 'medium', hints: ['Coin-operated cabinet', 'Joystick & buttons', 'Retro games'] },
  { word: 'Controller', category: 'Gaming', difficulty: 'easy', hints: ['D-Pad & buttons', 'Gamepad', 'Plug into console'] },
  { word: 'Mushroom', category: 'Gaming', difficulty: 'easy', hints: ['Red with white spots', 'Makes you grow big', 'Plumber snack'] },
  { word: 'Dragon', category: 'Gaming', difficulty: 'hard', hints: ['Breathes fire', 'Scaly wings', 'Hoards gold'] },
  { word: 'Key', category: 'Gaming', difficulty: 'easy', hints: ['Unlocks dungeon doors', 'Golden metal', 'Teeth on edge'] },
  { word: 'Shield', category: 'Gaming', difficulty: 'easy', hints: ['Blocks attacks', 'Held in hand', 'Crest symbol'] },
  { word: 'Diamond', category: 'Gaming', difficulty: 'easy', hints: ['Precious gem', 'Mined underground', 'Light blue shine'] },

  // Sci-Fi & Space
  { word: 'Rocket', category: 'Sci-Fi', difficulty: 'easy', hints: ['Blasts off to space', 'Fire propulsion', 'Pointy nosecone'] },
  { word: 'Alien', category: 'Sci-Fi', difficulty: 'easy', hints: ['Green skin', 'Big dark eyes', 'From outer space'] },
  { word: 'UFO', category: 'Sci-Fi', difficulty: 'easy', hints: ['Flying saucer', 'Tractor beam', 'Spins in sky'] },
  { word: 'Saturn', category: 'Sci-Fi', difficulty: 'medium', hints: ['Planet with rings', 'Gas giant', 'Orbiting body'] },
  { word: 'Robot', category: 'Sci-Fi', difficulty: 'easy', hints: ['Metallic body', 'Antenna on head', 'Beep boop'] },
  { word: 'Astronaut', category: 'Sci-Fi', difficulty: 'medium', hints: ['Space suit', 'Bubble visor helmet', 'Moonwalker'] },
  { word: 'Laser Gun', category: 'Sci-Fi', difficulty: 'medium', hints: ['Shoots energy beams', 'Futuristic weapon', 'Pew pew'] },
  { word: 'Black Hole', category: 'Sci-Fi', difficulty: 'hard', hints: ['Gravity trap', 'Event horizon', 'Consumes light'] },

  // Fantasy & Magic
  { word: 'Wizard Hat', category: 'Fantasy', difficulty: 'easy', hints: ['Pointy hat', 'Stars & moons pattern', 'Worn by sorcerers'] },
  { word: 'Magic Wand', category: 'Fantasy', difficulty: 'easy', hints: ['Wooden stick', 'Sparkles on tip', 'Casts spells'] },
  { word: 'Crystal Ball', category: 'Fantasy', difficulty: 'medium', hints: ['Fortune teller sphere', 'Glowing glass', 'Sees the future'] },
  { word: 'Unicorn', category: 'Fantasy', difficulty: 'medium', hints: ['Magical horse', 'Horn on forehead', 'Rainbow mane'] },
  { word: 'Spellbook', category: 'Fantasy', difficulty: 'medium', hints: ['Ancient tome', 'Leather bound', 'Glowing runes'] },

  // Objects & Nature
  { word: 'Campfire', category: 'Nature', difficulty: 'easy', hints: ['Burning logs', 'Roasting marshmallows', 'Crackling flames'] },
  { word: 'Cactus', category: 'Nature', difficulty: 'easy', hints: ['Desert plant', 'Prickly needles', 'Green succulent'] },
  { word: 'Rainbow', category: 'Nature', difficulty: 'easy', hints: ['Multi-colored arc', 'After the rain', 'Pot of gold'] },
  { word: 'Lighthouse', category: 'Nature', difficulty: 'medium', hints: ['Tower on coast', 'Spinning light beam', 'Guides ships'] },
  { word: 'Volcano', category: 'Nature', difficulty: 'medium', hints: ['Mountain spitting lava', 'Smoke plume', 'Eruption'] },
  { word: 'Sunflower', category: 'Nature', difficulty: 'easy', hints: ['Tall yellow petals', 'Follows the sun', 'Contains seeds'] }
];

export function getRandomWordPrompt(): WordPrompt {
  return WORD_PROMPTS[Math.floor(Math.random() * WORD_PROMPTS.length)];
}

export function getRandomWordOptions(count: number = 3): WordPrompt[] {
  const shuffled = [...WORD_PROMPTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function isCloseGuess(guess: string, target: string): boolean {
  const cleanGuess = guess.trim().toLowerCase();
  const cleanTarget = target.trim().toLowerCase();
  if (cleanGuess === cleanTarget) return false; // That's exact match, not just close
  
  // Check levenshtein distance or substring
  if (cleanTarget.includes(cleanGuess) && cleanGuess.length >= Math.max(3, cleanTarget.length - 2)) {
    return true;
  }
  
  if (levenshteinDistance(cleanGuess, cleanTarget) <= 2 && cleanTarget.length >= 4) {
    return true;
  }
  
  return false;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
