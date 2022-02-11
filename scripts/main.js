const BLOCKING_TILES = [4];
const FLOOR_ID = 0;
const ROCK_ID = 10;
const COMPUTER_ID = 2;

let cursors;

let level = {
  index: 1
};

let levels;
let game;
let player;
let isDoingAction = false;
let currentTile = {
  x: 0,
  y: 0,
  transition: false
};
let inventory = "";

load();

async function load() {
  await fetch("data/levels.json")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      levels = data;
      return levels;
    });
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
      default: "arcade",
      arcade: {
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  });
}

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("tileset", "assets/tileset.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
}

async function create() {
  // Background
  this.add.image(1280 / 2, 720 / 2, "sky");

  // Level
  const map = this.make.tilemap({
    data: levels[level.index],
    tileWidth: 32,
    tileHeight: 32
  });
  map.addTilesetImage("tileset");
  level.tiles = map.createLayer(0, "tileset", 1280 / 2 - 720 / 2, 0);
  level.tiles.scale = 720 / 320;

  // Player
  player = this.physics.add.sprite(
    getTileX(currentTile.x),
    getTileY(currentTile.y),
    "dude"
  );
  player.scale = 1.5;
  this.anims.create({
    key: "x-1y0",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 0,
      end: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "x1y0",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 5,
      end: 8
    }),
    frameRate: 10,
    repeat: -1
  });

  // Input
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  // Don't handle input if the player hasn't let go of the key after picking up or dropping
  if (
    isDoingAction &&
    !(
      cursors.left.isDown ||
      cursors.right.isDown ||
      cursors.up.isDown ||
      cursors.down.isDown
    )
  ) {
    isDoingAction = false;
  }
  // If player is moving between tiles
  if (currentTile.transition) {
    if (
      Math.abs(player.x - getTileX(currentTile.x)) < 5 &&
      Math.abs(player.y - getTileY(currentTile.y)) < 5
    ) {
      player.setVelocityX(0);
      player.setVelocityY(0);
      player.anims.pause();
      currentTile.transition = false;
    }
  } else if (!isDoingAction) {
    // Check for directional input
    if (cursors.left.isDown) {
      handleDirectional(-1, 0);
    } else if (cursors.right.isDown) {
      handleDirectional(1, 0);
    } else {
      player.setVelocityX(0);
      player.anims.pause();
    }
    if (cursors.up.isDown) {
      handleDirectional(0, -1);
    } else if (cursors.down.isDown) {
      handleDirectional(0, 1);
    } else {
      player.setVelocityY(0);
    }
  }
}

function getTileX(pos) {
  return 1280 / 2 - 720 / 2 + pos * 32 * 2.25 + 0.5 * 32 * 2.25;
}

function getTileY(pos) {
  return pos * 32 * 2.25 + 0.5 * 32 * 2.25;
}

/**
 * Take action based on the target tile specified in relative coordinates.
 * @param {int} dx The number of tiles in the X position from the tile the player is currently occupying.
 * @param {int} dy The number of tiles in the Y position from the tile the player is currently occupying.
 */
function handleDirectional(dx, dy) {
  let x = currentTile.x + dx;
  let y = currentTile.y + dy;
  // Return if the tile is outside the bounds of the level
  if (x < 0 || y < 0 || x > 9 || y > 9) return;
  // Return if the tile is a wall
  let tile = level.tiles.layer.data[y][x];
  if (BLOCKING_TILES.includes(tile.index)) return;
  // Check if player is placing or just walking
  let placeMode = cursors.space.isDown && inventory != "";
  if (tile.index != ROCK_ID && tile.index != COMPUTER_ID) {
    if (placeMode) {
      // Place on tile if nothing is occupying it
      if (inventory == "rock") {
        tile.index = ROCK_ID;
        inventory = "";
        isDoingAction = true;
      } else if (inventory == "computer") {
        tile.index = COMPUTER_ID;
        inventory = "";
        isDoingAction = true;
      }
    } else {
      // Move to tile if nothing is occupying it
      player.setVelocityX(dx * 160);
      player.setVelocityY(dy * 160);
      player.anims.play(`x${dx}y${dy}`, true);
      currentTile.x += dx;
      currentTile.y += dy;
      currentTile.transition = true;
    }
  } else if (!inventory) {
    // If the inventory is empty, attempt to pick up the tile
    if (tile.index == ROCK_ID) {
      tile.index = FLOOR_ID;
      inventory = "rock";
      isDoingAction = true;
    } else if (tile.index == COMPUTER_ID) {
      tile.index = FLOOR_ID;
      inventory = "computer";
      isDoingAction = true;
    }
  } else if (placeMode && tile.index == ROCK_ID && inventory == "rock") {
    // If the player is trying to place a rock on another rock, make a computer
    tile.index = COMPUTER_ID;
    inventory = "";
    isDoingAction = true;
  }
}
