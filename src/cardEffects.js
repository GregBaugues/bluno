// Special card effects module for Bluey Uno
import { CARD_VALUES } from './constants.js';
import { getNextPlayerIndex, gameLog } from './utils.js';
import { chooseAIColor } from './gameRules.js';
import { playAITurn } from './aiPlayer.js';

/**
 * Handle Skip card effect
 * @param {Object} gameState - Current game state
 * @param {Function} updateGameDisplay - Function to update the UI
 * @returns {Object} Effect result with skipNextTurn flag
 */
function handleSkipCard(gameState, updateGameDisplay) {
  const skippedPlayerIndex = getNextPlayerIndex(
    gameState.currentPlayerIndex, 
    gameState.direction, 
    gameState.players.length
  );
  const skippedPlayerName = gameState.players[skippedPlayerIndex].name;
  gameLog(`${skippedPlayerName}'s turn is skipped`);
  
  gameState.currentPlayerIndex = skippedPlayerIndex;
  return { skipNextTurn: false }; // Let normal turn advancement happen
}

/**
 * Handle Reverse card effect
 * @param {Object} gameState - Current game state
 * @param {Function} updateGameDisplay - Function to update the UI
 * @returns {Object} Effect result with skipNextTurn flag
 */
function handleReverseCard(gameState, updateGameDisplay) {
  // Reverse direction
  gameState.direction *= -1;
  gameLog(`Direction reversed: now playing ${gameState.direction === 1 ? 'clockwise' : 'counter-clockwise'}`);
  
  // Make sure UI updates when direction changes
  updateGameDisplay(gameState);
  
  // In a 2-player game, reverse acts like skip
  if (gameState.players.length === 2) {
    gameState.currentPlayerIndex = getNextPlayerIndex(
      gameState.currentPlayerIndex,
      gameState.direction,
      gameState.players.length
    );
    gameLog("2-player game: Reverse acts like Skip");
  }
  
  return { skipNextTurn: false }; // Let normal turn advancement happen
}

/**
 * Handle Draw 2 card effect
 * @param {Object} gameState - Current game state
 * @param {Function} handleDrawCards - Function to handle drawing cards
 * @param {Function} handleSkipNextPlayer - Function to skip next player
 * @param {Function} updateGameDisplay - Function to update the UI
 * @returns {Object} Effect result with skipNextTurn flag
 */
function handleDraw2Card(gameState, handleDrawCards, handleSkipNextPlayer, updateGameDisplay, dependencies) {
  // Next player draws 2 cards and skips their turn
  const nextPlayerIndex = handleDrawCards(2);
  
  // Check for AI-to-AI drawing situation
  const isCurrentPlayerAI = gameState.players[gameState.currentPlayerIndex].isAI;
  const isNextPlayerAI = gameState.players[nextPlayerIndex].isAI;
  const isAItoAIDrawing = isCurrentPlayerAI && isNextPlayerAI;
  
  // Handle AI and human players differently:
  if (isNextPlayerAI) {
    // For AI, skip their turn immediately since they've already drawn
    handleSkipNextPlayer(nextPlayerIndex);
    
    // For AI-to-AI interactions, add a small delay to prevent freezing
    if (isAItoAIDrawing) {
      // Allow a small delay for UI updates
      setTimeout(() => {
        // Continue with the normal game flow after delay
        updateGameDisplay(gameState);
        
        // Let the next AI player take their turn
        if (gameState.currentPlayerIndex !== 0) {
          const aiDependencies = {
            playCard: dependencies.playCard,
            drawSingleCard: dependencies.drawSingleCard,
            nextTurn: dependencies.nextTurn,
            updateGameDisplay: dependencies.updateGameDisplay
          };
          setTimeout(() => playAITurn(gameState, aiDependencies), 500);
        }
      }, 300);
    }
    
    // Since we manually called handleSkipNextPlayer, we should skip the normal nextTurn()
    return { skipNextTurn: true };
  } else {
    // For human players, we pause the game until they draw all required cards
    // Don't advance the turn yet - it will happen after they finish drawing
    return { skipNextTurn: true };
  }
}

/**
 * Handle Wild card effect
 * @param {Object} gameState - Current game state
 * @returns {Object} Effect result with skipNextTurn flag
 */
function handleWildCard(gameState) {
  // For AI player, choose color based on hand
  if (gameState.currentPlayerIndex !== 0) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const chosenColor = chooseAIColor(player.hand);
    gameState.currentColor = chosenColor;
    gameState.waitingForColorChoice = false;
  }
  // For human player, color choice UI is handled elsewhere
  
  return { skipNextTurn: false }; // Let normal turn advancement happen
}

/**
 * Handle Wild Draw 4 card effect
 * @param {Object} gameState - Current game state
 * @param {Function} getNextPlayerIndex - Function to get next player index
 * @param {Function} handleDrawCards - Function to handle drawing cards
 * @param {Function} handleSkipNextPlayer - Function to skip next player
 * @param {Function} updateGameDisplay - Function to update the UI
 * @returns {Object} Effect result with skipNextTurn flag
 */
function handleWildDraw4Card(gameState, getNextPlayerIndexFn, handleDrawCards, handleSkipNextPlayer, updateGameDisplay, dependencies) {
  // For Wild Draw 4, the player who played it MUST choose color first
  // For human players, we already handle this in continueAfterCardPlay
  // For AI players, we need to handle the color selection here
  
  if (gameState.players[gameState.currentPlayerIndex].isAI) {
    // AI chooses color based on their hand
    const player = gameState.players[gameState.currentPlayerIndex];
    const chosenColor = chooseAIColor(player.hand);
    gameState.currentColor = chosenColor;
    gameState.waitingForColorChoice = false;
    
    // Store the next player index who will draw (important: do this BEFORE changing turns)
    gameState.pendingDrawPlayerIndex = getNextPlayerIndexFn();
    gameState.pendingDrawCount = 4;
    
    // Next player draws 4 cards and loses turn
    const nextIdx = handleDrawCards(4);
    
    // Check for AI-to-AI drawing situation
    const isCurrentPlayerAI_WD4 = gameState.players[gameState.currentPlayerIndex].isAI;
    const isNextPlayerAI_WD4 = gameState.players[nextIdx].isAI;
    const isAItoAIDrawing_WD4 = isCurrentPlayerAI_WD4 && isNextPlayerAI_WD4;
    
    // Handle AI and human players differently:
    if (isNextPlayerAI_WD4) {
      // For AI, skip their turn immediately since they've already drawn
      handleSkipNextPlayer(nextIdx);
      
      // For AI-to-AI interactions, add a small delay to prevent freezing
      if (isAItoAIDrawing_WD4) {
        // Allow a small delay for UI updates
        setTimeout(() => {
          // Continue with the normal game flow after delay
          updateGameDisplay(gameState);
          
          // Let the next AI player take their turn
          if (gameState.currentPlayerIndex !== 0) {
            const aiDependencies = {
              playCard: dependencies.playCard,
              drawSingleCard: dependencies.drawSingleCard,
              nextTurn: dependencies.nextTurn,
              updateGameDisplay: dependencies.updateGameDisplay
            };
            setTimeout(() => playAITurn(gameState, aiDependencies), 500);
          }
        }, 300);
      }
      
      // Since we manually called handleSkipNextPlayer, we should skip the normal nextTurn()
      return { skipNextTurn: true };
    } else {
      // For human players, we pause the game until they draw all required cards
      // Don't advance the turn yet - it will happen after they finish drawing
      return { skipNextTurn: true };
    }
  } else {
    // Human player plays Wild Draw 4
    // We don't handle any draw logic here
    // It will be handled after the player chooses a color in chooseColor()
    return { skipNextTurn: true }; // Prevent automatic turn advancement
  }
}

/**
 * Main function to handle special card effects
 * @param {Object} card - The special card that was played
 * @param {Object} gameState - Current game state
 * @param {Object} dependencies - Object containing required functions
 * @returns {boolean} Whether to skip the normal nextTurn() call
 */
export function handleSpecialCard(card, gameState, dependencies) {
  const {
    getNextPlayerIndex: getNextPlayerIndexFn,
    handleDrawCards,
    handleSkipNextPlayer,
    updateGameDisplay,
    playAITurn
  } = dependencies;

  // Always update the current color to the card's color
  // This fixes the color not updating when playing special cards
  if (card.color !== 'wild') {
    gameState.currentColor = card.color;
  }
  
  let result = { skipNextTurn: false };
  
  switch (card.value) {
    case 'Skip':
      result = handleSkipCard(gameState, updateGameDisplay);
      break;
      
    case 'Reverse':
      result = handleReverseCard(gameState, updateGameDisplay);
      break;
      
    case 'Draw 2':
      result = handleDraw2Card(gameState, handleDrawCards, handleSkipNextPlayer, updateGameDisplay, dependencies);
      break;
      
    case 'Wild':
      result = handleWildCard(gameState);
      break;
      
    case 'Wild Draw 4':
      result = handleWildDraw4Card(gameState, getNextPlayerIndexFn, handleDrawCards, handleSkipNextPlayer, updateGameDisplay, dependencies);
      break;
      
    default:
      // We already set the current color at the beginning of this function
      // for all non-wild cards, so no additional action is needed here
      result = { skipNextTurn: false }; // Let normal turn advancement happen
      break;
  }
  
  // Return a flag indicating if we should skip the normal nextTurn() call
  return result.skipNextTurn;
}