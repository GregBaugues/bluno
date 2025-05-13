import { gameState, playCard, chooseColor, startGame, drawCard, initializeEmptyGame } from './game.js';
import { colors } from './deck.js';
import { getCharacterDisplay, characterColors } from './images.js';

// Helper function to apply common styles to elements
function applyStyles(element, styles) {
  for (const [property, value] of Object.entries(styles)) {
    element.style[property] = value;
  }
  return element;
}

// Initialize the game board
function renderGame() {
  console.log('Starting renderGame');
  
  // Render all game elements
  renderOpponents();
  renderDeckAndDiscardPile();
  renderPlayerHand();
  setupColorChoiceUI();
  updateTurnIndicator();
  
  // Render Julia if the function exists
  if (typeof renderJulia === 'function') {
    renderJulia();
  }
  
  console.log('Initial renderGame complete');
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
  
  // Create a visual representation of cards
  const numCards = player.hand.length;
  
  // Limit the number of displayed cards
  const maxVisibleCards = 7;
  const cardsToShow = Math.min(numCards, maxVisibleCards);
  
  // Create and add cards
  for (let i = 0; i < cardsToShow; i++) {
    const card = document.createElement('div');
    card.className = 'opponent-card';
    
    // Use different styling when there's only one card left
    if (numCards === 1) {
      // Style for UNO card
      card.style.width = '40px';
      card.style.height = '56px';
      card.style.backgroundColor = '#ff3b3b';
      card.style.margin = '0 4px';
      card.style.borderRadius = '8px';
      card.style.border = '2px solid white';
      card.style.boxShadow = '0 2px 8px rgba(255, 0, 0, 0.5)';
      
      if (player.hasCalledUno) {
        // Add UNO text on the card
        const unoText = document.createElement('div');
        unoText.textContent = 'UNO';
        unoText.style.color = 'white';
        unoText.style.fontWeight = 'bold';
        unoText.style.fontSize = '12px';
        unoText.style.transform = 'rotate(-45deg)';
        unoText.style.position = 'absolute';
        unoText.style.top = '50%';
        unoText.style.left = '50%';
        unoText.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
        card.appendChild(unoText);
      }
    } else {
      // Standard card styling
      card.style.width = '28px';
      card.style.height = '38px';
      card.style.backgroundColor = '#ff5757';
      card.style.margin = '0 -5px'; // Overlap cards
      card.style.borderRadius = '5px';
      card.style.border = '2px solid white';
      card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    }
    
    cardsContainer.appendChild(card);
  }
  
  // If there are more cards than we're showing, add indicator
  if (numCards > maxVisibleCards) {
    const moreCards = document.createElement('div');
    moreCards.className = 'more-cards';
    moreCards.textContent = `+${numCards - maxVisibleCards}`;
    moreCards.style.marginLeft = '5px';
    moreCards.style.fontWeight = 'bold';
    moreCards.style.opacity = '0.7';
    cardsContainer.appendChild(moreCards);
  }
  
  return cardsContainer;
}

// Create name badge for characters
function createNameBadge(name, isLarge = false) {
  const badge = document.createElement('div');
  badge.className = 'name-badge';
  badge.textContent = name;
  
  // Base styling
  badge.style.backgroundColor = 'white';
  badge.style.color = '#333';
  badge.style.borderRadius = '15px';
  badge.style.padding = isLarge ? '8px 15px' : '4px 10px';
  badge.style.fontWeight = 'bold';
  badge.style.fontSize = isLarge ? '22px' : '16px';
  badge.style.marginTop = '8px';
  badge.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  badge.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
  
  return badge;
}

// Render the opponents (Bluey characters)
function renderOpponents() {
  const opponentsArea = document.getElementById('opponents-area');
  opponentsArea.innerHTML = '';
  
  // Set up the layout - always show 3 opponent slots
  opponentsArea.style.display = 'flex'; 
  opponentsArea.style.justifyContent = 'space-evenly';
  opponentsArea.style.width = '100%';
  opponentsArea.style.maxWidth = '900px';
  opponentsArea.style.margin = '0 auto';
  
  // Define fixed positions for each character
  const positions = [
    { left: '25%', top: '0' },   // Bluey (always first)
    { left: '50%', top: '0' },   // Bingo (middle)
    { left: '75%', top: '0' }    // Bandit (right)
  ];
  
  // Create placeholders for all 3 potential opponent slots
  for (let i = 0; i < 3; i++) {
    const opponentSlot = document.createElement('div');
    opponentSlot.className = 'opponent-slot';
    opponentSlot.style.minWidth = '200px';
    opponentSlot.style.minHeight = '200px';
    opponentSlot.style.display = 'flex';
    opponentSlot.style.flexDirection = 'column';
    opponentSlot.style.alignItems = 'center';
    opponentSlot.style.justifyContent = 'center';
    
    // Check if this position has a player in the current game
    const playerIndex = i + 1; // +1 because human is index 0
    
    if (playerIndex < gameState.players.length) {
      // This is an active player
      const player = gameState.players[playerIndex];
      const opponent = document.createElement('div');
      opponent.className = 'opponent';
      
      // Add highlight for current player
      if (gameState.currentPlayerIndex === playerIndex) {
        opponent.classList.add('current-player');
      }
      
      // Create UNO indicator if needed
      if (player.hand.length === 1 && player.hasCalledUno) {
        const unoIndicator = document.createElement('div');
        unoIndicator.className = 'uno-indicator';
        unoIndicator.textContent = 'UNO!';
        opponent.appendChild(unoIndicator);
      }
      
      // Create and add the image with badge for all characters
      const characterImage = document.createElement('div');
      characterImage.className = 'character-image';
      characterImage.style.width = '100px';
      characterImage.style.height = '100px';
      characterImage.style.position = 'relative';
      
      // Add the character display inside this container
      if (player.name === 'Bluey') {
        // For Bluey, use the createCharacterDisplay function
        const blueyDisplay = createCharacterDisplay('Bluey', 100);
        characterImage.appendChild(blueyDisplay);
      } else {
        // For other characters, use getCharacterDisplay from images.js
        characterImage.innerHTML = getCharacterDisplay(player.name);
      }
      
      // Card badges have been removed from all character images
      
      opponent.appendChild(characterImage);
      
      // Add character name
      opponent.appendChild(createNameBadge(player.name, false));
      
      // Add cards container to show visual representation of cards
      opponent.appendChild(createCardsContainer(player));
      
      // Add the opponent to the slot
      opponentSlot.appendChild(opponent);
    }
    
    // Add the slot to the area regardless of whether it contains a player
    opponentsArea.appendChild(opponentSlot);
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
  deckBack.className = 'card-back';
  deckBack.style.width = '120px';
  deckBack.style.height = '168px';
  deckBack.style.borderRadius = '10px';
  deckBack.style.backgroundColor = '#ff5757';
  deckBack.style.border = '3px solid white';
  deckBack.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  deckBack.style.position = 'relative';
  deckBack.style.display = 'flex';
  deckBack.style.justifyContent = 'center';
  deckBack.style.alignItems = 'center';
  
  // Add UNO logo to deck back
  const unoLogo = document.createElement('div');
  unoLogo.textContent = 'UNO';
  unoLogo.style.color = 'white';
  unoLogo.style.fontSize = '32px';
  unoLogo.style.fontWeight = 'bold';
  unoLogo.style.transform = 'rotate(-45deg)';
  unoLogo.style.textShadow = '0 2px 5px rgba(0, 0, 0, 0.5)';
  unoLogo.style.letterSpacing = '2px';
  deckBack.appendChild(unoLogo);
  
  // Add card count to deck
  const deckCount = document.createElement('div');
  deckCount.className = 'deck-count';
  deckCount.textContent = gameState.deck.length.toString();
  deckCount.style.position = 'absolute';
  deckCount.style.top = '-10px';
  deckCount.style.right = '-10px';
  deckCount.style.backgroundColor = 'white';
  deckCount.style.color = '#333';
  deckCount.style.borderRadius = '50%';
  deckCount.style.width = '30px';
  deckCount.style.height = '30px';
  deckCount.style.display = 'flex';
  deckCount.style.justifyContent = 'center';
  deckCount.style.alignItems = 'center';
  deckCount.style.fontWeight = 'bold';
  deckCount.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  deckCount.style.border = '2px solid #ff5757';
  deckBack.appendChild(deckCount);
  
  deckElement.appendChild(deckBack);
  
  // Add click handler for drawing cards
  deckElement.onclick = () => {
    if (gameState.currentPlayerIndex === 0) { // Only if it's the human player's turn
      if (gameState.requiredDraws > 0) {
        // If player needs to draw cards due to Draw 2 or Draw 4
        drawCard(gameState);
        
        // Remove 'required-draw' and 'active-deck' classes when no more draws required
        if (gameState.requiredDraws === 0) {
          deckElement.classList.remove('required-draw');
          deckElement.classList.remove('active-deck');
          
          // Remove any draw indicators
          const drawIndicators = document.querySelectorAll('.draw-indicator, .deck-reminder');
          drawIndicators.forEach(indicator => {
            indicator.parentElement.removeChild(indicator);
          });
        }
      } else if (!gameState.waitingForColorChoice) {
        // Regular draw
        drawCard(gameState);
      }
    }
  };
  
  // Add required draw indicators and styling if needed
  if (gameState.requiredDraws > 0) {
    // Remove any existing indicators first
    const existingIndicators = document.querySelectorAll('.draw-indicator, .deck-reminder');
    existingIndicators.forEach(reminder => {
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
  }
  
  // Render discard pile
  discardPileElement.innerHTML = '';
  
  if (gameState.discardPile.length > 0) {
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const cardElement = createCardElement(topCard);
    
    // Add a subtle glow effect to the top discard card
    cardElement.style.boxShadow = `0 0 15px rgba(255, 255, 255, 0.7), 0 4px 8px rgba(0, 0, 0, 0.3)`;
    
    discardPileElement.appendChild(cardElement);
    
    // Show the current color if it's a wild card
    if ((topCard.value === 'Wild' || topCard.value === 'Wild Draw 4') && gameState.currentColor) {
      updateColorIndicator(gameState.currentColor);
    } else {
      updateColorIndicator(topCard.color);
    }
  } else {
    // Show empty placeholder for discard pile
    const emptyPile = document.createElement('div');
    emptyPile.className = 'empty-discard';
    emptyPile.style.width = '120px';
    emptyPile.style.height = '168px';
    emptyPile.style.borderRadius = '10px';
    emptyPile.style.border = '3px dashed rgba(255, 255, 255, 0.5)';
    emptyPile.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    discardPileElement.appendChild(emptyPile);
    
    // Hide color indicator when no cards are in play
    updateColorIndicator(null);
  }
}

// Update the color indicator on the side of the screen
function updateColorIndicator(color) {
  const indicator = document.getElementById('color-indicator');
  if (!indicator) return;
  
  if (!color) {
    // Hide indicator if no color
    indicator.style.display = 'none';
    return;
  }
  
  // Show and update indicator
  indicator.style.display = 'block';
  
  // Map color names to actual CSS colors
  const colorMap = {
    'red': '#ff3b3b',
    'blue': '#4a7af5',
    'green': '#47c83e',
    'yellow': '#ffee3e'
  };
  
  const cssColor = colorMap[color.toLowerCase()] || '#ffffff';
  
  // Style the indicator
  indicator.style.backgroundColor = cssColor;
  indicator.style.width = '30px';
  indicator.style.height = '150px';
  indicator.style.borderRadius = '15px';
  indicator.style.boxShadow = `0 0 20px ${cssColor}88`;
  indicator.style.border = '3px solid white';
}

// Render the player's hand
function renderPlayerHand() {
  const playerHandElement = document.getElementById('player-hand');
  playerHandElement.innerHTML = '';
  
  // Removed the "Your Cards" title as it's obvious
  
  // Get player's hand
  const playerHand = gameState.players[0].hand;
  
  // Create container for cards
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'player-cards';
  cardsContainer.style.display = 'flex';
  cardsContainer.style.justifyContent = 'center';
  cardsContainer.style.flexWrap = 'wrap';
  cardsContainer.style.gap = '10px';
  playerHandElement.appendChild(cardsContainer);
  
  // Generate card elements
  playerHand.forEach((card, index) => {
    const cardElement = createCardElement(card);
    
    // Add active class if it's the player's turn and the card is playable
    if (gameState.currentPlayerIndex === 0 && !gameState.waitingForColorChoice && isCardPlayable(card)) {
      cardElement.classList.add('playable-card');
      
      // Add click handler for playable cards
      cardElement.onclick = () => {
        // Play the card
        playCard(gameState, 0, index);
      };
    }
    
    cardsContainer.appendChild(cardElement);
  });
  
  // Display UNO button if player has 2 cards left
  if (playerHand.length === 2 && gameState.currentPlayerIndex === 0 && !gameState.players[0].hasCalledUno) {
    const unoButtonContainer = document.createElement('div');
    unoButtonContainer.style.display = 'flex';
    unoButtonContainer.style.justifyContent = 'center';
    unoButtonContainer.style.marginTop = '20px';
    
    const unoButton = document.createElement('button');
    unoButton.textContent = 'Say UNO!';
    unoButton.className = 'uno-button';
    unoButton.style.padding = '10px 25px';
    unoButton.style.fontSize = '20px';
    unoButton.style.fontWeight = 'bold';
    unoButton.style.backgroundColor = '#ff3b3b';
    unoButton.style.color = 'white';
    unoButton.style.border = 'none';
    unoButton.style.borderRadius = '15px';
    unoButton.style.cursor = 'pointer';
    unoButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    unoButton.style.transform = 'scale(1)';
    unoButton.style.transition = 'transform 0.2s';
    
    // Add hover effect
    unoButton.onmouseenter = () => {
      unoButton.style.transform = 'scale(1.05)';
    };
    
    unoButton.onmouseleave = () => {
      unoButton.style.transform = 'scale(1)';
    };
    
    // Add click handler
    unoButton.onclick = () => {
      // Set UNO flag for player
      gameState.players[0].hasCalledUno = true;
      // Update display
      updateGameDisplay(gameState);
      
      // Add animation and sound
      const unoAnimation = document.createElement('div');
      unoAnimation.className = 'uno-animation';
      unoAnimation.textContent = 'UNO!';
      unoAnimation.style.position = 'fixed';
      unoAnimation.style.top = '50%';
      unoAnimation.style.left = '50%';
      unoAnimation.style.transform = 'translate(-50%, -50%)';
      unoAnimation.style.fontSize = '100px';
      unoAnimation.style.fontWeight = 'bold';
      unoAnimation.style.color = '#ff3b3b';
      unoAnimation.style.textShadow = '0 0 20px white';
      unoAnimation.style.zIndex = '9999';
      document.body.appendChild(unoAnimation);
      
      // Play UNO sound
      // soundSystem.playUnoSound();
      
      // Animate and remove
      unoAnimation.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 1 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 }
        ],
        {
          duration: 1500,
          easing: 'ease-in-out'
        }
      ).onfinish = () => {
        document.body.removeChild(unoAnimation);
      };
    };
    
    unoButtonContainer.appendChild(unoButton);
    playerHandElement.appendChild(unoButtonContainer);
  }
}

// Setup color choice UI
function setupColorChoiceUI() {
  const colorChoiceElement = document.getElementById('color-choice');
  const colorButtonsElement = document.getElementById('color-buttons');
  
  if (!colorChoiceElement || !colorButtonsElement) return;
  
  // Clear existing buttons
  colorButtonsElement.innerHTML = '';
  
  // Hide or show color choice based on game state
  if (gameState.waitingForColorChoice) {
    colorChoiceElement.style.display = 'flex';
    colorChoiceElement.style.flexDirection = 'column';
    colorChoiceElement.style.alignItems = 'center';
    colorChoiceElement.style.justifyContent = 'center';
    colorChoiceElement.style.position = 'fixed';
    colorChoiceElement.style.top = '50%';
    colorChoiceElement.style.left = '50%';
    colorChoiceElement.style.transform = 'translate(-50%, -50%)';
    colorChoiceElement.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    colorChoiceElement.style.padding = '30px';
    colorChoiceElement.style.borderRadius = '20px';
    colorChoiceElement.style.boxShadow = '0 0 0 2000px rgba(0, 0, 0, 0.5), 0 5px 25px rgba(0, 0, 0, 0.5)';
    colorChoiceElement.style.zIndex = '1000';
    
    // Generate color buttons
    const colorOptions = ['red', 'blue', 'green', 'yellow'];
    
    // Create container for buttons
    colorButtonsElement.style.display = 'flex';
    colorButtonsElement.style.justifyContent = 'center';
    colorButtonsElement.style.gap = '15px';
    colorButtonsElement.style.marginTop = '15px';
    
    // Map of colors to emoji
    const colorEmojis = {
      'red': '❤️',
      'blue': '💙',
      'green': '💚',
      'yellow': '💛'
    };
    
    // Create buttons for each color
    colorOptions.forEach(color => {
      const button = document.createElement('button');
      button.className = 'color-button';
      button.dataset.color = color;
      
      // Style the button
      button.style.width = '80px';
      button.style.height = '80px';
      button.style.borderRadius = '50%';
      button.style.border = 'none';
      button.style.cursor = 'pointer';
      button.style.fontSize = '40px';
      button.style.display = 'flex';
      button.style.justifyContent = 'center';
      button.style.alignItems = 'center';
      button.style.transition = 'transform 0.2s';
      
      // Set color-specific styles
      const colorMap = {
        'red': '#ff3b3b',
        'blue': '#4a7af5',
        'green': '#47c83e',
        'yellow': '#ffee3e'
      };
      
      button.style.backgroundColor = colorMap[color];
      button.style.boxShadow = `0 4px 10px ${colorMap[color]}88`;
      button.innerHTML = colorEmojis[color];
      
      // Add hover effect
      button.onmouseenter = () => {
        button.style.transform = 'scale(1.1)';
      };
      
      button.onmouseleave = () => {
        button.style.transform = 'scale(1)';
      };
      
      // Add click handler
      button.onclick = () => {
        chooseColor(gameState, color);
        colorChoiceElement.style.display = 'none';
      };
      
      colorButtonsElement.appendChild(button);
    });
  } else {
    colorChoiceElement.style.display = 'none';
  }
}

// Helper to determine if a card is playable based on the current game state
function isCardPlayable(card) {
  // If required draws are pending, no cards are playable
  if (gameState.requiredDraws > 0) {
    return false;
  }
  
  // If waiting for color choice, no cards are playable
  if (gameState.waitingForColorChoice) {
    return false;
  }
  
  // Check if discard pile is empty
  if (!gameState.discardPile || gameState.discardPile.length === 0) {
    // If no cards in discard pile, any card is playable
    return true;
  }
  
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  
  // Wild cards are always playable
  if (card.value === 'Wild' || card.value === 'Wild Draw 4') {
    return true;
  }
  
  // If top card is wild, match against current color
  if (topCard && (topCard.value === 'Wild' || topCard.value === 'Wild Draw 4') && gameState.currentColor) {
    return card.color === gameState.currentColor;
  }
  
  // Otherwise, match color or value
  return !topCard || card.color === topCard.color || card.value === topCard.value;
}

// Create a card element for display
function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  
  // Base card styling
  cardElement.style.width = '80px';
  cardElement.style.height = '112px';
  cardElement.style.borderRadius = '10px';
  cardElement.style.border = '3px solid white';
  cardElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  cardElement.style.position = 'relative';
  cardElement.style.display = 'flex';
  cardElement.style.flexDirection = 'column';
  cardElement.style.justifyContent = 'center';
  cardElement.style.alignItems = 'center';
  cardElement.style.transition = 'transform 0.2s';
  
  // Color-specific styling
  const colorMap = {
    'red': '#ff3b3b',
    'blue': '#4a7af5',
    'green': '#47c83e',
    'yellow': '#ffee3e'
  };
  
  if (card.value === 'Wild' || card.value === 'Wild Draw 4') {
    // Special styling for wild cards
    cardElement.style.background = 'linear-gradient(135deg, #ff3b3b 0%, #4a7af5 50%, #47c83e 75%, #ffee3e 100%)';
  } else {
    cardElement.style.backgroundColor = colorMap[card.color.toLowerCase()];
  }
  
  // Add value and emoji to card
  const cardContent = document.createElement('div');
  cardContent.className = 'card-content';
  cardContent.style.fontSize = '40px';
  cardContent.style.display = 'flex';
  cardContent.style.flexDirection = 'column';
  cardContent.style.alignItems = 'center';
  cardContent.style.justifyContent = 'center';
  cardContent.style.height = '100%';
  cardContent.style.width = '100%';
  
  // Add card value to top-left and bottom-right corners
  const topValue = document.createElement('div');
  topValue.className = 'card-corner top-left';
  topValue.textContent = card.value;
  topValue.style.position = 'absolute';
  topValue.style.top = '5px';
  topValue.style.left = '5px';
  topValue.style.fontSize = '16px';
  topValue.style.fontWeight = 'bold';
  topValue.style.color = 'white';
  
  const bottomValue = document.createElement('div');
  bottomValue.className = 'card-corner bottom-right';
  bottomValue.textContent = card.value;
  bottomValue.style.position = 'absolute';
  bottomValue.style.bottom = '5px';
  bottomValue.style.right = '5px';
  bottomValue.style.fontSize = '16px';
  bottomValue.style.fontWeight = 'bold';
  bottomValue.style.color = 'white';
  bottomValue.style.transform = 'rotate(180deg)';
  
  cardElement.appendChild(topValue);
  cardElement.appendChild(bottomValue);
  
  // Add emoji for card value
  const emoji = document.createElement('div');
  emoji.textContent = card.emoji;
  emoji.style.fontSize = '40px';
  emoji.style.textAlign = 'center';
  
  cardContent.appendChild(emoji);
  cardElement.appendChild(cardContent);
  
  // Add hover effect for playable cards (handled in renderPlayerHand)
  cardElement.onmouseenter = () => {
    if (cardElement.classList.contains('playable-card')) {
      cardElement.style.transform = 'translateY(-10px)';
      cardElement.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.2)';
    }
  };
  
  cardElement.onmouseleave = () => {
    cardElement.style.transform = 'translateY(0)';
    cardElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  };
  
  return cardElement;
}

// Function to update the game display based on the current state
function updateGameDisplay(gameState) {
  // Update all UI components
  renderOpponents();
  renderDeckAndDiscardPile();
  renderPlayerHand();
  setupColorChoiceUI();
  updateTurnIndicator();
}

// Create a standard character display with size customization
function createCharacterDisplay(characterName, size = 100) {
  const container = document.createElement('div');
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.position = 'relative';
  
  // Choose the proper class for fallback
  let colorClass;
  if (characterName === 'Bluey') {
    colorClass = 'bluey-color';
  } else if (characterName === 'Bingo') {
    colorClass = 'bingo-color';
  } else if (characterName === 'Bandit') {
    colorClass = 'bandit-color';
  } else if (characterName === 'Julia') {
    colorClass = 'julia-color';
  }
  
  // Create fallback first
  const fallback = document.createElement('div');
  fallback.className = `character-fallback ${colorClass}`;
  fallback.textContent = characterName.charAt(0);
  container.appendChild(fallback);
  
  // Add image element for real image
  const image = document.createElement('img');
  image.className = 'character-img';
  // Get image path from preloaded images in the HTML
  const preloadedImg = document.getElementById(`${characterName.toLowerCase()}-img`);
  if (preloadedImg) {
    image.src = preloadedImg.src;
  } else {
    // Fallback path for direct loading
    image.src = `public/images/${characterName.toLowerCase()}.png`;
  }
  image.alt = characterName;
  container.appendChild(image);
  
  // No decorations - removed emoji overlays
  
  return container;
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
  playerCountLabel.textContent = 'Choose number of players:';
  playerCountLabel.style.fontSize = '22px';
  playerCountLabel.style.color = 'white';
  playerCountLabel.style.marginBottom = '15px';
  
  const playerButtons = document.createElement('div');
  playerButtons.style.display = 'flex';
  playerButtons.style.justifyContent = 'center';
  playerButtons.style.gap = '15px';
  
  // Create buttons for 2-4 players
  for (let i = 2; i <= 4; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.borderRadius = '50%';
    button.style.border = 'none';
    button.style.backgroundColor = 'white';
    button.style.color = '#ff5757';
    button.style.fontSize = '28px';
    button.style.fontWeight = 'bold';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    button.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
    
    // Add hover effect
    button.onmouseenter = () => {
      button.style.transform = 'scale(1.1)';
      button.style.backgroundColor = '#ffcc66';
    };
    
    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
      button.style.backgroundColor = 'white';
    };
    
    // Start game with selected number of players
    button.onclick = () => {
      document.body.removeChild(welcomeScreen);
      startGame(i);
    };
    
    playerButtons.appendChild(button);
  }
  
  playerSelection.appendChild(playerCountLabel);
  playerSelection.appendChild(playerButtons);
  
  // Build content
  content.appendChild(title);
  content.appendChild(description);
  content.appendChild(playerSelection);
  welcomeScreen.appendChild(content);
  
  // Style welcome screen
  welcomeScreen.style.position = 'fixed';
  welcomeScreen.style.top = '0';
  welcomeScreen.style.left = '0';
  welcomeScreen.style.width = '100%';
  welcomeScreen.style.height = '100%';
  welcomeScreen.style.backgroundColor = '#ff5757';
  welcomeScreen.style.display = 'flex';
  welcomeScreen.style.justifyContent = 'center';
  welcomeScreen.style.alignItems = 'center';
  welcomeScreen.style.zIndex = '9999';
  welcomeScreen.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
  
  // Add decorative Uno cards floating in background
  for (let i = 0; i < 20; i++) {
    const card = document.createElement('div');
    const size = Math.random() * 50 + 20; // Random size between 20-70px
    const xPos = Math.random() * 100; // Random horizontal position
    const yPos = Math.random() * 100; // Random vertical position
    const rotation = Math.random() * 360; // Random rotation
    const delay = Math.random() * 10; // Random animation delay
    
    card.style.position = 'absolute';
    card.style.width = `${size}px`;
    card.style.height = `${size * 1.4}px`;
    card.style.borderRadius = '5px';
    card.style.left = `${xPos}%`;
    card.style.top = `${yPos}%`;
    card.style.transform = `rotate(${rotation}deg)`;
    
    // Random color
    const colors = ['#4a7af5', '#47c83e', '#ffee3e', '#ff3b3b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    card.style.backgroundColor = randomColor;
    card.style.border = '2px solid white';
    card.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    
    // Add floating animation
    card.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`;
    card.style.animationDelay = `${delay}s`;
    
    welcomeScreen.appendChild(card);
  }
  
  // Add to body
  document.body.appendChild(welcomeScreen);
  
  // Add global styles for animations
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes float {
      0% { transform: translate(0, 0) rotate(${Math.random() * 360}deg); }
      50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg); }
      100% { transform: translate(0, 0) rotate(${Math.random() * 360}deg); }
    }
  `;
  document.head.appendChild(styleElement);
}

// Initialize the game when the page loads
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

export {
  renderGame,
  updateGameDisplay,
  showWelcomeScreen
};