/**
 * Player creation tests for the player management system
 */
import { CHARACTERS, CHARACTER_PRIORITY } from '../../../src/constants';
import { verifyPlayerProperties } from '../playerTestUtils';

// Import the modules to test
const playerManager = require('../../../src/playerManager');

describe('Player Creation', () => {
  describe('createPlayer', () => {
    it('should create a player with correct properties', () => {
      // Create a player
      const player = playerManager.createPlayer('TestPlayer', false);
      
      // Verify properties
      verifyPlayerProperties(player, {
        name: 'TestPlayer',
        isAI: false,
        handSize: 0
      });
    });

    it('should create an AI player with correct properties', () => {
      // Create an AI player
      const player = playerManager.createPlayer('Bluey', true);
      
      // Verify properties
      verifyPlayerProperties(player, {
        name: 'Bluey',
        isAI: true,
        handSize: 0
      });
    });

    it('should initialize players with empty hands', () => {
      // Create a player
      const player = playerManager.createPlayer('TestPlayer', false);
      
      // Verify hand is empty array
      expect(player.hand).toEqual([]);
    });
  });

  describe('createPlayers', () => {
    it('should create the correct number of players (2)', () => {
      // Create 2 players (1 human + 1 AI)
      const players = playerManager.createPlayers(2);
      
      // Verify count
      expect(players.length).toBe(2);
      
      // Verify human player
      verifyPlayerProperties(players[0], {
        name: CHARACTERS.PLAYER,
        isAI: false
      });
      
      // Verify AI player (should be Bluey)
      verifyPlayerProperties(players[1], {
        name: CHARACTER_PRIORITY[0], // Bluey
        isAI: true
      });
    });

    it('should create the correct number of players (3)', () => {
      // Create 3 players (1 human + 2 AI)
      const players = playerManager.createPlayers(3);
      
      // Verify count
      expect(players.length).toBe(3);
      
      // Verify first AI player (should be Bluey)
      verifyPlayerProperties(players[1], {
        name: CHARACTER_PRIORITY[0], // Bluey
        isAI: true
      });
      
      // Verify second AI player (should be Bingo)
      verifyPlayerProperties(players[2], {
        name: CHARACTER_PRIORITY[1], // Bingo
        isAI: true
      });
    });

    it('should create the correct number of players (4)', () => {
      // Create 4 players (1 human + 3 AI)
      const players = playerManager.createPlayers(4);
      
      // Verify count
      expect(players.length).toBe(4);
      
      // Verify third AI player (should be Dad)
      verifyPlayerProperties(players[3], {
        name: CHARACTER_PRIORITY[2], // Dad
        isAI: true
      });
    });

    it('should handle invalid player counts by clamping to valid range (2-4)', () => {
      // Test with too few players (should clamp to minimum of 2)
      const tooFewPlayers = playerManager.createPlayers(1);
      expect(tooFewPlayers.length).toBe(2);
      
      // Test with too many players (should clamp to maximum of 4)
      const tooManyPlayers = playerManager.createPlayers(5);
      expect(tooManyPlayers.length).toBe(4);
    });

    it('should ensure each player has unique properties', () => {
      // Create 4 players
      const players = playerManager.createPlayers(4);
      
      // Check that each player has a unique name
      const names = players.map(p => p.name);
      const uniqueNames = [...new Set(names)];
      expect(uniqueNames.length).toBe(players.length);
      
      // Verify first player is human and others are AI
      expect(players[0].isAI).toBe(false);
      expect(players.slice(1).every(p => p.isAI)).toBe(true);
    });

    it('should initialize all players with empty hands', () => {
      // Create players
      const players = playerManager.createPlayers(3);
      
      // Verify all hands are empty arrays
      players.forEach(player => {
        expect(player.hand).toEqual([]);
      });
    });
  });

  describe('getRandomBlueyCharacters', () => {
    it('should return the requested number of characters', () => {
      // Get 2 random characters
      const characters = playerManager.getRandomBlueyCharacters(2);
      
      // Verify count
      expect(characters.length).toBe(2);
    });

    it('should return unique characters', () => {
      // Get 3 random characters
      const characters = playerManager.getRandomBlueyCharacters(3);
      
      // Verify all are unique
      const uniqueCharacters = [...new Set(characters)];
      expect(uniqueCharacters.length).toBe(characters.length);
    });

    it('should return characters from the AI character constants', () => {
      // Get all available characters
      const characters = playerManager.getRandomBlueyCharacters(4);
      
      // Verify all are from constants
      const validCharacters = Object.values(CHARACTERS.AI);
      characters.forEach(character => {
        expect(validCharacters).toContain(character);
      });
    });
  });
});