/**
 * DOM SELECTORS
 */

const startButton = document.querySelector(".js-start-button");
const statusSpan = document.querySelector(".js-status"); // Use querySelector() to get the status element
const heading = document.querySelector(".js-heading"); // Use querySelector() to get the heading element
const padContainer = document.querySelector(".pad-container"); // Use querySelector() to get the padContainer element

/**
* VARIABLES
*/
let computerSequence = []; // track the computer-generated sequence of pad presses
let playerSequence = []; // track the player-generated sequence of pad presses
let maxRoundCount = 0; // the max number of rounds, varies with the chosen level
let roundCount = 0; // track the number of rounds that have been played so far

/**
* AUDIO FILES and PADS
*/
const pads = [
 {
   color: "red",
   selector: document.querySelector(".js-pad-red"),
   sound: new Audio("https://github.com/aprilsClasses/js-dev-final-capstone-starter-simon-says/blob/main/assets/simon-says-sound-1.mp3?raw=true"),
 },
 {
   color: "green",
   selector: document.querySelector(".js-pad-green"),
   sound: new Audio("https://github.com/aprilsClasses/js-dev-final-capstone-starter-simon-says/blob/main/assets/simon-says-sound-2.mp3?raw=true"),
 },
 {
   color: "blue",
   selector: document.querySelector(".js-pad-blue"),
   sound: new Audio("https://github.com/aprilsClasses/js-dev-final-capstone-starter-simon-says/blob/main/assets/simon-says-sound-3.mp3?raw=true"),
 },
 {
   color: "yellow",
   selector: document.querySelector(".js-pad-yellow"),
   sound: new Audio("https://github.com/aprilsClasses/js-dev-final-capstone-starter-simon-says/blob/main/assets/simon-says-sound-1.mp3?raw=true"),
 }
];

const loseSound = new Audio("https://github.com/aprilsClasses/js-dev-final-capstone-starter-simon-says/blob/main/assets/mixkit-retro-arcade-game-over-470.wav?raw=true");
const winSound = new Audio("https://github.com/aprilsClasses/js-dev-final-capstone-starter-simon-says/blob/main/assets/mixkit-retro-game-notification-212.wav?raw=true");
/**
* Preloads sounds in the browser for quicker playback. Adds an event listener to set 'ready' to true when
* sound clips are fully loaded and playable
* 
* Added an error handler and alert to notify user when sounds may not be available
*/

pads.forEach(pad => {
 pad.sound.preload = 'auto';


pad.sound.addEventListener('canplaythrough', () => {
pad.sound.ready = true;
});

pad.sound.addEventListener('error', () => {
 console.error("Sound may not have played. Accept our apologies and email maskedEmail.com if you continue experiencing difficulties");
})
});

/**
* OTHER EVENT LISTENERS
*/
padContainer.addEventListener("click", padHandler);
startButton.addEventListener("click", startButtonHandler);

/**
* EVENT HANDLERS
*/

/**
* 
* Handles start button click event and will initialize the game and start computer's turn
*/
function startButtonHandler() {
 maxRoundCount = setLevel();
 console.log("maxRoundCount:", maxRoundCount);
 roundCount = 1;

 startButton.classList.add("hidden");
 statusSpan.classList.remove("hidden");

 playComputerTurn();
 
 return {startButton, statusSpan};

}

function padHandler(event) {
 const {color} = event.target.dataset;
 if (!color || padContainer.classList.contains("unclickable")) return;

 const pad = pads.find(pad => pad.color === color);
 if (pad) {
   // Play sound and immediately activate pad
   pad.sound.currentTime = 0;
   pad.sound.play();
   activatePad(color); // this will light the pad
   checkPress(color); // checks if correct
 }
}

function setLevel(level = 1) {
 switch (level) {
   case 1:
     return 8;
   case 2:
     return 14;
   case 3:
     return 20;
   case 4:
     return 31;
   default:
     return "Please enter level 1, 2, 3, or 4";
 }
}

function getRandomItem(collection) {
 if (collection.length === 0) return null;
 const randomIndex = Math.floor(Math.random() * collection.length);
 return collection[randomIndex];
}

/**
* Sets the status text of a given HTML element with a given a message
*/
function setText(element, text) {
 element.textContent = text;
 return element;
}
function activatePad(color, timing = 500, isItTheComputersTurn = false) {
 const pad = pads.find(pad => pad.color === color);
 if (pad) {
   if (isItTheComputersTurn) {
     // (There was an issue with sounds overlapping when pads were quickly clicked in succession.)
     // Checks to see if sound is already playing
     if(!pad.sound.paused) {
       pad.sound.pause(); // Stops the previous sound so it doesn't overlap with current sound
       pad.sound.currentTime = 0; // resets sound to play from beginning of clicp
     }
     pad.sound.play().catch((error) => {
       console.error("Error when playing sound clip:", error);
     });
   }
   pad.selector.classList.add('activated');
   setTimeout(() => pad.selector.classList.remove('activated'), timing);
 }
}


function activatePads(sequence) {

 sequence.forEach((color, index) => {
   setTimeout(() => {
     activatePad(color, 500, true);
 }, index * 600);
 });
     
}

function playComputerTurn() {
 padContainer.classList.add("unclickable");

 setText(statusSpan, "The computer's turn...");
 setText(heading, `Round ${roundCount} of ${maxRoundCount}`);

 // Computer turn was starting too quickly so added a delay before starting pad activations sequence

 const randomColor = getRandomItem(pads.map(pad => pad.color));
 computerSequence.push(randomColor);
 setTimeout(() => {
 activatePads(computerSequence);

 // individual pad timings (on first turn, first pad activates after 600 millieconds, the second after 1200, 3rd after 1800, etc,
 // allowing time for user to see clicked pads clearly
 const del = computerSequence.length * 600; 
 setTimeout(() => {
   playHumanTurn();
 }, del);
}, 700); // delay before starting the pad activation sequence for computer
   
}

/**
* Enables player's turn by making pads clickable.
* Prevents pads from moving during player's turn to avoid click delays.
* Updates player of remaining presses needed in the sequence
*/
function playHumanTurn() {
 padContainer.classList.remove("unclickable");
 padContainer.classList.remove("no-hover");
 const pressesRemaining = computerSequence.length - playerSequence.length;
 setText(statusSpan, `Player's turn. Presses remaining: ${pressesRemaining}`);
}

/**
* Handles player input when pad is pressed.
* Checks if user's pressed color matches expected color in the sequence.
* Updates the player's sequence and if tge sequence is completed, checks the current roun.
* If pressed color doesn't match, updates the status to show player how many presses they have left in the sequence
* @param {string} color - color of the clicked pad
* @returns - Ends the play if sequence is incorrect
*/
function checkPress(color) {

 playerSequence.push(color);

 const index = playerSequence.length - 1;

 // Calculates the remaining presses needed for the player and compares the expected color at the current index of computerSequence with the color of player's most recent press.
 // If they don't match, it means the player pressed a button out of sequence, resulting in game over.
 // The 'remaining Presses' tells how many more buttons the player needs to press in the sequence
 const remainingPresses = computerSequence.length - playerSequence.length;

 // Checks if the player's last pad press matches expected color in the computer's sequence at the current index.
 if(computerSequence[index] !== playerSequence[index]) {
     resetGame("Game over.");
     return;
 }
   if(remainingPresses === 0) {
     checkRound();
 }  // let user know how many presses they have left
 setText(statusSpan, `Presses left: ${remainingPresses}`);

}

/**
* Checks if player has completed current round
* If player reaches maximum number of rounds, game resets with a win message
* If player hasn't reached max rounds, game continues with computer's turn
*/
function checkRound() {
 if(playerSequence.length === maxRoundCount) {
   resetGame("Great job. You win!");
 } else {
   roundCount += 1;
   playerSequence = [];

   setText(statusSpan, "Nice! Keep going!");

   setTimeout(() => {
     playComputerTurn();
   }, 600);
 }
}

function resetGame(text) {
 if(text.includes("Game over")) {
   loseSound.play().catch((error) => {
     console.error("Error playing sound:", error);
   });
 } else if (text.includes("Great job")) {
   winSound.play().catch((error) => {
     console.error("Error play sound:", error);
   });
 }
 computerSequence = [];
 playerSequence = [];
 roundCount = 0;
 
 setTimeout(() => {
 alert(text);
 setText(heading, "Simon Says");
 startButton.classList.remove("hidden");
 statusSpan.classList.add("hidden");
 padContainer.classList.add("unclickable");
}, 500);
}

window.statusSpan = statusSpan;
window.heading = heading;
window.padContainer = padContainer;
window.pads = pads;
window.computerSequence = computerSequence;
window.playerSequence = playerSequence;
window.maxRoundCount = maxRoundCount;
window.roundCount = roundCount;
window.startButtonHandler = startButtonHandler;
window.padHandler = padHandler;
window.setLevel = setLevel;
window.getRandomItem = getRandomItem;
window.setText = setText;
window.activatePad = activatePad;
window.activatePads = activatePads;
window.playComputerTurn = playComputerTurn;
window.playHumanTurn = playHumanTurn;
window.checkPress = checkPress;
window.checkRound = checkRound;
window.resetGame = resetGame;