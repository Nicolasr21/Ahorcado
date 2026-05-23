const words = [
  {
    display: "Educación",
    hint: "Proceso de formación que ayuda a desarrollar conocimientos, valores y habilidades."
  },
  {
    display: "Tecnología",
    hint: "Conjunto de herramientas y conocimientos que facilitan resolver problemas."
  },
  {
    display: "Conocimiento",
    hint: "Información, ideas y experiencias que una persona comprende y puede aplicar."
  },
  {
    display: "Vocación",
    hint: "Inclinación o interés profundo hacia una profesión, actividad o servicio."
  },
  {
    display: "Robótica",
    hint: "Área que diseña, construye y programa máquinas capaces de realizar tareas."
  },
  {
    display: "Enseñanza",
    hint: "Acción de guiar a otros para que aprendan algo nuevo."
  },
  {
    display: "Aprendizaje",
    hint: "Proceso mediante el cual se adquieren habilidades o conocimientos."
  }
];

const alphabet = "abcdefghijklmnñopqrstuvwxyz".split("");
const maxMistakes = 6;

const wordDisplay = document.querySelector("#word-display");
const keyboard = document.querySelector("#keyboard");
const statusText = document.querySelector("#status-text");
const attemptsText = document.querySelector("#attempts-text");
const hintButton = document.querySelector("#hint-button");
const hintText = document.querySelector("#hint-text");
const newGameButton = document.querySelector("#new-game-button");
const guessForm = document.querySelector("#guess-form");
const fullWordInput = document.querySelector("#full-word-input");
const bodyParts = document.querySelectorAll(".body-part");

let selectedWord;
let guessedLetters;
let mistakes;
let gameFinished;

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/ñ/g, "n")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getLetterKey(letter) {
  return letter
    .toLowerCase()
    .replace(/ñ/g, "#")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/#/g, "ñ");
}

function getWordKey(word) {
  return word.split("").map(getLetterKey).join("");
}

function pickRandomWord() {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

function startGame() {
  selectedWord = pickRandomWord();
  selectedWord.key = getWordKey(selectedWord.display);
  guessedLetters = new Set();
  mistakes = 0;
  gameFinished = false;

  statusText.textContent = "Elige una letra para comenzar.";
  statusText.className = "status";
  hintText.textContent = "La pista aparecerá aquí.";
  fullWordInput.value = "";
  fullWordInput.disabled = false;
  hintButton.disabled = false;

  renderWord();
  renderKeyboard();
  updateDrawing();
  updateAttempts();
}

function renderWord() {
  wordDisplay.innerHTML = "";

  selectedWord.display.split("").forEach((letter) => {
    const letterKey = getLetterKey(letter);
    const slot = document.createElement("span");
    slot.className = "letter-slot";
    slot.textContent = guessedLetters.has(letterKey) ? letter : "";
    wordDisplay.appendChild(slot);
  });
}

function renderKeyboard() {
  keyboard.innerHTML = "";

  alphabet.forEach((letter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "key";
    button.textContent = letter;
    button.addEventListener("click", () => handleLetter(letter, button));
    keyboard.appendChild(button);
  });
}

function handleLetter(letter, button) {
  if (gameFinished || guessedLetters.has(letter)) {
    return;
  }

  guessedLetters.add(letter);
  button.disabled = true;

  if (selectedWord.key.includes(letter)) {
    button.classList.add("correct");
    statusText.textContent = "Bien hecho, esa letra está en la palabra.";
  } else {
    mistakes += 1;
    button.classList.add("incorrect");
    statusText.textContent = "Esa letra no aparece. Intenta otra.";
  }

  renderWord();
  updateDrawing();
  updateAttempts();
  checkGameState();
}

function updateDrawing() {
  bodyParts.forEach((part, index) => {
    part.classList.toggle("visible", index < mistakes);
  });
}

function updateAttempts() {
  attemptsText.textContent = `Intentos restantes: ${maxMistakes - mistakes}`;
}

function checkGameState() {
  const hasWon = selectedWord.key
    .split("")
    .every((letter) => guessedLetters.has(letter));

  if (hasWon) {
    finishGame(true);
  } else if (mistakes >= maxMistakes) {
    finishGame(false);
  }
}

function finishGame(won) {
  gameFinished = true;
  fullWordInput.disabled = true;
  hintButton.disabled = true;

  document.querySelectorAll(".key").forEach((button) => {
    button.disabled = true;
  });

  if (won) {
    revealWord();
    statusText.textContent = `Ganaste. La palabra era ${selectedWord.display}.`;
    statusText.className = "status win";
  } else {
    revealWord();
    statusText.textContent = `Perdiste. La palabra era ${selectedWord.display}.`;
    statusText.className = "status lose";
  }
}

function revealWord() {
  selectedWord.key.split("").forEach((letter) => guessedLetters.add(letter));
  renderWord();
}

hintButton.addEventListener("click", () => {
  hintText.textContent = selectedWord.hint;
});

newGameButton.addEventListener("click", startGame);

guessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (gameFinished) {
    return;
  }

  const userGuess = normalizeText(fullWordInput.value);

  if (!userGuess) {
    statusText.textContent = "Escribe una palabra antes de comprobar.";
    return;
  }

  if (userGuess === normalizeText(selectedWord.display)) {
    finishGame(true);
  } else {
    mistakes += 1;
    fullWordInput.value = "";
    statusText.textContent = "La palabra completa no coincide. Pierdes un intento.";
    updateDrawing();
    updateAttempts();
    checkGameState();
  }
});

startGame();
