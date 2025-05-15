// Turn management and card effects module for Bluey Uno
import { CARD_VALUES } from './constants.js';
import { getNextPlayerIndex } from './utils.js';
import { gameLog } from './utils.js';
import gameState from './gameState.js';
import eventBus, { GameEvents } from './events.js';
import { checkWinCondition, chooseAIColor } from './gameRules.js';
import { reshuffleDeck } from './deck.js';

/**
 * Handles a player playing a card
 * @param {number} playerIndex - Index of the player playing the card
 * @param {number} cardIndex - Index of the card in the player's hand
 * @returns {boolean} True if the card was successfully played
 */
function playCard(playerIndex, cardIndex) {
  const state = gameState.state;

  // If any player is currently drawing cards, don't allow ANY actions
  if (state.isDrawingCards || state.requiredDraws > 0) {
    // AI players should never try to play while isDrawingCards is true
    // But if they do, just silently prevent it
    
    // Show a message if it's a human player trying to play during drawing
    if (playerIndex === 0) {
      eventBus.emit(GameEvents.INVALID_CARD_PLAY, { 
        cardIndex, 
        message: "You must finish drawing all required cards first!" 
      });
    }
    
    gameLog("Prevented card play while drawing cards in progress");
    return false; // Exit early, don't proceed with card play
  }

  const player = state.players[playerIndex];
  const card = player.hand[cardIndex];
  
  // Get the top card on the discard pile
  const topDiscard = state.discardPile.length > 0 ? 
    state.discardPile[state.discardPile.length - 1] : 
    null;
  
  // Import here to avoid circular dependency
  const { canPlayCard } = require('./gameRules.js');
  
  // Check if card can be played
  if (!canPlayCard(card, topDiscard, state.currentColor, player.hand)) {
    // If human player tries to play an invalid card, trigger feedback
    if (playerIndex === 0) {
      eventBus.emit(GameEvents.INVALID_CARD_PLAY, { cardIndex });
    }
    return false; // Exit early, don't proceed with card play
  }
  
  // Move card from hand to discard pile
  const playedCard = player.hand.splice(cardIndex, 1)[0];
  const updatedDiscardPile = [...state.discardPile, playedCard];
  
  gameLog(`${player.name} plays ${playedCard.color} ${playedCard.value} ${playedCard.emoji}`);
  
  // Update game state with the played card
  gameState.updateState({
    discardPile: updatedDiscardPile
  });
  
  // Emit event for card played
  eventBus.emit(GameEvents.CARD_PLAYED, { 
    playerIndex, 
    player, 
    card: playedCard 
  });
  
  // Check win condition IMMEDIATELY after playing the card
  // Ensure we give the UI a moment to properly remove the card from hand before checking win
  setTimeout(() => {
    if (checkWinCondition(player)) {
      gameState.updateState({
        winningPlayerIndex: playerIndex
      });
      
      gameLog(`${player.name} has played their last card and wins!`);
      eventBus.emit(GameEvents.GAME_ENDED, { winnerIndex: playerIndex });
    }
  }, 100);
  
  // If this was the last card, we know we'll win
  if (player.hand.length === 0) {
    return true;
  }
  
  // Continue with card effects if the game hasn't ended
  if (player.isAI) {
    // Add a delay for AI players before continuing
    setTimeout(() => {
      continueAfterCardPlay(playedCard, false, player, playerIndex);
    }, 1000);
  } else {
    // For human players, continue immediately
    continueAfterCardPlay(playedCard, false, player, playerIndex);
  }
  
  return true;
}

/**
 * Continues game flow after a card is played
 * @param {Object} playedCard - The card that was played
 * @param {boolean} skipNextTurn - Whether to skip the next turn
 * @param {Object} player - The player who played the card
 * @param {number} playerIndex - Index of the player
 */
function continueAfterCardPlay(playedCard, skipNextTurn, player, playerIndex) {
  const state = gameState.state;
  
  // Special handling for wild cards played by human player
  if ((playedCard.value === CARD_VALUES.WILD.STANDARD || 
       playedCard.value === CARD_VALUES.WILD.DRAW_FOUR) && 
      state.currentPlayerIndex === 0) {
    // Set waiting for color choice flag
    gameState.updateState({
      waitingForColorChoice: true
    });
    
    // For Wild Draw 4, set up the pending draw action for the next player
    if (playedCard.value === CARD_VALUES.WILD.DRAW_FOUR) {
      const nextPlayerIndex = getNextPlayerIndex(
        state.currentPlayerIndex, 
        state.direction, 
        state.players.length
      );
      
      gameState.updateState({
        pendingDrawPlayerIndex: nextPlayerIndex,
        pendingDrawCount: 4
      });
    }
    
    // Emit event for color choice required
    eventBus.emit(GameEvents.COLOR_CHOICE_REQUIRED, { 
      playedCard,
      playerIndex 
    });
    
    return;
  } else {
    // Handle all other types of cards
    const cardSkipNextTurn = skipNextTurn || handleSpecialCard(playedCard);
    
    // Check for Uno - automatically call for everyone
    if (player.hand.length === 1 && !player.hasCalledUno) {
      // Update player's UNO status
      const updatedPlayers = [...state.players];
      updatedPlayers[playerIndex].hasCalledUno = true;
      
      gameState.updateState({
        players: updatedPlayers
      });
      
      // Emit UNO called event
      eventBus.emit(GameEvents.UNO_CALLED, { playerIndex });
    }
    
    // Move to next player's turn only if the special card didn't already handle it
    if (!cardSkipNextTurn) {
      nextTurn();
    }
  }
  
  // If it's AI's turn, let them play
  if (gameState.state.currentPlayerIndex !== 0) {
    setTimeout(() => {
      // Import here to avoid circular dependency
      const { playAITurn } = require('./game.js');
      playAITurn();
    }, 1000);
  }
}

/**
 * Handles special card effects
 * @param {Object} card - The card played
 * @returns {boolean} Whether turn advancement should be skipped
 */
function handleSpecialCard(card) {
  const state = gameState.state;
  
  // Always update the current color to the card's color
  if (card.color !== 'wild') {
    gameState.updateState({
      currentColor: card.color
    });
  }
  
  // Flag to indicate if this card handles its own turn advancement
  let skipNextTurn = false;
  
  switch (card.value) {
    case CARD_VALUES.SPECIAL.SKIP:
      // Skip the next player
      const skippedPlayerIndex = getNextPlayerIndex(
        state.currentPlayerIndex, 
        state.direction, 
        state.players.length
      );
      
      gameLog(`${state.players[skippedPlayerIndex].name}'s turn is skipped`);
      
      // Update current player to the skipped player
      gameState.updateState({
        currentPlayerIndex: skippedPlayerIndex
      });
      
      // Emit turn skipped event
      eventBus.emit(GameEvents.TURN_SKIPPED, { 
        playerIndex: skippedPlayerIndex 
      });
      
      skipNextTurn = false; // Let normal turn advancement happen
      break;
      
    case CARD_VALUES.SPECIAL.REVERSE:
      // Reverse direction
      const newDirection = state.direction * -1;
      
      gameState.updateState({
        direction: newDirection
      });
      
      gameLog(`Direction reversed: now playing ${newDirection === 1 ? 'clockwise' : 'counter-clockwise'}`);
      
      // Emit direction changed event
      eventBus.emit(GameEvents.DIRECTION_CHANGED, { direction: newDirection });
      
      // In a 2-player game, reverse acts like skip
      if (state.players.length === 2) {
        const nextPlayerIndex = getNextPlayerIndex(
          state.currentPlayerIndex, 
          newDirection, 
          state.players.length
        );
        
        gameState.updateState({
          currentPlayerIndex: nextPlayerIndex
        });
        
        gameLog("2-player game: Reverse acts like Skip");
      }
      
      skipNextTurn = false; // Let normal turn advancement happen
      break;
      
    case CARD_VALUES.SPECIAL.DRAW_TWO:
      // Next player draws 2 cards and skips their turn
      const nextPlayerIndex = handleDrawCards(2);
      
      // Check for AI-to-AI drawing situation
      const isCurrentPlayerAI = state.players[state.currentPlayerIndex].isAI;
      const isNextPlayerAI = state.players[nextPlayerIndex].isAI;
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
            eventBus.emit(GameEvents.UI_UPDATED);
            
            // Let the next AI player take their turn
            if (gameState.state.currentPlayerIndex !== 0) {
              setTimeout(() => {
                // Import here to avoid circular dependency
                const { playAITurn } = require('./game.js');
                playAITurn();
              }, 500);
            }
          }, 300);
        }
        
        // Since we manually called handleSkipNextPlayer, we should skip the normal nextTurn()
        skipNextTurn = true;
      } else {
        // For human players, we pause the game until they draw all required cards
        // Don't advance the turn yet - it will happen after they finish drawing
        skipNextTurn = true;
      }
      break;
      
    case CARD_VALUES.WILD.STANDARD:
      // Handle wild card color selection
      handleWildCardColor();
      skipNextTurn = false; // Let normal turn advancement happen
      break;
      
    case CARD_VALUES.WILD.DRAW_FOUR:
      // For Wild Draw 4, the player who played it MUST choose color first
      if (state.players[state.currentPlayerIndex].isAI) {
        // AI chooses color based on their hand
        handleWildCardColor();
        
        // Store the next player index who will draw (important: do this BEFORE changing turns)
        const nextPlayerIndex = getNextPlayerIndex(
          state.currentPlayerIndex, 
          state.direction, 
          state.players.length
        );
        
        gameState.updateState({
          pendingDrawPlayerIndex: nextPlayerIndex,
          pendingDrawCount: 4
        });
        
        // Next player draws 4 cards and loses turn
        const nextIdx = handleDrawCards(4);
        
        // Check for AI-to-AI drawing situation
        const isCurrentPlayerAI_WD4 = state.players[state.currentPlayerIndex].isAI;
        const isNextPlayerAI_WD4 = state.players[nextIdx].isAI;
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
              eventBus.emit(GameEvents.UI_UPDATED);
              
              // Let the next AI player take their turn
              if (gameState.state.currentPlayerIndex !== 0) {
                setTimeout(() => {
                  // Import here to avoid circular dependency
                  const { playAITurn } = require('./game.js');
                  playAITurn();
                }, 500);
              }
            }, 300);
          }
          
          // Since we manually called handleSkipNextPlayer, we should skip the normal nextTurn()
          skipNextTurn = true;
        } else {
          // For human players, we pause the game until they draw all required cards
          // Don't advance the turn yet - it will happen after they finish drawing
          skipNextTurn = true;
        }
      } else {
        // Human player plays Wild Draw 4
        // We don't handle any draw logic here
        // It will be handled after the player chooses a color in chooseColor()
        skipNextTurn = true; // Prevent automatic turn advancement
      }
      break;
      
    default:
      // We already set the current color at the beginning of this function
      // for all non-wild cards, so no additional action is needed here
      skipNextTurn = false; // Let normal turn advancement happen
      break;
  }
  
  // Return a flag indicating if we should skip the normal nextTurn() call
  return skipNextTurn;
}

/**
 * Handles skipping the next player's turn
 * @param {number} nextPlayerIndex - Index of the player to skip
 */
function handleSkipNextPlayer(nextPlayerIndex) {
  const state = gameState.state;
  
  // Skip their turn - in 2-player games this means it's your turn again
  if (state.players.length === 2) {
    // In 2-player game, keep the currentPlayerIndex the same 
    // (effectively skipping the other player and returning to you)
    // No change to currentPlayerIndex needed
  } else {
    // For 3+ player games, skip the next player's turn
    // We need to move forward one more position in the current direction
    // without changing the direction itself
    const skipToPlayerIndex = getNextPlayerIndex(
      nextPlayerIndex, 
      state.direction, 
      state.players.length
    );
    
    gameState.updateState({
      currentPlayerIndex: skipToPlayerIndex
    });
  }
}

/**
 * Handles drawing cards for the next player
 * @param {number} numCards - Number of cards to draw
 * @returns {number} Index of the player who's drawing cards
 */
function handleDrawCards(numCards) {
  const state = gameState.state;
  const nextPlayerIndex = getNextPlayerIndex(
    state.currentPlayerIndex, 
    state.direction, 
    state.players.length
  );
  const nextPlayer = state.players[nextPlayerIndex];
  
  gameLog(`handleDrawCards: ${numCards} cards for player ${nextPlayerIndex} (${nextPlayer.name})`);
  
  // Check if we're in an AI-to-AI drawing situation
  const isAItoAIDrawing = state.players[state.currentPlayerIndex].isAI && nextPlayer.isAI;
  
  // Set drawing cards flag (if not AI-to-AI)
  if (!isAItoAIDrawing) {
    gameState.updateState({
      isDrawingCards: true
    });
    gameLog("Setting isDrawingCards to true");
  }
  
  // If the next player is AI, draw cards automatically
  if (nextPlayer.isAI) {
    gameLog(`AI ${nextPlayer.name} is drawing ${numCards} cards automatically`);
    
    // Draw multiple cards for AI
    const updatedPlayers = [...state.players];
    let updatedDeck = [...state.deck];
    
    for (let i = 0; i < numCards; i++) {
      // If deck is empty, reshuffle discard pile
      if (updatedDeck.length === 0) {
        const result = reshuffleDeck(updatedDeck, [...state.discardPile]);
        updatedDeck = result.deck;
        
        // Update discard pile in game state
        gameState.updateState({
          discardPile: result.discardPile
        });
      }
      
      // Draw a card from the deck
      if (updatedDeck.length > 0) {
        const drawnCard = updatedDeck.pop();
        updatedPlayers[nextPlayerIndex].hand.push(drawnCard);
      }
    }
    
    // Update game state with drawn cards
    gameState.updateState({
      players: updatedPlayers,
      deck: updatedDeck,
      isDrawingCards: false // Always make sure drawing flag is cleared for AI
    });
    
    // Emit card drawn event
    eventBus.emit(GameEvents.CARD_DRAWN, { 
      playerIndex: nextPlayerIndex,
      numCards: numCards
    });
    
    // Log the AI drawing for debugging
    gameLog(`AI ${nextPlayer.name} drew ${numCards} cards`);
    
    // For AI-to-AI interactions, add a small delay to ensure UI updates properly
    if (isAItoAIDrawing) {
      // Force a small delay to ensure the UI updates before continuing
      return nextPlayerIndex;
    }
  } else {
    // For human player, set a draw requirement state
    gameLog(`Setting requiredDraws=${numCards} for human player`);
    
    gameState.updateState({
      requiredDraws: numCards
    });
    
    // Save the original player index - ONLY if we're not already handling a draw
    // This prevents overwriting pendingDrawPlayerIndex if already set
    if (state.currentPlayerIndex !== 0 && state.pendingDrawPlayerIndex === null) {
      // Remember the actual current player index to restore it later
      gameState.updateState({
        pendingDrawPlayerIndex: state.currentPlayerIndex
      });
      
      gameLog(`Saving currentPlayerIndex ${state.currentPlayerIndex} to pendingDrawPlayerIndex`);
      
      // Temporarily set current player to human player
      gameState.updateState({
        currentPlayerIndex: 0
      });
      
      gameLog("Setting currentPlayerIndex to 0 (human) temporarily");
    }
    
    // Emit draw requirement event
    eventBus.emit(GameEvents.DRAW_REQUIREMENT, { 
      numCards: numCards,
      message: `Draw ${numCards} cards! Your turn will be skipped.`
    });
    
    // Note: For human players, the isDrawingCards flag will be cleared in handleRequiredDraw
    // when they finish drawing all required cards.
    // Also, handleRequiredDraw will advance to the next player once drawing is complete.
  }
  
  return nextPlayerIndex;
}

/**
 * Handle wild card color selection
 */
function handleWildCardColor() {
  const state = gameState.state;
  
  // For AI player, choose color based on hand
  if (state.currentPlayerIndex !== 0) {
    // AI chooses most frequent color in hand
    const aiColor = chooseAIColor(state.players[state.currentPlayerIndex].hand);
    
    gameState.updateState({
      currentColor: aiColor,
      waitingForColorChoice: false
    });
  }
  // For human player, we'll show color choice UI (handled in UI module)
}

/**
 * Human player chooses color after playing a wild card
 * @param {string} color - The chosen color
 */
function chooseColor(color) {
  const state = gameState.state;
  
  gameState.updateState({
    currentColor: color,
    waitingForColorChoice: false
  });
  
  // Emit color choice made event
  eventBus.emit(GameEvents.COLOR_CHOICE_MADE, { color });
  
  // Get the last played card
  const lastPlayedCard = state.discardPile[state.discardPile.length - 1];
  const wasWildDraw4 = lastPlayedCard.value === CARD_VALUES.WILD.DRAW_FOUR;
  
  // If it was a Wild Draw 4, make the next player draw 4 cards
  if (wasWildDraw4) {
    // Store the next player index who will draw (if not already stored)
    if (state.pendingDrawPlayerIndex === null) {
      const nextPlayerIndex = getNextPlayerIndex(
        state.currentPlayerIndex, 
        state.direction, 
        state.players.length
      );
      
      gameState.updateState({
        pendingDrawPlayerIndex: nextPlayerIndex
      });
    }
    
    // Get the next player who will draw
    const nextPlayerIndex = state.pendingDrawPlayerIndex;
    gameLog(`After Wild Draw 4 color choice, next player (${state.players[nextPlayerIndex].name}) will draw 4 cards`);
    
    // Check if the next player is AI or human
    const isNextPlayerAI = state.players[nextPlayerIndex].isAI;
    
    // Have the next player draw 4 cards
    handleDrawCards(4);
    
    // Handle AI and human players differently:
    if (isNextPlayerAI) {
      gameLog("Wild Draw 4 - AI player needs to draw and be skipped");
      
      // For AI players, skip their turn immediately
      handleSkipNextPlayer(nextPlayerIndex);
      
      // Update the UI immediately
      eventBus.emit(GameEvents.UI_UPDATED);
      
      // If it's AI's turn, let them play after a delay
      if (state.currentPlayerIndex !== 0) {
        gameLog("Starting next AI turn after Wild Draw 4 color choice and skip");
        setTimeout(() => {
          // Import here to avoid circular dependency
          const { playAITurn } = require('./game.js');
          playAITurn();
        }, 1000);
      } 
    } else {
      gameLog("Human player needs to draw 4 cards from Wild Draw 4");
      // For human players, we've already set up the drawing state
      // The turn will be handled automatically when they finish drawing
    }
  } else {
    // For regular Wild cards, just move to next player's turn
    nextTurn();
    
    // Emit UI updated event
    eventBus.emit(GameEvents.UI_UPDATED);
    
    // If it's AI's turn, let them play after a delay
    if (state.currentPlayerIndex !== 0) {
      setTimeout(() => {
        // Import here to avoid circular dependency
        const { playAITurn } = require('./game.js');
        playAITurn();
      }, 1000);
    }
  }
}

/**
 * Handle required draws (Draw 2 or Draw 4)
 * @returns {boolean} True if all required draws are complete
 */
function handleRequiredDraw() {
  const state = gameState.state;
  
  // Decrement the required draws counter
  gameState.updateState({
    requiredDraws: state.requiredDraws - 1
  });
  
  // Emit UI updated event
  eventBus.emit(GameEvents.UI_UPDATED);
  
  // If that was the last required draw, end turn
  if (state.requiredDraws - 1 === 0) {
    // Reset the drawing cards flag
    gameState.updateState({
      isDrawingCards: false
    });
    
    // Before restoration
    gameLog(`Before index restoration - currentPlayerIndex: ${state.currentPlayerIndex}, pendingDrawPlayerIndex: ${state.pendingDrawPlayerIndex}`);
    
    // Restore the original player index if we temporarily changed it
    // This must happen BEFORE we determine the next player
    if (state.pendingDrawPlayerIndex !== null && state.pendingDrawPlayerIndex !== undefined) {
      gameLog(`Restoring player index from ${state.currentPlayerIndex} to ${state.pendingDrawPlayerIndex}`);
      
      gameState.updateState({
        currentPlayerIndex: state.pendingDrawPlayerIndex,
        pendingDrawPlayerIndex: null
      });
    } else {
      gameLog("No player index to restore (pendingDrawPlayerIndex was null)");
    }
    
    // Now that we've restored the current player index, determine who's next
    // For Wild Draw 4, we need to skip the next player (which should be the human player)
    const nextPlayerIndex = getNextPlayerIndex(
      state.currentPlayerIndex, 
      state.direction, 
      state.players.length
    );
    
    // We need to calculate the player after the one being skipped
    const skipToPlayerIndex = getNextPlayerIndex(
      nextPlayerIndex, 
      state.direction, 
      state.players.length
    );
    
    const skipToPlayerName = state.players[skipToPlayerIndex].name;
    
    // Emit draw requirement complete event
    eventBus.emit(GameEvents.DRAW_REQUIREMENT_COMPLETE, {
      message: `Cards drawn! Your turn is skipped. ${skipToPlayerName}'s turn now.`
    });
    
    // For Wild Draw 4, we only need one advancement
    // We've already restored currentPlayerIndex to the person who played the card
    // Now we just need to skip the player who drew cards
    nextTurn(); // Skip the player who drew cards and move to the next player in sequence
    
    gameLog("After turn skip - Current player is now:", state.currentPlayerIndex, 
            `(${state.players[state.currentPlayerIndex].name})`);
    
    // Show a short delay to let the player see their drawn cards
    setTimeout(() => {
      // Emit UI updated event
      eventBus.emit(GameEvents.UI_UPDATED);
      
      // If it's AI's turn, let them play (and make sure this isn't called prematurely)
      if (state.currentPlayerIndex !== 0) {
        gameLog(`Starting AI turn for ${state.players[state.currentPlayerIndex].name} after human finished drawing`);
        setTimeout(() => {
          // Import here to avoid circular dependency
          const { playAITurn } = require('./game.js');
          playAITurn();
        }, 1000);
      } else {
        gameLog(`It's human player's turn (${state.players[0].name}) after the draw and skip cycle`);
      }
    }, 1000);
    
    return true; // Handled the last required draw
  }
  
  return false; // More required draws needed
}

/**
 * Advances the turn to the next player
 */
function nextTurn() {
  const state = gameState.state;
  const previousPlayerIndex = state.currentPlayerIndex;
  const previousPlayerName = state.players[previousPlayerIndex].name;
  
  // Calculate next player index
  const nextPlayerIndex = getNextPlayerIndex(
    state.currentPlayerIndex, 
    state.direction, 
    state.players.length
  );
  
  gameState.updateState({
    currentPlayerIndex: nextPlayerIndex
  });
  
  const nextPlayerName = state.players[nextPlayerIndex].name;
  gameLog(`Turn: ${previousPlayerName} → ${nextPlayerName}`);
  
  // Emit turn changed event
  eventBus.emit(GameEvents.TURN_CHANGED, { 
    previousIndex: previousPlayerIndex,
    currentIndex: nextPlayerIndex
  });
}

/**
 * Draw a single card for the current player
 * @param {number} playerIndex - Index of the player drawing (optional, defaults to current player)
 * @returns {Object} The drawn card
 */
function drawSingleCard(playerIndex = null) {
  const state = gameState.state;
  const drawingPlayerIndex = playerIndex !== null ? playerIndex : state.currentPlayerIndex;
  
  // Check if deck is empty
  let updatedDeck = [...state.deck];
  let updatedDiscardPile = [...state.discardPile];
  
  if (updatedDeck.length === 0) {
    const result = reshuffleDeck(updatedDeck, updatedDiscardPile);
    updatedDeck = result.deck;
    updatedDiscardPile = result.discardPile;
  }
  
  // Draw a card from the deck
  let drawnCard = null;
  if (updatedDeck.length > 0) {
    drawnCard = updatedDeck.pop();
    
    // Add card to player's hand
    const updatedPlayers = [...state.players];
    updatedPlayers[drawingPlayerIndex].hand.push(drawnCard);
    
    // Update game state
    gameState.updateState({
      deck: updatedDeck,
      discardPile: updatedDiscardPile,
      players: updatedPlayers
    });
    
    // Log the card draw
    const playerName = state.players[drawingPlayerIndex].name;
    gameLog(`${playerName} draws a ${drawnCard.color} ${drawnCard.value} ${drawnCard.emoji}`);
    
    // Emit card drawn event
    eventBus.emit(GameEvents.CARD_DRAWN, { 
      playerIndex: drawingPlayerIndex,
      card: drawnCard
    });
  }
  
  return drawnCard;
}

export {
  playCard,
  continueAfterCardPlay,
  handleSpecialCard,
  handleSkipNextPlayer,
  handleDrawCards,
  handleWildCardColor,
  chooseColor,
  handleRequiredDraw,
  nextTurn,
  drawSingleCard
};