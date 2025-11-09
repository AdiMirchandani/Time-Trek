// --- Basic setup ---
const world = document.getElementById("world");
const player = document.getElementById("player");
const message = document.getElementById("message");
const foundDisplay = document.getElementById("found");

const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popup-title");
const popupText = document.getElementById("popup-text");
const popupClose = document.getElementById("popup-close");

const GAME_WIDTH = 800;
const WORLD_WIDTH = 2400;
const PLAYER_SPEED = 4;

let playerX = 100;
let keys = {};
let popupOpen = false;
let activeArtifact = null;

// Data for each artifact (what appears when you press E)
const artifactInfo = {
  cuneiform: {
    name: "Cuneiform Tablet",
    description:
      "Cuneiform was one of the world’s first writing systems, invented in Mesopotamia. Scribes pressed wedge-shaped marks into clay tablets to record trades, laws, stories like the Epic of Gilgamesh, and more. Every time you write on paper or type on a keyboard, you're using an idea that started here!"
  },
  plow: {
    name: "The Plow",
    description:
      "The plow allowed Mesopotamian farmers to dig into the soil more easily and plant more crops. This meant more food, larger cities, and more people. Modern tractors and farming machines are high-tech versions of this early tool."
  },
  irrigation: {
    name: "Irrigation Gate",
    description:
      "Irrigation systems in Mesopotamia used canals and gates to control the water from the Tigris and Euphrates rivers. This turned dry land into farmland and made big civilizations possible. Modern sprinklers, dams, and canals still use the same basic idea."
  },
  wheel: {
    name: "The Wheel",
    description:
      "The wheel first appeared in Mesopotamia and was used for things like pottery and carts. Today, wheels and wheel-like parts (like gears) are everywhere—cars, bikes, engines, watches, and even hard drives. Without the wheel, travel and machines would be completely different."
  },
  math: {
    name: "Math Tablet",
    description:
      "Mesopotamian mathematicians developed a base-60 number system. That’s why we have 60 seconds in a minute, 60 minutes in an hour, and 360 degrees in a circle. Their work helped inspire later math like algebra, which modern science, engineering, and technology depend on."
  }
};

// Turn each artifact DOM element into an object we can track
const artifactElements = Array.from(document.querySelectorAll(".artifact"));

const artifacts = artifactElements.map((el) => {
  const type = el.dataset.type;
  const x = parseInt(el.dataset.x, 10) || 0;

  // Place artifact at the given world X position
  el.style.left = x + "px";

  return {
    el,
    x,
    type,
    name: artifactInfo[type].name,
    description: artifactInfo[type].description,
    collected: false
  };
});

const totalArtifacts = artifacts.length;
let foundCount = 0;

// --- Input handling ---

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (popupOpen) {
    // When popup is open, only allow close keys
    if (key === " " || key === "enter" || key === "escape") {
      e.preventDefault();
      closePopup();
    }
    return;
  }

  // Track keys for movement
  keys[key] = true;

  if (key === "e") {
    if (activeArtifact && !activeArtifact.collected) {
      openPopup(activeArtifact);
    }
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  keys[key] = false;
});

// Also allow clicking the close button
popupClose.addEventListener("click", () => {
  closePopup();
});

// --- Game loop ---

function update() {
  if (!popupOpen) {
    handleMovement();
  }
  checkArtifacts();
  requestAnimationFrame(update);
}

function handleMovement() {
  let movingLeft = keys["arrowleft"] || keys["a"];
  let movingRight = keys["arrowright"] || keys["d"];

  if (movingLeft) {
    playerX -= PLAYER_SPEED;
  }
  if (movingRight) {
    playerX += PLAYER_SPEED;
  }

  // Clamp inside the world
  const PLAYER_WIDTH = 32;
  if (playerX < 0) playerX = 0;
  if (playerX > WORLD_WIDTH - PLAYER_WIDTH) {
    playerX = WORLD_WIDTH - PLAYER_WIDTH;
  }

  // Update player position in the world
  player.style.left = playerX + "px";

  // Camera: keep player roughly centered
  let cameraX = playerX - GAME_WIDTH / 2;
  if (cameraX < 0) cameraX = 0;
  if (cameraX > WORLD_WIDTH - GAME_WIDTH) {
    cameraX = WORLD_WIDTH - GAME_WIDTH;
  }

  world.style.transform = `translateX(${-cameraX}px)`;
}

function checkArtifacts() {
  let closest = null;
  let minDistance = 60; // how close you need to be

  artifacts.forEach((a) => {
    if (a.collected) return;
    const dx = Math.abs(playerX - a.x);
    if (dx < minDistance) {
      minDistance = dx;
      closest = a;
    }
  });

  if (closest) {
    activeArtifact = closest;
    message.textContent = `You see a ${closest.name}. Press E to inspect it.`;
  } else {
    activeArtifact = null;
    if (!popupOpen) {
      message.textContent =
        "Explore Mesopotamia! Use ← → or A/D to move. Press E near an object to inspect it.";
    }
  }
}

// --- Popup handling ---

function openPopup(artifact) {
  popupTitle.textContent = artifact.name;
  popupText.textContent = artifact.description;
  popup.classList.remove("hidden");
  popupOpen = true;

  if (!artifact.collected) {
    artifact.collected = true;
    artifact.el.classList.add("collected");
    foundCount++;
    foundDisplay.textContent = `Artifacts found: ${foundCount} / ${totalArtifacts}`;

    if (foundCount === totalArtifacts) {
      message.textContent =
        "You found all the key Mesopotamian inventions! Press Space or Enter to close.";
    } else {
      message.textContent =
        "Great discovery! Keep exploring to find the remaining inventions.";
    }
  }
}

function closePopup() {
  popup.classList.add("hidden");
  popupOpen = false;

  if (foundCount === totalArtifacts) {
    message.textContent =
      "Mission complete! You uncovered how Mesopotamian inventions shaped our modern world.";
  } else {
    message.textContent =
      "Explore Mesopotamia! Use ← → or A/D to move. Press E near an object to inspect it.";
  }
}

// Start the loop
update();
