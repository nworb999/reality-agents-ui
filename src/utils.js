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

export const clearScreen = () => {
  const element = document.getElementById("textBox");
  element.textBox = "";
};

export const selectAndDisplayRandomStrings = (strings, elementId) => {
  return new Promise(async (resolve) => {
    let selectedStrings = [];
    let remainingStrings = [...strings];

    for (let i = 0; i < 5 && remainingStrings.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * remainingStrings.length);
      selectedStrings.push(remainingStrings[randomIndex]);
      remainingStrings.splice(randomIndex, 1);
    }

    const concatenatedString = selectedStrings.join("\n");

    await typeWriter({ elementId, text: concatenatedString, speed: 50 });
    resolve();
  });
};

export const typeWriter = ({
  elementId = "textBox",
  text,
  speed = 50,
} = {}) => {
  return new Promise((resolve) => {
    console.log("Typing text:", text);
    let i = 0;
    const element = document.getElementById(elementId);
    // element.innerHTML = ""; // Clear existing content and prepare for HTML content
    const interval = setInterval(() => {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(interval);
        console.log("Finished typing text.");
        resolve(); // Resolve the promise when finished typing
      }
    }, speed);
  });
};

function extractInfoPart(line) {
  const parts = line.split("- INFO -"); // Split the line at '- INFO -'
  if (parts.length > 1) {
    return parts[1]; // Return the second part if it exists
  } else {
    return null;
  }
}

export const filterScriptText = (text, names) => {
  const lines = text.split("\n"); // Split the script into lines
  const filteredLines = [];
  const nameLines = [];
  lines.forEach((line) => {
    const clean_line = extractInfoPart(line);
    const nameFound = names.some((name) => {
      const pattern = new RegExp(`^\\s*${name}:`, "i");
      return pattern.test(clean_line);
    });
    if (nameFound) {
      nameLines.push(clean_line);
    } else {
      filteredLines.push(line.replace(" INFO -", ""));
    }
  });
  console.log(nameLines);
  return {
    filteredText: filteredLines.join("\n"),
    nameText: nameLines.join("\n\n\n"),
  };
};

export const spinner = ({
  elementId = "textBox",
  duration = 3000,
  speed = 100,
} = {}) => {
  return new Promise((resolve) => {
    const element = document.getElementById(elementId);
    let startTime = Date.now();
    let currentSymbolIndex = 0;

    const interval = setInterval(() => {
      if (Date.now() - startTime >= duration) {
        clearInterval(interval);
        element.textContent = "";
        resolve();
        return;
      }

      element.textContent = SPINNER_SYMBOLS[currentSymbolIndex];
      currentSymbolIndex = (currentSymbolIndex + 1) % SPINNER_SYMBOLS.length;
    }, speed);
  });
};
