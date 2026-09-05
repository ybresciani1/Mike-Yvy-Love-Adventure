import { COLORS } from '../constants.js';

export function generateTextures(scene) {
    const g = scene.make.graphics();

    // --- HIGH RES PIXEL ART CHARACTERS (Stardew Style) ---
    const drawPixel = (x, y, color) => {
        g.fillStyle(color, 1);
        g.fillRect(x, y, 1, 1); 
    };
    const fillRect = (x, y, w, h, color) => {
        g.fillStyle(color, 1);
        g.fillRect(x, y, w, h);
    };

    // --- DETAILED MIKE (Standard) ---
    g.clear();
    fillRect(10, 4, 12, 10, 0xffdbac); // Head base
    fillRect(12, 14, 8, 4, 0xffdbac); // Neck
    fillRect(8, 14, 4, 8, 0x3498db); // L Sleeve (Blue)
    fillRect(8, 22, 4, 2, 0xffdbac); // L Hand (Skin)
    fillRect(20, 14, 4, 8, 0x3498db); // R Sleeve (Blue)
    fillRect(20, 22, 4, 2, 0xffdbac); // R Hand (Skin)
    fillRect(9, 2, 14, 4, 0x4a3b2a); // Top
    fillRect(9, 2, 3, 10, 0x4a3b2a); // L side
    fillRect(20, 2, 3, 10, 0x4a3b2a); // R side
    drawPixel(12, 3, 0x6d4c41); // Highlight
    fillRect(11, 8, 2, 2, 0x000000); // L Eye
    fillRect(19, 8, 2, 2, 0x000000); // R Eye
    fillRect(10, 16, 12, 10, 0x3498db);
    fillRect(14, 16, 4, 4, 0x2980b9); // Collar/Detail
    fillRect(11, 24, 10, 6, 0x34495e);
    fillRect(11, 30, 4, 2, 0x34495e); // L Leg
    fillRect(17, 30, 4, 2, 0x34495e); // R Leg
    fillRect(10, 31, 5, 1, 0x111111);
    fillRect(17, 31, 5, 1, 0x111111);
    g.generateTexture('mike', 32, 32);

    // --- DETAILED MIKE (Suit) ---
    g.clear();
    fillRect(10, 4, 12, 10, 0xffdbac); // Skin
    fillRect(9, 2, 14, 4, 0x4a3b2a); // Hair Top
    fillRect(9, 2, 3, 10, 0x4a3b2a); // Hair Sides
    fillRect(20, 2, 3, 10, 0x4a3b2a); 
    fillRect(11, 8, 2, 2, 0x000000); // Eyes
    fillRect(19, 8, 2, 2, 0x000000);
    fillRect(9, 14, 14, 14, 0x2c3e50);
    fillRect(8, 14, 3, 10, 0x2c3e50); // Arms
    fillRect(21, 14, 3, 10, 0x2c3e50);
    fillRect(14, 14, 4, 10, 0xffffff);
    fillRect(15, 14, 2, 8, 0xe74c3c); 
    fillRect(11, 26, 4, 6, 0x2c3e50);
    fillRect(17, 26, 4, 6, 0x2c3e50);
    fillRect(10, 31, 5, 1, 0x000000);
    fillRect(17, 31, 5, 1, 0x000000);
    g.generateTexture('mike_suit', 32, 32);

    // --- DETAILED MIKE (Casual) ---
    g.clear();
    fillRect(10, 4, 12, 10, 0xffdbac); 
    fillRect(9, 2, 14, 4, 0x4a3b2a); 
    fillRect(9, 2, 3, 10, 0x4a3b2a);
    fillRect(20, 2, 3, 10, 0x4a3b2a);
    fillRect(11, 8, 2, 2, 0x000000); 
    fillRect(19, 8, 2, 2, 0x000000);
    fillRect(9, 14, 14, 12, 0x95a5a6);
    fillRect(8, 14, 3, 10, 0x95a5a6); // Arms
    fillRect(21, 14, 3, 10, 0x95a5a6);
    fillRect(11, 24, 4, 8, 0x1a237e);
    fillRect(17, 24, 4, 8, 0x1a237e);
    fillRect(10, 31, 5, 1, 0xffffff);
    fillRect(17, 31, 5, 1, 0xffffff);
    g.generateTexture('mike_casual', 32, 32);

    // --- DETAILED YVY (Stardew Style) ---
    g.clear();
    fillRect(11, 5, 10, 9, 0xffdbac); // Face
    fillRect(12, 14, 8, 3, 0xffdbac); // Neck/Chest
    fillRect(9, 15, 3, 10, 0xffdbac); // Arms (Bare)
    fillRect(20, 15, 3, 10, 0xffdbac);
    fillRect(9, 3, 14, 5, 0x5d4037); // Top
    fillRect(8, 5, 3, 18, 0x5d4037); // L Side Long
    fillRect(21, 5, 3, 18, 0x5d4037); // R Side Long
    fillRect(12, 9, 2, 2, 0x000000); // L Eye
    fillRect(18, 9, 2, 2, 0x000000); // R Eye
    fillRect(11, 11, 2, 1, 0xff9999); // Blush
    fillRect(19, 11, 2, 1, 0xff9999);
    fillRect(11, 16, 10, 10, 0xe91e63); // Bodice
    fillRect(10, 24, 12, 6, 0xe91e63); // Skirt flare
    fillRect(11, 28, 3, 4, 0x212121);
    fillRect(18, 28, 3, 4, 0x212121);
    g.generateTexture('yvy', 32, 32);

    // --- DETAILED AIDEN (Child) ---
    g.clear();
    fillRect(11, 10, 10, 8, 0xffdbac); // Head
    fillRect(10, 8, 12, 4, 0x2c3e50); // Hair (Short dark)
    fillRect(10, 10, 2, 4, 0x2c3e50); // Sideburns
    fillRect(20, 10, 2, 4, 0x2c3e50);
    fillRect(12, 13, 2, 2, 0x000000); // Eyes
    fillRect(18, 13, 2, 2, 0x000000);
    fillRect(11, 18, 10, 8, 0xffa500); 
    fillRect(9, 18, 3, 6, 0xffa500); // Arms
    fillRect(20, 18, 3, 6, 0xffa500);
    fillRect(11, 26, 3, 6, 0x1a237e);
    fillRect(18, 26, 3, 6, 0x1a237e);
    fillRect(11, 31, 3, 1, 0x111111);
    fillRect(18, 31, 3, 1, 0x111111);
    g.generateTexture('aiden', 32, 32);

    // --- DETAILED AIDEN (Older) ---
    g.clear();
    fillRect(11, 8, 10, 8, 0xffdbac); // Head
    fillRect(10, 6, 12, 4, 0x2c3e50); // Hair
    fillRect(10, 8, 2, 5, 0x2c3e50);
    fillRect(20, 8, 2, 5, 0x2c3e50);
    fillRect(12, 11, 2, 2, 0x000000);
    fillRect(18, 11, 2, 2, 0x000000);
    fillRect(10, 16, 12, 10, 0x2980b9);
    fillRect(9, 16, 3, 9, 0x2980b9);
    fillRect(20, 16, 3, 9, 0x2980b9);
    fillRect(11, 26, 4, 6, 0x34495e);
    fillRect(17, 26, 4, 6, 0x34495e);
    g.generateTexture('aiden_older', 32, 32);

    // --- DETAILED SCENERY TEXTURES ---
    g.clear();
    g.fillStyle(0x66bb6a, 1); g.fillRect(0,0,32,32);
    for(let i=0; i<8; i++) {
        let x = Math.floor(Math.random()*30);
        let y = Math.floor(Math.random()*30);
        g.fillStyle(0x388e3c, 1); g.fillRect(x,y,2,4);
        g.fillStyle(0x81c784, 1); g.fillRect(x+1,y+1,1,2);
    }
    g.generateTexture('grass_detailed', 32, 32);

    g.clear();
    g.fillStyle(0x8d6e63, 1); g.fillRect(0,0,32,32);
    g.fillStyle(0x6d4c41, 1); 
    g.fillRect(0,0,32,1); g.fillRect(0,31,32,1);
    for(let i=0; i<32; i+=4) { 
        if(Math.random()>0.5) g.fillRect(i, Math.random()*32, 2, 1);
    }
    g.fillStyle(0x4e342e, 1); 
    g.fillRect(2, 2, 2, 2); g.fillRect(2, 28, 2, 2);
    g.generateTexture('floor_wood_detailed', 32, 32);

    g.clear();
    g.fillStyle(0x66bb6a, 1); g.fillRect(0,0,32,32);
    g.fillStyle(0xffffff, 1);
    g.fillRect(6, 4, 6, 28); 
    g.fillRect(20, 4, 6, 28);
    g.beginPath(); g.moveTo(6,4); g.lineTo(9,0); g.lineTo(12,4); g.fill();
    g.beginPath(); g.moveTo(20,4); g.lineTo(23,0); g.lineTo(26,4); g.fill();
    g.fillStyle(0xeeeeee, 1);
    g.fillRect(0, 10, 32, 4);
    g.fillRect(0, 22, 32, 4);
    g.generateTexture('fence_detailed', 32, 32);

    g.clear();
    g.fillStyle(0x5d4037, 1); g.fillRect(0,0,32,32);
    g.fillStyle(0x3e2723, 1);
    g.fillRect(5,5,4,4); g.fillRect(20,15,4,4);
    g.generateTexture('dirt_patch', 32, 32);

    g.clear();
    g.fillStyle(0x2e7d32, 1);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x1b5e20, 1);
    g.fillCircle(10, 12, 6); g.fillCircle(22, 12, 6); g.fillCircle(16, 22, 6);
    g.generateTexture('bush_detailed', 32, 32);

    g.clear();
    g.fillStyle(0xffeb3b, 1); 
    g.fillCircle(16, 16, 4);
    g.fillStyle(0xff5722, 1); 
    g.fillCircle(16, 8, 4); g.fillCircle(24, 16, 4); g.fillCircle(16, 24, 4); g.fillCircle(8, 16, 4);
    g.generateTexture('flower_red', 32, 32);
    
    g.clear();
    g.fillStyle(0x8e0000, 1); g.fillRect(0,0,32,32);
    g.fillStyle(0x600000, 1); g.fillCircle(16, 16, 8);
    g.generateTexture('theater_carpet', 32, 32);

    g.clear();
    g.fillStyle(0xb71c1c, 1); 
    g.fillRect(4, 8, 24, 20); 
    g.fillStyle(0x7f0000, 1); 
    g.fillRect(4, 28, 24, 4); 
    g.fillStyle(0x3e2723, 1); 
    g.fillRect(0, 16, 4, 16);
    g.fillRect(28, 16, 4, 16);
    g.generateTexture('theater_seat', 32, 32);

    g.clear();
    g.fillStyle(0xb71c1c, 1); g.fillRect(0,0,32,32);
    g.fillStyle(0x880e4f, 1); g.fillRect(0,0,10,32); g.fillRect(22,0,10,32);
    g.generateTexture('theater_curtain', 32, 32);

    g.clear(); g.fillStyle(COLORS.marine, 1); g.fillRect(8, 8, 16, 24); g.fillStyle(0xffdbac, 1); g.fillRect(10, 4, 12, 10); g.fillStyle(0x1e3a1a, 1); g.fillRect(8, 2, 16, 4); g.generateTexture('marine', 32, 32);
    
    g.clear(); 
    g.fillStyle(0xffffff, 1); g.fillRect(8, 8, 16, 24); // Shirt
    g.fillStyle(0x333333, 1); g.fillRect(8, 12, 16, 16); // Apron
    g.fillStyle(0xffdbac, 1); g.fillRect(10, 4, 12, 10); // Head
    g.fillStyle(0x555555, 1); g.fillRect(10, 2, 12, 4); // Hat
    g.generateTexture('bartender', 32, 32);

    g.clear(); g.fillStyle(COLORS.tsa, 1); g.fillRect(8, 8, 16, 24); g.fillStyle(0xffdbac, 1); g.fillRect(10, 4, 12, 10); g.fillStyle(0x000000, 1); g.fillRect(10, 2, 12, 4); g.generateTexture('tsa', 32, 32);
    g.clear(); g.fillStyle(0x9c27b0, 1); g.fillRect(8, 8, 16, 24); g.fillStyle(0xffdbac, 1); g.fillRect(10, 4, 12, 10); g.generateTexture('civilian', 32, 32);
    g.clear(); g.fillStyle(0x000000, 1); g.fillRect(8, 8, 16, 24); g.fillStyle(0xffdbac, 1); g.fillRect(10, 4, 12, 10); g.generateTexture('host', 32, 32);
    g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(8, 8, 16, 24); g.fillStyle(0xffdbac, 1); g.fillRect(10, 4, 12, 10); g.fillStyle(0x333333, 1); g.fillRect(8,20,16,12); g.generateTexture('server', 32, 32);
    
    g.clear(); g.fillStyle(0x8e44ad, 1); g.fillRect(8, 8, 16, 24); g.fillStyle(0xffdbac, 1); g.fillRect(10, 4, 12, 10); g.fillStyle(0xff0000, 0.4); g.fillRect(10, 6, 12, 4);
    g.generateTexture('drunk', 32, 32);

    g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(8, 8, 16, 24); g.fillStyle(0xffdbac, 1); g.fillRect(10, 4, 12, 10); g.fillStyle(0xdddddd, 1); g.fillRect(8, 2, 16, 28); g.generateTexture('doctor', 32, 32);
    
    g.clear(); g.fillStyle(COLORS.floor, 1); g.fillRect(0, 0, 32, 32); g.fillStyle(0x795548, 0.5); g.fillRect(0,30,32,2); g.generateTexture('floor_wood', 32, 32);
    g.clear(); g.fillStyle(0xbdc3c7, 1); g.fillRect(0, 0, 32, 32); g.fillStyle(0xecf0f1, 0.3); g.fillRect(2,2,28,28); g.generateTexture('floor_tile', 32, 32);
    g.clear(); g.fillStyle(0x424242, 1); g.fillRect(0, 0, 32, 32); g.fillStyle(0x616161, 1); g.fillRect(2,2,28,28); g.generateTexture('pavement', 32, 32);
    g.clear(); g.fillStyle(0x2e7d32, 1); g.fillRect(0, 0, 32, 32); g.fillStyle(0x1b5e20, 0.5); g.fillRect(0,30,32,2); g.generateTexture('grass', 32, 32);
    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(4, 8, 24, 16); g.generateTexture('suitcase', 32, 32);
    g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(8, 10, 16, 12); g.fillStyle(0x000000, 1); g.fillRect(10, 12, 12, 2); g.generateTexture('ticket', 32, 32);
    g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(10, 10, 12, 18); g.fillStyle(COLORS.starbucks, 1); g.fillRect(10, 15, 12, 4); g.generateTexture('coffee', 32, 32);
    g.clear(); g.fillStyle(COLORS.beer, 1); g.fillRect(10, 10, 12, 16); g.fillStyle(0xffffff, 1); g.fillRect(10, 10, 12, 4); g.generateTexture('beer', 32, 32);
    g.clear(); g.fillStyle(COLORS.cocktail, 1); g.beginPath(); g.moveTo(10,10); g.lineTo(22,10); g.lineTo(16,20); g.closePath(); g.fill(); g.fillStyle(0xffffff, 1); g.fillRect(15,20,2,10); g.generateTexture('cocktail', 32, 32);
    g.clear(); g.fillStyle(COLORS.pizza_crust, 1); g.beginPath(); g.moveTo(16,32); g.lineTo(0,10); g.lineTo(32,10); g.closePath(); g.fill(); g.fillStyle(COLORS.pizza_sauce, 1); g.beginPath(); g.moveTo(16,28); g.lineTo(4,12); g.lineTo(28,12); g.closePath(); g.fill(); g.generateTexture('pizza_slice', 32, 32);
    g.clear(); g.fillStyle(COLORS.pizza_sauce, 1); g.fillCircle(16,16,16); g.fillStyle(COLORS.pizza_crust, 1); g.fillCircle(16,16,12); g.generateTexture('pizza_logo', 32, 32);
    g.clear(); g.fillStyle(COLORS.furniture, 1); g.fillRect(0,0,64,32); g.fillStyle(0x3e2723, 1); g.fillRect(5,5,54,10); g.generateTexture('dresser', 64, 32);
    g.clear(); g.fillStyle(0x8d6e63, 1); g.fillRect(0,0,64,32); g.fillStyle(0x5d4037, 1); g.fillRect(0,0,10,32); g.fillRect(54,0,10,32); g.fillRect(0,0,64,10); g.generateTexture('couch', 64, 32);
    g.clear(); g.fillStyle(0x1b5e20, 1); g.fillRect(0,0,64,32); g.fillStyle(0x0a3d0a, 1); g.fillRect(0,0,10,32); g.fillRect(54,0,10,32); g.fillRect(0,0,64,10); g.generateTexture('couch_green', 64, 32); 
    g.clear(); g.fillStyle(0x111111, 1); g.fillRect(0,0,64,40); g.fillStyle(0x444444, 1); g.fillRect(2,2,60,36); g.generateTexture('tv', 64, 40); 
    g.clear(); g.fillStyle(0x555555, 1); g.fillRect(14, 0, 4, 32); g.fillStyle(0xffff00, 0.8); g.fillCircle(16, 4, 6); g.generateTexture('streetlight', 32, 32);
    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(12, 16, 8, 16); g.fillStyle(COLORS.lamp_shade, 1); g.beginPath(); g.moveTo(6, 16); g.lineTo(26, 16); g.lineTo(22, 6); g.lineTo(10, 6); g.closePath(); g.fill(); g.generateTexture('lamp', 32, 32);
    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(0, 0, 32, 48); g.fillStyle(0xffd700, 1); g.fillCircle(24, 24, 3); g.generateTexture('door', 32, 48);
    g.clear(); g.fillStyle(COLORS.vr_headset, 1); g.fillRect(4, 10, 24, 12); g.fillStyle(0x000000, 1); g.fillRect(0, 14, 32, 4); g.fillStyle(0x00e5ff, 1); g.fillCircle(8, 16, 2); g.fillCircle(24, 16, 2); g.generateTexture('vr_headset', 32, 32);
    g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 96, 48); g.fillStyle(0xeeeeee, 1); g.fillRect(4, 4, 88, 40); g.generateTexture('conf_table', 96, 48);
    g.clear(); g.fillStyle(0x000000, 1); g.fillRect(0, 10, 64, 20); g.fillStyle(0x333333, 1); g.fillRect(10, 0, 40, 12); g.fillStyle(0x00e5ff, 1); g.fillRect(48, 12, 4, 6); g.fillStyle(0x999999, 1); g.fillCircle(12, 30, 8); g.fillCircle(52, 30, 8); g.generateTexture('uber_car', 64, 40);
    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(0, 0, 32, 16); g.generateTexture('casket', 32, 16);
    g.clear(); g.fillStyle(0xeeeeee, 1); g.fillRect(0, 0, 64, 32); g.fillStyle(0xbbdefb, 1); g.fillRect(5, 5, 54, 22); g.generateTexture('hospital_bed', 64, 32);
    g.clear(); g.fillStyle(0x8d6e63, 1); g.fillRect(0, 0, 32, 32); g.fillStyle(0x000000, 0.2); g.fillRect(2, 2, 28, 28); g.generateTexture('box', 32, 32);
    g.clear(); g.fillStyle(0xff0000, 1); g.fillCircle(4,4,4); g.generateTexture('firework_red', 8, 8);
    g.clear(); g.fillStyle(0x00ff00, 1); g.fillCircle(4,4,4); g.generateTexture('firework_green', 8, 8);
    g.clear(); g.fillStyle(0x0000ff, 1); g.fillCircle(4,4,4); g.generateTexture('firework_blue', 8, 8);
    
    g.clear();
    g.fillStyle(0xf1c40f, 1); // Shell
    g.beginPath(); g.moveTo(4, 24); g.lineTo(28, 24); g.lineTo(24, 12); g.lineTo(8, 12); g.closePath(); g.fill();
    g.fillStyle(0x5d4037, 1); g.fillRect(8, 14, 16, 4); // Meat
    g.fillStyle(0x2ecc71, 1); g.fillRect(10, 12, 12, 4); // Lettuce
    g.fillStyle(0xe74c3c, 1); g.fillRect(12, 12, 4, 2); g.fillRect(18, 12, 4, 2); // Tomatoes
    g.generateTexture('tacos', 32, 32);

    g.clear();
    g.fillStyle(0xecf0f1, 1); g.fillEllipse(16, 20, 24, 12); // Plate
    g.fillStyle(0xf39c12, 1); g.fillEllipse(16, 18, 18, 8); // Pasta
    g.fillStyle(0xe74c3c, 1); g.fillEllipse(16, 15, 12, 6); // Sauce
    g.fillStyle(0x5d4037, 1); g.fillCircle(16, 12, 4); // Meatball
    g.generateTexture('spaghetti', 32, 32);
    
    g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(8,16,16,16); g.fillStyle(0xe74c3c, 1); g.fillRect(10,16,4,16); g.fillRect(18,16,4,16); g.fillStyle(0xf1c40f, 1); g.fillCircle(16,14,10); g.generateTexture('popcorn', 32, 32);
    
    g.clear(); 
    g.fillStyle(0x8b4513, 1); g.fillEllipse(16, 16, 24, 18); // Main body
    g.fillStyle(0xa0522d, 1); g.fillCircle(10, 20, 6); g.fillCircle(22, 20, 6); // Legs
    g.fillStyle(0xffffff, 1); g.fillCircle(6, 22, 3); g.fillCircle(26, 22, 3); // Bone tips
    g.generateTexture('turkey', 32, 32);
    
    g.clear(); g.fillStyle(0xeeeeee, 1); g.fillEllipse(16, 16, 20, 14); g.fillStyle(0xffd700, 1); g.fillRect(14, 12, 6, 6); g.generateTexture('mashed_potatoes', 32, 32);
    g.clear(); g.fillStyle(0x8b0000, 1); g.fillEllipse(16, 16, 16, 12); g.generateTexture('cranberry', 32, 32);
    g.clear(); g.fillStyle(0xcd853f, 1); g.fillEllipse(16, 16, 20, 14); g.fillStyle(0x8b4513, 1); g.fillEllipse(16, 16, 16, 10); g.generateTexture('pie', 32, 32);

    g.clear(); 
    g.fillStyle(0x111111, 1); g.fillRect(6, 10, 20, 12); // Body
    g.fillCircle(10, 8, 5); // Head
    g.fillStyle(0x00ff00, 1); g.fillCircle(8, 8, 2); g.fillCircle(12, 8, 2); // Eyes
    g.fillStyle(0x111111, 1); g.beginPath(); g.moveTo(2, 6); g.lineTo(6, 4); g.lineTo(6, 10); g.fill(); // Wing L
    g.beginPath(); g.moveTo(26, 6); g.lineTo(30, 4); g.lineTo(26, 10); g.fill(); // Wing R
    g.fillStyle(0x111111, 1); g.fillRect(24, 14, 8, 4); 
    g.fillStyle(0xff0000, 1); g.beginPath(); g.moveTo(32, 14); g.lineTo(36, 12); g.lineTo(34, 16); g.fill(); // Red Fin
    g.generateTexture('toothless', 40, 32);

    g.clear();
    g.fillStyle(0xffffff, 1); g.fillRect(6, 10, 20, 12);
    g.fillCircle(10, 8, 5);
    g.fillStyle(0x88ccff, 1); g.fillCircle(8, 8, 2); g.fillCircle(12, 8, 2); // Blue Eyes
    g.fillStyle(0xffffff, 1);
    g.beginPath(); g.moveTo(2, 6); g.lineTo(6, 4); g.lineTo(6, 10); g.fill(); 
    g.beginPath(); g.moveTo(26, 6); g.lineTo(30, 4); g.lineTo(26, 10); g.fill();
    g.fillRect(24, 14, 8, 4); // Tail
    g.generateTexture('light_fury', 40, 32);

    g.clear();
    g.fillStyle(0x333333, 1); g.fillCircle(8, 8, 6); // Head
    g.fillStyle(0xffffff, 1); g.fillCircle(6, 6, 2); // Spot
    g.fillStyle(0x00ff00, 1); g.fillCircle(7, 7, 1); g.fillCircle(9, 7, 1); // Eyes
    g.fillStyle(0x333333, 1); g.fillRect(6, 12, 8, 6); // Body
    g.generateTexture('night_light', 16, 20);

    g.clear(); 
    g.fillStyle(0xffffff, 1); g.fillRect(4, 6, 40, 24); // Huge Body
    g.fillCircle(12, 12, 10); // Massive Head
    g.fillStyle(0xcccccc, 1); g.beginPath(); g.moveTo(12, 12); g.lineTo(2, 16); g.lineTo(6, 20); g.fill(); // Tusk L
    g.beginPath(); g.moveTo(12, 12); g.lineTo(22, 16); g.lineTo(18, 20); g.fill(); // Tusk R
    g.fillStyle(0xeeeeee, 1); // Spikes
    g.beginPath(); g.moveTo(8, 2); g.lineTo(12, 6); g.lineTo(16, 2); g.fill();
    g.beginPath(); g.moveTo(16, 2); g.lineTo(20, 6); g.lineTo(24, 2); g.fill();
    g.fillStyle(0x88ccff, 1); g.fillCircle(10, 10, 2); g.fillCircle(14, 10, 2); // Blue Eyes
    g.generateTexture('bewilderbeast', 48, 32);

    g.clear(); g.fillStyle(0x00ffff, 0.8); g.fillCircle(4,4,4); g.generateTexture('blue_fire', 8, 8);
    g.clear(); g.fillStyle(0x008000, 1); g.fillCircle(4,4,4); g.generateTexture('jalapeno', 8, 8);
    g.clear(); g.fillStyle(0xccffff, 0.9); g.fillCircle(6,6,6); g.generateTexture('ice_breath', 12, 12);

    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(6, 6, 20, 20); g.fillStyle(0x3e2723, 1); g.fillRect(6, 6, 20, 6); g.generateTexture('chair', 32, 32);
    g.clear(); g.fillStyle(0xfff8e1, 1); g.fillRect(10, 8, 12, 16); g.fillStyle(0x000000, 1); g.fillRect(12, 10, 8, 2); g.generateTexture('menu', 32, 32);
    g.clear(); g.fillStyle(0x2e7d32, 1); g.fillCircle(16, 16, 12); g.fillStyle(0x1b5e20, 1); g.fillCircle(12, 12, 4); g.fillCircle(20, 14, 4); g.generateTexture('plant', 32, 32);
    g.clear(); g.fillStyle(0x4e342e, 1); g.fillRect(4, 4, 24, 24); g.fillStyle(0x8d6e63, 1); g.fillRect(4, 4, 24, 8); g.generateTexture('host_stand', 32, 32);

    g.clear();
    g.fillStyle(0x4a148c, 1); g.fillRect(0,0,32,32);
    g.fillStyle(0x6a1b9a, 1); 
    g.fillCircle(16, 16, 6); 
    g.beginPath(); g.moveTo(16, 8); g.lineTo(12, 16); g.lineTo(16, 24); g.lineTo(20, 16); g.fill();
    g.generateTexture('fancy_wallpaper', 32, 32);

    g.clear(); 
    g.fillStyle(0x880e4f, 1); g.fillRect(0,0,64,64); // Dark Red
    g.lineStyle(2, 0xffd700, 1); g.strokeRect(4,4,56,56); // Gold border
    g.lineStyle(1, 0xffd700, 1);
    g.beginPath(); g.moveTo(4,4); g.lineTo(16,16); g.stroke();
    g.beginPath(); g.moveTo(60,4); g.lineTo(48,16); g.stroke();
    g.beginPath(); g.moveTo(4,60); g.lineTo(16,48); g.stroke();
    g.beginPath(); g.moveTo(60,60); g.lineTo(48,48); g.stroke();
    g.strokeRect(16,16,32,32); 
    g.fillStyle(0xad1457, 1); g.fillCircle(32,32,10); 
    g.generateTexture('fancy_rug', 64, 64);

    g.clear(); 
    g.fillStyle(0xffffff, 1); g.fillRect(0,0,80,64); 
    g.fillStyle(0x3e2723, 1); g.fillRect(0,0,80,16); 
    g.fillStyle(0xd4af37, 1); g.fillRect(0,0,80,2); 
    g.fillStyle(0x5d4037, 1); g.fillRect(2, 2, 76, 12);
    g.fillStyle(0x3e2723, 1); g.fillCircle(10,8,2); g.fillCircle(30,8,2); g.fillCircle(50,8,2); g.fillCircle(70,8,2);
    g.fillStyle(0x1a237e, 1); g.fillRect(5,25,70,39); 
    g.fillStyle(0x283593, 1); g.fillRect(5,25,70,5); 
    g.generateTexture('fancy_bed', 80, 64);

    g.clear();
    g.fillStyle(0xd4af37, 1); 
    g.fillRect(15, 0, 2, 10);
    g.fillStyle(0xd4af37, 1); 
    g.fillCircle(16, 14, 6);
    g.lineStyle(2, 0xd4af37, 1);
    g.beginPath(); g.moveTo(16, 14); g.lineTo(4, 10); g.stroke();
    g.beginPath(); g.moveTo(16, 14); g.lineTo(28, 10); g.stroke();
    g.beginPath(); g.moveTo(16, 14); g.lineTo(8, 20); g.stroke();
    g.beginPath(); g.moveTo(16, 14); g.lineTo(24, 20); g.stroke();
    g.fillStyle(0xffffe0, 1); 
    g.fillCircle(4, 8, 2); g.fillCircle(28, 8, 2); 
    g.fillCircle(8, 22, 2); g.fillCircle(24, 22, 2);
    g.fillCircle(16, 26, 3); 
    g.generateTexture('chandelier', 32, 32);

    g.clear();
    g.fillStyle(0xd4af37, 1); g.fillRect(12, 16, 8, 16); // Gold Base
    g.fillStyle(0xffecb3, 1); // Cream Shade
    g.beginPath(); g.moveTo(6, 16); g.lineTo(26, 16); g.lineTo(22, 4); g.lineTo(10, 4); g.closePath(); g.fill();
    g.generateTexture('fancy_lamp', 32, 32);
    
    g.clear();
    g.fillStyle(0xe0f7fa, 1); g.fillRect(0,0,32,32);
    g.fillStyle(0xb2ebf2, 1); g.fillRect(0,30,32,2); 
    g.generateTexture('hospital_wall', 32, 32);

    g.clear();
    g.fillStyle(0x90a4ae, 1); g.fillRect(12, 0, 8, 32); 
    g.fillStyle(0xeceff1, 1); g.fillRect(8, 4, 16, 12); 
    g.generateTexture('iv_stand', 32, 32);

    g.clear();
    g.fillStyle(0x455a64, 1); g.fillRect(0, 0, 32, 24); 
    g.fillStyle(0x000000, 1); g.fillRect(2, 2, 28, 20); 
    g.fillStyle(0x00e676, 1); g.fillRect(4, 12, 24, 2); 
    g.generateTexture('heart_monitor', 32, 32);

    g.clear();
    g.fillStyle(0xffffff, 1); g.fillRect(0,0,64,64);
    g.fillStyle(0x81d4fa, 0.5); g.fillRect(4,4,56,56);
    g.fillStyle(0xffffff, 1); g.fillRect(30,0,4,64); g.fillRect(0,30,64,4);
    g.generateTexture('hospital_window', 64, 64);

    g.clear(); g.fillStyle(0x95a5a6, 1); g.fillRect(0,0,32,32); g.fillStyle(0x7f8c8d, 1); g.beginPath(); g.moveTo(4,4); g.lineTo(16,16); g.lineTo(4,28); g.strokePath(); g.generateTexture('walkway', 32, 32);
    g.clear(); g.fillStyle(0xe74c3c, 1); g.fillRect(0,0,64,48); g.fillStyle(0xc0392b, 1); g.fillRect(0,0,64,12); g.fillStyle(0xffcc00, 1); g.fillRect(16, 16, 32, 16); g.generateTexture('store_food', 64, 48);
    g.clear(); g.fillStyle(0x3498db, 1); g.fillRect(0,0,64,48); g.fillStyle(0x2980b9, 1); g.fillRect(0,0,64,12); g.fillStyle(0xffffff, 1); g.fillRect(10,20,44,20); g.generateTexture('store_news', 64, 48);
    
    g.clear(); g.fillStyle(0xbdc3c7, 1); g.fillRect(0, 0, 32, 48); g.fillStyle(0x3498db, 1); g.fillRect(2, 2, 28, 20); g.fillStyle(0x2ecc71, 1); g.fillCircle(16, 12, 6); g.fillStyle(0x333333, 1); g.fillRect(4, 26, 24, 4); g.fillRect(4, 34, 16, 4); g.generateTexture('poster', 32, 48);
    g.clear(); g.fillStyle(0x7f8c8d, 1); g.fillRect(0, 0, 100, 100); g.fillStyle(0x87ceeb, 0.4); g.fillRect(5, 5, 90, 90); g.generateTexture('large_window', 100, 100);
    g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(10, 14, 20, 4); g.fillRect(16, 10, 4, 12); g.fillRect(10, 12, 2, 8); g.generateTexture('mini_plane', 32, 32);
    
    g.clear(); g.fillStyle(0xffcdd2, 1); g.fillRect(0,0,64,48); g.fillStyle(0xec407a, 1); g.fillRect(0,0,64,12); g.fillStyle(0xffffff, 1); g.fillRect(16,20,32,28); g.generateTexture('donut_shop', 64, 48);
    
    g.clear(); g.fillStyle(0xfbc02d, 1); g.fillCircle(16,16,12); g.fillStyle(0xec407a, 1); g.fillCircle(16,16,10); g.fillStyle(0x2d2d2d, 1); g.fillCircle(16,16,4); g.generateTexture('donut_strawberry', 32, 32);
    g.clear(); g.fillStyle(0xfbc02d, 1); g.fillCircle(16,16,12); g.fillStyle(0x5d4037, 1); g.fillCircle(16,16,10); g.fillStyle(0x2d2d2d, 1); g.fillCircle(16,16,4); g.generateTexture('donut_chocolate', 32, 32);
    
    g.clear(); 
    g.fillStyle(0xcccccc, 1); g.fillRect(0,0,96,64); 
    g.fillStyle(0xffffff, 1);
    g.beginPath(); g.moveTo(48, 32); g.lineTo(10, 10); g.lineTo(10, 40); g.fill(); 
    g.beginPath(); g.moveTo(48, 32); g.lineTo(86, 10); g.lineTo(86, 40); g.fill(); 
    g.fillStyle(0xff69b4, 1); g.fillCircle(48, 32, 18); 
    g.fillStyle(0xcccccc, 1); g.fillCircle(48, 32, 6); 
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    for(let i=0; i<8; i++) {
        g.fillStyle(colors[i%colors.length], 1);
        let a = Math.random() * Math.PI * 2;
        let r = 10 + Math.random() * 6;
        g.fillRect(48 + Math.cos(a)*r, 32 + Math.sin(a)*r, 2, 2);
    }
    g.generateTexture('graffiti_wall', 96, 64);
    
    g.clear(); g.fillStyle(0x9575cd, 1); g.fillRect(0,0,64,48); g.fillStyle(0x5e35b1, 1); g.fillRect(0,0,64,12); g.generateTexture('shop_crystal', 64, 48);
    g.clear(); g.fillStyle(0x4db6ac, 1); g.fillRect(0,0,64,48); g.fillStyle(0x00897b, 1); g.fillRect(0,0,64,12); g.generateTexture('shop_clothing', 64, 48);
    g.clear(); g.fillStyle(0xffcc80, 1); g.fillRect(0,0,64,48); g.fillStyle(0xe65100, 1); g.fillRect(0,0,64,12); g.generateTexture('shop_book', 64, 48); 

    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(0,0,64,24); g.fillStyle(0x3e2723, 1); g.fillRect(0,20,64,4); g.fillRect(0,0,4,24); g.fillRect(60,0,4,24); g.generateTexture('park_bench', 64, 24);

    g.clear();
    g.fillStyle(0x8d6e63, 1); 
    g.fillRect(4, 12, 20, 10); 
    g.fillRect(20, 8, 8, 8); 
    g.fillRect(4, 22, 4, 6); g.fillRect(20, 22, 4, 6); 
    g.fillRect(2, 14, 4, 2); 
    g.generateTexture('generic_dog', 32, 32);

    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(0,0,32,32); g.fillStyle(0x3e2723, 1); g.fillRect(0,0,32,4); g.generateTexture('bar_counter', 32, 32);
    g.clear(); g.fillStyle(0x8d6e63, 1); g.fillCircle(16, 10, 10); 
    g.fillStyle(0x3e2723, 1); g.fillRect(14, 20, 4, 12); 
    g.fillRect(8, 28, 16, 4); 
    g.generateTexture('bar_stool', 32, 32);
    g.clear(); g.fillStyle(0x3e2723, 1); g.fillRect(0, 10, 32, 4); 
    const bCols = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    for(let i=0; i<4; i++) {
        g.fillStyle(bCols[i], 1); g.fillRect(2 + i*8, 0, 4, 10);
    }
    g.generateTexture('bar_shelf', 32, 32);
    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(0,0,32,32);
    g.fillStyle(0x795548, 1); 
    g.fillRect(0,0,14,14); g.fillRect(16,0,16,14);
    g.fillRect(0,16,6,14); g.fillRect(8,16,14,14); g.fillRect(24,16,8,14);
    g.generateTexture('bar_wall', 32, 32);
}
