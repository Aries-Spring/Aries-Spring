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

async function main() {
  try {
    // Skip if comment is from bot
    if (commentUser === 'github-actions[bot]' || commentUser.includes('[bot]')) {
      console.log('Skipping bot comment');
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
    
    // Check if character exists for this user
    let character = characterManager.getCharacter(gameState, commentUser);
    let characterJustCreated = false;
    
    // If no character exists, try to create one
    if (!character) {
      // Check if this comment is attempting character creation
      if (characterManager.isCharacterCreationComment(commentBody)) {
        character = await characterManager.createCharacter(
          gameState,
          commentUser,
          commentBody
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
          'You don\'t have a character yet. To create one, comment with:\n' +
          '```\n' +
          'I want to create a character named [Your Name], a [Class]\n' +
          '```'
        );
        return;
      }
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

main().catch(console.error);

