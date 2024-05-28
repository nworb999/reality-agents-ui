import ConversationGameController from "./src/controller.js";
import { GENERIC_SIMS_STATEMENTS } from "./src/constants.js";
import {
  selectAndDisplayRandomStrings,
  spinner,
  typeWriter,
  clearScreen,
  filterScriptText,
} from "./src/utils.js";

let script = "";
const gameSetupForm = document.getElementById("game-setup-form");
const gameController = new ConversationGameController(script);

const initializeInputNavigation = () => {
  const inputs = document.querySelectorAll("input[type=text]");
  inputs[0].focus();

  inputs.forEach((input, index) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      }
    });
  });
};

const scriptLoopJob = (names) => {
  let lastScriptLength = 0;

  const typingJob = async () => {
    const currentScript = gameController.script;
    if (currentScript.length > lastScriptLength) {
      const newScriptText = currentScript.slice(lastScriptLength);
      const { filteredText, nameText } = filterScriptText(newScriptText, names); // Filter the new script text using dynamic names
      if (nameText) {
        console.log({ nameText });
        const formattedNameText = nameText
          .split(":")
          .map((part, index) =>
            index === 0 ? `\n${part.toUpperCase()}\n` : `${part}`
          )
          .join("\n");

        await typeWriter({
          text: formattedNameText,
          elementId: "nameBox",
          speed: 20,
        });
      }
      if (filteredText) {
        await typeWriter({
          text: filteredText,
          elementId: "textBox",
          speed: 20,
        });
        lastScriptLength = currentScript.length;
      }
    }
    setTimeout(typingJob, 1000);
  };

  typingJob();
};

gameSetupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  gameSetupForm.style.display = "none";

  const characters = Array.from(document.querySelectorAll(".character")).map(
    (characterDiv) => {
      return {
        name:
          characterDiv.querySelector(".character-name").value.trim() ||
          characterDiv.querySelector(".character-name").placeholder,
        personality:
          characterDiv.querySelector(".character-personality").value.trim() ||
          characterDiv.querySelector(".character-personality").placeholder,
        relationship_to_target:
          characterDiv.querySelector(".character-relation").value.trim() ||
          characterDiv.querySelector(".character-relation").placeholder,
      };
    }
  );

  const scene =
    document.getElementById("sceneInput").value ||
    document.getElementById("sceneInput").placeholder;
  const conflict =
    document.getElementById("conflictInput").value ||
    document.getElementById("conflictInput").placeholder;
  console.log({
    scene,
    conflict,
    characters: characters,
  });
  await gameController.createGame({
    scene,
    conflict,
    characters: characters,
  });

  await gameController.startGame(); // this didn't have an await before

  await spinner();

  await selectAndDisplayRandomStrings(GENERIC_SIMS_STATEMENTS);

  await spinner();
  clearScreen();

  scriptLoopJob(characters.map((character) => character.name));
});

const gameLoopJob = setInterval(() => {
  if (gameController.gameStarted) {
    clearInterval(gameLoopJob);
    gameController.gameLoop();
  }
}, 500);

initializeInputNavigation();
