let level = 1;

let levels;
let game;

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
  this.add.image(1280 / 2, 720 / 2, "sky");
  const map = this.make.tilemap({
    data: levels[level],
    tileWidth: 32,
    tileHeight: 32,
  });
  map.addTilesetImage("tileset");
  const layer = map.createLayer(0, "tileset", 1280 / 2 - 720 / 2, 0);
  layer.scale = 720 / 320;
}

function update() {}
