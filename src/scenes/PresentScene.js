import Phaser from 'phaser';
import { playBlueTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';

export class PresentScene extends Phaser.Scene {
    constructor() { super('PresentScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#ff9a9e');
        
        // --- SWITCHED TO BLUE THEME BY YUNG KAI ---
        playBlueTheme(); 

        this.add.rectangle(400, 150, 800, 300, 0xfecfef);
        this.add.circle(400, 300, 80, 0xffd700).setAlpha(0.8);
        this.add.rectangle(400, 450, 800, 300, 0x89c2d9);
        this.add.rectangle(400, 450, 800, 10, 0xffffff).setAlpha(0.3);
        this.add.rectangle(400, 550, 800, 100, 0x5d4037);
        for(let i=0; i<800; i+=40) this.add.rectangle(i+20, 500, 10, 50, 0x3e2723);
        this.add.rectangle(400, 480, 800, 10, 0x3e2723);
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(350, 520, outfit);
        this.yvy = this.add.sprite(450, 520, 'yvy');
        this.aiden = this.add.sprite(400, 535, 'aiden_older'); 
        this.add.text(400, 50, "Present Day", { fontSize: '28px', color: '#fff', fontStyle: 'bold', backgroundColor: '#000' }).setOrigin(0.5);
        this.time.addEvent({
            delay: 600, loop: true,
            callback: () => {
                let h = this.add.text(400 + (Math.random()-0.5)*100, 500, "❤️", { fontSize: '20px' });
                this.tweens.add({ targets: h, y: 300, alpha: 0, duration: 2000, onComplete: () => h.destroy() });
            }
        });
        this.time.delayedCall(1500, () => {
            showDialogue("Mike: 'Every day with you feels like a dream.'", () => {
                showDialogue("Yvy: 'I love you more today than I did yesterday.'", () => {
                    showDialogue("Mike: 'And I'll love you even more tomorrow.'", () => {
                        showDialogue("They stand together, looking out at the sunset, hand in hand.", () => {
                            showDialogue("Their story continues, building a life full of love, laughter, and endless adventure.", () => {
                                showDialogue("❤️ THE END ❤️", () => {});
                            });
                        });
                    });
                });
            });
        });
    }
}
