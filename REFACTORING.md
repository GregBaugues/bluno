# Refactoring Opportunities for Bluey Uno

This document outlines potential refactoring opportunities for the Bluey Uno game to improve maintainability, readability, and performance.

## 1. Game State Management

### Current Issue
The game uses a global `gameState` object in `game.js` which makes it difficult to track state changes and can lead to unpredictable behavior.

### Recommendation
- Convert to a class-based approach with proper encapsulation
- Add getters/setters for state properties to control access
- Implement a state management pattern like Observer or Pub/Sub

```javascript
// Example refactored approach
class GameState {
  #state = {
    deck: [],
    discardPile: [],
    players: [],
    currentPlayerIndex: 0,
    // ... other properties
  };
  
  get currentPlayer() {
    return this.#state.players[this.#state.currentPlayerIndex];
  }
  
  updateState(changes) {
    this.#state = {...this.#state, ...changes};
    this.notifyObservers();
  }
  
  // Observer pattern methods
  addObserver(observer) { /* ... */ }
  notifyObservers() { /* ... */ }
}
```

## 2. Duplicate Code in Special Card Handling

### Current Issue
There is significant duplication in `handleSpecialCard()` function with similar code blocks for "Wild" and "Wild Draw 4" cards.

### Recommendation
- Extract common functionality into shared helper functions
- Use strategy pattern to handle different card types
- Reduce complexity of special card handling

```javascript
// Example refactored approach
function handleWildCard(card, isDrawFour = false) {
  // Common wild card handling logic
  if (gameState.currentPlayerIndex !== 0) {
    chooseAIColor();
  } else {
    gameState.currentColor = 'blue'; // Default temporary color
    gameState.waitingForImplicitColor = true;
  }
  
  if (isDrawFour) {
    handleDrawPenalty(4);
  }
}

function handleDrawPenalty(drawCount) {
  // Common logic for Draw 2 and Wild Draw 4
  let nextIdx = getNextPlayerIndex();
  let nextPlayer = gameState.players[nextIdx];
  
  if (nextPlayer.isAI) {
    drawCardsForAI(nextPlayer, drawCount);
  } else {
    gameState.requiredDraws = drawCount;
  }
  
  // Handle turn skipping
  handleTurnSkip();
}
```

## 3. AI Logic Improvements

### Current Issue
The AI logic in `playAITurn()` is very basic and doesn't consider strategy (like saving wild cards).

### Recommendation
- Separate AI logic into its own module
- Implement different difficulty levels
- Add strategic decision-making based on game state

```javascript
// Example refactored approach
class AIPlayer {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty;
  }
  
  chooseCard(player, gameState) {
    const playableCards = this.getPlayableCards(player, gameState);
    
    if (this.difficulty === 'easy') {
      return this.chooseRandomCard(playableCards);
    } else {
      return this.chooseStrategicCard(playableCards, gameState);
    }
  }
  
  chooseStrategicCard(cards, gameState) {
    // Prioritize number cards, save special cards for later
    // Consider number of cards other players have
    // ...strategic logic
  }
}
```

## 4. Event Handling

### Current Issue
Event handling for UI interactions is scattered across different files, making it difficult to follow the flow of control.

### Recommendation
- Centralize event handling in a dedicated module
- Use event delegation to reduce the number of listeners
- Implement a proper MVC or component architecture

```javascript
// Example refactored approach
class GameController {
  constructor(gameState, view) {
    this.gameState = gameState;
    this.view = view;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    document.getElementById('deck').addEventListener('click', this.handleDeckClick.bind(this));
    // Setup other event listeners...
  }
  
  handleDeckClick() {
    if (!this.gameState.isGameStarted) {
      this.startGame();
    } else if (this.gameState.currentPlayerIndex === 0) {
      this.drawCard();
    }
  }
}
```

## 5. Sound System Enhancements

### Current Issue
The sound system creates oscillators for each sound every time they're played, which isn't efficient.

### Recommendation
- Pre-generate and cache sound buffers
- Use audio sprites for better mobile compatibility
- Add option to load actual audio files instead of synthesized sounds

```javascript
// Example refactored approach
class EnhancedSoundSystem {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.soundBuffers = {};
    this.enabled = true;
  }
  
  async initialize() {
    // Create and cache buffers for all sounds
    await Promise.all([
      this.createAndCacheSound('cardPlay'),
      this.createAndCacheSound('yourTurn'),
      // ...other sounds
    ]);
  }
  
  async createAndCacheSound(name) {
    const buffer = await this.generateSoundBuffer(name);
    this.soundBuffers[name] = buffer;
  }
  
  play(name) {
    if (!this.enabled || !this.soundBuffers[name]) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.soundBuffers[name];
    source.connect(this.audioContext.destination);
    source.start(0);
  }
}
```

## 6. UI Rendering Optimization

### Current Issue
The UI is completely re-rendered on every state change in `updateGameDisplay()`, which can be inefficient.

### Recommendation
- Implement incremental updates based on what changed
- Use a virtual DOM approach to only update changed elements
- Split UI into smaller components that render independently

```javascript
// Example refactored approach
class GameView {
  constructor(rootElement) {
    this.root = rootElement;
    this.components = {
      opponents: new OpponentsView(document.getElementById('opponents-area')),
      playerHand: new PlayerHandView(document.getElementById('player-hand')),
      deck: new DeckView(document.getElementById('deck')),
      discardPile: new DiscardPileView(document.getElementById('discard-pile'))
    };
  }
  
  update(gameState, changedProps = null) {
    // If specific props changed, only update those components
    if (changedProps?.includes('players')) {
      this.components.opponents.render(gameState.players.slice(1));
      this.components.playerHand.render(gameState.players[0]);
    }
    
    if (changedProps?.includes('deck') || changedProps?.includes('discardPile')) {
      this.components.deck.render(gameState.deck);
      this.components.discardPile.render(gameState.discardPile);
    }
    
    // If no specific props, update everything
    if (!changedProps) {
      Object.values(this.components).forEach(component => 
        component.render(gameState)
      );
    }
  }
}
```

## 7. Code Organization

### Current Issue
Some files (especially `game.js`) are very large and handle multiple responsibilities.

### Recommendation
- Split large files into smaller, focused modules
- Group related functionality (e.g., all card handling logic together)
- Improve naming to better reflect a file or function's purpose

Proposed file structure:
```
src/
├── core/
│   ├── GameState.js
│   ├── Player.js
│   └── Card.js
├── logic/
│   ├── CardEffects.js
│   ├── TurnManagement.js
│   └── WinConditions.js
├── ai/
│   ├── AIPlayer.js
│   └── AIStrategies.js
├── ui/
│   ├── components/
│   │   ├── OpponentsView.js
│   │   ├── PlayerHandView.js
│   │   └── DeckView.js
│   ├── Renderer.js
│   └── EventHandlers.js
├── utils/
│   ├── Shuffle.js
│   └── AudioManager.js
└── index.js
```

## 8. Error Handling

### Current Issue
The code lacks robust error handling, particularly for asynchronous operations and edge cases.

### Recommendation
- Add proper try/catch blocks for error-prone operations
- Implement graceful fallbacks when features fail
- Add logging for debugging purposes

## 9. Testing

### Current Issue
There are no visible tests for the game logic.

### Recommendation
- Add unit tests for core game logic
- Create integration tests for user interactions
- Implement snapshot testing for UI components

## Next Steps

Prioritize these refactoring tasks based on:
1. How much they affect game stability
2. Visibility to the player
3. Ease of implementation

Start with the Game State management, as this provides the foundation for many other improvements.