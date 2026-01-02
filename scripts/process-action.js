#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const characterManager = require('./character-manager');
const gameEngine = require('./game-engine');
const aiHandler = require('./ai-handler');
const loreValidator = require('./lore-validator');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;
const issueNumber = parseInt(process.env.ISSUE_NUMBER);
const commentBody = process.env.COMMENT_BODY || '';
const commentUser = process.env.COMMENT_USER;
const issueBody = process.env.ISSUE_BODY || '';
const issueTitle = process.env.ISSUE_TITLE || '';
const eventName = process.env.EVENT_NAME || 'issue_comment';
const issueUser = process.env.ISSUE_USER || commentUser;

/**
 * Extracts class name from text (issue body or title)
 */
function extractClassFromText(text) {
  const classes = [
    'warrior', 'mage', 'rogue', 'cleric', 'ranger', 'paladin',
    'bard', 'monk', 'warlock', 'druid', 'sorcerer', 'barbarian'
  ];
  
  const lower = text.toLowerCase();
  for (const className of classes) {
    if (lower.includes(className)) {
      return className.charAt(0).toUpperCase() + className.slice(1);
    }
  }
  return null;
}

async function main() {
  try {
    const isIssueCreation = eventName === 'issues';
    const currentUser = isIssueCreation ? issueUser : commentUser;
    
    // Skip if from bot
    if (currentUser === 'github-actions[bot]' || currentUser.includes('[bot]')) {
      console.log('Skipping bot action');
      return;
    }

    // Check if issue has game-active label
    const issue = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const hasGameLabel = issue.data.labels.some(
      label => label.name === 'game-active' || label.name === 'game'
    );

    if (!hasGameLabel) {
      console.log('Issue does not have game label, skipping');
      return;
    }

    // Load current game state from issue body (use API response, fallback to env var)
    const currentIssueBody = issue.data.body || issueBody;
    let gameState = gameEngine.loadStateFromIssueBody(currentIssueBody);
    
    // Store issue creator if not already set
    if (!gameState.issueCreator) {
      gameState.issueCreator = issueUser;
      await updateIssueBody(gameState);
    }
    
    // Multiplayer lock: Only allow issue creator to interact
    if (gameState.issueCreator && currentUser !== gameState.issueCreator) {
      const creatorCharacter = characterManager.getCharacter(gameState, gameState.issueCreator);
      const creatorName = creatorCharacter ? creatorCharacter.name : gameState.issueCreator;
      await postComment(
        `🔒 **Adventure Locked**\n\n` +
        `This adventure is locked to **${creatorName}**. Please create your own issue to start your adventure!\n\n` +
        `Click one of the class buttons in the README to begin your journey!`
      );
      return;
    }
    
    // Check if character exists for this user
    let character = characterManager.getCharacter(gameState, currentUser);
    let characterJustCreated = false;
    
    // Handle issue creation: auto-create character
    if (isIssueCreation && !character) {
      // Extract class from issue title or body
      const extractedClass = extractClassFromText(issueTitle + ' ' + currentIssueBody);
      
      if (extractedClass) {
        // Fetch GitHub user profile for display name
        let userDisplayName = currentUser;
        try {
          const userProfile = await octokit.rest.users.getByUsername({
            username: currentUser,
          });
          userDisplayName = userProfile.data.name || userProfile.data.login;
        } catch (error) {
          console.warn('Failed to fetch user profile, using username:', error);
        }
        
        // Create character with GitHub profile name
        character = await characterManager.createCharacter(
          gameState,
          currentUser,
          null, // No comment body for issue creation
          userDisplayName,
          extractedClass
        );
        
        if (character) {
          characterJustCreated = true;
          gameState.issueCreator = currentUser;
          await updateIssueBody(gameState);
          
          // Post welcome message
          await postComment(
            `🎉 **Welcome, ${character.name}!**\n\n` +
            `You have been created as a **${character.class}** in the world of Aetheria.\n\n` +
            `**Starting Stats:**\n` +
            `- Level: ${character.level}\n` +
            `- Health: ${character.health}/${character.maxHealth}\n` +
            `- Mana: ${character.mana}/${character.maxMana}\n` +
            `- Gold: ${character.gold}\n` +
            `- Location: ${character.location}\n\n` +
            `**Your Attributes:**\n` +
            `- Strength: ${character.stats.strength}\n` +
            `- Dexterity: ${character.stats.dexterity}\n` +
            `- Intelligence: ${character.stats.intelligence}\n` +
            `- Wisdom: ${character.stats.wisdom}\n` +
            `- Constitution: ${character.stats.constitution}\n` +
            `- Charisma: ${character.stats.charisma}\n\n` +
            `Your adventure begins now! Comment with actions like "I explore the village" or "I talk to the merchant" to start playing.`
          );
          return;
        }
      } else {
        // Class not found in issue, prompt user
        await postComment(
          `❓ **Class Selection Required**\n\n` +
          `I couldn't detect your class from the issue. Please edit this issue and include one of these classes in the title or body:\n\n` +
          `**Available Classes:** Warrior, Mage, Rogue, Cleric, Ranger, Paladin, Bard, Monk, Warlock, Druid, Sorcerer, Barbarian\n\n` +
          `Or use one of the class buttons in the README to create an issue with the class pre-selected!`
        );
        return;
      }
    }
    
    // If no character exists and this is a comment (not issue creation), try to create one
    if (!character && !isIssueCreation) {
      // Check if this comment is attempting character creation
      if (characterManager.isCharacterCreationComment(commentBody)) {
        // Fetch GitHub user profile for display name
        let userDisplayName = currentUser;
        try {
          const userProfile = await octokit.rest.users.getByUsername({
            username: currentUser,
          });
          userDisplayName = userProfile.data.name || userProfile.data.login;
        } catch (error) {
          console.warn('Failed to fetch user profile, using username:', error);
        }
        
        character = await characterManager.createCharacter(
          gameState,
          currentUser,
          commentBody,
          userDisplayName
        );
        
        if (!character) {
          // Character creation failed or needs more info
          await postComment(
            '❓ **Character Creation**\n\n' +
            'Please provide character details in this format:\n' +
            '```\n' +
            'I want to create a character named [Your Name], a [Class]\n' +
            '```\n\n' +
            '**Available Classes:** Warrior, Mage, Rogue, Cleric, Ranger, Paladin, Bard, Monk, Warlock, Druid, Sorcerer, Barbarian'
          );
          return;
        }
        
        // Character created successfully
        characterJustCreated = true;
        await updateIssueBody(gameState);
        
        // Post welcome message
        await postComment(
          `🎉 **Welcome, ${character.name}!**\n\n` +
          `You have been created as a **${character.class}** in the world of Aetheria.\n\n` +
          `**Starting Stats:**\n` +
          `- Level: ${character.level}\n` +
          `- Health: ${character.health}/${character.maxHealth}\n` +
          `- Mana: ${character.mana}/${character.maxMana}\n` +
          `- Gold: ${character.gold}\n` +
          `- Location: ${character.location}\n\n` +
          `**Your Attributes:**\n` +
          `- Strength: ${character.stats.strength}\n` +
          `- Dexterity: ${character.stats.dexterity}\n` +
          `- Intelligence: ${character.stats.intelligence}\n` +
          `- Wisdom: ${character.stats.wisdom}\n` +
          `- Constitution: ${character.stats.constitution}\n` +
          `- Charisma: ${character.stats.charisma}\n\n` +
          `Your adventure begins now! Comment with actions like "I explore the village" or "I talk to the merchant" to start playing.`
        );
        return;
      } else {
        // No character and not trying to create one
        await postComment(
          '👋 **Welcome!**\n\n' +
          'You don\'t have a character yet. Your character should have been created automatically when you opened this issue.\n\n' +
          'If you see this message, please make sure your issue includes a class name (Warrior, Mage, Rogue, etc.) in the title or body.'
        );
        return;
      }
    }
    
    // If still no character at this point, something went wrong
    if (!character) {
      await postComment(
        '⚠️ **Character Not Found**\n\n' +
        'Unable to create or find your character. Please ensure your issue includes a valid class name.'
      );
      return;
    }

    // Process the action
    const action = commentBody.trim();
    
    if (!action || action.length === 0) {
      await postComment('Please provide an action to perform!');
      return;
    }

    // Get lore context
    const loreContext = fs.readFileSync(
      path.join(__dirname, '../docs/lore.md'),
      'utf-8'
    );

    // Call AI to process action
    const aiResponse = await aiHandler.processAction(
      character,
      gameState,
      action,
      loreContext
    );

    // Validate AI response against lore
    const validationResult = loreValidator.validateResponse(
      aiResponse,
      gameState,
      character,
      loreContext
    );

    if (!validationResult.valid) {
      console.log('AI response failed validation:', validationResult.reason);
      // Retry with stricter constraints
      const retryResponse = await aiHandler.processAction(
        character,
        gameState,
        action,
        loreContext,
        validationResult.reason
      );
      
      const retryValidation = loreValidator.validateResponse(
        retryResponse,
        gameState,
        character,
        loreContext
      );
      
      if (retryValidation.valid) {
        await processValidResponse(retryResponse, gameState, character);
      } else {
        await postComment(
          `⚠️ **Action could not be processed:** ${retryValidation.reason}\n\n` +
          `Please try a different action that fits within the game's rules.`
        );
      }
    } else {
      await processValidResponse(aiResponse, gameState, character);
    }

  } catch (error) {
    console.error('Error processing action:', error);
    await postComment(
      '❌ An error occurred while processing your action. Please try again later.'
    );
  }
}

async function processValidResponse(aiResponse, gameState, character) {
  // Update game state based on AI response
  const updatedState = gameEngine.updateStateFromResponse(
    gameState,
    character,
    aiResponse
  );

  // Update issue body with new state
  await updateIssueBody(updatedState);

  // Post AI response as comment
  await postComment(formatResponse(aiResponse, character));

  // Check if character has died (health <= 0)
  if (character.health <= 0) {
    await handleCharacterDeath(character, updatedState);
  }
}

async function postComment(message) {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: message,
  });
}

async function updateIssueBody(gameState) {
  // Get current issue body from API
  const currentIssue = await octokit.rest.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });
  
  const currentBody = currentIssue.data.body || '';
  const stateJson = JSON.stringify(gameState, null, 2);
  const newBody = gameEngine.embedStateInIssueBody(currentBody, stateJson);
  
  await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    body: newBody,
  });
}

function formatResponse(aiResponse, character) {
  return `## 🎮 ${character.name}\n\n${aiResponse.description}\n\n---\n` +
         `**Location:** ${character.location || 'Unknown'}\n` +
         `**Health:** ${character.health || 100}/${character.maxHealth || 100}\n` +
         `**Level:** ${character.level || 1}`;
}

/**
 * Handles character death by posting a death message and closing the issue
 */
async function handleCharacterDeath(character, gameState) {
  // Generate fitting death message
  const deathMessage = `💀 **Your Adventure Has Ended**

${character.name}, the ${character.class}, has fallen in battle...

**Final Stats:**
- Location: ${character.location || 'Unknown'}
- Final Level: ${character.level || 1}
- Experience: ${character.experience || 0}
- Gold: ${character.gold || 0}
- Quests Completed: ${character.quests?.filter(q => q.status === 'completed').length || 0}

Your journey in Aetheria has come to an end. May your legend live on in the tales of future adventurers.

*This adventure has been concluded.*`;

  // Post death message as comment
  await postComment(deathMessage);

  // Update issue body one final time with the final game state
  await updateIssueBody(gameState);

  // Close the issue
  await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    state: 'closed',
  });
}

main().catch(console.error);

