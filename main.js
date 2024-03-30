import ConversationGameController from "./src/controller.js";

const gameSetupForm = document.getElementById("game-setup-form");

// Handle form submission
gameSetupForm.addEventListener("submit", async (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Create a new game controller
  const gameController = new ConversationGameController();

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

  // Start the game
  gameController.startGame();
});
