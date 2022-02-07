// Initialize the game
const game = new Phaser.Game({
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

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("tileset", "assets/tileset.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  this.add.image(1280 / 2, 720 / 2, "sky");
  const map = this.make.tilemap({
    data: [],
    tileWidth: 64,
    tileHeight: 64,
  });
  map.addTilesetImage("tileset");
  const layer = map.createLayer(0, "tileset", 0, 0);
}

function update() {}
