class T800 {
    constructor(scene, x, y, leftBound, rightBound) {
        this.scene = scene;
        this.enemy = scene.physics.add.sprite(x, y, 't800');
        
        
        // Setup T-800
        this.enemy.setScale(2.0);
        this.enemy.setBounce(0.2);
        this.enemy.setCollideWorldBounds(true);
        this.enemy.body.enable = true;
        this.enemy.setSize(40, 70);
        
        // Link this T800 instance to its sprite (needed for hit detection)
        this.enemy.t800Instance = this;
        
        // Custom properties
        this.leftBound = leftBound;
        this.rightBound = rightBound;
        this.direction = 1;
        this.lastShot = 0;
        this.patrolSpeed = 100;
        this.health = 3;  // Each T-800 starts with 3 health
        
        // Set initial movement
        this.enemy.setVelocityX(this.patrolSpeed);
    }

    update(playerX, playerY) {
        this.handlePatrol();
        this.handleShooting(playerX, playerY);
    }

    handlePatrol() {
        // Patrol logic
        if (this.enemy.x >= this.rightBound) {
            this.direction = -1;
            this.enemy.flipX = false;
        } else if (this.enemy.x <= this.leftBound) {
            this.direction = 1;
            this.enemy.flipX = true;
        }
        
        // Set patrol velocity
        this.enemy.setVelocityX(this.patrolSpeed * this.direction);
    }

    handleShooting(playerX, playerY) {
        // Check if player is in sight (within 300 pixels and same approximate y-level)
        const distanceToPlayer = Math.abs(playerX - this.enemy.x);
        const sameLevel = Math.abs(playerY - this.enemy.y) < 100;
        
        if (distanceToPlayer < 300 && sameLevel) {
            // Shoot at player if enough time has passed (every 2 seconds)
            const currentTime = this.scene.time.now;
            if (currentTime - this.lastShot > 2000) {
                this.shoot();
                this.lastShot = currentTime;
            }
        }
    }

    shoot() {
        const offsetX = this.enemy.flipX ? 65 : -65;
        const offsetY = -20;  // Higher firing position
        
        const blast = this.scene.enemyBlasts.create(
            this.enemy.x + offsetX,
            this.enemy.y + offsetY,
            'enemyBlast'
        );
        
        blast.setScale(1.5);
        
        const direction = this.enemy.flipX ? 1 : -1;
        blast.setVelocityX(300 * direction);
        
        // Make blast disappear when it goes off screen
        blast.checkWorldBounds = true;
        blast.outOfBoundsKill = true;
    }

    takeDamage() {
        this.health--;
        
        // Flash effect when hit
        this.scene.tweens.add({
            targets: this.enemy,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
     
     
                this.enemy.alpha = 1;
            }
        });
        
        // Return true if T-800 should be destroyed (health <= 0)
        return this.health <= 0;
    }

    getSprite() {
        return this.enemy;
    }

    destroy() {
        // Clean up the sprite when destroyed
        if (this.enemy) {
            this.enemy.destroy();
        }
    }
} 