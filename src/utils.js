import {
  DEFAULT_PLAYERS,
  SCENE_DEFAULT,
  CONFLICT_DEFAULT,
  THEN_PRESS_ENTER,
  SPINNER_SYMBOLS,
} from "./constants.js";

const ORDINAL_DICT = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
};

export const setupGame = (
  sceneCache,
  conflictCache,
  charactersCache,
  testFlag = false
) => {
  const scene = testFlag
    ? SCENE_DEFAULT
    : sceneCache ||
      promptWithDefault("Where do they work? e.g. auto shop", SCENE_DEFAULT);
  const conflict = testFlag
    ? CONFLICT_DEFAULT
    : conflictCache ||
      promptWithDefault("What is the conflict? e.g. money", CONFLICT_DEFAULT);
  const characters = testFlag
    ? DEFAULT_PLAYERS
    : charactersCache || collectCharacters();

  return [scene, conflict, characters];
};

const promptWithDefault = (promptMessage, defaultValue) => {
  const input = prompt(`${promptMessage}${THEN_PRESS_ENTER}`);
  return input || defaultValue;
};

const definePlayerRelationships = (players, testFlag = false) => {
  players.forEach((player, i) => {
    const targetPlayer = players[(i + 1) % players.length];
    let relationship = testFlag
      ? "They are just acquaintances."
      : prompt(
          `How does ${player.name} feel about ${targetPlayer.name}?${THEN_PRESS_ENTER}`
        ).trim();

    player.relationshipToTarget =
      relationship || "They are just acquaintances.";
  });
  return players;
};

export const collectCharacterInfo = (playerNumber) => {
  const ordinal = ORDINAL_DICT[playerNumber] || `${playerNumber}th`;
  const name = prompt(
    `What is the name of the ${ordinal} character?${THEN_PRESS_ENTER}`
  ).trim();

  if (name.toLowerCase() === "test") {
    return null; // Signal to use default players
  }

  const personality = prompt(
    `What is ${name}'s personality?${THEN_PRESS_ENTER}`
  ).trim();

  return createCharacter(name, personality);
};

const collectCharacters = () => {
  const firstCharacter = collectCharacterInfo(1);
  if (firstCharacter === null) {
    return DEFAULT_PLAYERS;
  }

  const characters = [firstCharacter, collectCharacterInfo(2)];
  definePlayerRelationships(characters);

  if (
    characters.every(
      (character) =>
        character.name === "" &&
        character.relationshipToTarget === "They are just acquaintances."
    )
  ) {
    return DEFAULT_PLAYERS;
  }

  return characters;
};

const createCharacter = (
  name,
  personality = null,
  relationshipToTarget = "They are just acquaintances."
) => {
  return {
    name,
    personality,
    relationshipToTarget,
  };
};

export const selectAndDisplayRandomStrings = (strings, elementId) => {
  let selectedStrings = [];
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * strings.length);
    selectedStrings.push(strings[randomIndex]);
  }

  const concatenatedString = selectedStrings.join("\n");

  typeWriter(elementId, concatenatedString, 50);
};

const typeWriter = (elementId, text, speed) => {
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      document.getElementById(elementId).textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(interval);
    }
  }, speed);
};
export const spinner = (elementId, duration = 3000, speed = 100) => {
  return new Promise((resolve) => {
    const element = document.getElementById(elementId);
    let startTime = Date.now();
    let currentSymbolIndex = 0;

    const interval = setInterval(() => {
      if (Date.now() - startTime >= duration) {
        clearInterval(interval);
        resolve();
        return;
      }

      element.textContent += SPINNER_SYMBOLS[currentSymbolIndex];
      currentSymbolIndex = (currentSymbolIndex + 1) % SPINNER_SYMBOLS.length;
    }, speed);
  });
};
