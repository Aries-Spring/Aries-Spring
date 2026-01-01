# 🎮 GitHub README Game

An interactive fantasy role-playing game powered by GitHub Issues and Actions! Create your character, explore a rich fantasy world, and embark on epic adventures—all through GitHub comments.

## 🚀 How to Play

### Getting Started

1. **Create a new issue** in this repository
2. **Add the `game-active` label** to your issue (or ask a maintainer to add it)
3. **Create your character** by commenting on the issue with something like:
   - "I want to create a character named [Your Name], a [Class]"
   - "Create character: [Name], [Class]"
   - Example: "I want to create a character named Aria, a Mage"

4. **Start playing!** After your character is created, simply comment with actions in natural language:
   - "I explore the forest"
   - "I talk to the merchant"
   - "I cast a fireball at the goblin"
   - "I search for treasure"

### Character Creation

Each GitHub user can create **one character** per issue. When creating your character, you can choose:

- **Name**: Your character's name
- **Class**: Choose from Warrior, Mage, Rogue, Cleric, Ranger, Paladin, Bard, Monk, Warlock, Druid, Sorcerer, or Barbarian

Each class has unique stat bonuses that will be applied automatically.

### Game Mechanics

- **Natural Language Actions**: Type what you want to do in plain English. The AI game master will interpret your actions and respond accordingly.

- **Character Stats**: Your character has:
  - Health and Mana
  - Six core attributes: Strength, Dexterity, Intelligence, Wisdom, Constitution, Charisma
  - Level and Experience
  - Gold and Inventory
  - Active Quests

- **World Exploration**: Explore different locations, interact with NPCs, fight monsters, complete quests, and discover treasures.

- **State Persistence**: Your game state is saved in the issue body, so you can continue your adventure anytime by commenting on your issue.

## 🎯 Example Actions

Here are some examples of actions you can try:

```
I walk to the market
I buy a sword from the merchant
I explore the dark forest
I cast a healing spell on myself
I attack the bandit with my sword
I search for hidden treasure
I talk to the village elder
I rest at the inn
I accept the quest to find the lost artifact
I use my potion of healing
I investigate the mysterious cave
```

## 🌍 World Lore

The game takes place in a fantasy world with:

- **Villages and Cities**: Safe havens where you can rest, trade, and receive quests
- **Dungeons and Caves**: Dangerous areas filled with monsters and treasure
- **Forests and Wilderness**: Explore to find resources, encounters, and secrets
- **NPCs**: Characters you can interact with, trade with, or receive quests from
- **Monsters**: Creatures you can fight for experience and loot

The world follows consistent rules and lore. Actions that break the game's rules or are impossible will be rejected with an explanation.

## 🔧 Setup Instructions

To set up this game in your own repository:

### 1. Repository Setup

1. **Fork or clone this repository**
2. **Enable GitHub Actions** in your repository settings

### 2. Install Dependencies

Create a `package.json` file (if it doesn't exist) and install required dependencies:

```bash
npm init -y
npm install @octokit/rest
```

### 3. Configure GitHub Secrets

1. Go to your repository's **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add a secret named `GROK_API_KEY` with your Grok API key
   - Get your API key from [X.AI](https://x.ai)

### 4. Create Issue Template (Optional)

Create `.github/ISSUE_TEMPLATE/game-start.md`:

```markdown
---
name: Start New Game
about: Create a new game session
title: "[GAME] [Your Character Name]'s Adventure"
labels: game-active
---

# Character Creation

I want to create a character named [Your Name], a [Your Class]
```

### 5. Create Game Label

1. Go to **Issues** → **Labels**
2. Create a new label named `game-active` (or `game`)
3. Choose a color (e.g., green or blue)

### 6. Test the Game

1. Create a new issue
2. Add the `game-active` label
3. Comment to create your character
4. Start playing!

## 📝 How It Works

1. **Player comments** on an issue with the `game-active` label
2. **GitHub Action triggers** and processes the comment
3. **Character validation** ensures one character per user
4. **Game state** is loaded from the issue body
5. **Grok AI** interprets the action with full game context
6. **Lore validator** ensures the response follows game rules
7. **Game state** is updated and saved back to the issue body
8. **AI response** is posted as a comment

## 🎨 Customization

You can customize the game by:

- Editing `docs/lore.md` to change the world lore and rules
- Modifying `scripts/lore-validator.js` to add custom validation rules
- Adjusting character creation in `scripts/character-manager.js`
- Changing game mechanics in `scripts/game-engine.js`

## 🤝 Contributing

Feel free to submit issues or pull requests to improve the game!

## 📄 License

This project is open source and available for anyone to use and modify.

---

**Ready to start your adventure?** Create an issue and begin your journey! 🗡️✨

