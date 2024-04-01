import { URL } from "./constants.js";

export default class ConversationGameController {
  constructor() {
    this.characters = [];
    this.currentCharacter = 0;
    this.gameFinished = false;
  }

  async createGame({ scene, conflict, characters: characters }) {
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
      }),
    });
    const data = await response.json();
  }

  async startGame() {
    const response = await fetch(`${URL}/api/game/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    this.gameLoop();
  }

  async gameLoop() {
    while (!this.gameFinished) {
      await this.processCharacterTurn();
      this.currentCharacter =
        (this.currentCharacter + 1) % this.characters.length;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay before the next turn
    }
  }

  async processCharacterTurn() {
    const response = await fetch(`${URL}/api/game/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (data.message === "Game over: cutoff reached") {
      console.log("GAME OVER: CUTOFF REACHED");
      this.gameFinished = true;
    } else if (data.message === "Game over: conversation ended") {
      console.log("Game over: conversation ended");
      this.gameFinished = true;
    } else {
      this.displayDialogue(data.dialogue);
    }

    // Simulate the spinner animation
    setTimeout(() => console.log("Spinner animation"), 1000);
  }

  displayDialogue(dialogue) {}
}
