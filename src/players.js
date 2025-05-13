// Bluey character names - now includes Coco as the third opponent
const blueyCharacters = [
  'Bluey',
  'Bingo',
  'Bandit',
  'Coco'
];

// Create players (1 human, rest AI)
function createPlayers(numPlayers) {
  const players = [];
  
  // Create human player (Julia)
  players.push({
    name: 'Julia',
    hand: [],
    isAI: false,
    hasCalledUno: false
  });
  
  // Create AI players with specific Bluey characters
  // We'll use Bluey, Bingo, and Coco in that priority order
  const priorityCharacters = ['Bluey', 'Bingo', 'Coco'];
  
  // Use as many characters as needed based on numPlayers (1-3 AI players)
  for (let i = 0; i < Math.min(numPlayers - 1, priorityCharacters.length); i++) {
    players.push({
      name: priorityCharacters[i],
      hand: [],
      isAI: true,
      hasCalledUno: false
    });
  }
  
  return players;
}

// Get random Bluey characters without repeats
function getRandomBlueyCharacters(count) {
  // Shuffle the array
  const shuffled = [...blueyCharacters];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return the first 'count' characters
  return shuffled.slice(0, count);
}

export {
  createPlayers,
  blueyCharacters
};