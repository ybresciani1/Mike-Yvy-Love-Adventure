import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class ClubScene extends Phaser.Scene { 
    constructor() { super('ClubScene'); 
        this.isInteracting = false; 
    } 
    create() { 
        this.cameras.main.setBackgroundColor('#111111'); 
        this.cameras.main.setRotation(0); 
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) {
            this.add.image(x*32+16, y*32+16, 'floor_tile').setTint(0x333333);
        }
        this.danceFloor = this.add.rectangle(350, 350, 400, 300, 0x000000).setStrokeStyle(4, 0xff00ff);
        this.clubLights = [];
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0x00ffff];
        for(let i=0; i<6; i++) {
            let light = this.add.circle(150 + i*100, 100, 20, colors[i%colors.length]);
            light.setBlendMode(Phaser.BlendModes.ADD);
            this.tweens.add({ targets: light, scale: 3, alpha: 0.2, duration: 400 + Math.random()*400, yoyo: true, repeat: -1 });
            this.clubLights.push(light);
        }
        this.clubBar = this.add.rectangle(700, 300, 80, 400, 0x222222); 
        this.physics.add.existing(this.clubBar, true); 
        this.add.rectangle(670, 300, 20, 400, 0x444444); 
        for(let i=0; i<6; i++) {
            this.add.circle(630, 150 + i*60, 12, 0x880000).setStrokeStyle(2, 0xffaa00);
        }
        this.add.text(660, 80, "BAR", { fontSize: '20px', color: '#00ffff', fontStyle: 'bold', shadow: { color: '#000', blur: 4, fill: true } }); 
        this.add.sprite(740, 200, 'server'); 
        this.add.sprite(740, 400, 'server'); 
        this.yvy = this.physics.add.sprite(300, 350, 'yvy'); 
        this.marines = this.add.group(); 
        this.civilians = this.add.group(); 
        this.player = new Player(this, 100, 300); 
        this.heldDrink = this.add.sprite(0,0,'cocktail').setScale(0.7).setVisible(false);
        this.yvyDrink = this.add.sprite(0,0,'cocktail').setScale(0.7).setVisible(false); 
        for(let i=0; i<3; i++) { 
            let m = this.physics.add.sprite(200 + i*50, 400, 'marine'); this.marines.add(m); 
            let c = this.physics.add.sprite(220 + i*50, 420, 'civilian'); this.civilians.add(c); 
        } 
        this.cursors = this.input.keyboard.createCursorKeys(); 
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F); 
        this.instructionText = this.add.text(20, 20, "Hold F to Dance", { fontSize: '16px', color: '#fff' }); 
        this.time.addEvent({ delay: 450, loop: true, callback: () => { 
            playSound('club_beat'); 
            this.danceFloor.setFillStyle(Phaser.Display.Color.RandomRGB(10, 80).color);
            [this.yvy, ...this.marines.getChildren(), ...this.civilians.getChildren()].forEach(spr => { 
                spr.y += (Math.random() > 0.5 ? -4 : 4); 
                if(Math.random() > 0.8) spr.x += (Math.random() > 0.5 ? -10 : 10); 
            }); 
        }}); 
        this.physics.add.overlap(this.player, this.yvy, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.handleYvyInteraction(); }); 
        this.physics.add.overlap(this.player, this.clubBar, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.handleBarInteraction(); }); 
        this.physics.add.overlap(this.player, this.marines, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) showDialogue("Marine: 'Woo! Dance with us Mike!'"); }); 
    } 
    update() { 
        this.player.update(this.cursors); 
        if (this.heldDrink.visible) { this.heldDrink.x = this.player.x+10; this.heldDrink.y = this.player.y; }
        if (this.yvyDrink.visible) { this.yvyDrink.x = this.yvy.x+10; this.yvyDrink.y = this.yvy.y; }
        if (this.fKey.isDown && !this.player.isLocked) { 
            this.player.setTint(Math.random() * 0xffffff); 
            this.player.y += (Math.random() - 0.5) * 5; 
            if (gameState.clubProgress === 0) gameState.clubProgress = 1; 
            if (gameState.clubProgress === 3 && !this.danceTimer3) { 
                this.danceTimer3 = this.time.delayedCall(2000, () => { 
                    this.player.isLocked = true; 
                    showDialogue("Mike: 'I'm getting hungry...'", () => { 
                        showDialogue("Yvy: 'Me too. Let's go get pizza.'", () => { 
                            showDialogue("Mike: 'You know what?! We should get matching *hic* Eevee tattoos!'", () => {
                                showDialogue("Yvy: 'HMMM, maybe after getting food *giggles*'", () => {
                                    this.scene.start('PizzaScene'); 
                                });
                            });
                        }); 
                    }); 
                }); 
            } 
        } else { this.player.clearTint(); } 
        if (gameState.clubProgress === 1) this.instructionText.setText("Talk to the girl (Space)"); 
        else if (gameState.clubProgress === 2) this.instructionText.setText("Go to the Bar (Space)"); 
        else if (gameState.clubProgress === 3) this.instructionText.setText("Dance again (Hold F)"); 
        if (gameState.clubProgress >= 2) { 
            const dist = Phaser.Math.Distance.Between(this.yvy.x, this.yvy.y, this.player.x, this.player.y); 
            if (dist > 60) this.physics.moveToObject(this.yvy, this.player, 120); 
            else this.yvy.body.stop(); 
        } 
        const touching = this.physics.overlap(this.player, [this.yvy, this.clubBar]) || this.physics.overlap(this.player, this.marines); 
        document.getElementById('interaction-hint').style.display = touching ? 'block' : 'none'; 
    } 
    handleYvyInteraction() { 
        if (this.isInteracting) return;
        if (gameState.clubProgress < 1) { showDialogue("Dance first!"); return; } 
        if (gameState.clubProgress === 1) { 
            this.isInteracting = true;
            showDialogue("Mike: 'Hi! You have great energy.'", () => { 
                showDialogue("Yvy: 'Thanks! I'm Yvy.'", () => { 
                    showDialogue("Mike: 'Yvy? That sounds like Eevee... That's my favorite Pokemon!'", () => { 
                        this.player.isLocked = true; 
                        this.instructionText.setText("Dancing..."); 
                        this.time.addEvent({ delay: 100, repeat: 20, callback: () => { this.player.y += (Math.random()-0.5)*8; this.yvy.y += (Math.random()-0.5)*8; } }); 
                        this.time.delayedCall(2500, () => { 
                            this.player.isLocked = false; 
                            showDialogue("Yvy: 'Haha yes! I actually cosplay too.'", () => { 
                                showDialogue("Mike: 'Really? Me too. Let me see photos.'", () => { 
                                    showDialogue("Mike: 'NO WAY! Is that a T-Rex??'", () => { 
                                        showDialogue("Yvy: 'Yes! You have one too?'", () => { 
                                            showDialogue("Mike: 'I DO! Destiny! Drinks on me.'", () => { 
                                                gameState.clubProgress = 2; 
                                                this.isInteracting = false; 
                                            }); 
                                        }); 
                                    }); 
                                }); 
                            }); 
                        }); 
                    }); 
                }); 
            }); 
        } 
    } 
    handleBarInteraction() { 
        if (gameState.clubProgress === 2) { 
            playSound('clink'); 
            this.heldDrink.setVisible(true); 
            showDialogue("Mike ordered a mixed drink for Yvy.", () => { 
                this.heldDrink.setVisible(false); 
                this.yvyDrink.setVisible(true); 
                gameState.clubProgress = 3; 
            }); 
        } 
    } 
}
