import { URL } from "./constants.js";
import { collectCharacterInfo } from "./utils.js";

export default class ConversationGameController {
  constructor() {
    this.characters = [];
    this.currentCharacter = 0;
    this.gameFinished = false;
  }

  async createGame() {
    // Retrieve values from the form inputs
    const scene = document.getElementById("sceneInput").value;
    const conflict = document.getElementById("conflictInput").value;
    const charactersInput = document.getElementById("charactersInput").value;

    // Convert characters input to an array of character objects
    const characters = charactersInput
      .split(",")
      .map((name) => collectCharacterInfo(name.trim()));

    // POST request with the game setup data
    const response = await fetch(`${URL}/api/game/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scene: scene,
        conflict: conflict,
        characters: characters,
      }),
    });
    const data = await response.json();
    console.log(data);
  }

  async startGame() {
    // Fetch game setup from the backend
    const response = await fetch(`${URL}/api/game/setup`);
    const data = await response.json();
    this.characters = data.characters;
    if (!this.characters.length) return;

    this.gameLoop();
  }

  async gameLoop() {
    while (!this.gameFinished) {
      await this.processCharacterTurn();
      this.currentCharacter =
        (this.currentCharacter + 1) % this.characters.length;
    }
  }

  async processCharacterTurn() {
    const response = await fetch(`${URL}/api/game/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        characterId: this.characters[this.currentCharacter].id,
      }),
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
