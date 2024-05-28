import { URL } from "./constants.js";

export default class ConversationGameController {
  constructor(script) {
    this.characters = [];
    this.currentCharacter = 0;
    this.gameFinished = false;
    this.gameStarted = false;
    this.script = script;
    this.lastLogIndex = -1;
    this.logsInterval = null; // keep track of the log fetching interval
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

    if (response.ok) {
      const data = await response.json();
      console.log("Game created:", data);
    } else {
      console.error(
        "Failed to create game:",
        response.status,
        await response.text()
      );
    }

    console.log("Game created:", data);
  }

  async startGame() {
    console.log("Starting game...");
    const startGamePromise = fetch(`${URL}/api/game/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());

    const [startGameData] = await Promise.all([
      startGamePromise,
      this.startFetchingLogs(),
    ]);

    console.log("Game started:", startGameData);
    this.gameStarted = true;
  }

  async fetchLogs() {
    const response = await fetch(`${URL}/api/game/logs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (data.logs && data.logs.length > this.lastLogIndex + 1) {
      const newLogs = data.logs.slice(this.lastLogIndex + 1).join("\n");
      this.script += newLogs + "\n"; // Append new logs to the script
      this.lastLogIndex = data.logs.length - 1; // Update the last log index
      console.log("New logs added to script:\n", newLogs);
    }
  }

  startFetchingLogs() {
    this.logsInterval = setInterval(() => this.fetchLogs(), 2000);
  }

  stopFetchingLogs() {
    if (this.logsInterval) {
      clearInterval(this.logsInterval);
      this.logsInterval = null;
      console.log("Stopped fetching logs.");
    }
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

      // Check for game over conditions
      if (
        data.message === "Game over: cutoff reached" ||
        data.message === "Game over: conversation ended"
      ) {
        console.log(data.message);
        this.gameFinished = true;
        this.stopFetchingLogs();
      } else {
        // Process the character turn
        this.currentCharacter =
          (this.currentCharacter + 1) % this.characters.length;
      }

      // Wait for 5 seconds before the next update
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log("Exiting game loop.");
  }
}
