// External/utility imports
import { getNextPlayerIndex } from './utils.js';
import soundSystem from './sounds.js';

// Core game modules
import { createDeck, shuffleDeck, dealCards } from './deck.js';
import { createPlayers } from './players.js';
import { renderGame, updateGameDisplay, showWelcomeScreen } from './ui.js';

// New modular imports
import { canPlayCard, playerHasLegalMoves, chooseAIColor } from './gameRules.js';
import { handleSpecialCard } from './cardEffects.js';
import { playAITurn } from './aiPlayer.js';
import { createAIDependencies, handleWildDraw4ForAI, handleRegularWildCard, validateCardDraw, checkDrawnCardPlayability, handleEndOfTurnAI } from './gameHelpers.js';

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
    const aiDependencies = {
      playCard,
      drawSingleCard,
      nextTurn,
      updateGameDisplay
    };
    setTimeout(() => playAITurn(gameState, aiDependencies), 1000);
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
      gameState.pendingDrawPlayerIndex = getNextPlayerIndexForGame();
      gameState.pendingDrawCount = 4;
    }
    
    // Show color choice UI
    updateGameDisplay(gameState);
    return;
  } else {
    // Handle all other types of cards
    const specialCardDependencies = {
      getNextPlayerIndex: getNextPlayerIndexForGame,
      handleDrawCards,
      handleSkipNextPlayer,
      updateGameDisplay,
      playCard,
      drawSingleCard,
      nextTurn
    };
    const cardSkipNextTurn = skipNextTurn || handleSpecialCard(playedCard, gameState, specialCardDependencies);
    
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
    const aiDependencies = {
      playCard,
      drawSingleCard,
      nextTurn,
      updateGameDisplay
    };
    setTimeout(() => playAITurn(gameState, aiDependencies), 1000);
  }
}


// Helper functions for special card handling

// Helper function to get next player index using the utils function
function getNextPlayerIndexForGame() {
  return getNextPlayerIndex(gameState.currentPlayerIndex, gameState.direction, gameState.players.length);
}

// Handle drawing cards for the next player
function handleDrawCards(numCards) {
  const nextPlayerIndex = getNextPlayerIndexForGame();
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
    if (gameState.pendingDrawPlayerIndex === null) {
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
    const player = gameState.players[gameState.currentPlayerIndex];
    const chosenColor = chooseAIColor(player.hand);
    gameState.currentColor = chosenColor;
    gameState.waitingForColorChoice = false;
  }
  // For human player, we'll show color choice UI (handled in playCard function)
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
  
  const aiDependencies = createAIDependencies(playCard, drawSingleCard, nextTurn, updateGameDisplay);
  
  if (wasWildDraw4) {
    handleWildDraw4ColorChoice(gs, aiDependencies);
  } else {
    handleRegularWildCard(gs, nextTurn, updateGameDisplay, playAITurn, aiDependencies);
  }
}

// Helper function to handle Wild Draw 4 color choice logic
function handleWildDraw4ColorChoice(gs, aiDependencies) {
  // Store the next player index who will draw (if not already stored)
  if (gs.pendingDrawPlayerIndex === null) {
    gs.pendingDrawPlayerIndex = getNextPlayerIndexForGame();
  }
  
  // Get the next player who will draw
  const nextPlayerIndex = getNextPlayerIndexForGame();
  console.log(`After Wild Draw 4 color choice, next player (${gs.players[nextPlayerIndex].name}) will draw 4 cards`);
  
  // Have the next player draw 4 cards
  handleDrawCards(4);
  
  // Handle AI and human players differently
  const isNextPlayerAI = gs.players[nextPlayerIndex].isAI;
  
  if (isNextPlayerAI) {
    handleWildDraw4ForAI(gs, nextPlayerIndex, handleSkipNextPlayer, updateGameDisplay, playAITurn, aiDependencies);
  } else {
    console.log("Human player needs to draw 4 cards from Wild Draw 4");
    // For human players, we've already set up the drawing state
    // The turn will be handled automatically when they finish drawing
  }
}

// Draw a single card and add it to player's hand
function drawSingleCard(playerIndex) {
  // Check if deck is empty
  if (gameState.deck.length === 0) {
    reshuffleDeck();
  }
  
  // Log who we are drawing for
  console.log(`drawSingleCard for player: ${gameState.players[playerIndex].name}`);
  
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


/**
 * Restores the player index after required draws and calculates skip target
 * @returns {number} The index of the player who should take the next turn
 */
function restorePlayerIndexAndCalculateSkip() {
  console.log(`Before index restoration - currentPlayerIndex: ${gameState.currentPlayerIndex}, pendingDrawPlayerIndex: ${gameState.pendingDrawPlayerIndex}`);
  
  // Restore the original player index if we temporarily changed it
  if (gameState.pendingDrawPlayerIndex !== null && gameState.pendingDrawPlayerIndex !== undefined) {
    console.log(`Restoring player index from ${gameState.currentPlayerIndex} to ${gameState.pendingDrawPlayerIndex}`);
    gameState.currentPlayerIndex = gameState.pendingDrawPlayerIndex;
    gameState.pendingDrawPlayerIndex = null;
  } else {
    console.log("No player index to restore (pendingDrawPlayerIndex was null)");
  }
  
  // Calculate the player after the human who should take the next turn
  const humanPlayerIndex = 0;
  let nextAfterHumanIndex = (humanPlayerIndex + gameState.direction) % gameState.players.length;
  if (nextAfterHumanIndex < 0) {
    nextAfterHumanIndex += gameState.players.length;
  }
  
  // Ensure we never give the human player an immediate turn after drawing
  if (nextAfterHumanIndex === 0) {
    nextAfterHumanIndex = (nextAfterHumanIndex + gameState.direction) % gameState.players.length;
    if (nextAfterHumanIndex < 0) {
      nextAfterHumanIndex += gameState.players.length;
    }
  }
  
  return nextAfterHumanIndex;
}

/**
 * Completes the required draw sequence by setting up the next turn
 * @param {number} nextPlayerIndex - Index of the player who should take the next turn
 */
function completeRequiredDrawSequence(nextPlayerIndex) {
  // Play sound and reset drawing state
  setTimeout(() => soundSystem.play('cardPlay'), 300);
  gameState.isDrawingCards = false;
  
  // Set up turn skip notification
  const nextPlayerIndex_forUI = getNextPlayerIndexForGame();
  const skipToPlayerIndex = (nextPlayerIndex_forUI + gameState.direction) % gameState.players.length;
  const skipToPlayerName = gameState.players[skipToPlayerIndex < 0 ? skipToPlayerIndex + gameState.players.length : skipToPlayerIndex].name;
  
  window.dispatchEvent(new CustomEvent('drawRequirementComplete', {
    detail: { 
      message: `Cards drawn! Your turn is skipped. ${skipToPlayerName}'s turn now.` 
    }
  }));
  
  // Set the next player
  gameState.currentPlayerIndex = nextPlayerIndex;
  console.log("After Draw 2/Draw 4 turn skip - Current player is now:", gameState.currentPlayerIndex, 
              `(${gameState.players[gameState.currentPlayerIndex].name})`);
  
  // Start the next AI turn after a delay
  setTimeout(() => {
    updateGameDisplay(gameState);
    
    // Safety check and start AI turn
    if (gameState.currentPlayerIndex === 0) {
      console.error("ERROR: Human player should not get turn immediately after drawing from Draw 2/Draw 4");
      gameState.currentPlayerIndex = 1;
    }
    
    console.log(`Starting AI turn for ${gameState.players[gameState.currentPlayerIndex].name} after human finished drawing`);
    const aiDependencies = createAIDependencies(playCard, drawSingleCard, nextTurn, updateGameDisplay);
    setTimeout(() => playAITurn(gameState, aiDependencies), 1000);
  }, 1000);
}

// Handle required draws (Draw 2 or Draw 4)
function handleRequiredDraw() {
  gameState.requiredDraws--;
  updateGameDisplay(gameState);
  
  if (gameState.requiredDraws === 0) {
    const nextPlayerIndex = restorePlayerIndexAndCalculateSkip();
    completeRequiredDrawSequence(nextPlayerIndex);
    return true; // Handled the last required draw
  }
  
  return false; // More required draws needed
}

// Player draws a card
function drawCard() {
  console.log(`drawCard called - requiredDraws: ${gameState.requiredDraws}`);
  
  // Validate if draw is allowed
  const validation = validateCardDraw(
    gameState, 
    gameState.requiredDraws, 
    gameState.currentPlayerIndex, 
    gameState.waitingForColorChoice
  );
  
  if (!validation.isValid) {
    if (validation.reason === 'not_human_turn' || validation.reason === 'waiting_for_color') {
      return;
    }
  }
  
  // Check if player has legal moves and there are no required draws
  if (gameState.requiredDraws === 0) {
    const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
    if (playerHasLegalMoves(gameState.players[0].hand, topDiscard, gameState.currentColor)) {
      // Trigger shake animation on the deck to indicate player should play a card
      window.dispatchEvent(new CustomEvent('invalidDraw'));
      return; // Don't allow drawing if player has legal moves
    }
  }
  
  // Play a soft "draw" sound
  soundSystem.play('cardPlay');
  
  // Visual feedback - animate the deck
  animateDeckDraw();
  
  // Determine which player should be drawing the cards
  // If there are required draws, the cards should go to the human player (index 0)
  // regardless of who the current player is
  const playerIndexForDraw = (gameState.requiredDraws > 0) ? 0 : gameState.currentPlayerIndex;
  
  // Draw ONE CARD AT A TIME - always just one card per click
  const drawnCard = drawSingleCard(playerIndexForDraw);
  
  // Handle different draw scenarios
  if (gameState.requiredDraws > 0) {
    handleRequiredCardDraw(playerIndexForDraw, drawnCard);
  } else {
    handleNormalCardDraw(drawnCard);
  }
}

// Handle drawing cards when required (Draw 2 or Draw 4)
function handleRequiredCardDraw(playerIndexForDraw, drawnCard) {
  // Calculate how many cards were originally required (before this draw)
  const originalRequiredDraws = gameState.requiredDraws + 1;
  // Calculate which card we're drawing in the sequence (for clear logging)
  const currentDrawNumber = originalRequiredDraws - gameState.requiredDraws;
  
  console.log(`Drew card ${currentDrawNumber} of ${originalRequiredDraws} required draws for player ${playerIndexForDraw} (${gameState.players[playerIndexForDraw].name})`);
  const turnComplete = handleRequiredDraw();
  
  if (!turnComplete) {
    console.log(`Still need to draw ${gameState.requiredDraws} more cards`);
    // Return after drawing a required card - player needs to click again for next card
    return;
  }
  
  console.log("All required cards drawn - turn complete");
}

// Handle normal card drawing (not required)
function handleNormalCardDraw(drawnCard) {
  console.log("Normal draw (not required) - drew one card");
  updateGameDisplay(gameState);
  
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  const player = gameState.players[gameState.currentPlayerIndex];
  const cardIsPlayable = canPlayCard(drawnCard, topDiscard, gameState.currentColor, player.hand);
  
  if (!cardIsPlayable) {
    console.log("Drawn card can't be played - moving to next player");
    // Move to next player's turn
    nextTurn();
    updateGameDisplay(gameState);
    
    // If it's AI's turn, let them play
    const aiDependencies = createAIDependencies(playCard, drawSingleCard, nextTurn, updateGameDisplay);
    handleEndOfTurnAI(gameState, playAITurn, aiDependencies, "after human draw");
  } else {
    console.log("Drawn card can be played - waiting for player to play it");
    // If card is playable, player must choose to play it manually
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