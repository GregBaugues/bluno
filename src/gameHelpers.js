// Helper functions for game logic simplification
import { gameLog } from './utils.js';

/**
 * Creates AI dependencies object for consistent usage
 * @param {Function} playCard - Play card function
 * @param {Function} drawSingleCard - Draw single card function  
 * @param {Function} nextTurn - Next turn function
 * @param {Function} updateGameDisplay - Update display function
 * @returns {Object} Dependencies object for AI
 */
export function createAIDependencies(playCard, drawSingleCard, nextTurn, updateGameDisplay) {
  return {
    playCard,
    drawSingleCard,
    nextTurn,
    updateGameDisplay
  };
}

/**
 * Handles post-Wild Draw 4 logic for AI players
 * @param {Object} gameState - Current game state
 * @param {number} nextPlayerIndex - Index of next player 
 * @param {Function} handleSkipNextPlayer - Skip player function
 * @param {Function} updateGameDisplay - Update display function
 * @param {Function} playAITurn - AI turn function
 * @param {Object} aiDependencies - AI dependencies
 */
export function handleWildDraw4ForAI(gameState, nextPlayerIndex, handleSkipNextPlayer, updateGameDisplay, playAITurn, aiDependencies) {
  gameLog("Wild Draw 4 - AI player needs to draw and be skipped");
  
  // For AI players, skip their turn immediately
  handleSkipNextPlayer(nextPlayerIndex);
  
  // Update the UI immediately
  updateGameDisplay(gameState);
  
  // If it's AI's turn, let them play after a delay
  if (gameState.currentPlayerIndex !== 0) {
    gameLog("Starting next AI turn after Wild Draw 4 color choice and skip");
    setTimeout(() => playAITurn(gameState, aiDependencies), 1000);
  }
}

/**
 * Handles post-Wild card logic for regular Wild cards
 * @param {Object} gameState - Current game state
 * @param {Function} nextTurn - Next turn function
 * @param {Function} updateGameDisplay - Update display function
 * @param {Function} playAITurn - AI turn function
 * @param {Object} aiDependencies - AI dependencies
 */
export function handleRegularWildCard(gameState, nextTurn, updateGameDisplay, playAITurn, aiDependencies) {
  // For regular Wild cards, just move to next player's turn
  nextTurn();
  
  // Update the UI
  updateGameDisplay(gameState);
  
  // If it's AI's turn, let them play after a delay
  if (gameState.currentPlayerIndex !== 0) {
    setTimeout(() => playAITurn(gameState, aiDependencies), 1000);
  }
}

/**
 * Determines if a drawn card is playable and logs appropriately
 * @param {Object} drawnCard - The card that was drawn
 * @param {Object} topDiscard - Top card on discard pile
 * @param {string} currentColor - Current active color
 * @param {Array} playerHand - Player's hand
 * @param {Function} canPlayCard - Function to check if card can be played
 * @returns {boolean} Whether the card can be played
 */
export function checkDrawnCardPlayability(drawnCard, topDiscard, currentColor, playerHand, canPlayCard) {
  const isPlayable = canPlayCard(drawnCard, topDiscard, currentColor, playerHand);
  
  if (isPlayable) {
    gameLog("Drawn card can be played - waiting for player to play it");
  } else {
    gameLog("Drawn card can't be played - moving to next player");
  }
  
  return isPlayable;
}

/**
 * Validates game state before allowing card draw
 * @param {Object} gameState - Current game state
 * @param {number} requiredDraws - Number of required draws
 * @param {number} currentPlayerIndex - Current player index
 * @param {boolean} waitingForColorChoice - Whether waiting for color choice
 * @returns {Object} Validation result with isValid and reason
 */
export function validateCardDraw(gameState, requiredDraws, currentPlayerIndex, waitingForColorChoice) {
  // Always allow drawing if the player has required draws
  if (requiredDraws > 0) {
    gameLog(`Allowing draw due to requiredDraws: ${requiredDraws}`);
    return { isValid: true, reason: 'required_draws' };
  }
  
  // Only human player can use this function when it's their turn
  if (currentPlayerIndex !== 0) {
    gameLog('Blocking draw - not human player\'s turn');
    return { isValid: false, reason: 'not_human_turn' };
  }
  
  // Don't draw if waiting for color choice
  if (waitingForColorChoice) {
    return { isValid: false, reason: 'waiting_for_color' };
  }
  
  return { isValid: true, reason: 'normal_draw' };
}

/**
 * Handles end-of-turn AI logic consistently
 * @param {Object} gameState - Current game state
 * @param {Function} playAITurn - AI turn function
 * @param {Object} aiDependencies - AI dependencies
 * @param {string} context - Context for logging
 */
export function handleEndOfTurnAI(gameState, playAITurn, aiDependencies, context = '') {
  if (gameState.currentPlayerIndex !== 0) {
    const logContext = context ? ` ${context}` : '';
    gameLog(`Starting AI turn${logContext}`);
    setTimeout(() => playAITurn(gameState, aiDependencies), 1000);
  }
}