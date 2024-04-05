import ConversationGameController from "./src/controller.js";
import { GENERIC_SIMS_STATEMENTS } from "./src/constants.js";
import { selectAndDisplayRandomStrings, spinner } from "./src/utils.js";

let script = "";
const gameSetupForm = document.getElementById("game-setup-form");
const gameController = new ConversationGameController(script);

function initializeInputNavigation() {
  const inputs = document.querySelectorAll("input[type=text]");
  inputs[0].focus(); // Focus on the first input

  inputs.forEach((input, index) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission on Enter
        if (index < inputs.length - 1) {
          inputs[index + 1].focus(); // Move to the next input
        }
      }
    });
  });
}

gameSetupForm.addEventListener("submit", async (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  gameSetupForm.style.display = "none";

  const gameOutput = document.getElementById("textBox");
  gameOutput.hidden = false;
  gameOutput.style.display = "block";

  const characters = Array.from(document.querySelectorAll(".character")).map(
    (characterDiv) => {
      return {
        name: characterDiv.querySelector(".character-name").value.trim(),
        personality: characterDiv
          .querySelector(".character-personality")
          .value.trim(),
        relationship_to_target: characterDiv
          .querySelector(".character-relation")
          .value.trim(),
      };
    }
  );
  const scene = document.getElementById("sceneInput").value;
  const conflict = document.getElementById("conflictInput").value;

  await gameController.createGame({
    scene,
    conflict,
    characters: characters,
  });

  gameController.startGame();

  await spinner("textBox");
  selectAndDisplayRandomStrings(GENERIC_SIMS_STATEMENTS, "textBox");
});

const gameLoopJob = setInterval(() => {
  if (gameController.gameStarted) {
    clearInterval(gameLoopJob);
    gameController.gameLoop();
  }
}, 1000);

initializeInputNavigation();
