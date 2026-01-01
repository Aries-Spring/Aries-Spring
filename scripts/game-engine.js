/**
 * Game state management utilities
 */

const STATE_MARKER_START = '<!-- GAME_STATE_START -->';
const STATE_MARKER_END = '<!-- GAME_STATE_END -->';

/**
 * Loads game state from issue body
 */
function loadStateFromIssueBody(issueBody) {
  if (!issueBody) {
    return getDefaultState();
  }

  const startIndex = issueBody.indexOf(STATE_MARKER_START);
  const endIndex = issueBody.indexOf(STATE_MARKER_END);

  if (startIndex === -1 || endIndex === -1) {
    return getDefaultState();
  }

  try {
    const stateJson = issueBody.substring(
      startIndex + STATE_MARKER_START.length,
      endIndex
    ).trim();
    
    const state = JSON.parse(stateJson);
    return mergeWithDefaults(state);
  } catch (error) {
    console.error('Error parsing game state:', error);
    return getDefaultState();
  }
}

/**
 * Embeds game state JSON into issue body
 */
function embedStateInIssueBody(issueBody, stateJson) {
  const stateBlock = `\n${STATE_MARKER_START}\n${stateJson}\n${STATE_MARKER_END}\n`;

  // If state already exists, replace it
  const startIndex = issueBody.indexOf(STATE_MARKER_START);
  const endIndex = issueBody.indexOf(STATE_MARKER_END);

  if (startIndex !== -1 && endIndex !== -1) {
    return (
      issueBody.substring(0, startIndex) +
      stateBlock +
      issueBody.substring(endIndex + STATE_MARKER_END.length)
    );
  }

  // Otherwise append to end
  return issueBody + stateBlock;
}

/**
 * Gets default game state
 */
function getDefaultState() {
  return {
    characters: {},
    issueCreator: null, // GitHub username of issue creator (for single-player lock)
    world: {
      time: 'morning',
      day: 1,
      season: 'spring',
    },
    locations: {
      'The Starting Village': {
        description: 'A peaceful village where new adventurers begin their journey.',
        type: 'village',
        connections: ['The Forest Path', 'The Market Square'],
      },
    },
    events: [],
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * Merges partial state with defaults
 */
function mergeWithDefaults(state) {
  const defaults = getDefaultState();
  return {
    ...defaults,
    ...state,
    characters: { ...defaults.characters, ...(state.characters || {}) },
    world: { ...defaults.world, ...(state.world || {}) },
    locations: { ...defaults.locations, ...(state.locations || {}) },
  };
}

/**
 * Updates game state based on AI response
 */
function updateStateFromResponse(gameState, character, aiResponse) {
  // Update character location if changed
  if (aiResponse.newLocation && aiResponse.newLocation !== character.location) {
    character.location = aiResponse.newLocation;
    
    // Add location to world if new
    if (!gameState.locations[aiResponse.newLocation]) {
      gameState.locations[aiResponse.newLocation] = {
        description: aiResponse.locationDescription || 'A new location.',
        type: aiResponse.locationType || 'area',
        connections: [],
      };
    }
  }

  // Update character stats if changed
  if (aiResponse.statChanges) {
    Object.keys(aiResponse.statChanges).forEach(stat => {
      if (character.stats[stat] !== undefined) {
        character.stats[stat] = Math.max(0, 
          character.stats[stat] + aiResponse.statChanges[stat]
        );
      }
    });
  }

  // Update health/mana
  if (aiResponse.healthChange !== undefined) {
    character.health = Math.max(0, Math.min(character.maxHealth,
      character.health + aiResponse.healthChange
    ));
  }

  if (aiResponse.manaChange !== undefined) {
    character.mana = Math.max(0, Math.min(character.maxMana,
      character.mana + aiResponse.manaChange
    ));
  }

  // Update experience
  if (aiResponse.experienceGain) {
    character.experience += aiResponse.experienceGain;
    while (character.experience >= character.experienceToNext) {
      character.experience -= character.experienceToNext;
      character.level += 1;
      character.experienceToNext = Math.floor(character.experienceToNext * 1.5);
      character.maxHealth += 10;
      character.health = character.maxHealth;
      character.maxMana += 5;
      character.mana = character.maxMana;
    }
  }

  // Update inventory
  if (aiResponse.itemsGained) {
    character.inventory.push(...aiResponse.itemsGained);
  }

  if (aiResponse.itemsLost) {
    aiResponse.itemsLost.forEach(itemName => {
      const index = character.inventory.findIndex(item => 
        item.name === itemName || item === itemName
      );
      if (index !== -1) {
        character.inventory.splice(index, 1);
      }
    });
  }

  // Update gold
  if (aiResponse.goldChange !== undefined) {
    character.gold = Math.max(0, character.gold + aiResponse.goldChange);
  }

  // Update quests
  if (aiResponse.questUpdates) {
    aiResponse.questUpdates.forEach(questUpdate => {
      const existingQuest = character.quests.find(q => q.id === questUpdate.id);
      if (existingQuest) {
        Object.assign(existingQuest, questUpdate);
      } else if (questUpdate.id) {
        character.quests.push(questUpdate);
      }
    });
  }

  // Update world time
  if (aiResponse.timePassed) {
    gameState.world.time = getNextTime(gameState.world.time, aiResponse.timePassed);
  }

  // Record event
  if (aiResponse.event) {
    gameState.events.push({
      timestamp: new Date().toISOString(),
      character: character.name,
      event: aiResponse.event,
    });
  }

  // Update last action timestamp
  character.lastAction = new Date().toISOString();
  gameState.lastUpdate = new Date().toISOString();

  return gameState;
}

/**
 * Gets next time of day based on time passed
 */
function getNextTime(currentTime, hoursPassed) {
  const times = ['morning', 'noon', 'afternoon', 'evening', 'night', 'midnight'];
  const currentIndex = times.indexOf(currentTime);
  const hoursPerTime = 4;
  const timeSteps = Math.floor(hoursPassed / hoursPerTime);
  const newIndex = (currentIndex + timeSteps) % times.length;
  return times[newIndex];
}

module.exports = {
  loadStateFromIssueBody,
  embedStateInIssueBody,
  updateStateFromResponse,
  getDefaultState,
};

