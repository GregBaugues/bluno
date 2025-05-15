import { createDeck, shuffleDeck, dealCards } from './deck.js';
import { createPlayers } from './players.js';
import { renderGame, updateGameDisplay, showWelcomeScreen } from './ui.js';
import soundSystem from './sounds.js';

// Game state
let gameState = {
  deck: [],
  discardPile: [],
  players: [],
  currentPlayerIndex: 0,
  direction: 1, // 1 for clockwise, -1 for counter-clockwise
  isGameStarted: false,
  currentColor: null,
  waitingForColorChoice: false,
  pendingDrawPlayerIndex: null, // Store next player index who will draw (for Wild Draw 4)
  pendingDrawCount: 0, // Number of cards to draw (for Wild Draw 4)
  requiredDraws: 0, // Number of cards player must draw (due to Draw 2 or Draw 4)
  isDrawingCards: false, // Flag to indicate whether a player is currently in the process of drawing cards
  winningPlayerIndex: undefined // Store the index of the player who won by playing their last card
};

// Create empty deck and discard pile for initial display
function initializeEmptyGame() {
  gameState.deck = [{ color: 'blue', value: '0', emoji: '😶' }]; // Just for display
  gameState.discardPile = [];
  
  // Create player with sample cards for initial display
  gameState.players = [{
    name: 'Julia',
    hand: [
      { color: 'red', value: '7', emoji: '😊' },
      { color: 'blue', value: '4', emoji: '😇' },
      { color: 'green', value: '2', emoji: '😁' },
      { color: 'yellow', value: '9', emoji: '😠' },
      { color: 'wild', value: 'Wild', emoji: '🌈' }
    ],
    isAI: false,
    hasCalledUno: false
  }];
  
  gameState.isGameStarted = false;
}

// Start the game
function startGame(numPlayers = 2) { // Player + 1 Bluey character by default, can be 2-4 total
  // Initialize sound system if it's the first game
  soundSystem.initialize();
  
  // Create and shuffle the deck
  gameState.deck = createDeck();
  gameState.deck = shuffleDeck(gameState.deck);
  
  // Create players (1 human, 1-3 AI)
  // Ensure numPlayers is between 2 and 4 (1 human + 1-3 AI)
  const totalPlayers = Math.max(2, Math.min(4, numPlayers));
  gameState.players = createPlayers(totalPlayers);
  
  // Deal cards
  dealCards(gameState.players, gameState.deck, 7);
  
  // Put one card on discard pile
  placeInitialCard();
  
  // Set game as started
  gameState.isGameStarted = true;
  gameState.currentPlayerIndex = 0; // Human player goes first
  gameState.winningPlayerIndex = undefined; // Reset winning player
  
  // Update UI
  updateGameDisplay(gameState);
  
  // Play "your turn" sound since the player goes first
  soundSystem.play('yourTurn');
  
  // If it's not the player's turn (index 0), let AI make a move
  if (gameState.currentPlayerIndex !== 0) {
    setTimeout(playAITurn, 1000);
  }
}

function placeInitialCard() {
  // Get a card from the deck that is not a special card
  let initialCardIndex;
  do {
    initialCardIndex = Math.floor(Math.random() * gameState.deck.length);
  } while (
    gameState.deck[initialCardIndex].value === 'Skip' ||
    gameState.deck[initialCardIndex].value === 'Reverse' ||
    gameState.deck[initialCardIndex].value === 'Draw 2' ||
    gameState.deck[initialCardIndex].value === 'Wild' ||
    gameState.deck[initialCardIndex].value === 'Wild Draw 4'
  );
  
  // Move the card from deck to discard pile
  const initialCard = gameState.deck.splice(initialCardIndex, 1)[0];
  gameState.discardPile.push(initialCard);
  gameState.currentColor = initialCard.color;
}

// Player plays a card
function playCard(gameState, playerIndex, cardIndex) {
  // If any player is currently drawing cards, don't allow ANY actions
  // This completely pauses the game until the drawing is complete
  if (gameState.isDrawingCards || gameState.requiredDraws > 0) {
    // AI players should never try to play while isDrawingCards is true
    // But if they do, just silently prevent it
    
    // Show a message if it's a human player trying to play during drawing
    if (playerIndex === 0) {
      window.dispatchEvent(new CustomEvent('invalidCardPlay', { 
        detail: { 
          cardIndex, 
          message: "You must finish drawing all required cards first!" 
        } 
      }));
    }
    
    console.log("Prevented card play while drawing cards in progress");
    return; // Exit early, don't proceed with card play
  }
  
  const player = gameState.players[playerIndex];
  const card = player.hand[cardIndex];
  
  // Handle case when there's no discard pile yet
  const topDiscard = gameState.discardPile.length > 0 ? 
    gameState.discardPile[gameState.discardPile.length - 1] : 
    null;
  
  
  // Check if card can be played (pass the player's hand for Wild Draw 4 validation)
  if (!canPlayCard(card, topDiscard, gameState.currentColor, player.hand)) {
    // If human player tries to play an invalid card, trigger shake animation
    if (playerIndex === 0) {
      // For Wild Draw 4, provide specific feedback if player has playable cards
        window.dispatchEvent(new CustomEvent('invalidCardPlay', { detail: { cardIndex } }));
    }
    return; // Exit early, don't proceed with card play
  }
  
  // Card is valid, proceed with playing it
  
  // Play the card play sound
  soundSystem.play('cardPlay');
  
  // Move card from hand to discard pile
  const playedCard = player.hand.splice(cardIndex, 1)[0];
  gameState.discardPile.push(playedCard);
  
  // Trim discard pile to keep only the 10 most recent cards when it exceeds 10 cards
  if (gameState.discardPile.length > 10) {
    gameState.discardPile = gameState.discardPile.slice(-10);
  }
  
  // Log the card play to console
  console.log(`${player.name} plays ${playedCard.color} ${playedCard.value} ${playedCard.emoji}`);
  
  // Update UI to show the played card
  updateGameDisplay(gameState);

  // Check win condition IMMEDIATELY after playing the card
  // As soon as any player plays their last card, they win, regardless of card effects
  if (player.hand.length === 0) {
    // Store the winner and end the game immediately
    gameState.winningPlayerIndex = playerIndex;
    console.log(`${player.name} has played their last card and wins!`);
    handleGameEnd();
    return;
  }
  
  // AI players need a pause after playing their card before continuing
  if (player.isAI) {
    // Add a 1 second pause for AI players after they play their card
    setTimeout(() => {
      continueAfterCardPlay(playedCard, false, player, playerIndex);
    }, 1000);
    return;
  }
  
  // For human players, continue immediately
  continueAfterCardPlay(playedCard, false, player, playerIndex);
}

// Helper function to continue game flow after a card is played
function continueAfterCardPlay(playedCard, skipNextTurn, player, playerIndex) {
  // Special handling for wild cards played by human player
  if ((playedCard.value === 'Wild' || playedCard.value === 'Wild Draw 4') && 
      gameState.currentPlayerIndex === 0) {
    // Set waiting for color choice flag
    gameState.waitingForColorChoice = true;
    
    // For Wild Draw 4, set up the pending draw action for the next player
    if (playedCard.value === 'Wild Draw 4') {
      // Store the next player index who will draw
      gameState.pendingDrawPlayerIndex = getNextPlayerIndex();
      gameState.pendingDrawCount = 4;
    }
    
    // Show color choice UI
    updateGameDisplay(gameState);
    return;
  } else {
    // Handle all other types of cards
    const cardSkipNextTurn = skipNextTurn || handleSpecialCard(playedCard);
    
    // Check for Uno - automatically call for everyone
    if (player.hand.length === 1 && !player.hasCalledUno) {
      player.hasCalledUno = true;
      // Play the UNO call sound
      soundSystem.play('unoCall');
    }
    
    // Move to next player's turn only if the special card didn't already handle it
    if (!cardSkipNextTurn) {
      nextTurn();
    }
    
    // Update the UI
    updateGameDisplay(gameState);
  }
  
  // If it's AI's turn, let them play
  if (gameState.currentPlayerIndex !== 0) {
    setTimeout(playAITurn, 1000);
  }
}

// Check if a card can be played
function canPlayCard(card, topDiscard, currentColor, playerHand) {
  // Regular Wild cards can always be played
  if (card.value === 'Wild') {
    return true;
  }
  
  // Wild Draw 4 can only be played if the player has no cards matching the current color or value
  if (card.value === 'Wild Draw 4') {
    // If playerHand is provided (for validation), check if player has playable cards
    if (playerHand && topDiscard) {
      // Check if player has any cards matching the current color or the value of the top card
      const hasPlayableCard = playerHand.some(handCard => 
        handCard !== card && (
          handCard.color === currentColor || // Matching color
          (handCard.value === topDiscard.value && handCard.value !== 'Wild' && handCard.value !== 'Wild Draw 4') // Matching value (excluding wilds)
        )
      );
      
      // Wild Draw 4 can only be played if player has no playable cards
      return !hasPlayableCard;
    }
    
    // If no hand is provided or no top discard (backward compatibility), allow the play
    return true;
  }
  
  // If there's no discard pile yet, any card can be played
  if (!topDiscard) {
    return true;
  }
  
  // If we're waiting for an implicit color choice, any colored card can be played
  // Wild card color selection is now handled manually
  
  // Card can be played if it matches the current color
  if (card.color === currentColor) {
    return true;
  }
  
  // Card can be played if it matches the value of the top card
  if (card.value === topDiscard.value) {
    return true;
  }
  
  return false;
}

// Helper functions for special card handling

// Get the next player index based on current player and direction
function getNextPlayerIndex() {
  let nextIndex = (gameState.currentPlayerIndex + gameState.direction) % gameState.players.length;
  if (nextIndex < 0) {
    nextIndex += gameState.players.length;
  }
  return nextIndex;
}

// Handle drawing cards for the next player
function handleDrawCards(numCards) {
  const nextPlayerIndex = getNextPlayerIndex();
  const nextPlayer = gameState.players[nextPlayerIndex];
  
  console.log(`handleDrawCards: ${numCards} cards for player ${nextPlayerIndex} (${nextPlayer.name})`);
  
  // Check if we're in an AI-to-AI drawing situation
  const isAItoAIDrawing = gameState.players[gameState.currentPlayerIndex].isAI && nextPlayer.isAI;
  
  // Set drawing cards flag (if not AI-to-AI)
  if (!isAItoAIDrawing) {
    gameState.isDrawingCards = true;
    console.log("Setting isDrawingCards to true");
  }
  
  // If the next player is AI, draw cards automatically
  if (nextPlayer.isAI) {
    console.log(`AI ${nextPlayer.name} is drawing ${numCards} cards automatically`);
    
    // Draw multiple cards for AI
    for (let i = 0; i < numCards; i++) {
      drawSingleCard(nextPlayerIndex);
    }
    
    // Update UI to show the AI's new cards
    updateGameDisplay(gameState);
    
    // Play a sound effect to indicate cards were drawn
    soundSystem.play('cardPlay');
    
    // Log the AI drawing for debugging
    console.log(`AI ${nextPlayer.name} drew ${numCards} cards`);
    
    // Always make sure drawing flag is cleared for AI
    gameState.isDrawingCards = false;
    
    // For AI-to-AI interactions, add a small delay to ensure UI updates properly
    if (isAItoAIDrawing) {
      // Force a small delay to ensure the UI updates before continuing
      return nextPlayerIndex;
    }
  } else {
    // For human player, set a draw requirement state
    console.log(`Setting requiredDraws=${numCards} for human player`);
    gameState.requiredDraws = numCards;
    
    // Save the original player index - ONLY if we're not already handling a draw
    // This prevents overwriting pendingDrawPlayerIndex if already set
    if (gameState.currentPlayerIndex !== 0 && gameState.pendingDrawPlayerIndex === null) {
      // Remember the actual current player index to restore it later
      gameState.pendingDrawPlayerIndex = gameState.currentPlayerIndex;
      console.log(`Saving currentPlayerIndex ${gameState.currentPlayerIndex} to pendingDrawPlayerIndex`);
      
      // Temporarily set current player to human player
      gameState.currentPlayerIndex = 0;
      console.log("Setting currentPlayerIndex to 0 (human) temporarily");
    }
    
    // Update the UI to show the drawing state
    updateGameDisplay(gameState);
    
    // Show a message indicating the player needs to draw cards and will lose their turn
    window.dispatchEvent(new CustomEvent('showDrawRequirement', { 
      detail: { 
        numCards: numCards,
        message: `Draw ${numCards} cards! Your turn will be skipped.`
      }
    }));
    
    // Note: For human players, the isDrawingCards flag will be cleared in handleRequiredDraw
    // when they finish drawing all required cards.
    // Also, handleRequiredDraw will advance to the next player once drawing is complete.
  }
  
  return nextPlayerIndex;
}

// Handle skipping the next player's turn
function handleSkipNextPlayer(nextPlayerIndex) {
  // Skip their turn - in 2-player games this means it's your turn again
  if (gameState.players.length === 2) {
    // In 2-player game, keep the currentPlayerIndex the same 
    // (effectively skipping the other player and returning to you)
    // No change to currentPlayerIndex needed
  } else {
    // For 3+ player games, skip the next player's turn
    // We need to move forward one more position in the current direction
    // without changing the direction itself
    gameState.currentPlayerIndex = (nextPlayerIndex + gameState.direction) % gameState.players.length;
    if (gameState.currentPlayerIndex < 0) {
      gameState.currentPlayerIndex += gameState.players.length;
    }
  }
}

// Handle wild card color selection
function handleWildCardColor() {
  // For AI player, choose color based on hand
  if (gameState.currentPlayerIndex !== 0) {
    // AI chooses most frequent color in hand
    chooseAIColor();
  }
  // For human player, we'll show color choice UI (handled in playCard function)
}

// Handle special cards
function handleSpecialCard(card) {
  // Always update the current color to the card's color
  // This fixes the color not updating when playing special cards
  if (card.color !== 'wild') {
    gameState.currentColor = card.color;
  }
  
  // Flag to indicate if this card handles its own turn advancement
  let skipNextTurn = false;
  
  switch (card.value) {
    case 'Skip':
      // Skip the next player
      const skippedPlayerIndex = getNextPlayerIndex();
      const skippedPlayerName = gameState.players[skippedPlayerIndex].name;
      console.log(`${skippedPlayerName}'s turn is skipped`);
      
      gameState.currentPlayerIndex = skippedPlayerIndex;
      skipNextTurn = false; // Let normal turn advancement happen
      break;
      
    case 'Reverse':
      // Reverse direction
      gameState.direction *= -1;
      console.log(`Direction reversed: now playing ${gameState.direction === 1 ? 'clockwise' : 'counter-clockwise'}`);
      
      // Make sure UI updates when direction changes
      updateGameDisplay(gameState);
      // In a 2-player game, reverse acts like skip
      if (gameState.players.length === 2) {
        gameState.currentPlayerIndex = getNextPlayerIndex();
        console.log("2-player game: Reverse acts like Skip");
      }
      skipNextTurn = false; // Let normal turn advancement happen
      break;
      
    case 'Draw 2':
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
              setTimeout(playAITurn, 500);
            }
          }, 300);
        }
        
        // Since we manually called handleSkipNextPlayer, we should skip the normal nextTurn()
        // to avoid skipping two turns
        skipNextTurn = true;
      } else {
        // For human players, we pause the game until they draw all required cards
        // Don't advance the turn yet - it will happen after they finish drawing
        skipNextTurn = true;
      }
      break;
      
    case 'Wild':
      // Handle wild card color selection
      handleWildCardColor();
      skipNextTurn = false; // Let normal turn advancement happen
      break;
      
    case 'Wild Draw 4':
      // For Wild Draw 4, the player who played it MUST choose color first
      // For human players, we already handle this in continueAfterCardPlay
      // For AI players, we need to handle the color selection here
      
      if (gameState.players[gameState.currentPlayerIndex].isAI) {
        // AI chooses color based on their hand
        handleWildCardColor();
        
        // Store the next player index who will draw (important: do this BEFORE changing turns)
        gameState.pendingDrawPlayerIndex = getNextPlayerIndex();
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
                setTimeout(playAITurn, 500);
              }
            }, 300);
          }
          
          // Since we manually called handleSkipNextPlayer, we should skip the normal nextTurn()
          // to avoid skipping two turns
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

// Choose color for AI
function chooseAIColor() {
  const player = gameState.players[gameState.currentPlayerIndex];
  const colorCounts = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0
  };
  
  // Count colors in hand
  player.hand.forEach(card => {
    if (card.color !== 'wild') {
      colorCounts[card.color]++;
    }
  });
  
  // Find most frequent color
  let maxCount = 0;
  let chosenColor = 'red'; // Default if no colored cards in hand
  
  for (const color in colorCounts) {
    if (colorCounts[color] > maxCount) {
      maxCount = colorCounts[color];
      chosenColor = color;
    }
  }
  
  gameState.currentColor = chosenColor;
  gameState.waitingForColorChoice = false;
}

// Show color choice UI for human player
function showColorChoiceUI() {
  // This is handled directly in UI.js when gameState.waitingForColorChoice is true
  gameState.waitingForColorChoice = true;
  updateGameDisplay(gameState);
}

// Human player chooses color after playing a wild card
function chooseColor(gameStateParam, color) {
  // For compatibility - if only one parameter passed, it's the color
  if (color === undefined && typeof gameStateParam === 'string') {
    color = gameStateParam;
    gameStateParam = gameState;
  }
  
  // Use either passed gameState or global gameState
  const gs = gameStateParam || gameState;
  
  gs.currentColor = color;
  gs.waitingForColorChoice = false;
  
  // Get the last played card
  const lastPlayedCard = gs.discardPile[gs.discardPile.length - 1];
  const wasWildDraw4 = lastPlayedCard.value === 'Wild Draw 4';
  
  // If it was a Wild Draw 4, make the next player draw 4 cards
  if (wasWildDraw4) {
    // Store the next player index who will draw (if not already stored)
    if (gs.pendingDrawPlayerIndex === null) {
      gs.pendingDrawPlayerIndex = getNextPlayerIndex();
    }
    
    // Get the next player who will draw
    const nextPlayerIndex = gs.pendingDrawPlayerIndex;
    console.log(`After Wild Draw 4 color choice, next player (${gs.players[nextPlayerIndex].name}) will draw 4 cards`);
    
    // Check if the next player is AI or human
    const isNextPlayerAI = gs.players[nextPlayerIndex].isAI;
    
    // Have the next player draw 4 cards
    handleDrawCards(4);
    
    // Handle AI and human players differently:
    if (isNextPlayerAI) {
      console.log("Wild Draw 4 - AI player needs to draw and be skipped");
      
      // For AI players, skip their turn immediately
      handleSkipNextPlayer(nextPlayerIndex);
      
      // Update the UI immediately
      updateGameDisplay(gs);
      
      // If it's AI's turn, let them play after a delay
      if (gs.currentPlayerIndex !== 0) {
        console.log("Starting next AI turn after Wild Draw 4 color choice and skip");
        setTimeout(playAITurn, 1000);
      } 
    } else {
      console.log("Human player needs to draw 4 cards from Wild Draw 4");
      // For human players, we've already set up the drawing state
      // The turn will be handled automatically when they finish drawing
    }
  } else {
    // For regular Wild cards, just move to next player's turn
    nextTurn();
    
    // Update the UI
    updateGameDisplay(gs);
    
    // If it's AI's turn, let them play after a delay
    if (gs.currentPlayerIndex !== 0) {
      setTimeout(playAITurn, 1000);
    }
  }
}

// Draw a single card and add it to player's hand
function drawSingleCard(playerIndex) {
  // Check if deck is empty
  if (gameState.deck.length === 0) {
    reshuffleDeck();
  }
  
  // Draw a card from the deck
  const drawnCard = gameState.deck.pop();
  gameState.players[playerIndex].hand.push(drawnCard);
  
  // Log the card draw to console
  const playerName = gameState.players[playerIndex].name;
  console.log(`${playerName} draws a ${drawnCard.color} ${drawnCard.value} ${drawnCard.emoji}`);
  
  return drawnCard;
}

// Animate the deck for a card draw effect
function animateDeckDraw() {
  const deck = document.getElementById('deck');
  if (deck) {
    // Quick animation to show the card is being drawn
    deck.animate(
      [
        { transform: 'translateY(0) rotate(0deg)' },
        { transform: 'translateY(-20px) rotate(-5deg)' },
        { transform: 'translateY(0) rotate(0deg)' }
      ],
      {
        duration: 400,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
      }
    );
  }
}

// Check if player has any legal moves
function playerHasLegalMoves(playerIndex) {
  const player = gameState.players[playerIndex];
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  
  // Check each card in hand to see if any can be played
  for (let i = 0; i < player.hand.length; i++) {
    if (canPlayCard(player.hand[i], topDiscard, gameState.currentColor, player.hand)) {
      return true;
    }
  }
  
  return false;
}

// Handle required draws (Draw 2 or Draw 4)
function handleRequiredDraw() {
  // Decrement the required draws counter
  gameState.requiredDraws--;
  
  // Update UI to show the updated counter
  updateGameDisplay(gameState);
  
  // If that was the last required draw, end turn
  if (gameState.requiredDraws === 0) {
    // Play a sound to indicate all required cards have been drawn
    setTimeout(() => {
      soundSystem.play('cardPlay');
    }, 300);
    
    // Reset the drawing cards flag
    gameState.isDrawingCards = false;
    
    // DEBUG: Before restoration
    console.log(`Before index restoration - currentPlayerIndex: ${gameState.currentPlayerIndex}, pendingDrawPlayerIndex: ${gameState.pendingDrawPlayerIndex}`);
    
    // For Wild Draw 4, the player's turn should be skipped
    // First, we need to restore the currentPlayerIndex to the AI player who played the Wild Draw 4
    // Then we need to properly skip the human player's turn
    
    // Restore the original player index if we temporarily changed it
    // This must happen BEFORE we determine the next player
    if (gameState.pendingDrawPlayerIndex !== null && gameState.pendingDrawPlayerIndex !== undefined) {
      console.log(`Restoring player index from ${gameState.currentPlayerIndex} to ${gameState.pendingDrawPlayerIndex}`);
      gameState.currentPlayerIndex = gameState.pendingDrawPlayerIndex;
      gameState.pendingDrawPlayerIndex = null;
    } else {
      console.log("No player index to restore (pendingDrawPlayerIndex was null)");
    }
    
    // Now that we've restored the current player index, determine who's next
    // For Wild Draw 4, we need to skip the next player (which should be the human player)
    const nextPlayerIndex = getNextPlayerIndex();
    // We need to calculate the player after the one being skipped
    const skipToPlayerIndex = (nextPlayerIndex + gameState.direction) % gameState.players.length;
    const skipToPlayerName = gameState.players[skipToPlayerIndex < 0 ? skipToPlayerIndex + gameState.players.length : skipToPlayerIndex].name;
    
    // Show a message indicating all required cards have been drawn and turn is skipped
    window.dispatchEvent(new CustomEvent('drawRequirementComplete', {
      detail: { 
        message: `Cards drawn! Your turn is skipped. ${skipToPlayerName}'s turn now.` 
      }
    }));
    
    // We need TWO turn advancements for Draw 2/Draw 4:
    // 1. First advance from the player who played the card to you (already happened)
    // 2. Second advance from you to the next player (needs to happen now)
    
    // SKIP: By default, after required draws, the person drawing should NOT play.
    // For Wild Draw 4, after the player finishes drawing, their turn is skipped
    console.log(`Turn will now be skipped for ${gameState.players[gameState.currentPlayerIndex].name}`);
    
    // For Wild Draw 4, we only need one advancement
    // We've already restored currentPlayerIndex to the person who played the card
    // Now we just need to skip the player who drew cards
    nextTurn(); // Skip the player who drew cards and move to the next player in sequence
    
    console.log("After turn skip - Current player is now:", gameState.currentPlayerIndex, 
                `(${gameState.players[gameState.currentPlayerIndex].name})`);
    
    // Show a short delay to let the player see their drawn cards
    setTimeout(() => {
      // Update the UI
      updateGameDisplay(gameState);
      
      // If it's AI's turn, let them play (and make sure this isn't called prematurely)
      if (gameState.currentPlayerIndex !== 0) {
        console.log(`Starting AI turn for ${gameState.players[gameState.currentPlayerIndex].name} after human finished drawing`);
        setTimeout(playAITurn, 1000);
      } else {
        console.log(`It's human player's turn (${gameState.players[0].name}) after the draw and skip cycle`);
      }
    }, 1000);
    
    return true; // Handled the last required draw
  }
  
  return false; // More required draws needed
}

// Player draws a card
function drawCard() {
  // Always allow drawing if the player has required draws
  if (gameState.requiredDraws > 0) {
    // This is fine, we want to allow drawing when required
  } else if (gameState.currentPlayerIndex !== 0) {
    // Otherwise only human player can use this function when it's their turn
    return;
  }
  
  if (gameState.waitingForColorChoice) return; // Don't draw if waiting for color choice
  
  // Check if player has legal moves and there are no required draws
  if (gameState.requiredDraws === 0 && playerHasLegalMoves(0)) {
    // Trigger shake animation on the deck to indicate player should play a card
    window.dispatchEvent(new CustomEvent('invalidDraw'));
    return; // Don't allow drawing if player has legal moves
  }
  
  // Play a soft "draw" sound
  soundSystem.play('cardPlay');
  
  // Visual feedback - animate the deck
  animateDeckDraw();
  
  // Draw ONE CARD AT A TIME - always just one card per click
  const drawnCard = drawSingleCard(gameState.currentPlayerIndex);
  
  // For required draws (Draw 2 or Draw 4 cases), handle properly
  if (gameState.requiredDraws > 0) {
    // Calculate how many cards were originally required (before this draw)
    const originalRequiredDraws = gameState.requiredDraws + 1;
    // Calculate which card we're drawing in the sequence (for clear logging)
    const currentDrawNumber = originalRequiredDraws - gameState.requiredDraws;
    
    console.log(`Drew card ${currentDrawNumber} of ${originalRequiredDraws} required draws`);
    const turnComplete = handleRequiredDraw();
    
    if (!turnComplete) {
      console.log(`Still need to draw ${gameState.requiredDraws} more cards`);
      // Return after drawing a required card - player needs to click again for next card
      return;
    } else {
      console.log("All required cards drawn - turn complete");
    }
  } else {
    // Normal draw case - update display and never auto-play drawn card
    console.log("Normal draw (not required) - drew one card");
    updateGameDisplay(gameState);
    
    // Only move to next player's turn if the drawn card can't be played
    const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
    const player = gameState.players[gameState.currentPlayerIndex];
    if (!canPlayCard(drawnCard, topDiscard, gameState.currentColor, player.hand)) {
      console.log("Drawn card can't be played - moving to next player");
      // Move to next player's turn
      nextTurn();
      
      // Update the UI
      updateGameDisplay(gameState);
      
      // If it's AI's turn, let them play
      if (gameState.currentPlayerIndex !== 0) {
        console.log("Starting AI turn after human draw");
        setTimeout(playAITurn, 1000);
      }
    } else {
      console.log("Drawn card can be played - waiting for player to play it");
    }
    // If card is playable, player must choose to play it manually
  }
}

// AI makes a turn
function playAITurn() {
  console.log("playAITurn called. Current player:", gameState.currentPlayerIndex);
  
  // Safety check - this function should only be called for AI players
  if (gameState.currentPlayerIndex === 0) {
    console.error("ERROR: playAITurn called for human player (index 0)");
    return;
  }
  
  // If ANY player is currently drawing cards, pause the game until drawing is complete
  // This ensures the proper game flow and turn order
  if (gameState.isDrawingCards || gameState.requiredDraws > 0) {
    console.log("Game paused - waiting for player to finish drawing cards...");
    return;
  }
  
  // Reset drawing flag if it was mistakenly left on for AI players
  if (gameState.isDrawingCards && gameState.currentPlayerIndex !== 0) {
    console.log("Resetting drawing flag for AI player");
    gameState.isDrawingCards = false;
  }
  
  // Add an extra safety check for game state
  if (!gameState.isGameStarted) {
    console.error("ERROR: Attempted to play AI turn when game is not started");
    return;
  }
  
  const player = gameState.players[gameState.currentPlayerIndex];
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  
  // Look for a card to play
  for (let i = 0; i < player.hand.length; i++) {
    const card = player.hand[i];
    if (canPlayCard(card, topDiscard, gameState.currentColor, player.hand)) {
      // Play the card
      setTimeout(() => playCard(gameState, gameState.currentPlayerIndex, i), 500);
      return;
    }
  }
  
  // If no card can be played, draw a card
  const drawnCard = drawSingleCard(gameState.currentPlayerIndex);
  
  // Check if drawn card can be played
  if (canPlayCard(drawnCard, topDiscard, gameState.currentColor, player.hand)) {
    // Play the card
    setTimeout(() => playCard(gameState, gameState.currentPlayerIndex, player.hand.length - 1), 500);
  } else {
    // Move to next player's turn
    nextTurn();
    
    // Update the UI
    updateGameDisplay(gameState);
    
    // If it's still AI's turn, continue (but only if no player is drawing cards)
    if (gameState.currentPlayerIndex !== 0 && !gameState.isDrawingCards) {
      setTimeout(playAITurn, 1000);
    }
  }
}

// Move to next player's turn
function nextTurn() {
  const previousPlayerIndex = gameState.currentPlayerIndex;
  const previousPlayerName = gameState.players[previousPlayerIndex].name;
  
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + gameState.direction) % gameState.players.length;
  if (gameState.currentPlayerIndex < 0) {
    gameState.currentPlayerIndex += gameState.players.length;
  }
  
  const nextPlayerName = gameState.players[gameState.currentPlayerIndex].name;
  console.log(`Turn: ${previousPlayerName} → ${nextPlayerName}`);
  
  // Play your turn sound if it's the player's turn
  if (gameState.currentPlayerIndex === 0) {
    soundSystem.play('yourTurn');
  } 
  // Play Bingo sound if it's Bingo's turn
  else if (gameState.players[gameState.currentPlayerIndex].name === 'Bingo') {
    soundSystem.play('bingo');
  }
  // Play Bluey sound if it's Bluey's turn
  else if (gameState.players[gameState.currentPlayerIndex].name === 'Bluey') {
    soundSystem.play('bluey');
  }
  // Play Dad sound if it's Dad's turn
  else if (gameState.players[gameState.currentPlayerIndex].name === 'Dad') {
    soundSystem.play('dad');
  }
}

// Reshuffle discard pile into deck
function reshuffleDeck() {
  // Keep the top card of the discard pile
  const topCard = gameState.discardPile.pop();
  
  // Move all other cards to the deck and shuffle
  gameState.deck = shuffleDeck([...gameState.discardPile]);
  
  // Clear discard pile and put top card back
  gameState.discardPile = [topCard];
}

// Player says Uno
function sayUno() {
  const player = gameState.players[0]; // Human player
  player.hasCalledUno = true;
  
  // Play the UNO call sound
  soundSystem.play('unoCall');
  
  // Update UI
  updateGameDisplay(gameState);
}

// Handle game end
function handleGameEnd() {
  // Use the stored winning player index if available, otherwise use current player
  const winnerIndex = gameState.winningPlayerIndex !== undefined ? 
    gameState.winningPlayerIndex : gameState.currentPlayerIndex;
  const winnerName = gameState.players[winnerIndex].name;
  const isPlayerWinner = winnerIndex === 0;
  
  // Play victory sound
  soundSystem.play('win');
  
  // Create a fun victory screen
  const victoryScreen = document.createElement('div');
  victoryScreen.style.position = 'fixed';
  victoryScreen.style.top = '0';
  victoryScreen.style.left = '0';
  victoryScreen.style.width = '100%';
  victoryScreen.style.height = '100%';
  victoryScreen.style.backgroundColor = isPlayerWinner ? 'rgba(255, 215, 0, 0.8)' : 'rgba(100, 149, 237, 0.8)';
  victoryScreen.style.display = 'flex';
  victoryScreen.style.flexDirection = 'column';
  victoryScreen.style.justifyContent = 'center';
  victoryScreen.style.alignItems = 'center';
  victoryScreen.style.zIndex = '2000';
  
  // Winner announcement
  const winnerMessage = document.createElement('h1');
  winnerMessage.style.fontSize = '40px';
  winnerMessage.style.color = 'white';
  winnerMessage.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  winnerMessage.style.marginBottom = '20px';
  winnerMessage.style.textAlign = 'center';
  winnerMessage.style.padding = '0 20px';
  
  // Add emojis and different messages based on who won
  if (isPlayerWinner) {
    winnerMessage.innerHTML = '🎉 YOU WIN! 🎉<br>HOORAY!';
  } else {
    winnerMessage.innerHTML = `${winnerName} wins!<br>Try again!`;
  }
  
  // Add celebration emojis that float up
  for (let i = 0; i < 20; i++) {
    const emoji = document.createElement('div');
    emoji.style.position = 'absolute';
    emoji.style.fontSize = '30px';
    emoji.style.left = `${Math.random() * 100}%`;
    emoji.style.bottom = '0';
    emoji.style.opacity = '0';
    emoji.textContent = ['🎉', '🎊', '🎈', '⭐', '🏆'][Math.floor(Math.random() * 5)];
    
    // Animate the emoji floating up
    emoji.animate(
      [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: `translateY(-${Math.random() * 400 + 200}px)`, opacity: 0 }
      ],
      {
        duration: Math.random() * 3000 + 2000,
        iterations: Infinity
      }
    );
    
    victoryScreen.appendChild(emoji);
  }
  
  // Play again button
  const playAgainButton = document.createElement('button');
  playAgainButton.textContent = 'Play Again';
  playAgainButton.style.fontSize = '24px';
  playAgainButton.style.padding = '15px 30px';
  playAgainButton.style.marginTop = '30px';
  playAgainButton.style.backgroundColor = '#4CAF50';
  playAgainButton.style.border = 'none';
  playAgainButton.style.borderRadius = '50px';
  playAgainButton.style.color = 'white';
  playAgainButton.style.cursor = 'pointer';
  playAgainButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  
  playAgainButton.innerHTML = '▶️ Play Again ▶️';
  
  playAgainButton.addEventListener('click', () => {
    document.body.removeChild(victoryScreen);
    // Show welcome screen instead of directly starting a new game
    showWelcomeScreen();
  });
  
  victoryScreen.appendChild(winnerMessage);
  victoryScreen.appendChild(playAgainButton);
  document.body.appendChild(victoryScreen);
  
  // Game is ended - we'll let them tap on deck to start a new game later
  
  // Reset game state
  gameState.isGameStarted = false;
}

// Toggle sound
function toggleSound() {
  const button = document.getElementById('toggle-sound');
  const isMuted = button.classList.toggle('muted');
  soundSystem.toggleSound(!isMuted);
}

// No event listeners needed for buttons anymore

// Export game functions for other modules
export {
  gameState,
  startGame,
  playCard,
  drawCard,
  sayUno,
  chooseColor,
  initializeEmptyGame,
  continueAfterCardPlay
};