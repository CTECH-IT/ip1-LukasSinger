let level = 1;

let levels;
let game;
let player;

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
        debug: false,
      },
    },
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
  });
}

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("tileset", "assets/tileset.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

async function create() {
  // Background
  this.add.image(1280 / 2, 720 / 2, "sky");

  // Level
  const map = this.make.tilemap({
    data: levels[level],
    tileWidth: 32,
    tileHeight: 32,
  });
  map.addTilesetImage("tileset");
  const walls = map.createLayer(0, "tileset", 1280 / 2 - 720 / 2, 0);
  walls.scale = 720 / 320;

  // Player
  player = this.physics.add.sprite(1280 / 2, 720 / 2, "dude");
  player.setCollideWorldBounds(true);
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 5,
      end: 8,
    }),
    frameRate: 10,
    repeat: -1,
  });

  // Collision
  this.physics.add.collider(player, walls);
}

function update() {}
