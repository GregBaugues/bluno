// Bluey character names - limited to only Bluey, Bingo, and Bandit
const blueyCharacters = [
  'Bluey',
  'Bingo',
  'Bandit'
];

// Create players (1 human, rest AI)
function createPlayers(numPlayers) {
  const players = [];
  
  // Create human player
  players.push({
    name: 'You',
    hand: [],
    isAI: false,
    hasCalledUno: false
  });
  
  // Create AI players with specific Bluey characters
  // We'll use Bluey, Bingo, and Bandit in that priority order
  const priorityCharacters = ['Bluey', 'Bingo', 'Bandit'];
  
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