class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.jumpTimer = 0;
        this.isJumping = false;
        this.currentBackground = 1;  // Track which background we're on
        this.playerLives = 9;  // Initialize player lives
        this.t800s = [];  // Add array to store T800 instances
        this.t1000s = [];
    }

    preload() {
        this.load.image('background1', 'assets/Dystopian1.png');
        this.load.image('background2', 'assets/Dystopian2.png');
        this.load.image('background3', 'assets/Final Battle.png');
        this.load.image('stand', 'assets/stand.png');
        this.load.image('duck', 'assets/duck.png');
        this.load.image('blast', 'assets/Blast.png');
        this.load.image('t800', 'assets/T-800.png');
        this.load.image('enemyBlast', 'assets/Blast.png');
        this.load.image('skynet-core', 'assets/Skynet.png');
        this.load.image('t1000', 'assets/T-1000.png');  
        this.load.audio('laser', 'assets/laser.mp3');
        this.load.audio('explosion', 'assets/explosion.mp3');
        this.load.audio('background-music', 'assets/The Terminator.mp3');
        this.load.audio('hurt', 'assets/classic_hurt.mp3');
    }

    create() {
        // Background zoomed to bottom right
        this.background = this.add.image(0, 0, 'background1');
        this.background.setScale(2.0);
        this.background.setOrigin(0, 0);
        this.background.setPosition(-400, -100);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.backgroundMusic = this.sound.add('background-music', { loop: true })
        this.backgroundMusic.play()

        // Set up the firing logic
        this.spaceKey.on('down', () => {
            this.fireLaser(); // Call the fireLaser method to handle the blast
        });

        // Set world bounds to match just the visible background size
        this.physics.world.setBounds(-400, -100, this.background.width * 2, this.background.height * 2);

        // Create player controller with lower ground level
        const startX = 800;
        const groundLevel = 525;  // Lower ground level (was 525)
        this.playerController = new Player(this, startX, groundLevel);
        
        // Get player sprite for camera following
        const player = this.playerController.getSprite();
        this.cameras.main.startFollow(player);
        this.cameras.main.setBounds(-400, -100, this.background.width * 2, this.background.height * 2);
        this.cameras.main.setLerp(0.1, 0.1);
        this.cameras.main.setZoom(1.5);
        this.cameras.main.centerOn(startX, groundLevel);

        // Create a group for blasts with physics enabled
        this.blasts = this.physics.add.group({
            allowGravity: false,
            immovable: false,
            collideWorldBounds: true
        });

        // Add space key for shooting
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Create enemy blasts group with physics enabled
        this.enemyBlasts = this.physics.add.group({
            allowGravity: false,
            immovable: false,
            collideWorldBounds: true
        });

        // Create T-800s group with physics enabled
        this.enemies = this.physics.add.group({
            immovable: false,
            collideWorldBounds: true
        });
        
        // Add 3 T-800s spread across the first background at player's ground level
        const t800Height = 525;  // Same as player's ground level
        this.createT800(200, t800Height, 100, 300);          // First T-800
        this.createT800(-100, t800Height, -200, 0);          // Second T-800
        this.createT800(-300, t800Height, -400, -200);       // Third T-800

        // Create health text display in top left corner
        this.healthText = this.add.text(150, 110, `Health: 9`, {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            fill: '#FFD700',  // Yellow color
            stroke: '#000000',  // Black outline
            strokeThickness: 4
        })
        .setScrollFactor(0)  // Make it stay on screen
        .setDepth(100);     // Make sure it's always on top

        // Create game over text (hidden initially) with smaller size
        this.gameOverText = this.add.text(400, 300, 'GAME OVER!', {
            fontSize: '48px',  // Reduced from 64px to 48px
            fontFamily: 'Arial Black',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4,  // Reduced from 6 to 4
            align: 'center'
        })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setDepth(100)
        .setVisible(false);

        // Update collision setup
        const playerBlasts = this.playerController.getBlasts();
        this.physics.add.collider(playerBlasts, this.enemies, this.handleEnemyHit, null, this);
        this.physics.add.collider(this.playerController.getSprite(), this.enemyBlasts, this.handlePlayerHit, null, this);
        this.physics.add.collider(playerBlasts, this.enemies, (blast, enemy) => {
            console.log('Blast hit enemy!', blast, enemy);
            this.handleEnemyHit(blast, enemy);
        });
    }

    fireLaser() {
        // Play laser sound effect
        this.sound.play('laser');
    }

    createT800(x, y, leftBound, rightBound) {
        const t800 = new T800(this, x, y, leftBound, rightBound);
        const sprite = t800.getSprite();
        sprite.t800Instance = t800;  // Link the sprite to its T800 instance
        sprite.body.allowGravity = false;  // Keep T-800 at fixed height
        sprite.body.setImmovable(true);    // Prevent movement up/down
        this.enemies.add(sprite);
        this.t800s.push(t800);
        return t800;
    }

    handleEnemyHit(blast, enemy) {
        this.sound.play('explosion');
        // Remove the blast
        blast.destroy();

        // Find the T800 instance that owns this sprite
        const t800 = enemy.t800Instance;
        if (t800) {
            // Use the T800's takeDamage method
            const isDead = t800.takeDamage();
            if (isDead) {
                // Remove from t800s array
                this.t800s = this.t800s.filter(t => t !== t800);
                // Destroy the enemy
                t800.destroy();
            }
        }
    }

    handlePlayerHit(player, blast) {
        this.sound.play('hurt');
        // Remove the blast
        blast.destroy();

        // Reduce player lives
        this.playerLives--;
        
        // Update health text to show "Health: " prefix
        this.healthText.setText(`Health: ${this.playerLives}`);

        // Flash effect when hit
        this.tweens.add({
            targets: player,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                player.alpha = 1;
                // Check for game over
                if (this.playerLives <= 0) {
                    this.gameOver();
                }
            }
        });
    }

    gameOver() {
        // Stop all movement and physics
        this.physics.pause();
        
        // Hide health text
        this.healthText.setVisible(false);
        
        // Reset camera zoom and position for game over screen
        this.cameras.main.setZoom(1.0);
        this.cameras.main.centerOn(400, 300);
        
        // Show game over text
        this.gameOverText = this.add.text(400, 250, 'GAME OVER!', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'

        })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setDepth(101);  // Make sure it's on top of everything

        // Add flash effect to game over text
        this.tweens.add({
            targets: this.gameOverText,
            alpha: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Power2'
        });

        // Add text to show instructions
        this.returnText = this.add.text(400, 320, 'Press ENTER to return to menu', {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setDepth(101);

        // Add return to menu on enter key press
        this.input.keyboard.once('keydown-ENTER', () => {
            // Reset all game states
            this.playerLives = 9;
            this.currentBackground = 1;
            this.isJumping = false;
            this.jumpTimer = 0;
            
            // Clear all enemies and blasts
            this.enemies.clear(true, true);
            this.blasts.clear(true, true);
            this.enemyBlasts.clear(true, true);
            
            // Return to menu scene
            this.scene.start('MenuScene');
        });
    }

    update() {
        // Update player controller
        this.playerController.update();
        
        // First transition (left side of Dystopian1)
        if (this.currentBackground === 1 && this.playerController.getSprite().x <= -200) {
            this.transitionBackground('background2', -this.background.width + 400);
        }

        // Second transition (right side of Dystopian2)
        else if (this.currentBackground === 2 && this.playerController.getSprite().x >= 800) {  // Changed from 400 to 800
            this.transitionBackground('background3', 0);
        }

        // Only end game when player loses all lives
        if (this.playerLives <= 0) {
            this.gameOver();
            return;
        }

        // Continue with normal gameplay updates...
        // Update each T800
        this.t800s.forEach(t800 => {
            if (t800.getSprite().active) {  // Only update if the sprite is still active
                t800.update(this.playerController.getSprite().x, this.playerController.getSprite().y);
            }
        });

        // Update T-1000 patrol if it exists
        if (this.t1000 && this.t1000.active) {
            this.updateT1000Patrol();
        }
    }

    enemyShoot(enemy) {
        // Calculate blast starting position with offset like player's blast
        const offsetX = enemy.flipX ? 65 : -65;  // Same offset as player
        const offsetY = -2;  // Same vertical offset as player
        
        const blast = this.enemyBlasts.create(
            enemy.x + offsetX,
            enemy.y + offsetY,
            'enemyBlast'
        );
        
        blast.setScale(1.5);  // Same scale as player's blast
        
        // Set horizontal-only velocity like player's blast but slower
        const direction = enemy.flipX ? 1 : -1;
        blast.setVelocityX(300 * direction);  // Changed from 600 to 300 for slower movement
        
        blast.checkWorldBounds = true;
        blast.outOfBoundsKill = true;
    }

    transitionBackground(newBgKey, newPosition) {
        this.currentBackground++;
        
        // Store current health before transition
        const currentHealth = this.playerLives;
        
        // Store player's relative position before transition
        const playerRelativeX = this.playerController.getSprite().x;
        
        // Set ground level based on background
        const groundLevel = newBgKey === 'background2' ? 595 : 525;
        
        // Temporarily disable collisions during transition
        this.physics.world.colliders.destroy();
        
        this.tweens.add({
            targets: this.background,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.background.setTexture(newBgKey);
                
                if (newBgKey === 'background2') {
                    this.background.setPosition(newPosition, -100);
                    this.background.setScale(2.0);
                    this.physics.world.setBounds(newPosition, -100, this.background.width * 2, this.background.height * 2);
                    this.cameras.main.setBounds(newPosition, -100, this.background.width * 2, this.background.height * 2);
                    
                    // Use lower position for background2
                    this.playerController.setPosition(playerRelativeX, 540);


                }

                
                else if (newBgKey === 'background3') {
                    // Calculate scale to fit screen
                    const scaleX = this.cameras.main.width / this.background.width;
                    const scaleY = this.cameras.main.height / this.background.height;
                    const scale = Math.max(scaleX, scaleY);
                    
                    this.background.setScale(scale);
                    this.background.setPosition(0, 0);
                    
                    // Set bounds to match the scaled background
                    const finalWidth = this.background.width * scale;
                    const finalHeight = this.background.height * scale;
                    this.physics.world.setBounds(0, 0, finalWidth, finalHeight);
                    this.cameras.main.setBounds(0, 0, finalWidth, finalHeight);
                    
                    // Position player at the right side of final battle
                    this.playerController.setPosition(finalWidth - 100, 525);
                    
                    // Add Skynet core in final battle
                    this.skynetCore = this.physics.add.sprite(100, 500, 'skynet-core');
                    this.skynetCore.setScale(2.0);
                    this.skynetCore.health = 20;
                    this.skynetCore.setImmovable(true);
                    this.skynetCore.body.allowGravity = false;
                    this.skynetCore.body.moves = false;
                    
                    // Add collision with player's blasts
                    const playerBlasts = this.playerController.getBlasts();
                    this.physics.add.collider(playerBlasts, this.skynetCore, this.handleCoreHit, null, this);

                    // Add T-1000 near Skynet core
                    this.t1000 = this.physics.add.sprite(250, 525, 't1000');
                    this.t1000.setScale(2.0);
                    this.t1000.setBounce(0.2);
                    this.t1000.setCollideWorldBounds(true);
                    this.t1000.body.enable = true;
                    this.t1000.setSize(40, 70);
                    this.t1000.body.allowGravity = false;
                    this.t1000.body.setImmovable(true);
                    this.t1000.health = 10;
                    this.t1000.direction = 1;
                    this.t1000.patrolSpeed = 500;
                    this.t1000.setVelocityX(this.t1000.patrolSpeed);
                    this.t1000.leftBound = 200;   // Add patrol bounds
                    this.t1000.rightBound = 600;  // Add patrol bounds
                    
                    // Add collision with player's blasts
                    this.physics.add.overlap(
                        playerBlasts,
                        this.t1000,
                        this.handleT1000Hit,
                        null,
                        this
                    );

                    // Add collision with player
                    this.physics.add.overlap(
                        this.playerController.getSprite(),
                        this.t1000,
                        this.handleT1000PlayerCollision,
                        null,
                        this
                    );
                }
                else {
                    this.background.setPosition(newPosition, -100);
                    this.background.setScale(2.0);
                    this.physics.world.setBounds(newPosition, -100, this.background.width * 2, this.background.height * 2);
                    this.cameras.main.setBounds(newPosition, -100, this.background.width * 2, this.background.height * 2);
                    
                    // Keep player at consistent ground level
                    this.playerController.setPosition(playerRelativeX, groundLevel);
                }
                
                // Restore player health to what it was before transition
                this.playerLives = currentHealth;
                this.healthText.setText(`Health: ${this.playerLives}`);
                
                // Re-enable collisions
                this.physics.add.collider(this.blasts, this.enemies, this.handleEnemyHit, null, this);
                this.physics.add.collider(this.playerController.getSprite(), this.enemyBlasts, this.handlePlayerHit, null, this);
                if (this.skynetCore) {
                    const playerBlasts = this.playerController.getBlasts();
                    this.physics.add.collider(playerBlasts, this.skynetCore, this.handleCoreHit, null, this);
                }
                
                this.cameras.main.setZoom(1.5);
                
                this.tweens.add({
                    targets: this.background,
                    alpha: 1,
                    duration: 500
                });
            }
        });
    }

    updateT1000Patrol() {
        // Patrol logic
        if (this.t1000.x >= this.t1000.rightBound) {
            this.t1000.direction = -1;
            this.t1000.flipX = false;
        } else if (this.t1000.x <= this.t1000.leftBound) {
            this.t1000.direction = 1;
            this.t1000.flipX = true;
        }
        
        // Set patrol velocity
        this.t1000.setVelocityX(this.t1000.patrolSpeed * this.t1000.direction);
    }

    handleT1000Hit(blast, t1000) {
        // Remove the blast
        this.sound.play('explosion');
        blast.destroy();
        
        // Reduce T-1000 health
        t1000.health--;
        
        // Flash effect when hit
        this.tweens.add({
            targets: t1000,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                t1000.alpha = 1;
            }
        });

        // Only destroy when health is exactly 0
        if (t1000.health === 0) {
            t1000.destroy();
        }
    }

    handleCoreHit(core, blast) {
        // Remove the blast
        this.sound.play('explosion');
        blast.destroy();

        // Reduce core health
        core.health--;

        // Flash effect when hit
        this.tweens.add({
            targets: core,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                core.alpha = 1;
                // If health depleted, destroy core and show victory
                if (core.health <= 0) {
                    core.destroy();
                    this.victory();
                }
            }
        });
    }

    victory() {
        // Stop all movement and physics
        this.physics.pause();
        
        // Hide health text
        this.healthText.setVisible(false);
        
        // Reset camera zoom and position for victory screen
        this.cameras.main.setZoom(1.0);
        this.cameras.main.centerOn(400, 300);
        
        // Show victory text
        this.victoryText = this.add.text(400, 250, 'Skynet has fallen!\nThe Resistance wins!', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setDepth(101);

        // Add flash effect to victory text
        this.tweens.add({
            targets: this.victoryText,
            alpha: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Power2'
        });

        // Add return to menu text
        this.returnText = this.add.text(400, 350, 'Press ENTER to return to menu', {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setDepth(101);

        // Add return to menu on enter key press
        this.input.keyboard.once('keydown-ENTER', () => {
            // Reset all game states
            this.playerLives = 9;
            this.currentBackground = 1;
            this.isJumping = false;
            this.jumpTimer = 0;
            
            // Clear all entities
            this.enemies.clear(true, true);
            this.blasts.clear(true, true);
            this.enemyBlasts.clear(true, true);
            if (this.skynetCore) this.skynetCore.destroy();
            
            // Return to menu scene
            this.scene.start('MenuScene');
        });
    }

    handleT1000PlayerCollision(player, t1000) {
        // Only handle collision if player is not invulnerable
        if (!player.isInvulnerable) {
            // Reduce player lives
            this.playerLives--;
            this.sound.play('hurt');
            
            // Update health text
            this.healthText.setText(`Health: ${this.playerLives}`);

            // Flash effect when hit
            this.tweens.add({
                targets: player,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 0,
                onComplete: () => {
                    player.alpha = 1;
                    // Check for game over
                    if (this.playerLives <= 0) {
                        this.gameOver();
                    }
                }
            });

            // Make player invulnerable for 1 second
            player.isInvulnerable = true;
            this.time.delayedCall(1000, () => {
                player.isInvulnerable = false;
            });
        }
    }
} 