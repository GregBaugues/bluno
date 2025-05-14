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
  isDrawingCards: false // Flag to indicate whether a player is currently in the process of drawing cards
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
  // If a player is currently drawing cards, don't allow playing cards
  if (gameState.isDrawingCards) {
    // Show a message if it's a human player trying to play during drawing
    if (playerIndex === 0) {
      window.dispatchEvent(new CustomEvent('invalidCardPlay', { 
        detail: { 
          cardIndex, 
          message: "You must finish drawing all required cards first!" 
        } 
      }));
    }
    return; // Exit early, don't proceed with card play
  }
  
  const player = gameState.players[playerIndex];
  const card = player.hand[cardIndex];
  
  // Handle case when there's no discard pile yet
  const topDiscard = gameState.discardPile.length > 0 ? 
    gameState.discardPile[gameState.discardPile.length - 1] : 
    null;
  
  // We no longer use implicit color choice
  
  // Check if card can be played (pass the player's hand for Wild Draw 4 validation)
  if (!canPlayCard(card, topDiscard, gameState.currentColor, player.hand)) {
    // If human player tries to play an invalid card, trigger shake animation
    if (playerIndex === 0) {
      // For Wild Draw 4, provide specific feedback if player has playable cards
      if (card.value === 'Wild Draw 4') {
        window.dispatchEvent(new CustomEvent('invalidCardPlay', { 
          detail: { 
            cardIndex, 
            message: "You can't play Wild Draw 4 when you have cards matching the current color or value!" 
          } 
        }));
      } else {
        // This will be handled in the UI layer
        window.dispatchEvent(new CustomEvent('invalidCardPlay', { detail: { cardIndex } }));
      }
    }
    return; // Exit early, don't proceed with card play
  }
  
  // Card is valid, proceed with playing it
  
  // Play the card play sound
  soundSystem.play('cardPlay');
  
  // Move card from hand to discard pile
  const playedCard = player.hand.splice(cardIndex, 1)[0];
  gameState.discardPile.push(playedCard);
  
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
    const skipNextTurn = handleSpecialCard(playedCard);
    
    // Check if player has won
    if (player.hand.length === 0) {
      handleGameEnd();
      return;
    }
    
    // Check for Uno - automatically call for everyone
    if (player.hand.length === 1 && !player.hasCalledUno) {
      player.hasCalledUno = true;
      // Play the UNO call sound
      soundSystem.play('unoCall');
    }
    
    // Move to next player's turn only if the special card didn't already handle it
    if (!skipNextTurn) {
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
  
  // If the next player is AI, draw cards automatically
  if (nextPlayer.isAI) {
    // Draw multiple cards for AI
    for (let i = 0; i < numCards; i++) {
      drawSingleCard(nextPlayerIndex);
    }
    
    // Update UI to show the AI's new cards
    updateGameDisplay(gameState);
    
    // Play a sound effect to indicate cards were drawn
    soundSystem.play('cardPlay');
  } else {
    // For human player, set a draw requirement state
    gameState.requiredDraws = numCards;
    // Set the drawing cards flag to indicate the player must draw cards
    gameState.isDrawingCards = true;
    
    // Update the UI to show the drawing state
    updateGameDisplay(gameState);
    
    // Show a message indicating the player needs to draw cards
    window.dispatchEvent(new CustomEvent('showDrawRequirement', { 
      detail: { numCards: numCards }
    }));
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
      gameState.currentPlayerIndex = getNextPlayerIndex();
      skipNextTurn = false; // Let normal turn advancement happen
      break;
      
    case 'Reverse':
      // Reverse direction
      gameState.direction *= -1;
      // Make sure UI updates when direction changes
      updateGameDisplay(gameState);
      // In a 2-player game, reverse acts like skip
      if (gameState.players.length === 2) {
        gameState.currentPlayerIndex = getNextPlayerIndex();
      }
      skipNextTurn = false; // Let normal turn advancement happen
      break;
      
    case 'Draw 2':
      // Next player draws 2 cards and skips their turn
      const nextPlayerIndex = handleDrawCards(2);
      
      // Skip their turn only if it's an AI player (human players need to manually draw)
      if (gameState.players[nextPlayerIndex].isAI) {
        handleSkipNextPlayer(nextPlayerIndex);
      }
      // We always skip normal turn advancement since either:
      // 1. AI player has already had their turn skipped, or
      // 2. Human player is in drawing state and we'll advance turns after they finish drawing
      skipNextTurn = true;
      break;
      
    case 'Wild':
      // Handle wild card color selection
      handleWildCardColor();
      skipNextTurn = false; // Let normal turn advancement happen
      break;
      
    case 'Wild Draw 4':
      // Handle wild card color selection
      handleWildCardColor();
      
      // Next player draws 4 cards and loses turn
      const nextIdx = handleDrawCards(4);
      
      // Skip their turn only if it's an AI player (human players need to manually draw)
      if (gameState.players[nextIdx].isAI) {
        handleSkipNextPlayer(nextIdx);
      }
      // We always skip normal turn advancement since either:
      // 1. AI player has already had their turn skipped, or
      // 2. Human player is in drawing state and we'll advance turns after they finish drawing
      skipNextTurn = true;
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
    // Handle the draw 4 effect now that color has been chosen
    const nextPlayerIndex = gs.pendingDrawPlayerIndex || getNextPlayerIndex();
    handleDrawCards(4);
    
    // Skip the next player's turn (but only if the next player is AI, since human players need to manually draw)
    if (gs.players[nextPlayerIndex].isAI) {
      handleSkipNextPlayer(nextPlayerIndex);
      
      // Update the UI immediately
      updateGameDisplay(gs);
      
      // If it's AI's turn and no player is drawing cards, let them play
      if (gs.currentPlayerIndex !== 0 && !gs.isDrawingCards) {
        setTimeout(playAITurn, 1000);
      }
    }
    // If human player, we wait for them to draw all required cards before continuing
  } else {
    // For regular Wild cards, just move to next player's turn
    nextTurn();
    
    // Update the UI
    updateGameDisplay(gs);
    
    // If it's AI's turn and no player is drawing cards, let them play
    if (gs.currentPlayerIndex !== 0 && !gs.isDrawingCards) {
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
    
    // Show a message indicating all required cards have been drawn
    window.dispatchEvent(new CustomEvent('drawRequirementComplete'));
    
    // Move to next player's turn
    nextTurn();
    
    // Update the UI
    updateGameDisplay(gameState);
    
    // If it's AI's turn, let them play
    if (gameState.currentPlayerIndex !== 0) {
      setTimeout(playAITurn, 1000);
    }
    
    return true; // Handled the last required draw
  }
  
  return false; // More required draws needed
}

// Player draws a card
function drawCard() {
  if (gameState.currentPlayerIndex !== 0) return; // Only human player can use this function
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
    const turnComplete = handleRequiredDraw();
    if (!turnComplete) {
      // Return after drawing a required card - player needs to click again for next card
      return;
    }
  } else {
    // Normal draw case - update display and never auto-play drawn card
    updateGameDisplay(gameState);
    
    // Only move to next player's turn if the drawn card can't be played
    const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
    const player = gameState.players[gameState.currentPlayerIndex];
    if (!canPlayCard(drawnCard, topDiscard, gameState.currentColor, player.hand)) {
      // Move to next player's turn
      nextTurn();
      
      // Update the UI
      updateGameDisplay(gameState);
      
      // If it's AI's turn, let them play
      if (gameState.currentPlayerIndex !== 0) {
        setTimeout(playAITurn, 1000);
      }
    }
    // If card is playable, player must choose to play it manually
  }
}

// AI makes a turn
function playAITurn() {
  // If a player is currently drawing cards, don't allow AI turns
  if (gameState.isDrawingCards) {
    console.log("Waiting for player to finish drawing cards...");
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
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + gameState.direction) % gameState.players.length;
  if (gameState.currentPlayerIndex < 0) {
    gameState.currentPlayerIndex += gameState.players.length;
  }
  
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
  const winnerIndex = gameState.currentPlayerIndex;
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
  initializeEmptyGame
};