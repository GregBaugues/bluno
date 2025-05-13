// Character image data and functionality

// Placeholder for character images - will be populated when images are provided
// Limited to only Bluey, Bingo, and Bandit
const characterImages = {
  'Bluey': null,
  'Bingo': null,
  'Bandit': null
};

// Default colors for character circles when images aren't available
// Limited to only Bluey, Bingo, and Bandit
const characterColors = {
  'Bluey': '#1E90FF',    // Blue
  'Bingo': '#FF6B6B',    // Red/orange
  'Bandit': '#4169E1'    // Royal blue
};

// Function to load character images - now just logs a message
function loadCharacterImages() {
  console.log('Using colored initials for character display');
  
  // No longer attempting to load actual images, just use null for all
  Object.keys(characterImages).forEach(character => {
    characterImages[character] = null;
  });
  
  return Promise.resolve(); // Return a resolved promise for async compatibility
}

// Function to get character display (colored circle with initial)
function getCharacterDisplay(characterName) {
  // Create a container div for the character display
  const container = document.createElement('div');
  container.className = 'character-display';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'relative';
  
  // Get the character initial
  const initial = characterName.charAt(0);
  
  // Determine the background color
  let bgColor = '#4682B4'; // Default color
  if (characterName === 'Bluey') {
    bgColor = '#1E90FF';
  } 
  else if (characterName === 'Bingo') {
    bgColor = '#FF6B6B';
  }
  else if (characterName === 'Bandit') {
    bgColor = '#4169E1';
  }
  else if (characterName in characterColors) {
    bgColor = characterColors[characterName];
  }
  
  // Create the circular background with initial
  const initialDiv = document.createElement('div');
  initialDiv.className = 'character-initial';
  initialDiv.textContent = initial;
  initialDiv.style.backgroundColor = bgColor;
  initialDiv.style.width = '100%';
  initialDiv.style.height = '100%';
  initialDiv.style.borderRadius = '50%';
  initialDiv.style.display = 'flex';
  initialDiv.style.justifyContent = 'center';
  initialDiv.style.alignItems = 'center';
  initialDiv.style.color = 'white';
  initialDiv.style.fontSize = '60px';
  initialDiv.style.fontWeight = 'bold';
  
  container.appendChild(initialDiv);
  
  // Return the HTML string
  return container.outerHTML;
}

export {
  characterImages,
  characterColors,
  loadCharacterImages,
  getCharacterDisplay
};