import { gameState, playCard, chooseColor, startGame, drawCard, initializeEmptyGame } from './game.js';
import { colors } from './deck.js';
import { getCharacterDisplay, loadCharacterImages } from './images.js';

// Helper function to apply common styles to elements
function applyStyles(element, styles) {
  for (const [property, value] of Object.entries(styles)) {
    element.style[property] = value;
  }
  return element;
}

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

// Create character name element
function createCharacterName(characterName, isNameOnly = false) {
  return createNameBadge(characterName, false);
}

// Create card badge for displaying card count
function createCardBadge(cards) {
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
  
  return cardBadge;
}

// Create a container for opponent cards
function createCardsContainer(player) {
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'opponent-cards';
  cardsContainer.style.position = 'relative';
  cardsContainer.style.display = 'flex';
  cardsContainer.style.flexDirection = 'row';
  cardsContainer.style.justifyContent = 'center';
  cardsContainer.style.marginTop = '20px';
  cardsContainer.style.minHeight = '70px';
  cardsContainer.style.width = '110%';
  cardsContainer.style.maxWidth = '350px';
  cardsContainer.style.flexWrap = 'wrap';
  cardsContainer.style.alignItems = 'center';
  cardsContainer.style.marginLeft = '-5%';
  
  // Calculate card overlap factor based on number of cards
  const cardOverlapFactor = Math.min(1, 7 / Math.max(1, player.hand.length));
  const cardOverlap = -20 * cardOverlapFactor;
  
  // Create visual representation of all cards
  for (let j = 0; j < player.hand.length; j++) {
    const card = document.createElement('div');
    card.className = 'opponent-card';
    
    // Calculate card size based on number of cards
    const cardSize = Math.max(26, 35 - Math.min(10, Math.max(0, player.hand.length - 5)));
    
    // Style the card
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize * 1.4}px`;
    card.style.backgroundColor = '#4682b4';
    card.style.border = '2px solid white';
    card.style.borderRadius = '5px';
    card.style.margin = `0 ${cardOverlap}px`;
    card.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    card.style.zIndex = j;
    card.style.position = 'relative';
    
    cardsContainer.appendChild(card);
  }
  
  return cardsContainer;
}

// Render the opponents (Bluey characters)
function renderOpponents() {
  const opponentsArea = document.getElementById('opponents-area');
  opponentsArea.innerHTML = '';
  
  // Set up the layout
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
    
    // Create UNO indicator if needed
    if (player.hand.length === 1 && player.hasCalledUno) {
      const unoIndicator = document.createElement('div');
      unoIndicator.className = 'uno-indicator';
      unoIndicator.textContent = 'UNO!';
      opponent.appendChild(unoIndicator);
    }
    
    // Handle different character types
    if (player.name === 'Bluey') {
      // For Bluey, only add the name (no image)
      opponent.appendChild(createNameBadge(player.name, false));
    } else {
      // For other characters, create and add the image with badge
      const characterImage = document.createElement('div');
      characterImage.className = 'character-image';
      characterImage.style.width = '100px';
      characterImage.style.height = '100px';
      characterImage.style.position = 'relative';
      
      // Add the character display inside this container
      const display = createCharacterDisplay(player.name, 100, true);
      characterImage.appendChild(display);
      
      // Add the card badge
      const cardBadge = createCardBadge(player.hand.length);
      characterImage.appendChild(cardBadge);
      
      opponent.appendChild(characterImage);
      
      // Add character name
      opponent.appendChild(createNameBadge(player.name, false));
    }
    
    // Add cards container to show visual representation of cards
    opponent.appendChild(createCardsContainer(player));
    
    // Add the opponent to the area
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

// Create a container for player cards
function createPlayerCardsContainer() {
  const container = document.createElement('div');
  
  applyStyles(container, {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '5px',
    padding: '10px 5px',
    width: '100%'
  });
  
  return container;
}

// Create player cards title
function createPlayerCardsTitle() {
  const title = document.createElement('div');
  title.textContent = 'Your Cards';
  
  applyStyles(title, {
    width: '100%',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333'
  });
  
  return title;
}

// Create UNO indicator for player
function createPlayerUnoIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'uno-indicator';
  indicator.textContent = 'UNO!';
  
  applyStyles(indicator, {
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)'
  });
  
  return indicator;
}

// Customize a card element for player's hand
function customizePlayerCard(cardElement) {
  // Make cards smaller with slight spacing
  applyStyles(cardElement, {
    width: '88px',
    height: '132px',
    margin: '0 -2px 0 0'
  });
  
  // Reduce emoji size
  const emoji = cardElement.querySelector('.card-emoji');
  if (emoji) {
    emoji.style.fontSize = '35px';
  }
  
  // Make corner numbers smaller
  const corners = cardElement.querySelectorAll('.card-corner');
  corners.forEach(corner => {
    applyStyles(corner, {
      fontSize: '15px',
      width: '20px',
      height: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0',
      margin: '0'
    });
  });
  
  return cardElement;
}

// Render the player's hand
function renderPlayerHand() {
  const playerHandElement = document.getElementById('player-hand');
  playerHandElement.innerHTML = '';
  playerHandElement.scrollLeft = 0; // Reset scroll position
  
  const player = gameState.players[0]; // Human player
  
  // Create container for better card arrangement
  const cardsContainer = createPlayerCardsContainer();
  
  // Add title for player's cards
  cardsContainer.appendChild(createPlayerCardsTitle());
  
  // Handle Uno indicator
  if (player.hand.length === 1 && player.hasCalledUno) {
    playerHandElement.appendChild(createPlayerUnoIndicator());
  }
  
  // Create and add card elements
  player.hand.forEach((card, index) => {
    // Create the base card
    const cardElement = createCardElement(card, index, false);
    
    // Customize it for player's hand
    customizePlayerCard(cardElement);
    
    // Add to container
    cardsContainer.appendChild(cardElement);
  });
  
  // Add the cards container to the hand element
  playerHandElement.appendChild(cardsContainer);
}

// Moved the applyStyles function to be at the top of the file

// Helper function to create card corners
function createCardCorner(card, position) {
  const corner = document.createElement('div');
  corner.className = `card-corner ${position}`;
  
  // Set position styles
  const styles = {
    position: 'absolute',
    ...(position === 'top-left' 
        ? { top: '2px', left: '2px' } 
        : { bottom: '2px', right: '2px' })
  };
  
  applyStyles(corner, styles);
  
  // Determine what text to show in the corner
  let cornerText;
  if (card.value === 'Skip') {
    cornerText = '⊘';
  } else if (card.value === 'Reverse') {
    cornerText = '⟷';
  } else if (card.value === 'Draw 2') {
    cornerText = '+2';
  } else if (card.value === 'Wild') {
    cornerText = '';
  } else if (card.value === 'Wild Draw 4') {
    cornerText = '+4';
  } else {
    cornerText = card.value;
  }
  
  corner.textContent = cornerText;
  
  // For Wild cards, create a rainbow circle icon in the corners
  if (card.value === 'Wild' || card.value === 'Wild Draw 4') {
    const rainbowCircle = document.createElement('div');
    rainbowCircle.className = 'rainbow-circle';
    applyStyles(rainbowCircle, {
      width: '12px',
      height: '12px'
    });
    
    corner.appendChild(rainbowCircle);
  }
  
  return corner;
}

// Helper function to create card oval and emoji
function createCardCenter(card) {
  // Create the oval background
  const ovalBackground = document.createElement('div');
  ovalBackground.className = 'card-oval';
  
  applyStyles(ovalBackground, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(0deg)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '65%'
  });
  
  // Create emoji element
  const emojiElement = document.createElement('div');
  emojiElement.className = 'card-emoji';
  emojiElement.textContent = card.emoji;
  
  applyStyles(emojiElement, {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    transform: 'rotate(0deg)'
  });
  
  // Add special class for Wild Draw 4
  if (card.color === 'wild' && card.value === 'Wild Draw 4') {
    emojiElement.classList.add('wild-draw-4');
  }
  
  ovalBackground.appendChild(emojiElement);
  return { ovalBackground, emojiElement };
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
  
  // Create card corners
  const topLeft = createCardCorner(card, 'top-left');
  const bottomRight = createCardCorner(card, 'bottom-right');
  
  // Create card center with emoji
  const { ovalBackground, emojiElement } = createCardCenter(card);
  
  // Assemble the card
  cardInner.appendChild(ovalBackground);
  cardElement.appendChild(cardInner);
  cardElement.appendChild(topLeft);
  cardElement.appendChild(bottomRight);
  
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

// Create a standard character display with size customization
function createCharacterDisplay(characterName, size = 100, includeDecorations = true) {
  const container = document.createElement('div');
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.borderRadius = '50%';
  
  // Determine the background color based on character
  let bgColor;
  let decoration = null;
  
  if (characterName === 'Julia') {
    bgColor = '#FFCC66'; // Golden yellow for Julia
  } else if (characterName === 'Bluey') {
    bgColor = '#1E90FF';
  } else if (characterName === 'Bingo') {
    bgColor = '#FF6B6B';
    if (includeDecorations) decoration = '❤️';
  } else if (characterName === 'Bandit') {
    bgColor = '#4169E1';
    if (includeDecorations) decoration = '😎';
  } else {
    bgColor = '#4682B4'; // Default color
  }
  
  container.style.backgroundColor = bgColor;
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.position = 'relative';
  container.style.border = '3px solid white';
  container.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  
  // Add decoration if needed
  if (decoration) {
    const decorationElem = document.createElement('div');
    decorationElem.style.position = 'absolute';
    decorationElem.style.top = '50%';
    decorationElem.style.left = '50%';
    decorationElem.style.transform = 'translate(-50%, -50%)';
    decorationElem.style.fontSize = `${size * 0.8}px`;
    decorationElem.style.opacity = '0.3';
    decorationElem.textContent = decoration;
    container.appendChild(decorationElem);
  }
  
  // Add the initial
  const initial = document.createElement('div');
  initial.textContent = characterName.charAt(0);
  initial.style.color = 'white';
  initial.style.fontSize = `${size * 0.5}px`;
  initial.style.fontWeight = 'bold';
  initial.style.position = 'relative';
  initial.style.zIndex = '1';
  
  container.appendChild(initial);
  return container;
}

// Create a name badge for character
function createNameBadge(characterName, isStandalone = false) {
  const nameElem = document.createElement('span');
  nameElem.textContent = characterName;
  nameElem.style.fontSize = '20px';
  nameElem.style.fontWeight = 'bold';
  nameElem.style.color = 'black';
  
  if (isStandalone) {
    // Standalone style (used for Julia)
    nameElem.style.backgroundColor = 'white';
    nameElem.style.padding = '5px 12px';
    nameElem.style.borderRadius = '12px';
    nameElem.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    nameElem.style.marginTop = '10px';
    nameElem.style.display = 'inline-block';
  } else {
    // Regular style (used within opponent div)
    nameElem.className = 'character-name';
  }
  
  return nameElem;
}

// Render Julia on the left side of the screen
function renderJulia() {
  const juliaDisplay = document.getElementById('julia-display');
  if (!juliaDisplay) return;
  
  // Clear previous content
  juliaDisplay.innerHTML = '';
  
  // Create Julia's container with a colored circle and initial
  const juliaContainer = createCharacterDisplay('Julia', 120, false);
  
  // Create Julia's name badge
  const juliaName = createNameBadge('Julia', true);
  
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