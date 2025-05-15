# Bluey Uno Refactoring Plan

## Introduction

This document outlines a comprehensive refactoring plan for the Bluey Uno card game codebase. The goals of this refactoring are to:

1. Improve code organization and maintainability
2. Eliminate duplication
3. Ensure consistent coding practices
4. Remove unused code
5. Improve the architecture for future extensions
6. Preserve all existing functionality and user experience

## Current Code Issues Overview

After analyzing the codebase, several areas for improvement have been identified:

1. **Large, monolithic functions** - Particularly in game.js and ui.js, many functions exceed 50+ lines and handle multiple responsibilities
2. **Excessive code duplication** - Similar patterns and logic repeated across files
3. **Inconsistent state management** - The gameState object is used inconsistently and modified from multiple places
4. **Lack of separation of concerns** - UI rendering logic is intertwined with game logic
5. **Hard-coded values throughout the codebase** - Colors, sizes, paths, etc. are duplicated rather than defined as constants
6. **Unused code** - Some features like sound toggling aren't fully implemented or used
7. **Complex conditional logic** - Particularly in game rule handling
8. **Inconsistent error handling** - Different approaches to handling errors across files
9. **Direct DOM manipulation in multiple files** - Creating a tight coupling between code modules

## Specific Recommendations by File

### 1. deck.js

Current issues:
- Hard-coded values for colors, card values, emoji mappings
- Functions that could benefit from better separation

Recommendations:
- Move all hard-coded values to named constants at the top of the file
- Refactor card creation to be more modular (separate numeric and special card creation)

Example refactoring:

```javascript
// Before:
const colors = ['red', 'blue', 'green', 'yellow'];
const numberValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const specialValues = ['Skip', 'Reverse', 'Draw 2'];
const wildValues = ['Wild', 'Wild Draw 4'];

// After:
const CARD_COLORS = Object.freeze({
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
  WILD: 'wild'
});

const CARD_TYPES = Object.freeze({
  NUMBER: 'number',
  SPECIAL: 'special',
  WILD: 'wild'
});

const CARD_VALUES = Object.freeze({
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
```

### 2. game.js

Current issues:
- Extremely large functions (several 50+ lines)
- Complex conditional logic for game rules
- Heavy intertwining with UI logic
- Global gameState object modified from multiple places
- Inconsistent error handling

Recommendations:
- Break down large functions into smaller, single-responsibility functions
- Create separate modules for game rules, turn management, and card effects
- Implement a proper state management system (or use simple pub/sub pattern)
- Standardize error handling approach

Example of function decomposition:

```javascript
// Before:
function handleSpecialCard(card) {
  // 70+ lines of complex logic with multiple responsibilities
  // handling different card types, effects, game state updates, etc.
}

// After:
function handleSpecialCard(card) {
  if (card.color !== 'wild') {
    gameState.currentColor = card.color;
  }
  
  switch (card.value) {
    case CARD_VALUES.SPECIAL.SKIP:
      return handleSkipCard();
    case CARD_VALUES.SPECIAL.REVERSE:
      return handleReverseCard();
    case CARD_VALUES.SPECIAL.DRAW_TWO:
      return handleDrawTwoCard();
    case CARD_VALUES.WILD.STANDARD:
      return handleWildCard();
    case CARD_VALUES.WILD.DRAW_FOUR:
      return handleWildDrawFourCard();
    default:
      return false;
  }
}

// Then create individual handler functions
function handleSkipCard() {
  const skippedPlayerIndex = getNextPlayerIndex();
  console.log(`${gameState.players[skippedPlayerIndex].name}'s turn is skipped`);
  gameState.currentPlayerIndex = skippedPlayerIndex;
  return false;
}

// Additional handler functions for other card types...
```

### 3. players.js

Current issues:
- Inconsistency between blueyCharacters array and actual usage
- Redundant code in character selection
- Functions that could be more generic

Recommendations:
- Create a consistent, unified approach to character data
- Refactor to use a more data-driven approach

Example refactoring:

```javascript
// Before:
const blueyCharacters = [
  'Bluey',
  'Bingo',
  'Bandit',
  'Dad'
];

// After:
const CHARACTERS = Object.freeze({
  PLAYER: 'Julia',
  AI: {
    BLUEY: 'Bluey',
    BINGO: 'Bingo',
    DAD: 'Dad',
    BANDIT: 'Bandit'
  }
});

const CHARACTER_PRIORITY = [
  CHARACTERS.AI.BLUEY,
  CHARACTERS.AI.BINGO,
  CHARACTERS.AI.DAD
];

// Refactored createPlayers function
function createPlayers(numPlayers) {
  const players = [];
  
  // Create human player
  players.push(createPlayer(CHARACTERS.PLAYER, false));
  
  // Create AI players in priority order
  for (let i = 0; i < Math.min(numPlayers - 1, CHARACTER_PRIORITY.length); i++) {
    players.push(createPlayer(CHARACTER_PRIORITY[i], true));
  }
  
  return players;
}

function createPlayer(name, isAI) {
  return {
    name,
    hand: [],
    isAI,
    hasCalledUno: false
  };
}
```

### 4. ui.js

Current issues:
- Extremely large functions with multiple responsibilities
- Direct DOM manipulation scattered throughout
- Duplicated style definitions (both in JS and CSS)
- Inconsistent approach to element creation and styling
- Multiple functions for similar tasks (e.g., different character renderings)

Recommendations:
- Create a component-based UI system
- Move style definitions to CSS where possible
- Create helper functions for common UI patterns
- Standardize element creation and manipulation

Example refactoring:

```javascript
// Before (scattered throughout the file):
function renderBingo() {
  // 30+ lines of direct DOM manipulation
}

function renderDad() {
  // 30+ lines of similar DOM manipulation
}

// After:
// Create a generic character component
function renderCharacter(config) {
  const { id, name, position, size, data } = config;
  
  // Get or create container
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    applyStyles(container, getCharacterContainerStyles(position));
    document.getElementById('game-container').appendChild(container);
  }
  
  // Clear previous content
  container.innerHTML = '';
  
  // Create character elements
  const characterContent = createCharacterDisplay(name, size);
  const nameDisplay = createNameBadge(name, size > 100);
  
  // Create opponent wrapper
  const opponentDiv = document.createElement('div');
  opponentDiv.className = 'opponent';
  opponentDiv.appendChild(characterContent);
  opponentDiv.appendChild(nameDisplay);
  
  // Add cards if this is an active player
  if (data) {
    const cardsContainer = createCardsContainer(data);
    opponentDiv.appendChild(cardsContainer);
    
    // Add UNO indicator if needed
    if (data.hand.length === 1 && data.hasCalledUno) {
      opponentDiv.appendChild(createUnoIndicator());
    }
    
    // Highlight if it's this character's turn
    if (gameState.currentPlayerIndex === gameState.players.indexOf(data)) {
      opponentDiv.classList.add('current-player');
    }
  }
  
  container.appendChild(opponentDiv);
  return container;
}

// Then use this generic component
function renderBingo() {
  // Find Bingo in players array
  const bingoPlayer = gameState.isGameStarted ? 
    gameState.players.find(player => player.name === CHARACTERS.AI.BINGO) : null;
  
  // Only show if game has enough players
  const shouldShow = !gameState.isGameStarted || 
    (gameState.players && gameState.players.length >= 3);
    
  // Render with proper configuration
  renderCharacter({
    id: 'bingo-display',
    name: CHARACTERS.AI.BINGO,
    position: { center: true, top: 0 },
    size: 100,
    data: shouldShow ? bingoPlayer : null,
    visible: shouldShow
  });
}
```

### 5. sounds.js

Current issues:
- Inconsistent sound handling
- Unused sound toggling functionality
- Duplication in sound file loading

Recommendations:
- Create a more consistent API for sound management
- Remove unused toggle functionality or fully implement it
- Refactor sound loading to reduce duplication

Example refactoring:

```javascript
// Before:
loadBingoSound() {
  // 30+ lines of complex loading code
}

loadBlueySound() {
  // Same 30+ lines duplicated with minor changes
}

// After:
// Define sounds in a configuration object
const SOUNDS = Object.freeze({
  CARD_PLAY: { type: 'synthesized', params: { waveform: 'sine', frequency: 440, duration: 0.3 } },
  YOUR_TURN: { type: 'synthesized', params: { notes: [
    { freq: 523.25, start: 0, duration: 0.5 },
    { freq: 659.25, start: 0.2, duration: 0.6 }
  ]}},
  UNO_CALL: { type: 'synthesized', params: { /* ... */ } },
  WIN: { type: 'synthesized', params: { /* ... */ } },
  BINGO: { type: 'sample', file: 'bingo.mp3', elementId: 'bingo-sound-preload' },
  BLUEY: { type: 'sample', file: 'bluey.mp3', elementId: 'bluey-sound-preload' },
  DAD: { type: 'sample', file: 'dad.mp3', elementId: 'dad-sound-preload' }
});

// Generic sample loading function
loadSampleSound(config) {
  const { name, file, elementId } = config;
  const preloadedAudio = document.getElementById(elementId);
  
  this.sounds[name] = {
    play: () => {
      if (!this.enabled) return;
      
      try {
        if (preloadedAudio) {
          console.log(`Using preloaded ${name} sound`);
          const audioClone = preloadedAudio.cloneNode();
          audioClone.volume = 0.5;
          
          audioClone.play()
            .then(() => {
              console.log(`${name} sound played successfully!`);
              audioClone.onended = () => {
                if (audioClone.parentNode) {
                  audioClone.parentNode.removeChild(audioClone);
                }
              };
            })
            .catch(err => {
              console.error(`Error playing cloned ${name} sound:`, err);
              // Fallback to direct play
              preloadedAudio.play().catch(e => {
                console.error(`Error playing original ${name} sound:`, e);
              });
            });
        } else {
          // Fallback to creating a new audio element
          console.log(`Preloaded ${name} sound not found, using fallback`);
          const fallbackAudio = new Audio(`public/${file}`);
          fallbackAudio.volume = 0.5;
          fallbackAudio.play().catch(error => {
            console.error(`Fallback ${name} sound failed:`, error);
          });
        }
      } catch (e) {
        console.error(`Exception playing ${name} sound:`, e);
      }
    }
  };
}
```

### 6. images.js

Current issues:
- Limited functionality that could be expanded
- Inconsistency with character color definitions elsewhere in the code

Recommendations:
- Consolidate character data (colors, images, etc.) into a single configuration
- Expand to include image loading and error handling

Example refactoring:

```javascript
// Before:
const characterColors = {
  'Bluey': '#1E90FF',    // Blue
  'Bingo': '#FF6B6B',    // Red/orange
  'Bandit': '#4169E1',   // Royal blue
  'Julia': '#FFCC66',    // Golden yellow
  'Dad': '#5F4B32'       // Brown for Dad
};

// After:
const CHARACTER_DATA = Object.freeze({
  [CHARACTERS.PLAYER]: {
    name: 'Julia',
    color: '#FFCC66',
    imagePath: 'public/images/julia.png',
    elementId: 'julia-img',
    initial: 'J',
    textColor: '#333'
  },
  [CHARACTERS.AI.BLUEY]: {
    name: 'Bluey',
    color: '#1E90FF',
    imagePath: 'public/images/bluey.png',
    elementId: 'bluey-img',
    initial: 'B',
    textColor: 'white',
    soundFile: 'bluey.mp3'
  },
  [CHARACTERS.AI.BINGO]: {
    name: 'Bingo',
    color: '#FF6B6B',
    imagePath: 'public/images/bingo.png',
    elementId: 'bingo-img',
    initial: 'B',
    textColor: 'white',
    soundFile: 'bingo.mp3'
  },
  // Add other characters...
});

// Functions to work with this more structured data
function getCharacterColor(name) {
  return CHARACTER_DATA[name]?.color || '#4682B4';
}

function getCharacterImagePath(name) {
  return CHARACTER_DATA[name]?.imagePath || null;
}

function getCharacterImageElement(name) {
  const elementId = CHARACTER_DATA[name]?.elementId;
  return elementId ? document.getElementById(elementId) : null;
}
```

### 7. index.html

Current issues:
- Inline scripts that should be moved to separate JS files
- Duplicated style definitions
- Character-specific code in the HTML

Recommendations:
- Move all inline scripts to proper JavaScript files
- Consolidate styles in the CSS file
- Use a more component-based approach to dynamically create UI elements

Example changes:

```html
<!-- Before -->
<script>
  // 50+ lines of inline character loading code
</script>

<!-- After -->
<!-- Remove inline script and instead: -->
<script src="src/imageLoader.js" type="module"></script>
```

## Architecture Improvements

### 1. State Management

Implement a simple pub/sub or observer pattern for game state:

```javascript
// gameState.js
class GameState {
  constructor() {
    this._state = {
      deck: [],
      discardPile: [],
      players: [],
      currentPlayerIndex: 0,
      direction: 1,
      // other state properties...
    };
    this._listeners = [];
  }
  
  // Get the current state (read-only)
  get state() {
    return { ...this._state }; // Return a copy to prevent direct modification
  }
  
  // Update state with proper notifications
  updateState(changes) {
    this._state = { ...this._state, ...changes };
    this._notifyListeners();
  }
  
  // Add a listener for state changes
  subscribe(listener) {
    this._listeners.push(listener);
    return () => this.unsubscribe(listener); // Return unsubscribe function
  }
  
  // Remove a listener
  unsubscribe(listener) {
    this._listeners = this._listeners.filter(l => l !== listener);
  }
  
  // Notify all listeners of state change
  _notifyListeners() {
    this._listeners.forEach(listener => listener(this._state));
  }
}

// Export a singleton instance
export default new GameState();
```

### 2. Event System

Create a unified event system to replace direct DOM event manipulation:

```javascript
// events.js
class EventBus {
  constructor() {
    this._events = {};
  }
  
  // Register an event handler
  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  // Remove an event handler
  off(event, callback) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(cb => cb !== callback);
  }
  
  // Trigger an event
  emit(event, data) {
    if (!this._events[event]) return;
    this._events[event].forEach(callback => callback(data));
  }
}

// Export a singleton instance
export default new EventBus();
```

### 3. Component-Based Architecture

Create a simple component system for UI elements:

```javascript
// components/Component.js
export default class Component {
  constructor(config = {}) {
    this.element = null;
    this.children = [];
    this.config = config;
  }
  
  // Create the DOM element
  render() {
    // Implementation depends on the specific component
    // Should return a DOM element
  }
  
  // Add a child component
  addChild(component) {
    this.children.push(component);
    if (this.element) {
      this.element.appendChild(component.render());
    }
  }
  
  // Apply styles to the element
  applyStyles(styles) {
    if (!this.element) return;
    Object.entries(styles).forEach(([prop, value]) => {
      this.element.style[prop] = value;
    });
  }
  
  // Update the component
  update(newConfig) {
    this.config = { ...this.config, ...newConfig };
    // Implementation depends on the specific component
  }
}

// components/Card.js
import Component from './Component.js';
import { CARD_COLORS, CARD_VALUES } from '../constants.js';

export default class Card extends Component {
  render() {
    const { card, isPlayable, onClick } = this.config;
    
    const element = document.createElement('div');
    element.className = `card ${card.color}`;
    element.setAttribute('data-value', card.value);
    
    // Add card content
    // ...
    
    // Add event handler if card is playable
    if (isPlayable && onClick) {
      element.classList.add('playable-card');
      element.addEventListener('click', onClick);
    }
    
    this.element = element;
    return element;
  }
}
```

## Implementation Approach

The refactoring should be implemented in phases to minimize disruption:

### Phase 1: Code Organization and Cleanup
1. Create a constants.js file for all shared constants
2. Extract utility functions to utils.js
3. Fix indentation and code style inconsistencies
4. Remove unused code (like sound toggle)

### Phase 2: Architectural Improvements
1. Implement basic state management
2. Create event system
3. Develop component-based UI framework 

### Phase 3: Module Refactoring
1. Refactor deck.js with proper separation of concerns
2. Refactor game.js into smaller, focused modules:
   - gameRules.js
   - turnManager.js
   - cardEffects.js
3. Refactor UI rendering functions
4. Update soundSystem.js with more consistent API

### Phase 4: Integration and Testing
1. Integrate all refactored modules
2. Implement comprehensive testing
3. Verify all functionality works as expected
4. Optimize for performance if needed

## Testing Considerations

1. Create manual test cases for all game scenarios
2. Add logging for important game state changes
3. Test on multiple browsers and devices
4. Focus on edge cases:
   - Card effects chaining (e.g., multiple Draw 2 cards)
   - End-game scenarios
   - Wild card color selection
   - Racing conditions in animation
   - UNO calling logic
   - Player ending a game with an action card

## Conclusion

This refactoring plan addresses the key issues in the current codebase while preserving all functionality. The changes will result in a more maintainable, extensible, and robust codebase that adheres to modern JavaScript best practices.

By implementing these changes incrementally, we can ensure that the game continues to function correctly throughout the refactoring process while steadily improving its architecture and code quality.