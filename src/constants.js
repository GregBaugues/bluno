// Constants for the Bluey Uno game

// Card colors
export const CARD_COLORS = Object.freeze({
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
  WILD: 'wild'
});

// Card types
export const CARD_TYPES = Object.freeze({
  NUMBER: 'number',
  SPECIAL: 'special',
  WILD: 'wild'
});

// Card values
export const CARD_VALUES = Object.freeze({
  NUMBERS: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  SPECIAL: {
    SKIP: 'Skip',
    REVERSE: 'Reverse',
    DRAW_TWO: 'Draw 2'
  },
  WILD: {
    STANDARD: 'Wild',
    DRAW_FOUR: 'Wild Draw 4'
  }
});

// Emoji mapping for cards
export const EMOJI_MAP = Object.freeze({
  // Numbers - using the emoji faces 
  '0': '😶', // Neutral face for zero
  '1': '😬', // Grimacing face (teeth showing)
  '2': '😁', // Grinning face with smiling eyes
  '3': '😍', // Heart eyes
  '4': '😇', // Angel face with halo
  '5': '😎', // Sunglasses face
  '6': '🙂', // Slightly smiling face
  '7': '😊', // Smiling face with smiling eyes
  '8': '😘', // Face blowing a kiss
  '9': '😠', // Angry face
  
  // Special cards
  'Skip': '🙅‍♀️', // Girl crossing arms (Skip)
  'Reverse': '👉', // Pointing hand for Reverse (the card shows two hands pointing)
  'Draw 2': '👯‍♀️', // Two dancers for Draw 2
  'Wild': '👍', // Thumbs up for Wild
  'Wild Draw 4': '💩', // Keeping the important poopey head for Draw 4!
});

// Character definitions
export const CHARACTERS = Object.freeze({
  PLAYER: 'Julia',
  AI: {
    BLUEY: 'Bluey',
    BINGO: 'Bingo',
    DAD: 'Dad',
    BANDIT: 'Bandit'
  }
});

// Character priority order for AI players
export const CHARACTER_PRIORITY = [
  CHARACTERS.AI.BLUEY,
  CHARACTERS.AI.BINGO,
  CHARACTERS.AI.DAD
];

// Character colors for styling
export const CHARACTER_COLORS = Object.freeze({
  [CHARACTERS.PLAYER]: '#FFCC66',    // Golden yellow
  [CHARACTERS.AI.BLUEY]: '#1E90FF',  // Blue
  [CHARACTERS.AI.BINGO]: '#FF6B6B',  // Red/orange
  [CHARACTERS.AI.BANDIT]: '#4169E1', // Royal blue
  [CHARACTERS.AI.DAD]: '#5F4B32'     // Brown
});

// Character data including paths and styling information
export const CHARACTER_DATA = Object.freeze({
  [CHARACTERS.PLAYER]: {
    name: CHARACTERS.PLAYER,
    color: CHARACTER_COLORS[CHARACTERS.PLAYER],
    imagePath: 'public/images/julia.png',
    elementId: 'julia-img',
    initial: 'J',
    textColor: '#333'
  },
  [CHARACTERS.AI.BLUEY]: {
    name: CHARACTERS.AI.BLUEY,
    color: CHARACTER_COLORS[CHARACTERS.AI.BLUEY],
    imagePath: 'public/images/bluey.png',
    elementId: 'bluey-img',
    initial: 'B',
    textColor: 'white',
    soundFile: 'bluey.mp3'
  },
  [CHARACTERS.AI.BINGO]: {
    name: CHARACTERS.AI.BINGO,
    color: CHARACTER_COLORS[CHARACTERS.AI.BINGO],
    imagePath: 'public/images/bingo.png',
    elementId: 'bingo-img',
    initial: 'B',
    textColor: 'white',
    soundFile: 'bingo.mp3'
  },
  [CHARACTERS.AI.DAD]: {
    name: CHARACTERS.AI.DAD,
    color: CHARACTER_COLORS[CHARACTERS.AI.DAD],
    imagePath: 'public/images/dad.png',
    elementId: 'dad-img',
    initial: 'D',
    textColor: 'white',
    soundFile: 'dad.mp3'
  },
  [CHARACTERS.AI.BANDIT]: {
    name: CHARACTERS.AI.BANDIT,
    color: CHARACTER_COLORS[CHARACTERS.AI.BANDIT],
    imagePath: 'public/images/bandit.png',
    elementId: 'bandit-img',
    initial: 'B',
    textColor: 'white'
  }
});

// Sound definitions for the game
export const SOUNDS = Object.freeze({
  CARD_PLAY: { type: 'synthesized', waveform: 'sine', frequency: 440, duration: 0.3 },
  YOUR_TURN: { 
    type: 'synthesized', 
    notes: [
      { freq: 523.25, start: 0, duration: 0.5 },
      { freq: 659.25, start: 0.2, duration: 0.6 }
    ]
  },
  UNO_CALL: { type: 'synthesized' },
  WIN: { type: 'synthesized' },
  BINGO: { type: 'sample', file: 'audio/bingo.mp3', elementId: 'bingo-sound-preload' },
  BLUEY: { type: 'sample', file: 'audio/bluey.mp3', elementId: 'bluey-sound-preload' },
  DAD: { type: 'sample', file: 'audio/dad.mp3', elementId: 'dad-sound-preload' }
});

// UI style constants
export const UI_COLORS = Object.freeze({
  RED: '#ff3b3b',
  BLUE: '#4a7af5',
  GREEN: '#47c83e',
  YELLOW: '#ffee3e',
  BACKGROUND_PINK: '#ffdbec',
  CONTAINER_PINK: '#ffc0dc'
});