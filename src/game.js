// Main game controller for Bluey Uno
import { createDeck, shuffleDeck, dealCards, getInitialCard } from './deck.js';
import { createPlayers, sayUno } from './playerManager.js';
import { canPlayCard, playerHasLegalMoves } from './gameRules.js';
import { 
  playCard, 
  drawSingleCard, 
  handleRequiredDraw, 
  nextTurn,
  chooseColor
} from './turnManager.js';
import gameState from './gameState.js';
import eventBus, { GameEvents } from './events.js';
import soundSystem from './sounds.js';
import { gameLog } from './utils.js';

/**
 * Initialize empty game state for display before game starts
 */
function initializeEmptyGame() {
  gameState.initializeEmptyGame();
  eventBus.emit(GameEvents.UI_UPDATED);
}

/**
 * Start a new game
 * @param {number} numPlayers - Number of players (2-4, including human)
 */
function startGame(numPlayers = 2) {
  // Initialize sound system if it's the first game
  soundSystem.initialize();
  
  // Create and shuffle the deck
  const deck = shuffleDeck(createDeck());
  
  // Create players (1 human, 1-3 AI)
  const players = createPlayers(Math.max(2, Math.min(4, numPlayers)));
  
  // Set initial game state
  gameState.updateState({
    deck,
    players,
    currentPlayerIndex: 0,
    direction: 1,
    discardPile: [],
    isGameStarted: true,
    currentColor: null,
    waitingForColorChoice: false,
    pendingDrawPlayerIndex: null,
    pendingDrawCount: 0,
    requiredDraws: 0,
    isDrawingCards: false,
    winningPlayerIndex: undefined
  });
  
  // Deal cards to players
  dealCards(players, deck, 7);
  
  // Place initial card
  const initialCard = getInitialCard(deck);
  gameState.updateState({
    deck,
    discardPile: [initialCard],
    currentColor: initialCard.color
  });
  
  // Update UI
  eventBus.emit(GameEvents.GAME_STARTED);
  eventBus.emit(GameEvents.UI_UPDATED);
  
  // Play "your turn" sound since the player goes first
  soundSystem.play('yourTurn');
  
  // If it's not the player's turn (index 0), let AI make a move
  if (gameState.state.currentPlayerIndex !== 0) {
    setTimeout(playAITurn, 1000);
  }
}

/**
 * Player draws a card
 */
function drawCard() {
  const state = gameState.state;
  
  // Always allow drawing if the player has required draws
  if (state.requiredDraws > 0) {
    // This is fine, we want to allow drawing when required
  } else if (state.currentPlayerIndex !== 0) {
    // Otherwise only human player can use this function when it's their turn
    return;
  }
  
  if (state.waitingForColorChoice) return; // Don't draw if waiting for color choice
  
  // Check if player has legal moves and there are no required draws
  if (state.requiredDraws === 0 && playerHasLegalMoves(state.players[0].hand, 
                                                     state.discardPile[state.discardPile.length - 1], 
                                                     state.currentColor)) {
    // Trigger shake animation on the deck to indicate player should play a card
    eventBus.emit(GameEvents.INVALID_DRAW);
    return; // Don't allow drawing if player has legal moves
  }
  
  // Play a soft "draw" sound
  soundSystem.play('cardPlay');
  
  // Animate the deck for visual feedback
  eventBus.emit(GameEvents.CARD_DRAWN, { animate: true });
  
  // Draw ONE CARD AT A TIME - always just one card per click
  const drawnCard = drawSingleCard(state.currentPlayerIndex);
  
  // For required draws (Draw 2 or Draw 4 cases), handle properly
  if (state.requiredDraws > 0) {
    // Calculate how many cards were originally required (before this draw)
    const originalRequiredDraws = state.requiredDraws + 1;
    // Calculate which card we're drawing in the sequence (for clear logging)
    const currentDrawNumber = originalRequiredDraws - state.requiredDraws;
    
    gameLog(`Drew card ${currentDrawNumber} of ${originalRequiredDraws} required draws`);
    const turnComplete = handleRequiredDraw();
    
    if (!turnComplete) {
      gameLog(`Still need to draw ${state.requiredDraws} more cards`);
      // Return after drawing a required card - player needs to click again for next card
      return;
    } else {
      gameLog("All required cards drawn - turn complete");
    }
  } else {
    // Normal draw case - update display and never auto-play drawn card
    gameLog("Normal draw (not required) - drew one card");
    eventBus.emit(GameEvents.UI_UPDATED);
    
    // Only move to next player's turn if the drawn card can't be played
    const topDiscard = state.discardPile[state.discardPile.length - 1];
    if (!canPlayCard(drawnCard, topDiscard, state.currentColor, state.players[state.currentPlayerIndex].hand)) {
      gameLog("Drawn card can't be played - moving to next player");
      // Move to next player's turn
      nextTurn();
      
      // Update the UI
      eventBus.emit(GameEvents.UI_UPDATED);
      
      // If it's AI's turn, let them play
      if (state.currentPlayerIndex !== 0) {
        gameLog("Starting AI turn after human draw");
        setTimeout(playAITurn, 1000);
      }
    } else {
      gameLog("Drawn card can be played - waiting for player to play it");
    }
    // If card is playable, player must choose to play it manually
  }
}

/**
 * AI makes a turn
 */
function playAITurn() {
  const state = gameState.state;
  gameLog("playAITurn called. Current player:", state.currentPlayerIndex);
  
  // Safety check - this function should only be called for AI players
  if (state.currentPlayerIndex === 0) {
    gameLog("ERROR: playAITurn called for human player (index 0)", "error");
    return;
  }
  
  // If ANY player is currently drawing cards, pause the game until drawing is complete
  // This ensures the proper game flow and turn order
  if (state.isDrawingCards || state.requiredDraws > 0) {
    gameLog("Game paused - waiting for player to finish drawing cards...");
    return;
  }
  
  // Reset drawing flag if it was mistakenly left on for AI players
  if (state.isDrawingCards && state.currentPlayerIndex !== 0) {
    gameLog("Resetting drawing flag for AI player");
    gameState.updateState({
      isDrawingCards: false
    });
  }
  
  // Add an extra safety check for game state
  if (!state.isGameStarted) {
    gameLog("ERROR: Attempted to play AI turn when game is not started", "error");
    return;
  }
  
  const player = state.players[state.currentPlayerIndex];
  const topDiscard = state.discardPile[state.discardPile.length - 1];
  
  // Look for a card to play
  for (let i = 0; i < player.hand.length; i++) {
    const card = player.hand[i];
    if (canPlayCard(card, topDiscard, state.currentColor, player.hand)) {
      // Play the card
      setTimeout(() => playCard(state.currentPlayerIndex, i), 500);
      return;
    }
  }
  
  // If no card can be played, draw a card
  const drawnCard = drawSingleCard(state.currentPlayerIndex);
  
  // Check if drawn card can be played
  if (canPlayCard(drawnCard, topDiscard, state.currentColor, player.hand)) {
    // Play the card (it will be the last card in the hand)
    setTimeout(() => playCard(state.currentPlayerIndex, player.hand.length - 1), 500);
  } else {
    // Move to next player's turn
    nextTurn();
    
    // Update the UI
    eventBus.emit(GameEvents.UI_UPDATED);
    
    // If it's still AI's turn, continue (but only if no player is drawing cards)
    if (state.currentPlayerIndex !== 0 && !state.isDrawingCards) {
      setTimeout(playAITurn, 1000);
    }
  }
}

/**
 * Handle game end
 */
function handleGameEnd() {
  const state = gameState.state;
  
  // Use the stored winning player index if available, otherwise use current player
  const winnerIndex = state.winningPlayerIndex !== undefined ? 
    state.winningPlayerIndex : state.currentPlayerIndex;
  
  const winnerName = state.players[winnerIndex].name;
  const isPlayerWinner = winnerIndex === 0;
  
  // Play victory sound
  soundSystem.play('win');
  
  // Emit game ended event
  eventBus.emit(GameEvents.GAME_ENDED, { 
    winnerIndex,
    winnerName,
    isPlayerWinner
  });
  
  // Game is ended - we'll let them tap on deck to start a new game later
  gameState.updateState({
    isGameStarted: false
  });
}

// Export game functions for other modules
export {
  gameState,
  startGame,
  playCard,
  drawCard,
  sayUno,
  chooseColor,
  initializeEmptyGame,
  playAITurn,
  handleGameEnd
};