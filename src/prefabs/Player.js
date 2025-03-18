class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.player = scene.physics.add.sprite(x, y, 'stand');
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Player properties
        this.groundLevel = 525;      // Base ground level
        
        // Setup player physics
        this.player.setScale(1.5);
        this.player.setBounce(0.1);  // Reduced bounce for better control
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(800);  // Enable gravity
        this.player.body.setDrag(1000);     // Add drag for better control
        this.player.body.setMaxVelocity(500, 700);  // Limit max speeds
        
        // Create blasts group
        this.blasts = scene.physics.add.group({
            allowGravity: false,
            immovable: false,
            collideWorldBounds: true
        });
    }

    update() {
        this.handleMovement();
        this.handleDuck();
        this.handleShooting();
    }

    handleMovement() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.flipX = false;
            this.player.setTexture('stand');
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.flipX = true;
            this.player.setTexture('stand');
        } else {
            this.player.setVelocityX(0);
            if (!this.cursors.down.isDown) {
                this.player.setTexture('stand');
            }
        }
    }

    handleDuck() {
        if (this.cursors.down.isDown) {
            this.player.setTexture('duck');
            // Make hitbox extremely small when ducking
            this.player.body.setSize(40, 10);  // Even smaller hitbox (was 50, 25)
            // Move hitbox to bottom of sprite
            this.player.body.setOffset(15, 60);  // Increased Y offset to move hitbox lower
        } else {
            this.player.setTexture('stand');
            // Return to normal hitbox size when standing
            this.player.body.setSize(70, 70);
            // Reset the offset
            this.player.body.setOffset(0, 0);
        }
    }

    handleShooting() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            const offsetX = this.player.flipX ? 65 : -65;
            const offsetY = -2;
            
            const blast = this.blasts.create(
                this.player.x + offsetX,
                this.player.y + offsetY,
                'blast'
            );
            
            blast.setScale(1.5);
            blast.setSize(30, 10);
            blast.body.enable = true;
            
            const direction = this.player.flipX ? 1 : -1;
            blast.setVelocityX(600 * direction);
            
            // Make blast disappear when it hits world bounds
            blast.setCollideWorldBounds(true);
            blast.body.onWorldBounds = true;
            
            // Listen for worldbounds collision and destroy the blast
            this.scene.physics.world.on('worldbounds', (body) => {
                if (body.gameObject === blast) {
                    blast.destroy();
                }
            });
        }
    }

    setPosition(x, y) {
        this.player.setPosition(x, y);
        // Update ground level if y position changes
        this.groundLevel = y;
    }

    getPosition() {
        return {
            x: this.player.x,
            y: this.player.y
        };
    }

    getBlasts() {
        return this.blasts;
    }

    getSprite() {
        return this.player;

    }
} 