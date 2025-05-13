// Character image data and functionality

// Direct image imports - this will ensure Parcel processes them correctly
import blueyImage from '../bluey.png';
import bingoImage from '../public/images/bingo.png';
import banditImage from '../public/images/bandit.png';
import juliaImage from '../julia.png';

// Map character names to their imported images
const characterImageSources = {
  'Bluey': blueyImage,
  'Bingo': bingoImage,
  'Bandit': banditImage,
  'Julia': juliaImage
};

// Function to get character display - image only, no fallbacks
function getCharacterDisplay(characterName) {
  // Create a container div for the character display
  const container = document.createElement('div');
  container.className = 'character-display';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'relative';
  
  // Create image element with direct source
  const imgElem = document.createElement('img');
  imgElem.className = 'character-img';
  imgElem.src = characterImageSources[characterName];
  imgElem.alt = characterName;
  imgElem.style.width = '100%';
  imgElem.style.height = '100%';
  imgElem.style.objectFit = 'cover';
  imgElem.style.objectPosition = 'center';
  imgElem.style.borderRadius = '50%';
  imgElem.style.border = '3px solid white';
  imgElem.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
  
  container.appendChild(imgElem);
  
  // Return the HTML string
  return container.outerHTML;
}

// No loading function needed, we're using direct image paths

export {
  characterImageSources,
  getCharacterDisplay
};