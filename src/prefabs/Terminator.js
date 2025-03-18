class Terminator {
    constructor(scene, x, y, leftBound, rightBound, type) {
        this.scene = scene;
        this.type = type; // 't800' or 't1000'
        this.sprite = scene.physics.add.sprite(x, y, type);
        this.sprite.setScale(2.0);
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.enable = true;
        this.sprite.setSize(40, 70);
        this.sprite.body.allowGravity = false;
        this.sprite.body.setImmovable(true);
        
        // Set patrol bounds
        this.leftBound = leftBound;
        this.rightBound = rightBound;
        
        // Set initial direction and speed based on type
        this.direction = 1;
        this.patrolSpeed = type === 't1000' ? 1200 : 100;
        this.sprite.setVelocityX(this.patrolSpeed);
        
        // Store reference to this instance in the sprite
        this.sprite[type + 'Instance'] = this;
        
        // Set initial health based on type
        this.sprite.health = type === 't1000' ? 5 : 3;
        
        // Set shooting properties (only for T-800)
        if (type === 't800') {
            this.canShoot = true;
            this.shootTimer = 0;
            this.shootDelay = 120;  // Frames between shots
            this.shootDistance = 500;  // Distance at which T800 can shoot
            this.minShootDistance = 100;  // Minimum distance to shoot
        }
    }

    update(playerX, playerY) {
        if (!this.sprite || !this.sprite.active) return;

        // Update patrol movement
        if (this.sprite.x >= this.rightBound) {
            this.direction = -1;
            this.sprite.flipX = false;
        } else if (this.sprite.x <= this.leftBound) {
            this.direction = 1;
            this.sprite.flipX = true;
        }
        
        // Set patrol velocity
        this.sprite.setVelocityX(this.patrolSpeed * this.direction);

        // Handle shooting (only for T-800)
        if (this.type === 't800' && this.canShoot) {
            const distance = Math.abs(playerX - this.sprite.x);
            if (distance <= this.shootDistance && distance >= this.minShootDistance) {
                // Determine if player is to the left or right and set facing direction
                if (playerX < this.sprite.x) {
                    this.sprite.flipX = false;
                } else {
                    this.sprite.flipX = true;
                }
                
                // Shoot at player
                this.scene.enemyShoot(this.sprite);
                this.canShoot = false;
                this.shootTimer = 0;
            }
        } else if (this.type === 't800') {
            this.shootTimer++;
            if (this.shootTimer >= this.shootDelay) {
                this.canShoot = true;
            }
        }
    }

    getSprite() {
        return this.sprite;
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
} 