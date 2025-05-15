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
  
  // Initialize direction indicator with the current game direction
  updateDirectionIndicator(gameState.direction);
  
  // Render Julia if the function exists
  if (typeof renderJulia === 'function') {
    renderJulia();
  }
  
  // Always call renderBingo if the function exists, even for 2-player games
  // The function will handle hiding itself when needed
  if (typeof renderBingo === 'function') {
    renderBingo();
  }
  
  // Always call renderDad, and let it decide whether to show itself
  if (typeof renderDad === 'function') {
    renderDad();
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
    
    // Make sure name turn indicator is also hidden
    updateNameTurnIndicator(null);
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
  
  // Update the name-based turn indicator
  if (gameState.players && gameState.players.length > 0) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    updateNameTurnIndicator(currentPlayer?.name || null);
  } else {
    updateNameTurnIndicator(null);
  }
}

// Update the direction indicator based on game direction
function updateDirectionIndicator(direction) {
  const directionIndicator = document.getElementById('direction-indicator');
  if (!directionIndicator) return;
  
  // Set the style for the direction indicator - no background
  directionIndicator.style.width = '60px';
  directionIndicator.style.height = '60px';
  directionIndicator.style.display = 'flex';
  directionIndicator.style.justifyContent = 'center';
  directionIndicator.style.alignItems = 'center';
  directionIndicator.style.fontSize = '40px'; // Larger icon size
  directionIndicator.style.position = 'relative';
  directionIndicator.style.marginTop = '20px';
  
  // Set the emoji based on direction
  if (direction === 1) {
    // Clockwise
    directionIndicator.innerHTML = '🔁';
    directionIndicator.title = 'Clockwise Direction';
    // Add animation for clockwise rotation
    directionIndicator.style.animation = 'rotate-clockwise 3s linear infinite';
    // Add text shadow for visibility without background
    directionIndicator.style.textShadow = '0 0 15px white, 0 0 10px white';
  } else {
    // Counter-clockwise
    directionIndicator.innerHTML = '🔄';
    directionIndicator.title = 'Counter-Clockwise Direction';
    // Add animation for counter-clockwise rotation
    directionIndicator.style.animation = 'rotate-counter-clockwise 3s linear infinite';
    // Add text shadow for visibility without background
    directionIndicator.style.textShadow = '0 0 15px white, 0 0 10px white';
  }
  
  // Make sure the animation style is defined
  if (!document.getElementById('direction-animations')) {
    const style = document.createElement('style');
    style.id = 'direction-animations';
    style.textContent = `
      @keyframes rotate-clockwise {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes rotate-counter-clockwise {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Create or update the name-based turn indicator next to the color indicator
function updateNameTurnIndicator(playerName) {
  // Find the side indicators container
  const sideIndicators = document.getElementById('side-indicators');
  if (!sideIndicators) return;
  
  // Look for existing turn indicator or create a new one
  let nameTurnIndicator = document.getElementById('name-turn-indicator');
  
  if (!nameTurnIndicator) {
    // Create new turn indicator
    nameTurnIndicator = document.createElement('div');
    nameTurnIndicator.id = 'name-turn-indicator';
    
    // Style the indicator - no background
    nameTurnIndicator.style.padding = '10px 15px';
    nameTurnIndicator.style.fontWeight = 'bold';
    nameTurnIndicator.style.fontSize = '18px';
    nameTurnIndicator.style.marginTop = '25px';
    nameTurnIndicator.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive, sans-serif";
    nameTurnIndicator.style.textAlign = 'center';
    nameTurnIndicator.style.minWidth = '130px';
    nameTurnIndicator.style.position = 'relative';
    
    // Add a label above the indicator
    const turnLabel = document.createElement('div');
    turnLabel.textContent = "Current Turn";
    turnLabel.style.fontSize = '14px';
    turnLabel.style.fontWeight = 'bold';
    turnLabel.style.color = 'white';
    turnLabel.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.5)';
    turnLabel.style.position = 'absolute';
    turnLabel.style.top = '-25px';
    turnLabel.style.left = '50%';
    turnLabel.style.transform = 'translateX(-50%)';
    turnLabel.style.width = '100%';
    turnLabel.style.textAlign = 'center';
    
    nameTurnIndicator.appendChild(turnLabel);
    
    // Add after the color indicator
    sideIndicators.appendChild(nameTurnIndicator);
  }
  
  // Set or clear content based on playerName
  if (playerName) {
    nameTurnIndicator.style.display = 'block';
    // Use inner span for the actual player name for styling purposes
    nameTurnIndicator.innerHTML = `<div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-weight: bold; color: white; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); font-size: 14px; width: 100%; text-align: center;">Current Turn</div><span>${playerName}</span>`;
    
    // Set color based on player name
    if (playerName === 'Bluey') {
      nameTurnIndicator.style.color = 'white';
      nameTurnIndicator.style.textShadow = '0 0 10px #1E90FF, 0 0 15px #1E90FF';
    } else if (playerName === 'Bingo') {
      nameTurnIndicator.style.color = 'white';
      nameTurnIndicator.style.textShadow = '0 0 10px #FF6B6B, 0 0 15px #FF6B6B';
    } else if (playerName === 'Dad') {
      nameTurnIndicator.style.color = 'white';
      nameTurnIndicator.style.textShadow = '0 0 10px #5F4B32, 0 0 15px #5F4B32';
    } else if (playerName === 'Bandit') {
      nameTurnIndicator.style.color = 'white';
      nameTurnIndicator.style.textShadow = '0 0 10px #4169E1, 0 0 15px #4169E1';
    } else if (playerName === 'Julia') {
      nameTurnIndicator.style.color = '#333';
      nameTurnIndicator.style.textShadow = '0 0 10px #FFCC66, 0 0 15px #FFCC66';
    } else {
      // Default fallback
      nameTurnIndicator.style.color = '#333';
      nameTurnIndicator.style.textShadow = '0 0 10px white, 0 0 15px white';
    }
  } else {
    // No current player, hide the indicator
    nameTurnIndicator.style.display = 'none';
  }
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
  
  // Reset Dad display flag since we're rebuilding the opponents
  document.body.dataset.dadDisplayed = "false";
  
  // Set up the layout
  opponentsArea.style.display = 'flex'; 
  opponentsArea.style.justifyContent = 'space-evenly'; // Use space-evenly for even distribution
  opponentsArea.style.width = '100%';
  opponentsArea.style.maxWidth = '900px';
  opponentsArea.style.margin = '0 auto';
  opponentsArea.style.position = 'relative'; // Ensure relative positioning for absolute children
  
  // Get the total number of expected opponents (excluding player 0 which is human)
  const totalOpponents = gameState.players ? gameState.players.length - 1 : 3;
  const isFourPlayerGame = totalOpponents >= 3;
  
  // Define positions based on how many opponents we have
  // Instead of using fixed position, we'll now apply styles differently
  // based on the container justification which is space-evenly
  let positions;
  if (totalOpponents === 1) {
    // For 2-player games (1 opponent), center the opponent
    // We'll handle this with a different approach
    positions = [
      { id: 'opponent-bluey' },  // Bluey
      { id: 'opponent-bingo' },  // Bingo slot (handled separately)
      { id: 'opponent-bandit' }  // Unused slot
    ];
  } else if (isFourPlayerGame) {
    // For 4-player games with 3 opponents, rely on space-evenly
    positions = [
      { id: 'opponent-bluey' },  // Bluey
      { id: 'opponent-bingo' },  // Bingo slot (handled separately)
      { id: 'opponent-bandit' }  // Bandit
    ];
  } else {
    // For 3-player games with 2 opponents
    positions = [
      { id: 'opponent-bluey' },  // Bluey
      { id: 'opponent-bingo' },  // Bingo slot (handled separately)
      { id: 'opponent-bandit' }  // Bandit
    ];
  }
  
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
    
    // Apply styling to the slots
    opponentSlot.style.position = 'relative';
    
    // Set ID for the opponent slot for better identification
    if (positions[i] && positions[i].id) {
      opponentSlot.id = positions[i].id;
    }
    
    // Special case for single opponent (center it)
    if (totalOpponents === 1 && i === 0) {
      opponentSlot.style.margin = '0 auto'; // Center the slot
    }
    
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
      } else if (player.name === 'Bingo') {
        // Skip displaying Bingo in the opponent area, as it's handled separately
        opponent.style.visibility = 'hidden'; // Hide the opponent but keep the layout intact
      } else if (player.name === 'Dad') {
        // For Dad, use the createCharacterDisplay function and mark as displayed
        if (i === 2) { // Only show Dad in third opponent slot (i=2)
          const dadDisplay = createCharacterDisplay('Dad', 100);
          characterImage.appendChild(dadDisplay);
          
          // Mark the player as Dad for deduplication in renderDad
          document.body.dataset.dadDisplayed = "true";
        } else {
          // If Dad is not in the correct slot, hide him
          opponent.style.visibility = 'hidden';
        }
      } else {
        // For other characters (like Bandit), use getCharacterDisplay from images.js
        characterImage.innerHTML = getCharacterDisplay(player.name);
      }
      
      // Card badges have been removed from all character images
      
      opponent.appendChild(characterImage);
      
      // Remove character name - only show avatar
      
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
  deckBack.style.width = '96px'; /* Reduced by 20% from 120px */
  
  // Add a small visual indicator on the deck if a player needs to draw cards
  if (gameState.isDrawingCards && gameState.requiredDraws > 0) {
    const drawIndicator = document.createElement('div');
    drawIndicator.className = 'draw-indicator';
    drawIndicator.textContent = `Draw ${gameState.requiredDraws} more`;
    drawIndicator.style.position = 'absolute';
    drawIndicator.style.top = '-30px';
    drawIndicator.style.left = '0';
    drawIndicator.style.width = '100%';
    drawIndicator.style.padding = '5px';
    drawIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    drawIndicator.style.color = 'white';
    drawIndicator.style.borderRadius = '5px';
    drawIndicator.style.textAlign = 'center';
    drawIndicator.style.fontWeight = 'bold';
    drawIndicator.style.zIndex = '10';
    deckBack.appendChild(drawIndicator);
  }
  deckBack.style.height = '134px'; /* Reduced by 20% from 168px */
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
    // Allow drawing when it's either:
    // 1. The player's turn, OR
    // 2. The player has required draws to make (from Draw 2 or Draw 4)
    if (gameState.currentPlayerIndex === 0 || gameState.isDrawingCards) {
      if (gameState.requiredDraws > 0) {
        // If player needs to draw cards due to Draw 2 or Draw 4
        drawCard();
        
        // Remove 'required-draw' and 'active-deck' classes when no more draws required
        if (gameState.requiredDraws === 0) {
          deckElement.classList.remove('required-draw');
          deckElement.classList.remove('active-deck');
          
          // Remove any draw indicators
          const drawIndicators = document.querySelectorAll('.draw-indicator, .deck-reminder');
          drawIndicators.forEach(indicator => {
            if (indicator.parentElement) {
              indicator.parentElement.removeChild(indicator);
            }
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
      
      // We no longer need the large screen-covering indicator
      // Just rely on the small indicator on the deck
      
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
    // Get up to 10 most recent cards from discard pile
    const visibleCardCount = Math.min(gameState.discardPile.length, 10);
    const visibleCards = gameState.discardPile.slice(-visibleCardCount);
    
    // Create a container for the offset cards
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'discard-cards-container';
    cardsContainer.style.position = 'relative';
    cardsContainer.style.width = '100%';
    cardsContainer.style.height = '100%';
    cardsContainer.style.display = 'flex';
    cardsContainer.style.alignItems = 'center';
    cardsContainer.style.justifyContent = 'flex-start';
    cardsContainer.style.overflow = 'visible';
    
    // Add cards with offset
    visibleCards.forEach((card, index) => {
      const isTopCard = index === visibleCards.length - 1;
      // Use true for all cards to make them all the same size
      const cardElement = createCardElement(card, true);
      
      // Add data attribute for card value (for CSS targeting)
      cardElement.setAttribute('data-value', card.value);
      
      // Add color class to the card
      cardElement.classList.add(card.color);
      
      // Calculate offset - move each card 40px to the right of the previous one for better visibility
      const offsetX = index * 40;
      cardElement.style.position = 'absolute';
      cardElement.style.left = `${offsetX}px`;
      // No vertical offset - keep cards on the same level
      cardElement.style.top = '0';
      cardElement.style.setProperty('--index', index); // Set CSS variable for responsive adjustments
      cardElement.style.zIndex = index + 1; // Ensure proper stacking order
      
      // Add glow only to the top card
      if (isTopCard) {
        cardElement.style.boxShadow = `0 0 15px rgba(255, 255, 255, 0.7), 0 4px 8px rgba(0, 0, 0, 0.3)`;
      }
      
      cardsContainer.appendChild(cardElement);
    });
    
    discardPileElement.appendChild(cardsContainer);
    
    // Show the current color based on the top card
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if ((topCard.value === 'Wild' || topCard.value === 'Wild Draw 4') && gameState.currentColor) {
      updateColorIndicator(gameState.currentColor);
    } else {
      updateColorIndicator(topCard.color);
    }
  } else {
    // Show empty placeholder for discard pile
    const emptyPile = document.createElement('div');
    emptyPile.className = 'empty-discard';
    emptyPile.style.width = '96px'; /* Reduced by 20% from 120px */
    emptyPile.style.height = '134px'; /* Reduced by 20% from 168px */
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
  
  // Make sure we also update the direction indicator with the current game direction
  updateDirectionIndicator(gameState.direction);
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
    
    // Add data attribute for card value (for CSS targeting)
    cardElement.setAttribute('data-value', card.value);
    
    // Add color class to the card
    cardElement.classList.add(card.color);
    
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
  
  // Automatically call UNO if player has 2 cards left and plays one
  if (playerHand.length === 2 && gameState.currentPlayerIndex === 0 && !gameState.players[0].hasCalledUno) {
    // Set UNO flag automatically - no button needed
    gameState.players[0].hasCalledUno = true;
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
        // Force hide the color choice UI
        colorChoiceElement.style.display = 'none';
        // Make sure the waitingForColorChoice flag is set to false
        gameState.waitingForColorChoice = false;
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
function createCardElement(card, isDiscardPile = false) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  
  // Base card styling - reduced size by 20% for all cards
  cardElement.style.width = isDiscardPile ? '112px' : '64px'; /* Reduced by 20% */
  cardElement.style.height = isDiscardPile ? '157px' : '90px'; /* Reduced by 20% */
  cardElement.style.borderRadius = '10px';
  cardElement.style.border = '3px solid white';
  cardElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
  cardElement.style.position = 'relative';
  cardElement.style.display = 'flex';
  cardElement.style.flexDirection = 'column';
  cardElement.style.justifyContent = 'center';
  cardElement.style.alignItems = 'center';
  cardElement.style.transition = 'transform 0.2s';
  cardElement.style.overflow = 'hidden';
  
  // Color-specific styling
  const colorMap = {
    'red': '#ff3b3b',
    'blue': '#4a7af5',
    'green': '#47c83e',
    'yellow': '#ffee3e'
  };
  
  // Create card background with color
  if (card.value === 'Wild' || card.value === 'Wild Draw 4') {
    // Special styling for wild cards - black background with colored sections
    cardElement.style.backgroundColor = '#333';
    
    // Create a colorful pattern for wild cards
    const wildPattern = document.createElement('div');
    wildPattern.style.position = 'absolute';
    wildPattern.style.top = '0';
    wildPattern.style.left = '0';
    wildPattern.style.right = '0';
    wildPattern.style.bottom = '0';
    wildPattern.style.zIndex = '0';
    
    // Create quadrants for the wild card
    const colors = ['#ff3b3b', '#4a7af5', '#47c83e', '#ffee3e'];
    
    const tl = document.createElement('div');
    tl.style.position = 'absolute';
    tl.style.top = '0';
    tl.style.left = '0';
    tl.style.width = '50%';
    tl.style.height = '50%';
    tl.style.backgroundColor = colors[0];
    
    const tr = document.createElement('div');
    tr.style.position = 'absolute';
    tr.style.top = '0';
    tr.style.right = '0';
    tr.style.width = '50%';
    tr.style.height = '50%';
    tr.style.backgroundColor = colors[1];
    
    const bl = document.createElement('div');
    bl.style.position = 'absolute';
    bl.style.bottom = '0';
    bl.style.left = '0';
    bl.style.width = '50%';
    bl.style.height = '50%';
    bl.style.backgroundColor = colors[2];
    
    const br = document.createElement('div');
    br.style.position = 'absolute';
    br.style.bottom = '0';
    br.style.right = '0';
    br.style.width = '50%';
    br.style.height = '50%';
    br.style.backgroundColor = colors[3];
    
    wildPattern.appendChild(tl);
    wildPattern.appendChild(tr);
    wildPattern.appendChild(bl);
    wildPattern.appendChild(br);
    
    cardElement.appendChild(wildPattern);
  } else {
    cardElement.style.backgroundColor = colorMap[card.color.toLowerCase()];
  }
  
  // Create center emoji container (without white oval background)
  const centerCircle = document.createElement('div');
  centerCircle.style.position = 'absolute';
  centerCircle.style.width = isDiscardPile ? '100px' : '55px';
  centerCircle.style.height = isDiscardPile ? '100px' : '55px';
  centerCircle.style.display = 'flex';
  centerCircle.style.justifyContent = 'center';
  centerCircle.style.alignItems = 'center';
  centerCircle.style.zIndex = '1';
  
  // Add emoji for card value with larger size
  const emoji = document.createElement('div');
  emoji.textContent = card.emoji;
  emoji.style.fontSize = isDiscardPile ? '80px' : '40px';
  emoji.style.lineHeight = '1';
  emoji.style.textShadow = '0 0 3px rgba(0, 0, 0, 0.3)';
  
  centerCircle.appendChild(emoji);
  cardElement.appendChild(centerCircle);
  
  // Add card value to top-left and bottom-right corners with better styling
  const topValue = document.createElement('div');
  topValue.className = 'card-corner top-left';
  
  // For special cards, use shortened display text
  let displayValue = card.value;
  if (card.value === 'Skip') displayValue = 'S';
  if (card.value === 'Reverse') displayValue = 'R'; 
  if (card.value === 'Draw 2') displayValue = '+2';
  if (card.value === 'Wild') displayValue = 'W';
  if (card.value === 'Wild Draw 4') displayValue = 'W4';
  
  topValue.textContent = displayValue;
  topValue.style.position = 'absolute';
  topValue.style.top = isDiscardPile ? '5px' : '3px';
  topValue.style.left = isDiscardPile ? '5px' : '3px';
  topValue.style.fontSize = isDiscardPile ? '18px' : '12px';
  topValue.style.fontWeight = 'bold';
  topValue.style.color = 'white';
  topValue.style.zIndex = '2';
  topValue.style.padding = '2px';
  topValue.style.display = 'flex';
  topValue.style.justifyContent = 'center';
  topValue.style.alignItems = 'center';
  
  const bottomValue = document.createElement('div');
  bottomValue.className = 'card-corner bottom-right';
  bottomValue.textContent = displayValue;
  bottomValue.style.position = 'absolute';
  bottomValue.style.bottom = isDiscardPile ? '5px' : '3px';
  bottomValue.style.right = isDiscardPile ? '5px' : '3px';
  bottomValue.style.fontSize = isDiscardPile ? '18px' : '12px';
  bottomValue.style.fontWeight = 'bold';
  bottomValue.style.color = 'white';
  bottomValue.style.transform = 'rotate(180deg)';
  bottomValue.style.zIndex = '2';
  bottomValue.style.padding = '2px';
  bottomValue.style.display = 'flex';
  bottomValue.style.justifyContent = 'center';
  bottomValue.style.alignItems = 'center';
  
  // Handle text color for yellow cards
  if (card.color === 'yellow') {
    topValue.style.color = 'black';
    bottomValue.style.color = 'black';
  }
  
  cardElement.appendChild(topValue);
  cardElement.appendChild(bottomValue);
  
  // Add small diagonal stripes pattern in the background for visual texture
  if (card.color !== 'wild') {
    const stripesPattern = document.createElement('div');
    stripesPattern.style.position = 'absolute';
    stripesPattern.style.top = '0';
    stripesPattern.style.left = '0';
    stripesPattern.style.right = '0';
    stripesPattern.style.bottom = '0';
    stripesPattern.style.opacity = '0.2';
    stripesPattern.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.5) 10px, rgba(255, 255, 255, 0.5) 20px)';
    stripesPattern.style.zIndex = '0';
    cardElement.appendChild(stripesPattern);
  }
  
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
  
  // Add diagonal stripe overlay for Skip cards
  if (card.value === 'Skip') {
    const skipLine = document.createElement('div');
    skipLine.style.position = 'absolute';
    skipLine.style.width = '150%';
    skipLine.style.height = '10px';
    skipLine.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    skipLine.style.transform = 'rotate(-45deg)';
    skipLine.style.top = '50%';
    skipLine.style.left = '-25%';
    skipLine.style.zIndex = '1';
    skipLine.style.borderTop = '2px solid black';
    skipLine.style.borderBottom = '2px solid black';
    cardElement.appendChild(skipLine);
  }
  
  // Add arrows for Reverse cards
  if (card.value === 'Reverse') {
    // First arrow pointing right
    const arrowUp = document.createElement('div');
    arrowUp.style.position = 'absolute';
    arrowUp.style.top = '30%';
    arrowUp.style.width = '60%';
    arrowUp.style.height = '10px';
    arrowUp.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    arrowUp.style.zIndex = '1';
    arrowUp.style.border = '1px solid black';
    cardElement.appendChild(arrowUp);
    
    // Arrowhead up
    const arrowheadUp = document.createElement('div');
    arrowheadUp.style.position = 'absolute';
    arrowheadUp.style.right = isDiscardPile ? '30px' : '15px';
    arrowheadUp.style.top = '25%';
    arrowheadUp.style.width = '0';
    arrowheadUp.style.height = '0';
    arrowheadUp.style.borderTop = '10px solid transparent';
    arrowheadUp.style.borderBottom = '10px solid transparent';
    arrowheadUp.style.borderLeft = isDiscardPile ? '20px solid rgba(255, 255, 255, 0.8)' : '12px solid rgba(255, 255, 255, 0.8)';
    arrowheadUp.style.zIndex = '1';
    cardElement.appendChild(arrowheadUp);
    
    // Second arrow pointing left
    const arrowDown = document.createElement('div');
    arrowDown.style.position = 'absolute';
    arrowDown.style.bottom = '30%';
    arrowDown.style.width = '60%';
    arrowDown.style.height = '10px';
    arrowDown.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    arrowDown.style.zIndex = '1';
    arrowDown.style.border = '1px solid black';
    cardElement.appendChild(arrowDown);
    
    // Arrowhead down
    const arrowheadDown = document.createElement('div');
    arrowheadDown.style.position = 'absolute';
    arrowheadDown.style.left = isDiscardPile ? '30px' : '15px';
    arrowheadDown.style.bottom = '25%';
    arrowheadDown.style.width = '0';
    arrowheadDown.style.height = '0';
    arrowheadDown.style.borderTop = '10px solid transparent';
    arrowheadDown.style.borderBottom = '10px solid transparent';
    arrowheadDown.style.borderRight = isDiscardPile ? '20px solid rgba(255, 255, 255, 0.8)' : '12px solid rgba(255, 255, 255, 0.8)';
    arrowheadDown.style.zIndex = '1';
    cardElement.appendChild(arrowheadDown);
  }
  
  // For Draw 2 cards, add a +2 indicator
  if (card.value === 'Draw 2') {
    const drawIndicator = document.createElement('div');
    drawIndicator.style.position = 'absolute';
    drawIndicator.style.top = '10px';
    drawIndicator.style.right = '30%';
    drawIndicator.style.fontSize = isDiscardPile ? '28px' : '16px';
    drawIndicator.style.fontWeight = 'bold';
    drawIndicator.style.color = 'white';
    drawIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    drawIndicator.style.padding = isDiscardPile ? '5px 10px' : '3px 6px';
    drawIndicator.style.borderRadius = '50%';
    drawIndicator.style.zIndex = '2';
    drawIndicator.textContent = '+2';
    cardElement.appendChild(drawIndicator);
  }
  
  // For Wild Draw 4 cards, add a +4 indicator
  if (card.value === 'Wild Draw 4') {
    const drawIndicator = document.createElement('div');
    drawIndicator.style.position = 'absolute';
    drawIndicator.style.top = '10px';
    drawIndicator.style.right = '30%';
    drawIndicator.style.fontSize = isDiscardPile ? '28px' : '16px';
    drawIndicator.style.fontWeight = 'bold';
    drawIndicator.style.color = 'white';
    drawIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    drawIndicator.style.padding = isDiscardPile ? '5px 10px' : '3px 6px';
    drawIndicator.style.borderRadius = '50%';
    drawIndicator.style.zIndex = '2';
    drawIndicator.textContent = '+4';
    cardElement.appendChild(drawIndicator);
  }
  
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
  updateDirectionIndicator(gameState.direction);
  
  // Render Julia if function exists
  if (typeof renderJulia === 'function') {
    renderJulia();
  }
  
  // Always call renderBingo and let it handle visibility based on player count
  if (typeof renderBingo === 'function') {
    renderBingo();
  }
  
  // Always call renderDad and let it handle visibility based on player count
  if (typeof renderDad === 'function') {
    renderDad();
  }
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
  } else if (characterName === 'Coco') {
    colorClass = 'coco-color';
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
    // Try to use the preloaded image's source
    image.src = preloadedImg.src;
    
    // Ensure the image displays when loaded
    image.onload = function() {
      // Once this instance loads, make sure it's visible
      image.style.display = 'block';
    };
    
    // Handle any loading error in this instance
    image.onerror = function() {
      console.warn(`Failed to load ${characterName} image in UI`);
      // Force direct load on error as a backup
      image.src = `public/images/${characterName.toLowerCase()}.png?direct=${Date.now()}`;
    };
  } else {
    // Fallback path for direct loading with cache-busting
    image.src = `public/images/${characterName.toLowerCase()}.png?ts=${Date.now()}`;
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

// Render Bingo, positioned inline with Bluey
function renderBingo() {
  const bingoDisplay = document.getElementById('bingo-display');
  if (!bingoDisplay) return;
  
  // Only show Bingo if game has at least 3 players (or we're not in a game yet)
  if (gameState.isGameStarted && gameState.players && gameState.players.length < 3) {
    // Hide Bingo's display completely when less than 3 players
    bingoDisplay.innerHTML = '';
    bingoDisplay.style.display = 'none';
    return;
  } else {
    // Make sure it's visible
    bingoDisplay.style.display = 'flex';
  }
  
  // Clear previous content
  bingoDisplay.innerHTML = '';
  
  // Create Bingo's container with a colored circle and initial - use 100px to match Bluey's size
  const bingoContainer = createCharacterDisplay('Bingo', 100);
  
  // Create a div to hold Bingo's image (similar to opponent structure)
  const bingoOpponent = document.createElement('div');
  bingoOpponent.className = 'opponent';
  bingoOpponent.appendChild(bingoContainer);  // Remove name badge
  
  // Get Bingo's player data if game is started
  if (gameState.isGameStarted && gameState.players && gameState.players.length >= 3) {
    // Find Bingo in the players array
    const bingoPlayer = gameState.players.find(player => player.name === 'Bingo');
    
    if (bingoPlayer) {
      // Add cards container to show visual representation of Bingo's cards
      const cardsContainer = createCardsContainer(bingoPlayer);
      bingoOpponent.appendChild(cardsContainer);
      
      // Add UNO indicator if needed
      if (bingoPlayer.hand.length === 1 && bingoPlayer.hasCalledUno) {
        const unoIndicator = document.createElement('div');
        unoIndicator.className = 'uno-indicator';
        unoIndicator.textContent = 'UNO!';
        bingoOpponent.appendChild(unoIndicator);
      }
      
      // Highlight if it's Bingo's turn
      if (gameState.currentPlayerIndex === gameState.players.indexOf(bingoPlayer)) {
        bingoOpponent.classList.add('current-player');
      }
    }
  }
  
  // Add the opponent to the display
  bingoDisplay.appendChild(bingoOpponent);
}

// Render Dad at the right position
function renderDad() {
  // Check for an existing dad-display div, create one if it doesn't exist
  let dadDisplay = document.getElementById('dad-display');
  if (!dadDisplay) {
    dadDisplay = document.createElement('div');
    dadDisplay.id = 'dad-display';
    dadDisplay.style.position = 'absolute';
    dadDisplay.style.right = '16.67%'; // Position at far right
    dadDisplay.style.transform = 'translateX(50%)'; // Adjust positioning
    dadDisplay.style.top = '0'; // Same top position as others
    dadDisplay.style.display = 'flex';
    dadDisplay.style.flexDirection = 'column';
    dadDisplay.style.alignItems = 'center';
    dadDisplay.style.zIndex = '100';
    
    // Add to the game container
    document.getElementById('game-container').appendChild(dadDisplay);
  }
  
  // Only show Dad in special Dad section if not already shown in opponents area
  // Check if Dad is already displayed somewhere else
  const isDadDisplayed = document.body.dataset.dadDisplayed === "true";
  
  if (isDadDisplayed || (gameState.isGameStarted && gameState.players && gameState.players.length < 4)) {
    // Hide Dad's display completely
    dadDisplay.innerHTML = '';
    dadDisplay.style.display = 'none';
    return;
  } else {
    // Make sure it's visible
    dadDisplay.style.display = 'flex';
  }
  
  // Clear previous content
  dadDisplay.innerHTML = '';
  
  // Create Dad's container
  const dadContainer = createCharacterDisplay('Dad', 100);
  
  // Create a div to hold Dad's image
  const dadOpponent = document.createElement('div');
  dadOpponent.className = 'opponent';
  dadOpponent.appendChild(dadContainer);  // Remove name badge
  
  // Get Dad's player data if game is started
  if (gameState.isGameStarted && gameState.players && gameState.players.length >= 4) {
    // Find Dad in the players array (typically index 3)
    const dadPlayer = gameState.players.find(player => player.name === 'Dad');
    
    if (dadPlayer) {
      // Add cards container to show visual representation of Dad's cards
      const cardsContainer = createCardsContainer(dadPlayer);
      dadOpponent.appendChild(cardsContainer);
      
      // Add UNO indicator if needed
      if (dadPlayer.hand.length === 1 && dadPlayer.hasCalledUno) {
        const unoIndicator = document.createElement('div');
        unoIndicator.className = 'uno-indicator';
        unoIndicator.textContent = 'UNO!';
        dadOpponent.appendChild(unoIndicator);
      }
      
      // Highlight if it's Dad's turn
      if (gameState.currentPlayerIndex === gameState.players.indexOf(dadPlayer)) {
        dadOpponent.classList.add('current-player');
      }
    }
  }
  
  // Add the opponent to the display
  dadDisplay.appendChild(dadOpponent);
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
  
  // Render Julia and Bingo characters
  renderJulia();
  renderBingo();
  // Initialize Coco for 4-player game support
  renderDad();
  
  // Add welcome screen
  showWelcomeScreen();
  
  // Add class to body when in standalone mode (added to homescreen)
  if (window.navigator.standalone) {
    document.body.classList.add('standalone');
  }
  
  // Add event listener for invalid card play
  window.addEventListener('invalidCardPlay', (event) => {
    // Get the card index from the event
    const cardIndex = event.detail.cardIndex;
    const errorMessage = event.detail.message;
    
    // Find the card element in the player's hand
    const playerHand = document.getElementById('player-hand');
    const cardsContainer = playerHand.querySelector('.player-cards');
    const cardElements = cardsContainer.querySelectorAll('.card');
    
    if (cardElements[cardIndex]) {
      // Add shake animation
      const cardElement = cardElements[cardIndex];
      cardElement.classList.add('shake');
      
      // Show error message if provided (specifically for Wild Draw 4 restriction)
      if (errorMessage) {
        showErrorMessage(errorMessage);
      }
      
      // Remove the shake class after animation completes
      setTimeout(() => {
        cardElement.classList.remove('shake');
      }, 500);
    }
  });
  
  // Add event listener for invalid draw (when player has playable cards)
  window.addEventListener('invalidDraw', () => {
    // Find the deck element
    const deckElement = document.getElementById('deck');
    
    if (deckElement) {
      // Add shake animation
      deckElement.classList.add('shake');
      
      // Remove the shake class after animation completes
      setTimeout(() => {
        deckElement.classList.remove('shake');
      }, 500);
    }
  });
  
});

// Function to show an error message to the player
function showErrorMessage(message) {
  // Create or get the error message container
  let errorContainer = document.getElementById('error-message-container');
  
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-message-container';
    applyStyles(errorContainer, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      maxWidth: '80%',
      textAlign: 'center',
      zIndex: '1000',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      fontSize: '20px',
      fontWeight: 'bold'
    });
    document.body.appendChild(errorContainer);
  }
  
  // Set the message
  errorContainer.textContent = message;
  
  // Show and then hide after a delay
  errorContainer.style.display = 'block';
  setTimeout(() => {
    errorContainer.style.display = 'none';
  }, 3000);
}

// Function to show a draw requirement message
function showDrawRequirementMessage(numCards, customMessage = null) {
  // Create a message about drawing cards
  const message = customMessage || `You need to draw ${numCards} cards!`;
  showErrorMessage(message);
}

// Add event listeners for drawing requirements
window.addEventListener('showDrawRequirement', (event) => {
  const numCards = event.detail.numCards;
  const customMessage = event.detail.message;
  showDrawRequirementMessage(numCards, customMessage);
});

window.addEventListener('drawRequirementComplete', (event) => {
  const message = event.detail && event.detail.message ? 
    event.detail.message : 
    'All required cards drawn! Next player\'s turn.';
  showErrorMessage(message);
});

export {
  renderGame,
  updateGameDisplay,
  showWelcomeScreen,
  renderBingo,
  renderDad,
  showErrorMessage
};