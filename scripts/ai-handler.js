/**
 * Grok AI integration for processing game actions
 */

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-4-1-fast-reasoning';

/**
 * Processes a player action using Grok AI
 */
async function processAction(character, gameState, action, loreContext, previousError = null) {
  const prompt = buildPrompt(character, gameState, action, loreContext, previousError);
  
  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a game master for a fantasy role-playing game. You must respond in valid JSON format only, with no additional text. Your responses must follow the game lore strictly and be consistent with the game state.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Try to parse JSON response
    let aiResponse;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      aiResponse = JSON.parse(jsonText);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from text
      console.warn('Failed to parse JSON response, using text fallback:', parseError);
      aiResponse = {
        description: content,
        valid: true,
      };
    }

    // Ensure required fields
    if (!aiResponse.description) {
      aiResponse.description = content;
    }

    return aiResponse;

  } catch (error) {
    console.error('Error calling Grok API:', error);
    throw error;
  }
}

/**
 * Builds the prompt for the AI
 */
function buildPrompt(character, gameState, action, loreContext, previousError = null) {
  const characterInfo = formatCharacterInfo(character);
  const worldInfo = formatWorldInfo(gameState);
  const locationInfo = formatLocationInfo(gameState, character.location);

  let prompt = `You are the game master for a fantasy role-playing game. A player wants to perform an action.

## WORLD LORE AND RULES
${loreContext}

## CURRENT GAME STATE

### Character Information
${characterInfo}

### World State
${worldInfo}

### Current Location
${locationInfo}

### Player's Action
"${action}"

## INSTRUCTIONS
1. Determine if the action is valid based on the lore and current game state.
2. If valid, describe what happens in an engaging, narrative style (2-4 sentences).
3. Update character stats, location, inventory, etc. as appropriate.
4. If the action is impossible or breaks lore, explain why it cannot be done.

## RESPONSE FORMAT
You MUST respond with ONLY valid JSON in this exact format:
{
  "description": "A narrative description of what happens (2-4 sentences)",
  "valid": true/false,
  "newLocation": "location name if character moves (optional)",
  "locationDescription": "description of new location (if moving)",
  "locationType": "village|forest|dungeon|city|etc (if moving)",
  "healthChange": number (positive for healing, negative for damage),
  "manaChange": number (positive for restore, negative for usage),
  "experienceGain": number (if action grants experience),
  "goldChange": number (positive for gain, negative for loss),
  "itemsGained": [{"name": "item name", "description": "item description"}],
  "itemsLost": ["item name"],
  "statChanges": {"strength": number, "dexterity": number, etc.},
  "questUpdates": [{"id": "quest-id", "status": "active|completed|failed", "progress": number}],
  "timePassed": number (hours),
  "event": "brief event description for history"
}

IMPORTANT:
- All numeric changes are relative (add/subtract from current values)
- Be consistent with the lore - don't allow impossible actions
- Make the narrative engaging and immersive
- Keep stat changes reasonable (typically -5 to +5)
- Experience gains should be appropriate (5-50 for minor actions, 50-200 for significant achievements)
- Health/mana changes should be realistic (combat: -10 to -30, healing: +10 to +50)
`;

  if (previousError) {
    prompt += `\n\n## PREVIOUS ERROR\nYour previous response was rejected: ${previousError}\nPlease ensure your response follows the lore and game rules correctly.`;
  }

  return prompt;
}

/**
 * Formats character information for the prompt
 */
function formatCharacterInfo(character) {
  return `
Name: ${character.name}
Class: ${character.class}
Level: ${character.level}
Health: ${character.health}/${character.maxHealth}
Mana: ${character.mana}/${character.maxMana}
Experience: ${character.experience}/${character.experienceToNext}
Gold: ${character.gold}
Location: ${character.location}

Stats:
- Strength: ${character.stats.strength}
- Dexterity: ${character.stats.dexterity}
- Intelligence: ${character.stats.intelligence}
- Wisdom: ${character.stats.wisdom}
- Constitution: ${character.stats.constitution}
- Charisma: ${character.stats.charisma}

Inventory: ${character.inventory.length > 0 
  ? character.inventory.map(item => typeof item === 'string' ? item : item.name).join(', ')
  : 'Empty'}

Active Quests: ${character.quests.length > 0
  ? character.quests.map(q => `${q.name || q.id} (${q.status || 'active'})`).join(', ')
  : 'None'}
`.trim();
}

/**
 * Formats world information for the prompt
 */
function formatWorldInfo(gameState) {
  return `
Time of Day: ${gameState.world.time}
Day: ${gameState.world.day}
Season: ${gameState.world.season}
`.trim();
}

/**
 * Formats location information for the prompt
 */
function formatLocationInfo(gameState, locationName) {
  const location = gameState.locations[locationName];
  if (!location) {
    return `Location: ${locationName}\n(No detailed information available)`;
  }

  return `
Location: ${locationName}
Type: ${location.type}
Description: ${location.description}
Connections: ${location.connections ? location.connections.join(', ') : 'None'}
`.trim();
}

module.exports = {
  processAction,
};

