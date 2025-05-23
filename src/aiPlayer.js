// AI player logic for Bluey Uno
import { canPlayCard } from './gameRules.js';
import { gameLog } from './utils.js';

/**
 * Determines if an AI player can make a move in the current game state
 * @param {Object} gameState - Current game state
 * @returns {boolean} Whether AI can make a move
 */
function canAIMakeMove(gameState) {
  // Safety check - this function should only be called for AI players
  if (gameState.currentPlayerIndex === 0) {
    gameLog("ERROR: AI turn called for human player (index 0)", 'error');
    return false;
  }
  
  // If ANY player is currently drawing cards, pause the AI until drawing is complete
  if (gameState.isDrawingCards || gameState.requiredDraws > 0) {
    gameLog("AI paused - waiting for player to finish drawing cards...");
    return false;
  }
  
  // Reset drawing flag if it was mistakenly left on for AI players
  if (gameState.isDrawingCards && gameState.currentPlayerIndex !== 0) {
    gameLog("Resetting drawing flag for AI player");
    gameState.isDrawingCards = false;
  }
  
  // Add an extra safety check for game state
  if (!gameState.isGameStarted) {
    gameLog("ERROR: Attempted to play AI turn when game is not started", 'error');
    return false;
  }
  
  return true;
}

/**
 * Finds the best card for AI to play from their hand
 * @param {Array} hand - AI player's hand
 * @param {Object} topDiscard - Top card on discard pile
 * @param {string} currentColor - Current active color
 * @returns {Object} Object with cardIndex or null, and whether card was found
 */
function findBestCardToPlay(hand, topDiscard, currentColor) {
  // Simple strategy: play the first playable card
  // Could be enhanced with more sophisticated AI logic later
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    if (canPlayCard(card, topDiscard, currentColor, hand)) {
      gameLog(`AI found playable card: ${card.color} ${card.value} at index ${i}`);
      return { cardIndex: i, found: true };
    }
  }
  
  gameLog("AI found no playable cards in hand");
  return { cardIndex: null, found: false };
}

/**
 * Determines AI strategy when drawing a card
 * @param {Object} drawnCard - The card that was drawn
 * @param {Object} topDiscard - Top card on discard pile 
 * @param {string} currentColor - Current active color
 * @param {Array} hand - AI player's hand (including the drawn card)
 * @returns {Object} Strategy object with action and cardIndex
 */
function getDrawCardStrategy(drawnCard, topDiscard, currentColor, hand) {
  // Check if drawn card can be played
  if (canPlayCard(drawnCard, topDiscard, currentColor, hand)) {
    gameLog("AI can play the drawn card");
    return { 
      action: 'play', 
      cardIndex: hand.length - 1 // Drawn card is at the end of hand
    };
  } else {
    gameLog("AI cannot play the drawn card - will pass turn");
    return { 
      action: 'pass', 
      cardIndex: null 
    };
  }
}

/**
 * Executes AI turn logic
 * @param {Object} gameState - Current game state
 * @param {Object} dependencies - Object containing required functions
 * @returns {Object} Result object indicating what action was taken
 */
export function executeAITurn(gameState, dependencies) {
  const {
    playCard,
    drawSingleCard,
    nextTurn,
    updateGameDisplay
  } = dependencies;

  gameLog(`AI turn starting. Current player: ${gameState.currentPlayerIndex}`);
  
  // Check if AI can make a move
  if (!canAIMakeMove(gameState)) {
    return { action: 'blocked', reason: 'Cannot make move in current state' };
  }
  
  const player = gameState.players[gameState.currentPlayerIndex];
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  
  // First, try to find a card to play from hand
  const playResult = findBestCardToPlay(player.hand, topDiscard, gameState.currentColor);
  
  if (playResult.found) {
    // Play the card with a delay for better UX
    setTimeout(() => {
      playCard(gameState, gameState.currentPlayerIndex, playResult.cardIndex);
    }, 500);
    
    return { action: 'play', cardIndex: playResult.cardIndex };
  }
  
  // If no card can be played, draw a card
  const drawnCard = drawSingleCard(gameState.currentPlayerIndex);
  gameLog(`AI drew: ${drawnCard.color} ${drawnCard.value}`);
  
  // Determine strategy for the drawn card
  const drawStrategy = getDrawCardStrategy(drawnCard, topDiscard, gameState.currentColor, player.hand);
  
  if (drawStrategy.action === 'play') {
    // Play the drawn card with a delay
    setTimeout(() => {
      playCard(gameState, gameState.currentPlayerIndex, drawStrategy.cardIndex);
    }, 500);
    
    return { action: 'draw_and_play', cardIndex: drawStrategy.cardIndex };
  } else {
    // Cannot play drawn card, pass turn
    nextTurn();
    updateGameDisplay(gameState);
    
    // If it's still AI's turn, continue (but only if no player is drawing cards)
    if (gameState.currentPlayerIndex !== 0 && !gameState.isDrawingCards) {
      setTimeout(() => playAITurn(gameState, dependencies), 1000);
    }
    
    return { action: 'draw_and_pass' };
  }
}

/**
 * Wrapper function for compatibility with existing code
 * @param {Object} gameState - Current game state
 * @param {Object} dependencies - Object containing required functions
 */
export function playAITurn(gameState, dependencies) {
  return executeAITurn(gameState, dependencies);
}