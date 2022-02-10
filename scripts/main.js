let level = 1;

let levels;
let game;
let player;
let cursors;
let currentTile = {
  x: 0,
  y: 0,
  transition: false
};

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
    data: levels[level],
    tileWidth: 32,
    tileHeight: 32
  });
  map.addTilesetImage("tileset");
  map.setCollisionByExclusion([0], true, this.collisionLayer);
  const walls = map.createLayer(0, "tileset", 1280 / 2 - 720 / 2, 0);
  walls.scale = 720 / 320;

  // Player
  player = this.physics.add.sprite(
    getTileX(currentTile.x),
    getTileY(currentTile.y),
    "dude"
  );
  player.scale = 1.5;
  player.setCollideWorldBounds(true);
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 0,
      end: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 5,
      end: 8
    }),
    frameRate: 10,
    repeat: -1
  });

  // Collision
  this.physics.add.collider(player, walls);

  // Input
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  // Moving between tiles
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
  } else {
    // Check for input to move between tiles
    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play("left", true);
      currentTile.x -= 1;
      currentTile.transition = true;
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play("right", true);
      currentTile.x += 1;
      currentTile.transition = true;
    } else {
      player.setVelocityX(0);
      player.anims.pause();
    }
    if (cursors.up.isDown) {
      player.setVelocityY(-160);
      currentTile.y -= 1;
      currentTile.transition = true;
    } else if (cursors.down.isDown) {
      player.setVelocityY(160);
      currentTile.y += 1;
      currentTile.transition = true;
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
