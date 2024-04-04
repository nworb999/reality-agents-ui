import ConversationGameController from "./src/controller.js";

let script = "";
const gameSetupForm = document.getElementById("game-setup-form");
const gameController = new ConversationGameController(script);

gameSetupForm.addEventListener("submit", async (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

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
});

const gameLoopJob = setInterval(() => {
  if (gameController.gameStarted) {
    clearInterval(gameLoopJob);
    gameController.gameLoop();
  }
}, 1000);
