// Character image data and functionality

// Character colors for the colored circle fallbacks
const characterColors = {
  'Bluey': '#1E90FF',    // Blue
  'Bingo': '#FF6B6B',    // Red/orange
  'Bandit': '#4169E1',   // Royal blue
  'Julia': '#FFCC66',    // Golden yellow
  'Coco': '#8A2BE2'      // Purple for Coco
};

// Simple function to get HTML for a character display with initial
function getCharacterDisplay(characterName) {
  // Create a container div for the character display
  const container = document.createElement('div');
  container.className = 'character-display';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'relative';
  
  // Get the background color
  const bgColor = characterColors[characterName] || '#4682B4'; // Default if not found
  
  // Create the circle with initial
  const circleDiv = document.createElement('div');
  circleDiv.className = 'character-initial';
  circleDiv.textContent = characterName.charAt(0);
  circleDiv.style.backgroundColor = bgColor;
  circleDiv.style.width = '100%';
  circleDiv.style.height = '100%';
  circleDiv.style.borderRadius = '50%';
  circleDiv.style.display = 'flex';
  circleDiv.style.justifyContent = 'center';
  circleDiv.style.alignItems = 'center';
  circleDiv.style.color = 'white';
  circleDiv.style.fontSize = '60px';
  circleDiv.style.fontWeight = 'bold';
  circleDiv.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
  
  container.appendChild(circleDiv);
  
  // Return the HTML string
  return container.outerHTML;
}

export {
  characterColors,
  getCharacterDisplay
};