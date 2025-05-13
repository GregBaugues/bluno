// Card colors
const colors = ['red', 'blue', 'green', 'yellow'];

// Card values
const numberValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const specialValues = ['Skip', 'Reverse', 'Draw 2'];
const wildValues = ['Wild', 'Wild Draw 4'];

// Emoji mapping for cards based on the image
const emojiMap = {
  // Numbers - using the emoji faces from the image
  '0': '😶', // Neutral face for zero
  '1': '😬', // Grimacing face (teeth showing)
  '2': '😁', // Grinning face with smiling eyes
  '3': '😍', // Heart eyes
  '4': '😇', // Angel face with halo
  '5': '😎', // Sunglasses face
  '6': '🙂', // Slightly smiling face
  '7': '😊', // Smiling face with smiling eyes
  '8': '😘', // Face blowing a kiss
  '9': '😠', // Angry face
  
  // Special cards based on the image
  'Skip': '🙅‍♀️', // Girl crossing arms (Skip)
  'Reverse': '👉', // Pointing hand for Reverse (the card shows two hands pointing)
  'Draw 2': '👯‍♀️', // Two dancers for Draw 2
  'Wild': '👍', // Thumbs up for Wild
  'Wild Draw 4': '💩', // Keeping the important poopey head for Draw 4!
};

// Create a deck of Uno cards
function createDeck() {
  const deck = [];
  
  // Add number cards
  colors.forEach(color => {
    // One 0 card per color
    deck.push({
      color,
      value: '0',
      emoji: emojiMap['0']
    });
    
    // Two of each number 1-9 per color
    numberValues.slice(1).forEach(value => {
      for (let i = 0; i < 2; i++) {
        deck.push({
          color,
          value,
          emoji: emojiMap[value]
        });
      }
    });
    
    // Two of each special card per color
    specialValues.forEach(value => {
      for (let i = 0; i < 2; i++) {
        deck.push({
          color,
          value,
          emoji: emojiMap[value]
        });
      }
    });
  });
  
  // Add wild cards (4 of each)
  wildValues.forEach(value => {
    for (let i = 0; i < 4; i++) {
      deck.push({
        color: 'wild',
        value,
        emoji: emojiMap[value]
      });
    }
  });
  
  return deck;
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Deal cards to players
function dealCards(players, deck, cardsPerPlayer) {
  console.log(`Dealing ${cardsPerPlayer} cards to each player`);
  for (let i = 0; i < cardsPerPlayer; i++) {
    players.forEach(player => {
      player.hand.push(deck.pop());
    });
  }
}

export {
  createDeck,
  shuffleDeck,
  dealCards,
  colors
};