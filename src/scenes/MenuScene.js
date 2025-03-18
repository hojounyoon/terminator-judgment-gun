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

        const leftArrow = this.add.text(120, 395, 'Left arrow (<): Move Left', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const rightArrow = this.add.text(130, 420, 'Right arrow (>): Move Right', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const downArrow = this.add.text(105, 445, 'Down arrow (v): Duck', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const space = this.add.text(65, 470, 'Space: Fire', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const yourhealth = this.add.text(600, 395, 'Player health: 9', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const T800health = this.add.text(598, 420, 'T-800 health: 3', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const T1000health = this.add.text(603, 445, 'T-1000 health: 5', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const corehealth = this.add.text(600, 470, 'Core health: 10', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const instruction = this.add.text(340, 520, "Instructions: Follow the path and fight the robots. Find Skynet's core and destroy\nit to win the game!", {
            fontSize: '18px',
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