const gameEngine = require('./game-engine');

/**
 * Gets a character for a specific user from the game state
 */
function getCharacter(gameState, username) {
  if (!gameState.characters) {
    return null;
  }
  return gameState.characters[username] || null;
}

/**
 * Checks if a comment is a character creation comment
 */
function isCharacterCreationComment(commentBody) {
  // Handle null/undefined/empty input
  if (!commentBody || typeof commentBody !== 'string') {
    return false;
  }
  
  const lower = commentBody.toLowerCase();
  return lower.includes('create') && 
         (lower.includes('character') || lower.includes('i want to be') || lower.includes('i am'));
}

/**
 * Creates a new character for a user
 * Returns the character object if successful, null if more info needed
 * @param {Object} gameState - The current game state
 * @param {string} username - GitHub username
 * @param {string|null} commentBody - Optional comment body for parsing (legacy support)
 * @param {string|null} displayName - Optional display name (GitHub profile name)
 * @param {string|null} className - Optional class name (for issue creation)
 */
async function createCharacter(gameState, username, commentBody = null, displayName = null, className = null) {
  // Check if character already exists
  if (getCharacter(gameState, username)) {
    return getCharacter(gameState, username);
  }

  // Initialize characters object if it doesn't exist
  if (!gameState.characters) {
    gameState.characters = {};
  }

  // Determine character name and class
  let characterName = displayName || username;
  let characterClass = className || 'Adventurer';
  
  // Initialize characterInfo to null (will be set if commentBody is provided)
  let characterInfo = null;
  
  // If comment body provided (legacy support), try to parse from it
  if (commentBody) {
    characterInfo = parseCharacterCreation(commentBody);
    if (characterInfo) {
      // Use parsed name if provided, otherwise use display name
      characterName = characterInfo.name || characterName;
      characterClass = characterInfo.class || characterClass;
    }
  }
  
  if (!characterName) {
    return null; // Need more info
  }

  // Create character with default stats
  const character = {
    name: characterName,
    class: characterClass,
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    experience: 0,
    experienceToNext: 100,
    location: 'The Starting Village',
    inventory: [],
    gold: 50,
    stats: {
      strength: characterInfo?.stats?.strength || 10,
      dexterity: characterInfo?.stats?.dexterity || 10,
      intelligence: characterInfo?.stats?.intelligence || 10,
      wisdom: characterInfo?.stats?.wisdom || 10,
      constitution: characterInfo?.stats?.constitution || 10,
      charisma: characterInfo?.stats?.charisma || 10,
    },
    quests: [],
    createdAt: new Date().toISOString(),
    lastAction: null,
  };

  // Apply class bonuses
  applyClassBonuses(character, character.class);

  // Store character
  gameState.characters[username] = character;

  return character;
}

/**
 * Parses character creation information from a comment
 */
function parseCharacterCreation(commentBody) {
  // Handle null/undefined input
  if (!commentBody || typeof commentBody !== 'string') {
    return {};
  }
  
  const lower = commentBody.toLowerCase();
  const result = {};

  // Try to extract name
  const namePatterns = [
    /(?:named|name is|called|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /character\s+named\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /i want to be\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ];

  for (const pattern of namePatterns) {
    const match = commentBody.match(pattern);
    if (match) {
      result.name = match[1];
      break;
    }
  }

  // Try to extract class
  const classes = [
    'warrior', 'mage', 'rogue', 'cleric', 'ranger', 'paladin',
    'bard', 'monk', 'warlock', 'druid', 'sorcerer', 'barbarian'
  ];
  
  for (const className of classes) {
    if (lower.includes(className)) {
      result.class = className.charAt(0).toUpperCase() + className.slice(1);
      break;
    }
  }

  return result;
}

/**
 * Applies class-specific bonuses to character stats
 */
function applyClassBonuses(character, className) {
  const bonuses = {
    Warrior: { strength: 3, constitution: 2 },
    Mage: { intelligence: 3, wisdom: 2 },
    Rogue: { dexterity: 3, strength: 1 },
    Cleric: { wisdom: 3, constitution: 1 },
    Ranger: { dexterity: 2, wisdom: 2 },
    Paladin: { strength: 2, wisdom: 2 },
    Bard: { charisma: 3, dexterity: 1 },
    Monk: { dexterity: 2, wisdom: 2 },
    Warlock: { intelligence: 2, charisma: 2 },
    Druid: { wisdom: 3, constitution: 1 },
    Sorcerer: { intelligence: 3, charisma: 1 },
    Barbarian: { strength: 3, constitution: 2 },
  };

  const bonus = bonuses[className] || {};
  Object.keys(bonus).forEach(stat => {
    character.stats[stat.toLowerCase()] = 
      (character.stats[stat.toLowerCase()] || 10) + bonus[stat];
  });
}

module.exports = {
  getCharacter,
  createCharacter,
  isCharacterCreationComment,
};

