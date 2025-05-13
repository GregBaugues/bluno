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

// Function to load character images
function loadCharacterImages() {
  console.log('Loading character images from public/images directory');
  
  // Try to load images for each character
  Object.keys(characterImages).forEach(character => {
    const imageName = character.toLowerCase();
    try {
      // Set the path to image files with multiple possible locations
      const paths = [
        `/public/images/${imageName}.png`,
        `./public/images/${imageName}.png`,
        `public/images/${imageName}.png`,
        `/images/${imageName}.png`,
        `./images/${imageName}.png`,
        `images/${imageName}.png`
      ];
      
      // Use a more direct approach to assign images
      // Assign static paths rather than trying to load them via onload/onerror
      if (character === 'Bluey') {
        characterImages[character] = `/public/images/bluey.png`;
        console.log(`Assigned image path for ${character}`);
      } 
      else if (character === 'Bingo') {
        characterImages[character] = `/public/images/bingo.png`;
        console.log(`Assigned image path for ${character}`);
      }
      else if (character === 'Bandit') {
        characterImages[character] = `/public/images/bandit.png`;
        console.log(`Assigned image path for ${character}`);
      }
    } catch (e) {
      console.log(`Error loading image for ${character}:`, e);
      characterImages[character] = null;
    }
  });
  
  return Promise.resolve(); // Return a resolved promise for async compatibility
}

// Function to get character display (either image or colored circle with initial)
function getCharacterDisplay(characterName) {
  // Create a container div for the character display
  const container = document.createElement('div');
  container.className = 'character-display';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'relative';
  
  // Create the character initial fallback
  const initial = characterName.charAt(0);
  let bgColor = '#4682B4'; // Default color
  
  if (characterName === 'Bluey') {
    bgColor = '#1E90FF';
    
    // Try to load the Bluey image
    const img = document.createElement('img');
    img.src = 'bluey.png';
    img.alt = 'Bluey';
    img.className = 'character-img';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    
    // Hide the image if it fails to load
    img.onerror = function() {
      img.style.display = 'none';
    };
    
    container.appendChild(img);
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
  initialDiv.style.position = 'absolute';
  initialDiv.style.top = '0';
  initialDiv.style.left = '0';
  
  if (characterName === 'Bluey') {
    // For Bluey, only show the initial if the image fails to load
    initialDiv.style.zIndex = '-1';
  }
  
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