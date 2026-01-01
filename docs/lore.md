# World Lore and Game Rules

This document defines the fantasy world, its rules, and constraints that the AI game master must follow.

## World Overview

The game takes place in the realm of **Aetheria**, a diverse fantasy world filled with magic, monsters, and adventure. The world follows consistent physical and magical laws that cannot be broken.

## Fundamental Rules

### 1. Magic System

- **Magic requires mana**: All spells consume mana. Characters cannot cast spells without sufficient mana.
- **Spell limitations**:
  - Low-level characters (1-5) can only cast basic spells
  - Complex spells require higher intelligence/wisdom stats
  - Some spells require specific materials or components
- **Magic cannot**:
  - Instantly teleport without a teleportation spell (requires level 10+ and high intelligence)
  - Resurrect the dead (requires divine intervention or extremely rare artifacts)
  - Create matter from nothing (transmutation has limits)

### 2. Physical Laws

- **Travel takes time**: Characters cannot instantly move between distant locations. Travel time depends on distance and mode of transportation.
- **Gravity and physics**: The world follows normal physical laws unless magic is involved.
- **Death**: Characters can die if health reaches 0. Death requires resurrection magic or divine intervention to recover from.

### 3. Character Limitations

- **Stats have maximums**: No stat can exceed 50 without special artifacts or divine blessings.
- **Level progression**: Characters gain experience through actions. Leveling up increases health, mana, and may grant new abilities.
- **Inventory limits**: Characters can carry a reasonable amount of items (approximately 20-30 items depending on size/weight).
- **Gold economy**: Gold is earned through quests, selling items, or defeating enemies. Prices should be consistent and reasonable.

### 4. Combat System

- **Turn-based**: Combat occurs in turns. Characters and enemies act sequentially.
- **Damage calculation**: Based on weapon, stats, and enemy defenses.
- **Healing**: Requires spells, potions, or rest. Natural regeneration is slow (1-2 HP per hour of rest).
- **Death in combat**: If health reaches 0, character is defeated. May require resurrection.

### 5. World Locations

#### Starting Village

- **Type**: Safe haven
- **Description**: A peaceful village where new adventurers begin their journey. Contains basic shops, an inn, and quest givers.
- **Connections**: Forest Path, Market Square
- **Services**: Inn (rest/healing), General Store, Blacksmith, Quest Board

#### The Forest Path

- **Type**: Wilderness
- **Description**: A path through a dense forest. May contain wild animals, bandits, or hidden treasures.
- **Danger Level**: Low to Medium
- **Connections**: Starting Village, Deep Forest, Bandit Camp

#### Market Square

- **Type**: Commercial area
- **Description**: A bustling marketplace with various merchants selling weapons, armor, potions, and supplies.
- **Connections**: Starting Village, Tavern
- **Services**: Multiple shops, traders, information brokers

#### Deep Forest

- **Type**: Dangerous wilderness
- **Description**: The heart of the forest, home to dangerous creatures and ancient secrets.
- **Danger Level**: Medium to High
- **Connections**: Forest Path, Ancient Ruins

#### Dungeons

- **Type**: Dangerous areas
- **Description**: Various dungeons scattered throughout the world, each with unique challenges and rewards.
- **Danger Level**: High
- **Features**: Traps, monsters, puzzles, treasure

### 6. NPCs and Interactions

- **NPCs have personalities**: Each NPC should have consistent behavior and motivations.
- **Quest givers**: Provide quests with clear objectives and rewards.
- **Merchants**: Buy and sell items at fair prices. Prices may vary by location.
- **Guards**: Protect settlements. Attacking guards has severe consequences.
- **Important NPCs**: Some NPCs are essential to the story and cannot be killed.

### 7. Items and Equipment

- **Weapons**: Swords, bows, staves, daggers, etc. Each has different damage and requirements.
- **Armor**: Provides defense. Heavier armor reduces mobility but increases protection.
- **Consumables**: Potions, food, scrolls. Single-use items that provide temporary effects.
- **Magic items**: Rare items with special properties. Should be difficult to obtain.
- **Quest items**: Special items required for quests. Cannot be sold or destroyed until quest completion.

### 8. Quests

- **Quest types**:
  - Fetch quests (retrieve items)
  - Kill quests (defeat enemies)
  - Exploration quests (visit locations)
  - Delivery quests (transport items)
  - Story quests (narrative-driven)
- **Quest rewards**: Experience, gold, items, reputation
- **Quest failure**: Some quests can fail if objectives are not met in time or if NPCs are killed

### 9. Time and Seasons

- **Time of day**: Morning, Noon, Afternoon, Evening, Night, Midnight
- **Time effects**:
  - Some NPCs only available at certain times
  - Monsters may be stronger at night
  - Shops may close at night
- **Seasons**: Spring, Summer, Fall, Winter
- **Seasonal effects**: Weather, availability of certain items, special events

### 10. Prohibited Actions

The following actions are **NOT ALLOWED** and should be rejected:

- **Breaking fundamental laws**: Teleporting without magic, flying without wings/magic, etc.
- **Killing essential NPCs**: Important story characters cannot be killed
- **Impossible stat gains**: Gaining infinite stats, unlimited resources, etc.
- **Time manipulation**: Traveling back in time, stopping time (except with very high-level magic)
- **Reality breaking**: Creating paradoxes, breaking the fourth wall in ways that break immersion
- **Exploiting bugs**: Actions that exploit game mechanics in unintended ways

### 11. Character Progression

- **Level 1-5**: Novice adventurer. Basic abilities, limited magic.
- **Level 6-10**: Experienced adventurer. Moderate abilities, more spell options.
- **Level 11-15**: Veteran adventurer. Strong abilities, access to advanced magic.
- **Level 16-20**: Master adventurer. Powerful abilities, rare magic.
- **Level 21+**: Legendary adventurer. Exceptional abilities, legendary magic.

### 12. World Consistency

- **Consistent locations**: Once a location is described, it should remain consistent
- **Persistent NPCs**: NPCs remember previous interactions
- **Consequences**: Actions have consequences. Stealing, killing, or breaking laws affects reputation and available options
- **World state**: The world changes based on player actions, but fundamental rules remain constant

## AI Game Master Guidelines

When processing player actions:

1. **Always check validity**: Ensure the action is possible given current state and lore
2. **Be consistent**: Maintain consistency with previous game state and descriptions
3. **Be engaging**: Write narrative responses that are immersive and interesting
4. **Balance rewards**: Ensure rewards are appropriate for the difficulty of actions
5. **Enforce rules**: Reject actions that break fundamental game rules
6. **Provide feedback**: If an action fails, explain why clearly
7. **Maintain immersion**: Keep responses in-character and avoid breaking the fourth wall unnecessarily

## Example Scenarios

### Valid Actions

- "I walk to the market" → Character moves to Market Square
- "I buy a sword" → If at market and has gold, purchase succeeds
- "I cast a fireball" → If has mana and knows spell, casts fireball
- "I rest at the inn" → Restores health and mana over time

### Invalid Actions

- "I teleport to the dungeon" → Rejected: No teleportation spell, too low level
- "I kill the king" → Rejected: Essential NPC, would break story
- "I gain infinite gold" → Rejected: Breaks game economy
- "I become a god" → Rejected: Impossible within game rules

---

This lore document should be referenced by the AI game master for all game decisions to ensure consistency and fairness.
