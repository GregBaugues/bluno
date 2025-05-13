// Module to add Julia and Bluey character images to the UNO game
// This doesn't modify core game files but adds the images after the game loads

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // Wait a bit to make sure the game is fully loaded
    addCharacterImages();
  }, 300);
});

function addCharacterImages() {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) return;

  // Add Julia image on the left side
  const juliaDisplay = document.createElement('div');
  juliaDisplay.id = 'julia-display';
  juliaDisplay.style.position = 'absolute';
  juliaDisplay.style.left = '40px';
  juliaDisplay.style.top = '400px';
  juliaDisplay.style.display = 'flex';
  juliaDisplay.style.flexDirection = 'column';
  juliaDisplay.style.alignItems = 'center';
  juliaDisplay.style.zIndex = '100';
  
  // Julia image
  const juliaImg = document.createElement('img');
  juliaImg.src = '../julia.png';
  juliaImg.alt = 'Julia';
  juliaImg.style.width = 'auto';
  juliaImg.style.height = 'auto';
  juliaImg.style.maxWidth = '150px';
  juliaImg.style.border = '2px solid white';
  juliaImg.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  juliaImg.style.objectFit = 'contain';
  
  // Julia name
  const juliaName = document.createElement('span');
  juliaName.textContent = 'Julia';
  juliaName.style.display = 'inline-block';
  juliaName.style.marginTop = '8px';
  juliaName.style.fontSize = '20px';
  juliaName.style.fontWeight = 'bold';
  juliaName.style.backgroundColor = 'white';
  juliaName.style.padding = '4px 10px';
  juliaName.style.borderRadius = '10px';
  juliaName.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  
  juliaDisplay.appendChild(juliaImg);
  juliaDisplay.appendChild(juliaName);
  gameContainer.appendChild(juliaDisplay);
  
  // Add Bluey next to player's hand
  const blueyDisplay = document.createElement('div');
  blueyDisplay.id = 'bluey-display';
  blueyDisplay.style.position = 'absolute';
  blueyDisplay.style.right = '-20px';
  blueyDisplay.style.bottom = '140px';
  blueyDisplay.style.zIndex = '50';
  
  const blueyImg = document.createElement('img');
  blueyImg.src = '../bluey.png';
  blueyImg.alt = 'Bluey';
  blueyImg.style.width = 'auto';
  blueyImg.style.height = '150px';
  blueyImg.style.objectFit = 'contain';
  blueyImg.style.transform = 'scaleX(-1)';
  
  blueyDisplay.appendChild(blueyImg);
  
  // Add Bluey to the game area
  const gameArea = document.getElementById('game-area');
  if (gameArea) {
    gameArea.appendChild(blueyDisplay);
  } else {
    // If game-area doesn't exist, add to the game container as fallback
    gameContainer.appendChild(blueyDisplay);
  }
  
  // Hide the blue oval above Bluey's name in the opponents-area
  const opponentsArea = document.getElementById('opponents-area');
  if (opponentsArea) {
    // Apply the fix after a short delay to ensure the game UI is rendered
    setTimeout(function() {
      // Target all character-image divs for Bluey specifically
      const opponents = opponentsArea.querySelectorAll('.opponent');
      opponents.forEach(opponent => {
        const characterName = opponent.querySelector('.character-name');
        if (characterName && characterName.textContent === 'Bluey') {
          // Find and hide the character image (blue oval) for Bluey
          const characterImage = opponent.querySelector('.character-image');
          if (characterImage) {
            characterImage.style.display = 'none';
          }
        }
      });
    }, 500);
  }

  // Make sure we have all 7 cards for each player at game start
  const startGame = document.querySelector('.deck-back');
  if (startGame) {
    startGame.addEventListener('click', function() {
      // This ensures we start a new game with the correct number of cards
      setTimeout(function() {
        // Check if there's a game already in progress
        const playerHand = document.getElementById('player-hand');
        if (playerHand) {
          const playerCards = playerHand.querySelectorAll('.card');
          console.log('Player cards:', playerCards.length);
          // If there are less than 7 cards, we need to reload the game
          if (playerCards.length < 7) {
            location.reload();
          }
        }
      }, 1000);
    });
  }
}