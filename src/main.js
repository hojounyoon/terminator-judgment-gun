const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene]
};

// Initialize the game with our configuration
const game = new Phaser.Game(config);

function preload() {
    // Assets will be loaded here
    this.load.image('background', 'assets/Dystopian1.png')
    this.load.spritesheet('player', 'assets/pixil-gif-drawing.gif', {
        frameWidth: 32,
        frameWidth: 48
    })
}

function create() {
    // Game objects will be created here
    this.add.image(400, 300, 'background')
    player = this.physics.add.sprite(100, 450, 'player')

    player.setBounce(0.2)
    player.setCollideWorldBounds(true)

    this.anims.create({
        key: 'stand',
        frames: [{key: 'player', frame: 0}],
        frameRate: 10
    })

    this.anims.duck({
        key: 'duck',
        frames: [{key: 'player', frame: 1}],
        frameRate: 10
    })

    cursors = this.input.keyboard.createCursorKeys()
}

function update() {
    // Game logic will run here
    if (cursors.left.isDown) {
        player.setVelocityX(-160)
    } else if (cursors.right.isDown) {
        player.setVelocityX(160)
    } else {
        player.setVelocityX(0)
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330)
    }

    if (cursors.down.isDown) {
        player.anims.play('duck', true)
    } else {
        player.anims.play('stand', true)
    }
}
