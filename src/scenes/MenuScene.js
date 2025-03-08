class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('background', 'assets/Dystopian1.png');
    }

    create() {
        // Static background
        const background = this.add.image(400, 300, 'background');
        background.setScale(1.4);  // Keep fixed scale without animation

        const title = this.add.text(400, 200, 'Terminator: Judgement Gun', {
            fontSize: '40px',
            fill: '#ffff00',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        const startText = this.add.text(400, 300, 'Press Enter to Start', {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Make the text pulsate
        this.tweens.add({
            targets: startText,
            alpha: 0.5,
            yoyo: true,
            repeat: -1,
            duration: 800
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('GameScene');
        });
    }
} 