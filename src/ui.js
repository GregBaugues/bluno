import { gameState, playCard, chooseColor, startGame, drawCard, initializeEmptyGame } from './game.js';
import { colors } from './deck.js';
import { getCharacterDisplay, loadCharacterImages } from './images.js';

// Initialize the game board
function renderGame() {
  // Load character images (when they become available)
  loadCharacterImages();
  
  // Render opponents area
  renderOpponents();
  
  // Render deck and discard pile
  renderDeckAndDiscardPile();
  
  // Render player's hand
  renderPlayerHand();
  
  // Set up color choice UI
  setupColorChoiceUI();
  
  // Update turn indicator
  updateTurnIndicator();
}

// Update the turn indicator to show whose turn it is visually
function updateTurnIndicator() {
  const turnIndicator = document.querySelector('.turn-indicator');
  if (!turnIndicator) return; // Safety check
  
  if (!gameState.isGameStarted) {
    // Hide the turn indicator before game starts
    turnIndicator.style.display = 'none';
    return;
  }
  
  if (gameState.currentPlayerIndex === 0) {
    // Your turn - show the arrow indicator
    turnIndicator.style.display = 'block';
  } else {
    // Not your turn - hide the indicator
    turnIndicator.style.display = 'none';
  }
  
  // Also highlight the active player in the opponents area
  const opponents = document.querySelectorAll('.opponent');
  opponents.forEach((opponent, index) => {
    if (index + 1 === gameState.currentPlayerIndex) {
      opponent.classList.add('current-player');
    } else {
      opponent.classList.remove('current-player');
    }
  });
}

// Render the opponents (Bluey characters)
function renderOpponents() {
  const opponentsArea = document.getElementById('opponents-area');
  opponentsArea.innerHTML = '';
  
  // Keep original layout but just ensure there's enough room for larger cards
  opponentsArea.style.display = 'flex'; 
  opponentsArea.style.justifyContent = 'center';
  opponentsArea.style.gap = '15px';
  
  // Skip the first player (human player)
  for (let i = 1; i < gameState.players.length; i++) {
    const player = gameState.players[i];
    const opponent = document.createElement('div');
    opponent.className = 'opponent';
    
    // Add highlight for current player
    if (gameState.currentPlayerIndex === i) {
      opponent.classList.add('current-player');
    }
    
    // For Bluey, ONLY show the name text, no blue oval/image
    if (player.name === 'Bluey') {
      // Character name only
      const name = document.createElement('div');
      name.className = 'character-name';
      name.textContent = player.name;
      name.style.fontSize = '24px';
      name.style.fontWeight = 'bold';
      name.style.color = 'black';
      name.style.textShadow = '0 1px 2px rgba(255,255,255,0.6)';
      name.style.marginTop = '15px';
      
      // Add name only
      opponent.appendChild(name);
    } 
    else if (player.name === 'Bingo') {
      // Character image with direct styling for each character
      const image = document.createElement('div');
      image.className = 'character-image';
    
      // Restore original size for character image
      image.style.width = '100px'; 
      image.style.height = '100px';
      
      // Bingo - Orange with red heart
      image.style.backgroundColor = '#FF6B6B'; // Bingo red/orange
      image.style.position = 'relative';
      image.style.overflow = 'hidden';
      
      // Add a heart icon in the background
      const decoration = document.createElement('div');
      decoration.style.position = 'absolute';
      decoration.style.top = '50%';
      decoration.style.left = '50%';
      decoration.style.transform = 'translate(-50%, -50%)';
      decoration.style.fontSize = '100px';
      decoration.style.opacity = '0.3';
      decoration.textContent = '❤️';
      image.appendChild(decoration);
      
      const initial = document.createElement('div');
      initial.className = 'character-initial';
      initial.textContent = 'B';
      initial.style.color = 'white';
      initial.style.fontSize = '80px';
      initial.style.fontWeight = 'bold';
      initial.style.position = 'relative';
      initial.style.zIndex = '1';
      image.appendChild(initial);
    }
    else if (player.name === 'Bandit') {
      // Bandit - Darker blue with sunglasses
      image.style.backgroundColor = '#4169E1'; // Bandit blue
      image.style.position = 'relative';
      image.style.overflow = 'hidden';
      
      // Add sunglasses icon in the background
      const decoration = document.createElement('div');
      decoration.style.position = 'absolute';
      decoration.style.top = '50%';
      decoration.style.left = '50%';
      decoration.style.transform = 'translate(-50%, -50%)';
      decoration.style.fontSize = '90px';
      decoration.style.opacity = '0.3';
      decoration.textContent = '😎';
      image.appendChild(decoration);
      
      const initial = document.createElement('div');
      initial.className = 'character-initial';
      initial.textContent = 'B';
      initial.style.color = 'white';
      initial.style.fontSize = '80px';
      initial.style.fontWeight = 'bold';
      initial.style.position = 'relative';
      initial.style.zIndex = '1';
      image.appendChild(initial);
    }
    else {
      // For other characters, use the standard approach
      const image = document.createElement('div');
      image.className = 'character-image';
      image.style.width = '100px'; 
      image.style.height = '100px';
      image.innerHTML = getCharacterDisplay(player.name);
    }
    
    // Character name
    const name = document.createElement('div');
    name.className = 'character-name';
    name.textContent = player.name;
    
    // Card count (now moved into the character image)
    // Display cards info at the bottom of the image
    const cards = player.hand.length;
    
    // Create card badge
    const cardBadge = document.createElement('div');
    cardBadge.className = 'card-badge';
    cardBadge.innerHTML = `🃏 <span>${cards}</span>`;
    cardBadge.style.position = 'absolute';
    cardBadge.style.bottom = '-15px';
    cardBadge.style.right = '-15px';
    cardBadge.style.backgroundColor = 'white';
    cardBadge.style.color = '#333';
    cardBadge.style.padding = '5px 12px';
    cardBadge.style.borderRadius = '20px';
    cardBadge.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    cardBadge.style.fontSize = '20px';
    cardBadge.style.fontWeight = 'bold';
    
    // Uno indicator
    if (player.hand.length === 1 && player.hasCalledUno) {
      const unoIndicator = document.createElement('div');
      unoIndicator.className = 'uno-indicator';
      unoIndicator.textContent = 'UNO!';
      opponent.appendChild(unoIndicator);
    }
    
    // Add elements to opponent div (only add the image if it exists)
    // Need to keep track of the image variable for each character type
    if (player.name === 'Bluey') {
      // For Bluey, we only added the name, no image
    } else if (player.name === 'Bingo' || player.name === 'Bandit') {
      // For Bingo and Bandit, the image variable should exist
      opponent.appendChild(image);
      // Add the card badge to the image
      image.appendChild(cardBadge);
    } else {
      // For other characters, add the image and badge
      opponent.appendChild(image);
      // Add the card badge to the image
      image.appendChild(cardBadge);
    }
    // Add name for all characters
    opponent.appendChild(name);
    
    // Add a visual representation of cards in hand - more prominent next to character name
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'opponent-cards';
    cardsContainer.style.position = 'relative';
    cardsContainer.style.display = 'flex';
    cardsContainer.style.flexDirection = 'row';
    cardsContainer.style.justifyContent = 'center';
    cardsContainer.style.marginTop = '20px'; // Increased margin top
    cardsContainer.style.minHeight = '70px'; // Increased height for larger cards
    cardsContainer.style.width = '110%'; // Extended width beyond parent to allow for proper card layout
    cardsContainer.style.maxWidth = '350px'; // Max width to prevent extremely wide card rows
    cardsContainer.style.flexWrap = 'wrap'; // Allow wrapping for many cards
    cardsContainer.style.alignItems = 'center';
    cardsContainer.style.marginLeft = '-5%'; // Offset for the extended width
    
    // Calculate how much we need to overlap cards based on number of cards
    const cardOverlapFactor = Math.min(1, 7 / Math.max(1, player.hand.length)); // More cards = more overlap
    const cardOverlap = -20 * cardOverlapFactor; // From -20px to 0px
    
    // Show all cards
    for (let j = 0; j < player.hand.length; j++) {
      const card = document.createElement('div');
      card.className = 'opponent-card';
      
      // Smaller cards to fit more
      const cardSize = Math.max(26, 35 - Math.min(10, Math.max(0, player.hand.length - 5))); // Reduce size for many cards
      
      // Opponent cards with UNO styling
      card.style.width = `${cardSize}px`;
      card.style.height = `${cardSize * 1.4}px`;
      card.style.backgroundColor = '#4682b4'; // UNO blue color
      card.style.border = '2px solid white';
      card.style.borderRadius = '5px';
      card.style.margin = `0 ${cardOverlap}px`; // Overlap based on card count
      card.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
      card.style.zIndex = j;
      card.style.position = 'relative';
      
      cardsContainer.appendChild(card);
    }
    
    opponent.appendChild(cardsContainer);
    opponentsArea.appendChild(opponent);
  }
}

// Render the deck and discard pile
function renderDeckAndDiscardPile() {
  const deckElement = document.getElementById('deck');
  const discardPileElement = document.getElementById('discard-pile');
  
  // Render deck
  deckElement.innerHTML = '';
  
  // Create better deck back design
  const deckBack = document.createElement('div');
  deckBack.className = 'deck-back';
  
  // Add UNO logo
  const unoLogo = document.createElement('div');
  unoLogo.className = 'uno-logo';
  unoLogo.textContent = 'UNO';
  deckBack.appendChild(unoLogo);
  
  // Add card count or start text
  const deckCount = document.createElement('div');
  deckCount.className = 'deck-count';
  
  if (!gameState.isGameStarted) {
    // If game hasn't started, show "Tap to Start" instead of card count
    deckCount.textContent = "Start!";
    deckCount.style.fontSize = "24px";
    deckCount.style.padding = "5px 12px";
    deckCount.style.backgroundColor = "#ff3b3b";
    deckCount.style.color = "white";
    deckCount.style.fontWeight = "bold";
    deckCount.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
    deckCount.style.cursor = "pointer";
    
    // Make the entire deck more noticeable
    deckElement.style.cursor = "pointer";
    deckElement.style.animation = "pulse 1.5s infinite";
    
    // Add a start game class to the deck
    deckElement.classList.add('start-deck');
  } else {
    // Normal card count during game
    deckCount.textContent = `${gameState.deck.length}`;
  }
  
  deckBack.appendChild(deckCount);
  deckElement.appendChild(deckBack);
  
  // Make the deck interactive
  deckElement.addEventListener('click', () => {
    if (!gameState.isGameStarted) {
      // Start the game when tapping on the deck before game begins
      startGame();
      console.log("Game started!");
    } else if (gameState.currentPlayerIndex === 0 && !gameState.waitingForColorChoice) {
      // Draw card during the game when it's player's turn
      drawCard();
    }
  });
  
  // Only highlight the deck if it's the player's turn and they need to draw
  if (gameState.isGameStarted && gameState.currentPlayerIndex === 0 && !gameState.waitingForColorChoice) {
    // Check if the player has any legal cards to play
    const hasLegalPlay = playerHasLegalMove();
    
    // Special highlight for required draws (Draw 2 or Draw 4)
    // Remove any existing draw indicators and reminders regardless of condition
    const existingIndicators = document.querySelectorAll('.draw-indicator');
    existingIndicators.forEach(indicator => {
      if (indicator.parentElement) {
        indicator.parentElement.removeChild(indicator);
      }
    });
    
    // Remove any existing deck reminders
    const existingReminders = document.querySelectorAll('.deck-reminder');
    existingReminders.forEach(reminder => {
      if (reminder.parentElement) {
        reminder.parentElement.removeChild(reminder);
      }
    });
    
    if (gameState.requiredDraws > 0) {
      deckElement.classList.add('required-draw');
      deckElement.classList.add('active-deck');
      
      // Create a large, prominent indicator that shows above the game area
      const drawIndicator = document.createElement('div');
      drawIndicator.className = 'draw-indicator';
      
      // Use different message based on number of cards remaining
      if (gameState.requiredDraws === 1) {
        drawIndicator.textContent = `YOU MUST DRAW 1 MORE CARD`;
      } else {
        drawIndicator.textContent = `YOU MUST DRAW ${gameState.requiredDraws} MORE CARDS`;
      }
      
      drawIndicator.style.position = 'fixed';
      drawIndicator.style.top = '50px';
      drawIndicator.style.left = '50%';
      drawIndicator.style.transform = 'translateX(-50%)';
      drawIndicator.style.backgroundColor = 'rgba(255, 40, 40, 0.9)';
      drawIndicator.style.color = 'white';
      drawIndicator.style.padding = '12px 25px';
      drawIndicator.style.borderRadius = '15px';
      drawIndicator.style.fontWeight = 'bold';
      drawIndicator.style.fontSize = '24px';
      drawIndicator.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)';
      drawIndicator.style.zIndex = '2000';
      drawIndicator.style.textAlign = 'center';
      drawIndicator.style.letterSpacing = '1px';
      drawIndicator.style.border = '3px solid white';
      drawIndicator.style.whiteSpace = 'nowrap';
      drawIndicator.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
      
      // Add animation to make it more noticeable
      drawIndicator.animate(
        [
          { transform: 'translateX(-50%) scale(1)' },
          { transform: 'translateX(-50%) scale(1.05)' },
          { transform: 'translateX(-50%) scale(1)' }
        ],
        {
          duration: 2000,
          iterations: Infinity,
          easing: 'ease-in-out'
        }
      );
      
      // Add the draw indicator to the document body so it's always visible
      document.body.appendChild(drawIndicator);
      
      // Add a reminder text directly on the deck
      const deckReminder = document.createElement('div');
      deckReminder.className = 'deck-reminder';
      
      if (gameState.requiredDraws === 1) {
        deckReminder.textContent = `Tap to draw your last required card`;
      } else {
        deckReminder.textContent = `Tap to draw 1 card (${gameState.requiredDraws} more to go)`;
      }
      
      deckReminder.style.position = 'absolute';
      deckReminder.style.bottom = '-45px';
      deckReminder.style.left = '50%';
      deckReminder.style.transform = 'translateX(-50%)';
      deckReminder.style.backgroundColor = '#ff3b3b';
      deckReminder.style.color = 'white';
      deckReminder.style.padding = '5px 15px';
      deckReminder.style.borderRadius = '15px';
      deckReminder.style.fontSize = '16px';
      deckReminder.style.fontWeight = 'bold';
      deckReminder.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
      deckReminder.style.whiteSpace = 'nowrap';
      deckReminder.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
      deckElement.appendChild(deckReminder);
      
      // Also add a counter directly on the deck
      const deckCounter = document.createElement('div');
      deckCounter.className = 'deck-reminder';
      deckCounter.textContent = gameState.requiredDraws.toString();
      deckCounter.style.position = 'absolute';
      deckCounter.style.top = '10px';
      deckCounter.style.right = '10px';
      deckCounter.style.backgroundColor = 'white';
      deckCounter.style.color = '#ff3b3b';
      deckCounter.style.width = '30px';
      deckCounter.style.height = '30px';
      deckCounter.style.borderRadius = '50%';
      deckCounter.style.fontSize = '18px';
      deckCounter.style.fontWeight = 'bold';
      deckCounter.style.display = 'flex';
      deckCounter.style.justifyContent = 'center';
      deckCounter.style.alignItems = 'center';
      deckCounter.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
      deckCounter.style.border = '2px solid #ff3b3b';
      deckCounter.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
      deckElement.appendChild(deckCounter);
    } 
    // Regular deck highlighting - only if player has no legal moves
    else if (!hasLegalPlay) {
      deckElement.classList.add('active-deck');
      deckElement.classList.remove('required-draw');
    } 
    else {
      // Player has legal moves, don't highlight deck
      deckElement.classList.remove('active-deck');
      deckElement.classList.remove('required-draw');
    }
  } else {
    deckElement.classList.remove('active-deck');
    deckElement.classList.remove('required-draw');
  }
  
  // Render discard pile
  discardPileElement.innerHTML = '';
  
  if (gameState.discardPile.length > 0) {
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const cardElement = createCardElement(topCard, -1, false); // Not playable
    
    // Make the discard pile card bigger to match the deck size
    cardElement.style.width = '140px';
    cardElement.style.height = '210px';
    cardElement.style.margin = '0';
    cardElement.style.fontSize = '30px';
    cardElement.style.borderRadius = '15px';
    cardElement.style.border = '5px solid white';
    
    // Adjust the card corners and other elements for the larger card
    const corners = cardElement.querySelectorAll('.card-corner');
    corners.forEach(corner => {
      corner.style.fontSize = '32px';
      corner.style.width = '50px';
      corner.style.height = '50px';
    });
    
    // Adjust the card emoji size
    const emoji = cardElement.querySelector('.card-emoji');
    if (emoji) {
      emoji.style.fontSize = '75px';
      emoji.style.transform = 'rotate(0deg)'; // Ensure emoji is straight
    }
    
    // Adjust the oval background
    const oval = cardElement.querySelector('.card-oval');
    if (oval) {
      oval.style.width = '85%';
      oval.style.height = '70%';
      oval.style.transform = 'translate(-50%, -50%) rotate(0deg)'; // Ensure oval is straight
    }
    
    discardPileElement.appendChild(cardElement);
  }
  
  // Update the side color indicator
  const colorIndicator = document.getElementById('color-indicator');
  
  // Remove all color classes first
  colorIndicator.className = ''; // Reset classes
  
  if (gameState.currentColor) {
    // Add the appropriate color class
    colorIndicator.classList.add(gameState.currentColor);
  }
}

// Render the player's hand
function renderPlayerHand() {
  const playerHandElement = document.getElementById('player-hand');
  playerHandElement.innerHTML = '';
  playerHandElement.scrollLeft = 0; // Reset scroll position
  
  const player = gameState.players[0]; // Human player
  
  // Create a container for better card arrangement
  const cardsContainer = document.createElement('div');
  cardsContainer.style.display = 'flex';
  cardsContainer.style.flexWrap = 'wrap';
  cardsContainer.style.justifyContent = 'center';
  cardsContainer.style.gap = '5px'; // Increased from 2px to add more spacing
  cardsContainer.style.padding = '10px 5px'; // Reduced padding
  cardsContainer.style.width = '100%';
  
  // Add visual title for player's cards
  const handTitle = document.createElement('div');
  handTitle.textContent = 'Your Cards';
  handTitle.style.width = '100%';
  handTitle.style.textAlign = 'center';
  handTitle.style.fontSize = '20px'; // Smaller text
  handTitle.style.fontWeight = 'bold';
  handTitle.style.marginBottom = '8px'; // Reduced margin
  handTitle.style.color = '#333';
  cardsContainer.appendChild(handTitle);
  
  // Handle Uno
  if (player.hand.length === 1 && player.hasCalledUno) {
    const unoIndicator = document.createElement('div');
    unoIndicator.className = 'uno-indicator';
    unoIndicator.textContent = 'UNO!';
    unoIndicator.style.position = 'absolute';
    unoIndicator.style.top = '0';
    unoIndicator.style.left = '50%';
    unoIndicator.style.transform = 'translateX(-50%)';
    playerHandElement.appendChild(unoIndicator);
  }
  
  const isPlayerTurn = gameState.currentPlayerIndex === 0 && gameState.isGameStarted;
  
  // Create card elements
  player.hand.forEach((card, index) => {
    // No longer highlighting playable cards
    const cardElement = createCardElement(card, index, false);
    
    // Make cards 20% smaller with slightly increased spacing between cards
    cardElement.style.width = '88px';  // 110px * 0.8 = 88px
    cardElement.style.height = '132px'; // 165px * 0.8 = 132px
    cardElement.style.margin = '0 -2px 0 0';  // Reduced negative margin to add spacing between cards
    
    // Reduce emoji size in player's hand cards
    const emoji = cardElement.querySelector('.card-emoji');
    if (emoji) {
      emoji.style.fontSize = '35px'; // Reduced from default size
    }
    
    // Make corner numbers smaller and ensure they stay in corners
    const corners = cardElement.querySelectorAll('.card-corner');
    corners.forEach(corner => {
      corner.style.fontSize = '15px';  // Reduced font size further
      corner.style.width = '20px';     // Even more constrained width
      corner.style.height = '20px';    // Even more constrained height
      corner.style.display = 'flex';
      corner.style.justifyContent = 'center';
      corner.style.alignItems = 'center';
      corner.style.padding = '0';      // Remove any padding
      corner.style.margin = '0';       // Remove any margin
    });
    
    // Add card to container
    cardsContainer.appendChild(cardElement);
  });
  
  // Add the cards container to the hand element
  playerHandElement.appendChild(cardsContainer);
}

// Create a card element
function createCardElement(card, index, isPlayable) {
  const cardElement = document.createElement('div');
  
  if (card.color === 'wild') {
    cardElement.className = `card wild`;
  } else {
    cardElement.className = `card ${card.color}`;
  }
  
  if (isPlayable) {
    cardElement.classList.add('playable');
  }
  
  // Add card value as data attribute for styling specific cards
  cardElement.setAttribute('data-value', card.value);
  
  // Create the UNO card design with oval in the middle
  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner';
  
  // Card value in top left and bottom right
  const topLeft = document.createElement('div');
  topLeft.className = 'card-corner top-left';
  topLeft.style.position = 'absolute';
  topLeft.style.top = '2px';
  topLeft.style.left = '2px';
  
  // Determine what to show in the corners based on the image
  let cornerText;
  if (card.value === 'Skip') {
    cornerText = '⊘';
  } else if (card.value === 'Reverse') {
    cornerText = '⟷';
  } else if (card.value === 'Draw 2') {
    cornerText = '+2';
  } else if (card.value === 'Wild') {
    cornerText = '';  // The wild card in the image has the rainbow circle instead of text
  } else if (card.value === 'Wild Draw 4') {
    cornerText = '+4';
  } else {
    cornerText = card.value;
  }
  
  // For Wild cards, create a rainbow circle icon in the corners
  if (card.value === 'Wild' || card.value === 'Wild Draw 4') {
    // Create rainbow circle for wild cards
    const rainbowCircle = document.createElement('div');
    rainbowCircle.className = 'rainbow-circle';
    rainbowCircle.style.width = '12px';
    rainbowCircle.style.height = '12px';
    
    topLeft.textContent = cornerText;
    topLeft.appendChild(rainbowCircle);
  } else {
    topLeft.textContent = cornerText;
  }
  
  const bottomRight = document.createElement('div');
  bottomRight.className = 'card-corner bottom-right';
  bottomRight.style.position = 'absolute';
  bottomRight.style.bottom = '2px';
  bottomRight.style.right = '2px';
  
  // For Wild cards, create a rainbow circle icon in the corners
  if (card.value === 'Wild' || card.value === 'Wild Draw 4') {
    // Create rainbow circle for wild cards
    const rainbowCircle = document.createElement('div');
    rainbowCircle.className = 'rainbow-circle';
    rainbowCircle.style.width = '12px';
    rainbowCircle.style.height = '12px';
    
    bottomRight.textContent = cornerText;
    bottomRight.appendChild(rainbowCircle);
  } else {
    bottomRight.textContent = cornerText;
  }
  
  // Create the oval background for the emoji
  const ovalBackground = document.createElement('div');
  ovalBackground.className = 'card-oval';
  ovalBackground.style.position = 'absolute';
  ovalBackground.style.top = '50%';
  ovalBackground.style.left = '50%';
  ovalBackground.style.transform = 'translate(-50%, -50%) rotate(0deg)'; // Added rotate(0deg) to ensure no tilting
  ovalBackground.style.display = 'flex';
  ovalBackground.style.justifyContent = 'center';
  ovalBackground.style.alignItems = 'center';
  ovalBackground.style.width = '80%';
  ovalBackground.style.height = '65%';
  
  // Card emoji in center
  const emojiElement = document.createElement('div');
  emojiElement.className = 'card-emoji';
  emojiElement.textContent = card.emoji;
  emojiElement.style.display = 'flex';
  emojiElement.style.justifyContent = 'center';
  emojiElement.style.alignItems = 'center';
  emojiElement.style.width = '100%';
  emojiElement.style.height = '100%';
  emojiElement.style.transform = 'rotate(0deg)'; // Ensure emoji is straight up and down
  
  // Add elements to card
  ovalBackground.appendChild(emojiElement);
  cardInner.appendChild(ovalBackground);
  cardElement.appendChild(cardInner);
  cardElement.appendChild(topLeft);
  cardElement.appendChild(bottomRight);
  
  // Wild cards should get special styling
  if (card.color === 'wild') {
    // For Wild Draw 4 (poop emoji)
    if (card.value === 'Wild Draw 4') {
      emojiElement.classList.add('wild-draw-4');
    }
  }
  
  // Add touch event for playing cards (if it's in player's hand)
  if (index >= 0) {
    cardElement.addEventListener('click', () => {
      if (gameState.currentPlayerIndex === 0 && !gameState.waitingForColorChoice) {
        const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
        if (canPlayCard(card, topDiscard, gameState.currentColor)) {
          playCard(index);
        } else {
          // Visual feedback that card can't be played
          cardElement.classList.add('shake');
          setTimeout(() => {
            cardElement.classList.remove('shake');
          }, 500);
        }
      }
    });
  }
  
  return cardElement;
}

// Setup the color choice UI
function setupColorChoiceUI() {
  // First, make sure the color choice element exists, create it if it doesn't
  let colorChoiceElement = document.getElementById('color-choice');
  if (!colorChoiceElement) {
    colorChoiceElement = document.createElement('div');
    colorChoiceElement.id = 'color-choice';
    colorChoiceElement.style.position = 'fixed';
    colorChoiceElement.style.top = '0';
    colorChoiceElement.style.left = '0';
    colorChoiceElement.style.width = '100%';
    colorChoiceElement.style.height = '100%';
    colorChoiceElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    colorChoiceElement.style.display = 'none';
    colorChoiceElement.style.zIndex = '1000';
    colorChoiceElement.style.justifyContent = 'center';
    colorChoiceElement.style.alignItems = 'center';
    colorChoiceElement.style.flexDirection = 'column';
    
    // Create the buttons container
    const colorButtonsContainer = document.createElement('div');
    colorButtonsContainer.id = 'color-buttons';
    colorButtonsContainer.style.display = 'flex';
    colorButtonsContainer.style.justifyContent = 'center';
    colorButtonsContainer.style.alignItems = 'center';
    colorButtonsContainer.style.marginTop = '20px';
    
    // Add a title
    const titleElement = document.createElement('h2');
    titleElement.textContent = 'Choose a Color!';
    titleElement.style.color = 'white';
    titleElement.style.fontSize = '30px';
    titleElement.style.marginBottom = '20px';
    titleElement.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
    titleElement.style.textAlign = 'center';
    
    // Add elements to the color choice container
    colorChoiceElement.appendChild(titleElement);
    colorChoiceElement.appendChild(colorButtonsContainer);
    
    // Add to the document
    document.body.appendChild(colorChoiceElement);
  }
  
  const colorButtonsContainer = document.getElementById('color-buttons');
  
  // Clear existing buttons
  colorButtonsContainer.innerHTML = '';
  
  // Create color buttons
  colors.forEach(color => {
    const colorButton = document.createElement('button');
    colorButton.style.width = '80px';
    colorButton.style.height = '80px';
    colorButton.style.backgroundColor = color;
    colorButton.style.margin = '0 15px';
    colorButton.style.borderRadius = '10px';
    colorButton.style.border = '4px solid white';
    colorButton.style.cursor = 'pointer';
    colorButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    colorButton.style.transition = 'transform 0.2s ease';
    
    // Add hover effect
    colorButton.addEventListener('mouseover', () => {
      colorButton.style.transform = 'scale(1.1)';
    });
    
    colorButton.addEventListener('mouseout', () => {
      colorButton.style.transform = 'scale(1)';
    });
    
    // Add color name to button
    const colorName = document.createElement('div');
    colorName.textContent = color.toUpperCase();
    colorName.style.position = 'absolute';
    colorName.style.bottom = '-30px';
    colorName.style.left = '50%';
    colorName.style.transform = 'translateX(-50%)';
    colorName.style.color = 'white';
    colorName.style.fontWeight = 'bold';
    colorName.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.8)';
    colorButton.style.position = 'relative';
    colorButton.appendChild(colorName);
    
    colorButton.addEventListener('click', () => {
      chooseColor(color);
      colorChoiceElement.style.display = 'none';
    });
    
    colorButtonsContainer.appendChild(colorButton);
  });
}

// Show color choice dialog
function showColorChoiceUI() {
  const colorChoiceElement = document.getElementById('color-choice');
  if (!colorChoiceElement) {
    setupColorChoiceUI();
  }
  colorChoiceElement.style.display = 'flex';
  
  // Ensure the dialog is visible and centered
  colorChoiceElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

// Check if a card can be played (for UI validation)
function canPlayCard(card, topDiscard, currentColor) {
  if (card.value === 'Wild' || card.value === 'Wild Draw 4') {
    return true;
  }
  
  if (card.color === currentColor) {
    return true;
  }
  
  if (card.value === topDiscard.value) {
    return true;
  }
  
  return false;
}

// Check if player has any legal moves
function playerHasLegalMove() {
  if (!gameState.isGameStarted || gameState.waitingForColorChoice) {
    return false;
  }
  
  const player = gameState.players[0]; // Human player
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  
  // Check each card in hand to see if any can be played
  for (let i = 0; i < player.hand.length; i++) {
    if (canPlayCard(player.hand[i], topDiscard, gameState.currentColor)) {
      return true; // Found at least one playable card
    }
  }
  
  return false; // No playable cards
}

// Update game display
function updateGameDisplay(state, drawnCard = null) {
  // Show the color choice UI if needed
  if (state.waitingForColorChoice && state.currentPlayerIndex === 0) {
    showColorChoiceUI();
  }
  
  // No need to update draw button state as we're using direct deck tapping
  
  // Render all game elements
  renderOpponents();
  renderDeckAndDiscardPile();
  renderPlayerHand();
  updateTurnIndicator();
  
  // Never auto-play cards for human player, even if they can be played
  // This section intentionally left empty to prevent auto-playing drawn cards
}

// Add animation when a card is played
function animateCardPlay(cardIndex, isPlayerCard) {
  // To be implemented for a more interactive experience
}

// Initialize game when the page loads
window.addEventListener('DOMContentLoaded', () => {
  // Hide any buttons that might be leftover from previous implementation
  const sayUnoButton = document.getElementById('say-uno');
  const toggleSoundButton = document.getElementById('toggle-sound');
  const drawCardButton = document.getElementById('draw-card');
  
  if (sayUnoButton) sayUnoButton.style.display = 'none';
  if (toggleSoundButton) toggleSoundButton.style.display = 'none';
  if (drawCardButton) drawCardButton.style.display = 'none';
  
  // Initialize empty starter display
  initializeEmptyGame();
  renderGame();
  
  // Render Julia character
  renderJulia();
  
  // Add welcome screen
  showWelcomeScreen();
  
  // Add class to body when in standalone mode (added to homescreen)
  if (window.navigator.standalone) {
    document.body.classList.add('standalone');
  }
});

// Render Julia on the left side of the screen - now just using colored initial
function renderJulia() {
  const juliaDisplay = document.getElementById('julia-display');
  if (!juliaDisplay) return;
  
  // Clear previous content
  juliaDisplay.innerHTML = '';
  
  // Create Julia's container with just a colored circle and initial
  const juliaContainer = document.createElement('div');
  juliaContainer.style.width = '120px';
  juliaContainer.style.height = '120px';
  juliaContainer.style.borderRadius = '50%';
  juliaContainer.style.backgroundColor = '#FFCC66'; // Golden yellow for Julia
  juliaContainer.style.display = 'flex';
  juliaContainer.style.justifyContent = 'center';
  juliaContainer.style.alignItems = 'center';
  juliaContainer.style.fontSize = '60px';
  juliaContainer.style.color = 'white';
  juliaContainer.style.fontWeight = 'bold';
  juliaContainer.style.border = '3px solid white';
  juliaContainer.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  juliaContainer.textContent = 'J';
  
  // Create Julia's name
  const juliaName = document.createElement('span');
  juliaName.textContent = 'Julia';
  juliaName.style.fontSize = '20px';
  juliaName.style.fontWeight = 'bold';
  juliaName.style.color = 'black';
  juliaName.style.backgroundColor = 'white';
  juliaName.style.padding = '5px 12px';
  juliaName.style.borderRadius = '12px';
  juliaName.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  juliaName.style.marginTop = '10px';
  juliaName.style.display = 'inline-block';
  
  // Add elements to Julia display
  juliaDisplay.appendChild(juliaContainer);
  juliaDisplay.appendChild(juliaName);
}

// Show welcome screen on first load
function showWelcomeScreen() {
  // Create welcome screen container
  const welcomeScreen = document.createElement('div');
  welcomeScreen.className = 'welcome-screen';
  
  // Add content
  const content = document.createElement('div');
  content.className = 'welcome-content';
  
  // Title
  const title = document.createElement('h1');
  title.textContent = 'Bluey UNO!';
  title.style.fontSize = '50px';
  title.style.color = 'white';
  title.style.textShadow = '0 2px 5px rgba(0, 0, 0, 0.5)';
  title.style.marginBottom = '20px';
  
  // Description
  const description = document.createElement('p');
  description.textContent = 'Play UNO with Bluey and friends!';
  description.style.fontSize = '24px';
  description.style.marginBottom = '40px';
  description.style.color = 'white';
  
  // Player count selection
  const playerSelection = document.createElement('div');
  playerSelection.style.marginBottom = '30px';
  playerSelection.style.textAlign = 'center';
  
  const playerCountLabel = document.createElement('div');
  playerCountLabel.textContent = 'How many opponents?';
  playerCountLabel.style.fontSize = '22px';
  playerCountLabel.style.color = 'white';
  playerCountLabel.style.marginBottom = '15px';
  
  const playerButtons = document.createElement('div');
  playerButtons.style.display = 'flex';
  playerButtons.style.justifyContent = 'center';
  playerButtons.style.gap = '15px';
  
  // Add buttons for 1-3 players
  let selectedPlayers = 1; // Default to 1 opponent (Bluey)
  
  for (let i = 1; i <= 3; i++) {
    const button = document.createElement('div');
    button.textContent = i;
    button.style.width = '50px';
    button.style.height = '50px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = i === 1 ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)'; // Default select 1 player
    button.style.color = i === 1 ? 'white' : 'black';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.fontSize = '24px';
    button.style.fontWeight = 'bold';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    button.style.transition = 'all 0.3s ease';
    
    // Add click handler
    button.addEventListener('click', () => {
      // Update selected player count
      selectedPlayers = i;
      
      // Update button styles
      playerButtons.childNodes.forEach((btn, idx) => {
        btn.style.backgroundColor = idx + 1 === i ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)';
        btn.style.color = idx + 1 === i ? 'white' : 'black';
      });
    });
    
    playerButtons.appendChild(button);
  }
  
  playerSelection.appendChild(playerCountLabel);
  playerSelection.appendChild(playerButtons);
  
  // UNO deck to click instead of a button
  const startDeck = document.createElement('div');
  startDeck.style.width = '140px';
  startDeck.style.height = '210px';
  startDeck.style.backgroundColor = '#ff66a5'; // Pink
  startDeck.style.backgroundImage = 'repeating-linear-gradient(-45deg, #ff66a5, #ff66a5 15px, #e5407e 15px, #e5407e 30px)';
  startDeck.style.borderRadius = '15px';
  startDeck.style.position = 'relative';
  startDeck.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.3)';
  startDeck.style.border = '5px solid white';
  startDeck.style.margin = '20px auto';
  startDeck.style.cursor = 'pointer';
  
  // Add UNO logo to the deck
  const unoLogo = document.createElement('div');
  unoLogo.textContent = 'UNO';
  unoLogo.style.position = 'absolute';
  unoLogo.style.top = '50%';
  unoLogo.style.left = '50%';
  unoLogo.style.transform = 'translate(-50%, -50%) rotate(-30deg)';
  unoLogo.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
  unoLogo.style.fontSize = '40px';
  unoLogo.style.fontWeight = 'bold';
  unoLogo.style.color = 'white';
  unoLogo.style.backgroundColor = 'red';
  unoLogo.style.padding = '5px 15px';
  unoLogo.style.borderRadius = '20px';
  unoLogo.style.border = '3px solid white';
  unoLogo.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  
  // Add text below deck
  const tapText = document.createElement('div');
  tapText.textContent = 'Tap to Play!';
  tapText.style.fontSize = '30px';
  tapText.style.fontWeight = 'bold';
  tapText.style.color = 'white';
  tapText.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
  tapText.style.marginTop = '20px';
  
  // Add click event
  startDeck.addEventListener('click', () => {
    document.body.removeChild(welcomeScreen);
    // Start game with the selected number of players (adding 1 for the human player)
    startGame(selectedPlayers + 1);
  });
  
  startDeck.appendChild(unoLogo);
  
  // Add pulse animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-welcome {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
  
  // Add UNO cards visual around the content
  for (let i = 0; i < 8; i++) {
    const card = document.createElement('div');
    card.className = 'welcome-card';
    card.style.position = 'absolute';
    card.style.width = '100px';
    card.style.height = '150px';
    card.style.borderRadius = '10px';
    card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    
    // Set random rotation and save it as a CSS variable for the animation
    const rotation = Math.random() * 60 - 30;
    card.style.setProperty('--rotation', `${rotation}deg`);
    card.style.setProperty('--index', i);
    card.style.transform = `rotate(${rotation}deg)`;
    
    // Random position around the edges
    const side = Math.floor(Math.random() * 4);
    if (side === 0) { // top
      card.style.top = '5%';
      card.style.left = `${Math.random() * 70 + 15}%`;
    } else if (side === 1) { // right
      card.style.top = `${Math.random() * 70 + 15}%`;
      card.style.right = '5%';
    } else if (side === 2) { // bottom
      card.style.bottom = '5%';
      card.style.left = `${Math.random() * 70 + 15}%`;
    } else { // left
      card.style.top = `${Math.random() * 70 + 15}%`;
      card.style.left = '5%';
    }
    
    // Random color
    const colors = ['#ff3b3b', '#0066cc', '#3cb043', '#ffcc00'];
    card.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Add emoji to the card
    const emoji = document.createElement('div');
    emoji.style.fontSize = '40px';
    emoji.style.position = 'absolute';
    emoji.style.top = '50%';
    emoji.style.left = '50%';
    emoji.style.transform = 'translate(-50%, -50%)';
    
    // Pick a random emoji from our UNO card set
    const emojis = ['😬', '😁', '😍', '😇', '😎', '🙂', '😊', '😘', '😠', '👍', '💩'];
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    card.appendChild(emoji);
    welcomeScreen.appendChild(card);
  }
  
  // Assemble and add to page
  content.appendChild(title);
  content.appendChild(description);
  content.appendChild(playerSelection);
  content.appendChild(startDeck);
  content.appendChild(tapText);
  welcomeScreen.appendChild(content);
  document.body.appendChild(welcomeScreen);
}

export {
  renderGame,
  updateGameDisplay,
  showColorChoiceUI,
  renderJulia
};