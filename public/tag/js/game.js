const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#959cf8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 2 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

const playJumpSound = () => zzfx(...[,,150,.05,.01,.03,1,1.5,41,-14,,,,,,,,.66,.05]);
const playTagSound = () => zzfx(...[,,400,.1,.1,.2,2,1.5,1,-20,,,,,,,,.7,.1]);
const playTeleportSound = () => zzfx(...[,,600,.1,.3,.5,1,2,5,-10,,,,,,,,.5,.1]);
const playBounceSound = () => zzfx(...[,,200,.05,.05,.1,1,1,20,-10,,,,,,,,.6,.05]);

function preload() {
    let g = this.make.graphics({x: 0, y: 0, add: false});

    const colors = ['Red', 'Blue', 'Green', 'Yellow'];
    const hexColors = [0xff0000, 0x0066ff, 0x00ff00, 0xffff00];

    for (let i=0; i<4; i++) {
        g.clear();
        g.fillStyle(0x1a1a1a, 1);
        g.fillRoundedRect(0, 0, 32, 32, 4);
        g.fillStyle(hexColors[i], 1);
        g.fillRect(0, 8, 32, 8);
        g.fillStyle(0xffffff, 1);
        g.fillRect(6, 10, 6, 6);
        g.fillRect(20, 10, 6, 6);
        g.fillStyle(0x000000, 1);
        g.fillRect(8, 12, 2, 2);
        g.fillRect(22, 12, 2, 2);
        g.generateTexture('player' + i, 32, 32);
    }

    g.clear();
    g.fillStyle(0xcce6ff, 1);
    g.fillRect(0, 0, 128, 32);
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 128, 8);
    g.generateTexture('platform', 128, 32);

    g.clear();
    g.fillStyle(0xffd700, 1);
    g.beginPath();
    for (let i = 0; i < 5; i++) {
        g.lineTo(16 + 16 * Math.cos(18 + i * 72 * Math.PI / 180), 16 - 16 * Math.sin(18 + i * 72 * Math.PI / 180));
        g.lineTo(16 + 8 * Math.cos(54 + i * 72 * Math.PI / 180), 16 - 8 * Math.sin(54 + i * 72 * Math.PI / 180));
    }
    g.closePath();
    g.fillPath();
    g.generateTexture('star', 32, 32);

    g.clear();
    g.fillStyle(0xff00ff, 1);
    g.fillRect(0, 16, 32, 16);
    g.fillStyle(0x00ffff, 1);
    g.fillRect(4, 12, 24, 4);
    g.generateTexture('jump_pad', 32, 32);

    g.clear();
    g.fillStyle(0xffcc00, 1);
    g.beginPath();
    g.moveTo(0, 16);
    g.lineTo(8, 0);
    g.lineTo(16, 8);
    g.lineTo(24, 0);
    g.lineTo(32, 16);
    g.closePath();
    g.fillPath();
    g.generateTexture('crown', 32, 16);
}

const mapData = [
    {x: 600, y: 780, w: 1200, h: 40, a: 0},
    {x: 200, y: 600, w: 400, h: 32, a: 0},
    {x: 1000, y: 600, w: 400, h: 32, a: 0},
    {x: 600, y: 450, w: 300, h: 32, a: 0},
    {x: 300, y: 300, w: 300, h: 32, a: 0.2},
    {x: 900, y: 300, w: 300, h: 32, a: -0.2},
    {x: 600, y: 150, w: 400, h: 32, a: 0},
    {x: -10, y: 400, w: 40, h: 800, a: 0},
    {x: 1210, y: 400, w: 40, h: 800, a: 0},
    {x: 600, y: -400, w: 1200, h: 40, a: 0}
];

const jumpPadsData = [
    {x: 100, y: 740},
    {x: 1100, y: 740},
    {x: 600, y: 410}
];

const teleporterData = [
    {x: 50, y: 550},
    {x: 1150, y: 550},
    {x: 600, y: 100},
    {x: 600, y: 720}
];

function create() {
    this.players = [];
    this.jumpPads = [];
    this.teleporters = [];

    // Tag Game State
    this.itIndex = Math.floor(Math.random() * 4); // Random starting "It"
    this.lastTagTime = 0;
    this.gameTimer = 120; // 2 minutes
    this.timerText = this.add.text(600, 50, this.gameTimer, {
        fontFamily: 'Arial', fontSize: '64px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0); // Fixed to UI
    this.timerText.setDepth(100);

    // Countdown Timer Event
    this.time.addEvent({
        delay: 1000,
        callback: () => {
            if (this.gameTimer > 0) {
                this.gameTimer--;
                this.timerText.setText(this.gameTimer);
            } else {
                this.scene.pause();
                let winnerText = this.add.text(600, 400, `Player ${this.itIndex + 1} loses!`, {
                    fontFamily: 'Arial', fontSize: '80px', color: '#ff0000', fontStyle: 'bold', stroke: '#000', strokeThickness: 8
                }).setOrigin(0.5).setScrollFactor(0);
                winnerText.setDepth(101);
            }
        },
        loop: true
    });

    const defaultCat = 1;
    const playerCat = 2;
    const sensorCat = 4;

    mapData.forEach(p => {
        let rect = this.matter.add.rectangle(p.x, p.y, p.w, p.h, {
            isStatic: true, angle: p.a, friction: 0.0, collisionFilter: { category: defaultCat }
        });
        let sprite = this.add.tileSprite(p.x, p.y, p.w, p.h, 'platform');
        sprite.setRotation(p.a);
    });

    jumpPadsData.forEach(p => {
        let pad = this.matter.add.sprite(p.x, p.y, 'jump_pad');
        pad.setStatic(true);
        pad.isJumpPad = true;
        this.jumpPads.push(pad);
    });

    teleporterData.forEach((p, i) => {
        let t = this.matter.add.sprite(p.x, p.y, 'star');
        t.setStatic(true);
        t.setSensor(true);
        t.teleportIndex = i;
        this.teleporters.push(t);

        this.tweens.add({
            targets: t,
            angle: 360,
            duration: 3000,
            repeat: -1
        });
    });

    const spawnPoints = [
        {x: 100, y: 700}, {x: 1100, y: 700},
        {x: 100, y: 500}, {x: 1100, y: 500}
    ];

    const controls = [
        { up: 'W', left: 'A', right: 'D', down: 'S' },
        { up: 'UP', left: 'LEFT', right: 'RIGHT', down: 'DOWN' },
        { up: 'I', left: 'J', right: 'L', down: 'K' },
        { up: 'T', left: 'F', right: 'H', down: 'G' }
    ];

    for(let i=0; i<4; i++) {
        let p = this.matter.add.sprite(spawnPoints[i].x, spawnPoints[i].y, 'player' + i);
        p.setRectangle(30, 30);
        p.setFixedRotation();
        p.setFriction(0.001);
        p.setBounce(0.0);
        p.playerIndex = i;
        p.canJump = true;
        p.lastTeleport = 0;
        p.setCollisionCategory(playerCat);
        p.setCollidesWith([defaultCat, playerCat, sensorCat]);

        let keys = this.input.keyboard.addKeys(controls[i]);
        this.players.push({ sprite: p, keys: keys, id: i });
    }

    // Crown for "It"
    this.crown = this.add.sprite(0, 0, 'crown');
    this.crown.setOrigin(0.5, 1);

    // Collision Logic (Jumping & Tagging)
    this.matter.world.on('collisionactive', (event) => {
        event.pairs.forEach((pair) => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            // Player vs Player collision (Tagging)
            if (bodyA.collisionFilter.category === playerCat && bodyB.collisionFilter.category === playerCat) {
                let p1 = this.players.find(p => p.sprite.body === bodyA);
                let p2 = this.players.find(p => p.sprite.body === bodyB);

                if (p1 && p2) {
                    let timeNow = this.time.now;
                    // Tag cooldown: 1.5 seconds
                    if (timeNow - this.lastTagTime > 1500) {
                        if (this.itIndex === p1.id) {
                            this.itIndex = p2.id;
                            this.lastTagTime = timeNow;
                            playTagSound();
                        } else if (this.itIndex === p2.id) {
                            this.itIndex = p1.id;
                            this.lastTagTime = timeNow;
                            playTagSound();
                        }
                    }
                }
            }

            this.players.forEach(p => {
                if (bodyA === p.sprite.body || bodyB === p.sprite.body) {
                    const otherBody = bodyA === p.sprite.body ? bodyB : bodyA;

                    if (otherBody.gameObject && otherBody.gameObject.isJumpPad) {
                        p.sprite.setVelocityY(-15);
                        playBounceSound();
                    } else if (!otherBody.isSensor) {
                        if (p.sprite.body.velocity.y > -0.1) {
                            p.canJump = true;
                        }
                    }
                }
            });
        });
    });

    this.matter.world.on('collisionstart', (event) => {
        event.pairs.forEach((pair) => {
            let bodyA = pair.bodyA;
            let bodyB = pair.bodyB;

            let playerBody = null;
            let sensorBody = null;

            if (bodyA.isSensor) { sensorBody = bodyA; playerBody = bodyB; }
            else if (bodyB.isSensor) { sensorBody = bodyB; playerBody = bodyA; }

            if (playerBody && sensorBody && sensorBody.gameObject && sensorBody.gameObject.teleportIndex !== undefined) {
                let pIndex = this.players.findIndex(p => p.sprite.body === playerBody);
                if (pIndex !== -1) {
                    let p = this.players[pIndex];
                    let tIndex = sensorBody.gameObject.teleportIndex;
                    let timeNow = this.time.now;

                    if (timeNow - p.sprite.lastTeleport > 1000) {
                        let targetIndex = (tIndex % 2 === 0) ? tIndex + 1 : tIndex - 1;
                        let targetT = this.teleporters[targetIndex];
                        p.sprite.setPosition(targetT.x, targetT.y);
                        p.sprite.lastTeleport = timeNow;
                        playTeleportSound();
                    }
                }
            }
        });
    });

    // Camera Setup
    this.cameras.main.setBounds(-200, -200, 1600, 1200);
}

function update() {
    const speed = 5;

    // Minimum X/Y bounds for dynamic camera
    let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;

    this.players.forEach(p => {
        let velX = 0;

        if (p.keys.left.isDown) velX = -speed;
        if (p.keys.right.isDown) velX = speed;

        // Slightly higher speed for "It"
        if (this.itIndex === p.id) {
            velX *= 1.1;
        }

        p.sprite.setVelocityX(velX);

        if (p.keys.up.isDown && p.canJump) {
            p.sprite.setVelocityY(-12); // Slightly higher jump
            p.canJump = false;
            playJumpSound();
        }

        // Fast fall
        if (p.keys.down.isDown) {
            p.sprite.setVelocityY(p.sprite.body.velocity.y + 1);
        }

        // Screen Wrap (X-axis)
        if (p.sprite.x < -20) p.sprite.x = 1220;
        if (p.sprite.x > 1220) p.sprite.x = -20;

        // Camera calculations
        if (p.sprite.x < minX) minX = p.sprite.x;
        if (p.sprite.x > maxX) maxX = p.sprite.x;
        if (p.sprite.y < minY) minY = p.sprite.y;
        if (p.sprite.y > maxY) maxY = p.sprite.y;
    });

    // Update Crown position
    let itPlayer = this.players[this.itIndex].sprite;
    this.crown.setPosition(itPlayer.x, itPlayer.y - 20);

    // Dynamic Camera Zoom and Pan
    let targetCenterX = (minX + maxX) / 2;
    let targetCenterY = (minY + maxY) / 2;
    let distX = Math.max(maxX - minX, 600); // Minimum view width
    let distY = Math.max(maxY - minY, 400); // Minimum view height

    let targetZoomX = 1200 / (distX + 200); // 200 padding
    let targetZoomY = 800 / (distY + 200);
    let targetZoom = Math.min(targetZoomX, targetZoomY);
    targetZoom = Phaser.Math.Clamp(targetZoom, 0.6, 1.2); // Cap zoom levels

    // Smooth camera lerp
    this.cameras.main.scrollX += ((targetCenterX - 600) - this.cameras.main.scrollX) * 0.1;
    this.cameras.main.scrollY += ((targetCenterY - 400) - this.cameras.main.scrollY) * 0.1;
    this.cameras.main.zoom += (targetZoom - this.cameras.main.zoom) * 0.05;
}
