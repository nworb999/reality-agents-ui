import {
  DEFAULT_PLAYERS,
  SCENE_DEFAULT,
  CONFLICT_DEFAULT,
  THEN_PRESS_ENTER,
} from "./constants.js";

const ORDINAL_DICT = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
};

export function displaySpinner(duration = 3) {
  const spinnerSymbols = ["|", "/", "-", "\\"];
  let startTime = Date.now();

  // Hide cursor
  process.stdout.write("\x1B[?25l");

  const interval = setInterval(() => {
    spinnerSymbols.forEach((symbol) => {
      if (Date.now() - startTime >= duration * 1000) {
        clearInterval(interval);
        process.stdout.write("\r \r"); // Clear line
        process.stdout.write("\x1B[?25h"); // Show cursor
        return;
      }
      process.stdout.write("\r" + symbol);
    });
  }, 100);
}

export function setupGame(
  sceneCache,
  conflictCache,
  charactersCache,
  testFlag = false
) {
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
}

function promptWithDefault(promptMessage, defaultValue) {
  const input = prompt(`${promptMessage}${THEN_PRESS_ENTER}`);
  return input || defaultValue;
}

function definePlayerRelationships(players, testFlag = false) {
  players.forEach((player, i) => {
    const targetPlayer = players[(i + 1) % players.length];
    let relationship = testFlag
      ? "They are just acquaintances."
      : prompt(
          `How does ${player.name} feel about ${targetPlayer.name}?${THEN_PRESS_ENTER}`
        ).trim();

    if (!testFlag) {
      displaySpinner(1);
    }

    player.relationshipToTarget =
      relationship || "They are just acquaintances.";
  });
  return players;
}

export function collectCharacterInfo(playerNumber) {
  const ordinal = ORDINAL_DICT[playerNumber] || `${playerNumber}th`;
  const name = prompt(
    `What is the name of the ${ordinal} character?${THEN_PRESS_ENTER}`
  ).trim();

  displaySpinner(1);
  if (name.toLowerCase() === "test") {
    return null; // Signal to use default players
  }

  const personality = prompt(
    `What is ${name}'s personality?${THEN_PRESS_ENTER}`
  ).trim();
  displaySpinner(1);

  return createCharacter(name, personality);
}

function collectCharacters() {
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
}

function createCharacter(
  name,
  personality = null,
  relationshipToTarget = "They are just acquaintances."
) {
  return {
    name,
    personality,
    relationshipToTarget,
  };
}
