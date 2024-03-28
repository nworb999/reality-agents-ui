import ConversationGameController from "./src/controller.js";

const gameSetupForm = document.getElementById("game-setup-form");

// Handle form submission
gameSetupForm.addEventListener("submit", (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Create a new game controller
  const gameController = new ConversationGameController();

  // Set up the game based on the form inputs
  gameController.createGame({
    scene: document.getElementById("sceneInput").value,
    conflict: document.getElementById("conflictInput").value,
    characters: Array.from(
      document.querySelectorAll(".character-inputs > div")
    ).map((characterDiv) => {
      return {
        name: characterDiv.querySelector(".character-name").value.trim(),
        personality: characterDiv
          .querySelector(".character-personality")
          .value.trim(),
        relation: characterDiv
          .querySelector(".character-relation")
          .value.trim(),
      };
    }),
  });

  // Start the game
  gameController.startGame();
});
