/**
 * Validates AI responses against game lore and rules
 */

/**
 * Validates an AI response against lore constraints
 */
function validateResponse(aiResponse, gameState, character, loreContext) {
  // Check if response has required fields
  if (!aiResponse || typeof aiResponse !== 'object') {
    return {
      valid: false,
      reason: 'Invalid response format',
    };
  }

  if (!aiResponse.description || typeof aiResponse.description !== 'string') {
    return {
      valid: false,
      reason: 'Response missing description',
    };
  }

  // Validate health changes
  if (aiResponse.healthChange !== undefined) {
    const newHealth = character.health + aiResponse.healthChange;
    if (newHealth < 0 || newHealth > character.maxHealth * 1.5) {
      return {
        valid: false,
        reason: 'Health change would result in invalid health value',
      };
    }
  }

  // Validate mana changes
  if (aiResponse.manaChange !== undefined) {
    const newMana = character.mana + aiResponse.manaChange;
    if (newMana < 0 || newMana > character.maxMana * 1.5) {
      return {
        valid: false,
        reason: 'Mana change would result in invalid mana value',
      };
    }
  }

  // Validate stat changes (should be reasonable)
  if (aiResponse.statChanges) {
    for (const [stat, change] of Object.entries(aiResponse.statChanges)) {
      if (Math.abs(change) > 10) {
        return {
          valid: false,
          reason: `Stat change for ${stat} is too large (${change})`,
        };
      }

      const currentStat = character.stats[stat.toLowerCase()];
      if (currentStat !== undefined) {
        const newStat = currentStat + change;
        if (newStat < 0 || newStat > 50) {
          return {
            valid: false,
            reason: `Stat ${stat} would be out of valid range (${newStat})`,
          };
        }
      }
    }
  }

  // Validate location changes
  if (aiResponse.newLocation) {
    // Check if location exists or is being created
    const location = gameState.locations[aiResponse.newLocation];
    if (!location && !aiResponse.locationDescription) {
      return {
        valid: false,
        reason: 'New location must have a description',
      };
    }
  }

  // Validate experience gains (should be reasonable)
  if (aiResponse.experienceGain !== undefined) {
    if (aiResponse.experienceGain < 0 || aiResponse.experienceGain > 1000) {
      return {
        valid: false,
        reason: `Experience gain is unreasonable: ${aiResponse.experienceGain}`,
      };
    }
  }

  // Validate gold changes (should be reasonable)
  if (aiResponse.goldChange !== undefined) {
    const newGold = character.gold + aiResponse.goldChange;
    if (newGold < 0 || Math.abs(aiResponse.goldChange) > 10000) {
      return {
        valid: false,
        reason: 'Gold change is unreasonable',
      };
    }
  }

  // Check for impossible actions in description
  const description = aiResponse.description.toLowerCase();
  
  // Prevent breaking fundamental game rules
  const forbiddenPatterns = [
    /(?:instantly|immediately|suddenly).*teleport/i,
    /(?:kill|destroy).*(?:god|immortal|unkillable)/i,
    /(?:gain|get).*(?:infinite|unlimited).*(?:power|gold|health)/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(description)) {
      return {
        valid: false,
        reason: 'Response contains impossible action that breaks game rules',
      };
    }
  }

  // Validate that character has required items for actions
  if (aiResponse.itemsLost && aiResponse.itemsLost.length > 0) {
    for (const itemName of aiResponse.itemsLost) {
      const hasItem = character.inventory.some(item => {
        const itemStr = typeof item === 'string' ? item : item.name;
        return itemStr.toLowerCase() === itemName.toLowerCase();
      });

      if (!hasItem) {
        return {
          valid: false,
          reason: `Character does not have item: ${itemName}`,
        };
      }
    }
  }

  // Validate quest updates
  if (aiResponse.questUpdates) {
    for (const questUpdate of aiResponse.questUpdates) {
      if (!questUpdate.id) {
        return {
          valid: false,
          reason: 'Quest update missing ID',
        };
      }

      const existingQuest = character.quests.find(q => q.id === questUpdate.id);
      if (!existingQuest && questUpdate.status === 'completed') {
        return {
          valid: false,
          reason: 'Cannot complete a quest that does not exist',
        };
      }
    }
  }

  return {
    valid: true,
    reason: null,
  };
}

module.exports = {
  validateResponse,
};

