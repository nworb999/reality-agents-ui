import { URL } from "./constants.js";

export default class ConversationGameController {
  constructor(script) {
    this.characters = [];
    this.currentCharacter = 0;
    this.gameFinished = false;
    this.gameStarted = false;
    this.script = script;
    this.lastLogIndex = -1; // Initialize lastLogIndex
    console.log("ConversationGameController initialized.");
  }

  async createGame({ scene, conflict, characters, max_turns = 10 }) {
    console.log("Creating game...");
    const response = await fetch(`${URL}/api/game/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scene: scene,
        conflict: conflict,
        characters: characters,
        test_flag: true,
        max_turns: max_turns,
      }),
    });
    const data = await response.json();
    console.log("Game created:", data);
  }

  async startGame() {
    console.log("Starting game...");
    const response = await fetch(`${URL}/api/game/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("Game started:", data);
    this.gameStarted = true;
  }

  async gameLoop() {
    console.log("Entering game loop...");

    while (!this.gameFinished) {
      const response = await fetch(`${URL}/api/game/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      // Update the script with new logs
      if (data.logs && data.logs.length > this.lastLogIndex + 1) {
        const newLogs = data.logs.slice(this.lastLogIndex + 1).join("\n");
        this.script += newLogs + "\n"; // Append new logs to the script
        this.lastLogIndex = data.logs.length - 1; // Update the last log index
        console.log("New logs added to script:\n", newLogs);
      }

      // Check for game over conditions
      if (data.message === "Game over: cutoff reached") {
        console.log("Game over: cutoff reached");
        this.gameFinished = true;
      } else if (data.message === "Game over: conversation ended") {
        console.log("Game over: conversation ended");
        this.gameFinished = true;
      } else {
        this.displayDialogue(data.dialogue);

        // Process the character turn
        this.currentCharacter =
          (this.currentCharacter + 1) % this.characters.length;
      }

      // Wait for 5 seconds before the next update
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.log("Exiting game loop.");
  }

  displayDialogue(dialogue) {
    console.log("Dialogue:", dialogue);
  }
}
