import { COLORS } from '../constants.js';

export function generateTextures(scene) {
    const g = scene.make.graphics();

    // --- PIXEL ART CHARACTERS ----------------------------------------------
    // One light source, upper left: highlights sit on the left of a form and
    // shadow down its right edge, so every character reads as one set. Figures
    // occupy y1..y32 with the feet on the bottom row, which is what keeps them
    // sitting correctly against furniture and floors.
    const drawPixel = (x, y, color) => {
        g.fillStyle(color, 1);
        g.fillRect(x, y, 1, 1);
    };
    const fillRect = (x, y, w, h, color) => {
        g.fillStyle(color, 1);
        g.fillRect(x, y, w, h);
    };

    const SKIN = 0xffdbac;
    const SKIN_SHADE = 0xe3b98c;
    const EYE_WHITE = 0xf6f6f6;
    const EYE = 0x1d1a17;
    const MOUTH = 0xb5654f;
    const BLUSH = 0xf09b96;

    /**
     * The head every adult shares: skin block shaded down the right cheek,
     * brows, whites-and-pupil eyes, a nose pixel and a mouth. `y` is the top
     * of the head; the jaw lands on y+10.
     */
    const drawFace = (y, { skin = SKIN, shade = SKIN_SHADE, brow = null, blush = false } = {}) => {
        fillRect(10, y, 12, 11, skin);
        fillRect(21, y, 1, 11, shade);
        fillRect(10, y + 10, 12, 1, shade);
        if (brow !== null) {
            // A clear row between brow and eye — sitting them flush reads as a scowl.
            fillRect(12, y + 2, 3, 1, brow);
            fillRect(17, y + 2, 3, 1, brow);
        }
        fillRect(12, y + 4, 3, 2, EYE_WHITE);
        fillRect(17, y + 4, 3, 2, EYE_WHITE);
        fillRect(13, y + 4, 1, 2, EYE);
        fillRect(18, y + 4, 1, 2, EYE);
        drawPixel(16, y + 6, shade);
        fillRect(14, y + 8, 4, 1, MOUTH);
        if (blush) {
            fillRect(11, y + 7, 2, 1, BLUSH);
            fillRect(19, y + 7, 2, 1, BLUSH);
        }
    };

    /** Short side-parted hair with a strand catching the light. */
    const drawShortHair = (top, hi, shade) => {
        fillRect(9, 1, 14, 4, top);
        fillRect(9, 5, 2, 7, top);
        fillRect(21, 5, 2, 7, top);
        fillRect(10, 2, 6, 1, hi);
        fillRect(9, 4, 14, 1, shade);
    };

    /** Torso, sleeves and hands. Returns nothing; call before legs. */
    const drawTorso = (shirt, shade, { hi = null, skin = SKIN } = {}) => {
        fillRect(13, 15, 6, 2, SKIN_SHADE); // neck
        fillRect(10, 17, 12, 9, shirt);
        fillRect(20, 17, 2, 9, shade);
        if (hi !== null) fillRect(11, 19, 1, 5, hi);
        fillRect(7, 17, 3, 6, shirt); // sleeves
        fillRect(22, 17, 3, 6, shade);
        fillRect(7, 23, 3, 3, skin); // hands
        fillRect(22, 23, 3, 3, SKIN_SHADE);
    };

    /** Legs and shoes, drawn from the belt line down to the bottom row. */
    const drawLegs = (pants, pantsShade, shoe, shoeShade) => {
        fillRect(11, 26, 4, 5, pants);
        fillRect(17, 26, 4, 5, pantsShade);
        fillRect(10, 31, 5, 1, shoe);
        fillRect(17, 31, 5, 1, shoeShade);
    };

    const HAIR = 0x4a3b2a;
    const HAIR_HI = 0x6d4c41;
    const HAIR_SHADE = 0x33281c;

    // --- MIKE (standard: blue tee and jeans) ---
    g.clear();
    drawFace(5, { brow: HAIR_SHADE });
    drawShortHair(HAIR, HAIR_HI, HAIR_SHADE);
    drawTorso(0x3498db, 0x2f86c4, { hi: 0x5dade2 });
    fillRect(13, 17, 6, 2, 0x2980b9); // collar
    fillRect(10, 26, 12, 1, 0x2c2c2c); // belt
    drawLegs(0x34495e, 0x2c3e50, 0xecf0f1, 0xd5dbdb);
    g.generateTexture('mike', 32, 32);

    // --- MIKE (business suit) ---
    g.clear();
    drawFace(5, { brow: HAIR_SHADE });
    drawShortHair(HAIR, HAIR_HI, HAIR_SHADE);
    drawTorso(0x2c3e50, 0x22303d);
    fillRect(14, 17, 4, 9, 0xf4f6f7); // shirt placket
    fillRect(15, 18, 2, 7, 0xc0392b); // tie
    fillRect(15, 25, 2, 1, 0x96281b); // tie tip
    fillRect(13, 17, 1, 4, 0x22303d); // lapels
    fillRect(18, 17, 1, 4, 0x1a242f);
    drawPixel(12, 20, 0xf1c40f); // pocket square
    drawLegs(0x2c3e50, 0x22303d, 0x1b1b1b, 0x121212);
    g.generateTexture('mike_suit', 32, 32);

    // --- MIKE (smart casual: grey henley) ---
    g.clear();
    drawFace(5, { brow: HAIR_SHADE });
    drawShortHair(HAIR, HAIR_HI, HAIR_SHADE);
    drawTorso(0x95a5a6, 0x7f8c8d, { hi: 0xbdc3c7 });
    fillRect(15, 17, 2, 4, 0x7f8c8d); // placket
    drawPixel(15, 18, 0xecf0f1); // buttons
    drawPixel(15, 20, 0xecf0f1);
    fillRect(10, 26, 12, 1, 0x5d4037); // belt
    drawLegs(0x1a237e, 0x151c66, 0xf5f5f5, 0xdcdcdc);
    g.generateTexture('mike_casual', 32, 32);

    // --- YVY (long hair, pink dress) ---
    const YVY_HAIR = 0x5d4037;
    const YVY_HAIR_HI = 0x7b5a49;
    const YVY_HAIR_SHADE = 0x3e2723;
    g.clear();
    drawFace(5, { brow: YVY_HAIR_SHADE, blush: true });
    fillRect(9, 1, 14, 4, YVY_HAIR); // crown
    fillRect(8, 4, 3, 15, YVY_HAIR); // long left fall
    fillRect(21, 4, 3, 15, YVY_HAIR); // long right fall
    fillRect(10, 2, 5, 1, YVY_HAIR_HI); // sheen
    fillRect(8, 16, 3, 3, YVY_HAIR_SHADE); // tips
    fillRect(21, 16, 3, 3, YVY_HAIR_SHADE);
    fillRect(9, 4, 14, 1, YVY_HAIR_SHADE);
    fillRect(13, 15, 6, 2, SKIN_SHADE); // neck
    fillRect(11, 17, 10, 8, 0xe91e63); // bodice
    fillRect(19, 17, 2, 8, 0xc2185b);
    fillRect(12, 18, 1, 4, 0xf06292); // highlight
    fillRect(11, 17, 10, 1, 0xf8bbd0); // neckline
    fillRect(11, 24, 10, 1, 0xad1457); // waist
    fillRect(10, 25, 12, 4, 0xe91e63); // skirt
    fillRect(19, 25, 3, 4, 0xc2185b);
    fillRect(10, 28, 12, 1, 0xad1457); // hem
    fillRect(9, 17, 2, 6, SKIN); // bare arms
    fillRect(21, 17, 2, 6, SKIN_SHADE);
    fillRect(9, 23, 2, 2, SKIN);
    fillRect(21, 23, 2, 2, SKIN_SHADE);
    fillRect(12, 29, 3, 2, SKIN); // legs
    fillRect(17, 29, 3, 2, SKIN_SHADE);
    fillRect(11, 31, 4, 1, 0x212121); // shoes
    fillRect(17, 31, 4, 1, 0x121212);
    g.generateTexture('yvy', 32, 32);

    // --- AIDEN (child: bigger head, shorter body) ---
    g.clear();
    fillRect(11, 9, 10, 9, SKIN); // head
    fillRect(20, 9, 1, 9, SKIN_SHADE);
    fillRect(11, 18, 10, 1, SKIN_SHADE); // jaw
    fillRect(10, 7, 12, 3, 0x2c3e50); // hair
    fillRect(10, 9, 2, 4, 0x2c3e50);
    fillRect(20, 9, 2, 4, 0x1f2c38);
    fillRect(11, 8, 4, 1, 0x46617a); // sheen
    fillRect(12, 12, 3, 2, EYE_WHITE); // big eyes
    fillRect(17, 12, 3, 2, EYE_WHITE);
    fillRect(13, 12, 1, 2, EYE);
    fillRect(18, 12, 1, 2, EYE);
    fillRect(12, 15, 1, 1, BLUSH);
    fillRect(19, 15, 1, 1, BLUSH);
    fillRect(15, 16, 3, 1, MOUTH); // grin
    fillRect(12, 19, 8, 7, 0xffa500); // tee
    fillRect(18, 19, 2, 7, 0xe59400);
    fillRect(13, 20, 1, 4, 0xffc04d);
    fillRect(10, 19, 2, 5, 0xffa500); // arms
    fillRect(20, 19, 2, 5, 0xe59400);
    fillRect(10, 24, 2, 2, SKIN);
    fillRect(20, 24, 2, 2, SKIN_SHADE);
    fillRect(12, 26, 3, 5, 0x1a237e); // shorts and legs
    fillRect(17, 26, 3, 5, 0x151c66);
    fillRect(11, 31, 4, 1, 0xe74c3c); // red sneakers
    fillRect(17, 31, 4, 1, 0xc0392b);
    g.generateTexture('aiden', 32, 32);

    // --- AIDEN (older: taller, hooded top) ---
    g.clear();
    fillRect(11, 6, 10, 10, SKIN);
    fillRect(20, 6, 1, 10, SKIN_SHADE);
    fillRect(11, 16, 10, 1, SKIN_SHADE);
    fillRect(10, 4, 12, 3, 0x2c3e50); // hair
    fillRect(10, 6, 2, 5, 0x2c3e50);
    fillRect(20, 6, 2, 5, 0x1f2c38);
    fillRect(11, 5, 4, 1, 0x46617a);
    fillRect(12, 9, 3, 2, EYE_WHITE);
    fillRect(17, 9, 3, 2, EYE_WHITE);
    fillRect(13, 9, 1, 2, EYE);
    fillRect(18, 9, 1, 2, EYE);
    fillRect(14, 13, 4, 1, MOUTH);
    fillRect(13, 17, 6, 2, SKIN_SHADE); // neck
    fillRect(10, 18, 12, 8, 0x2980b9); // hoodie
    fillRect(20, 18, 2, 8, 0x2471a3);
    fillRect(11, 20, 1, 4, 0x5dade2);
    fillRect(12, 18, 8, 2, 0x2471a3); // hood bunched at the neck
    fillRect(15, 21, 1, 4, 0x1f618d); // drawstring seam
    fillRect(7, 18, 3, 6, 0x2980b9); // sleeves
    fillRect(22, 18, 3, 6, 0x2471a3);
    fillRect(7, 24, 3, 2, SKIN);
    fillRect(22, 24, 3, 2, SKIN_SHADE);
    fillRect(11, 26, 4, 5, 0x34495e); // jeans
    fillRect(17, 26, 4, 5, 0x2c3e50);
    fillRect(10, 31, 5, 1, 0xecf0f1);
    fillRect(17, 31, 5, 1, 0xd5dbdb);
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

    // --- BACKGROUND CHARACTERS ---------------------------------------------
    // The crowd shares one silhouette so it reads as a set; roles differ by
    // palette, headwear and a small prop drawn by `extras`.
    const drawNpc = ({
        hair,
        hairHi = null,
        hairShade = null,
        shirt,
        shirtShade,
        pants,
        pantsShade,
        shoe = 0x2b2b2b,
        shoeShade = 0x1b1b1b,
        hat = null,
        hatShade = null,
        brim = null,
        skin = SKIN,
        blush = false,
        extras = null
    }) => {
        g.clear();
        drawFace(5, { skin, brow: hairShade ?? hair, blush });
        drawShortHair(hair, hairHi ?? hair, hairShade ?? hair);
        if (hat !== null) {
            fillRect(9, 1, 14, 4, hat);
            fillRect(9, 4, 14, 1, hatShade ?? hat);
            if (brim !== null) fillRect(8, 5, 16, 1, brim);
        }
        drawTorso(shirt, shirtShade, { skin });
        drawLegs(pants, pantsShade, shoe, shoeShade);
        if (extras !== null) extras();
    };

    drawNpc({
        hair: 0x3e2b1c,
        shirt: COLORS.marine,
        shirtShade: 0x24471f,
        pants: 0x24471f,
        pantsShade: 0x1e3a1a,
        shoe: 0x1b1b1b,
        shoeShade: 0x111111,
        hat: 0x1e3a1a,
        hatShade: 0x152b13,
        brim: 0x152b13,
        extras: () => {
            fillRect(7, 19, 3, 1, 0xf1c40f); // sleeve chevrons
            fillRect(7, 21, 3, 1, 0xf1c40f);
            fillRect(12, 18, 2, 1, 0xf1c40f); // collar insignia
            fillRect(10, 26, 12, 1, 0x1b1b1b); // belt
        }
    });
    g.generateTexture('marine', 32, 32);

    drawNpc({
        hair: 0x4e342e,
        shirt: 0xf4f6f7,
        shirtShade: 0xd7dbdd,
        pants: 0x2b2b2b,
        pantsShade: 0x1f1f1f,
        extras: () => {
            fillRect(10, 18, 4, 8, 0x1c1c1c); // waistcoat panels
            fillRect(18, 18, 4, 8, 0x141414);
            fillRect(14, 17, 4, 1, 0x8e1414); // bow tie
            drawPixel(15, 18, 0x8e1414);
            drawPixel(16, 18, 0x8e1414);
            fillRect(10, 22, 12, 4, 0x3b3b3b); // apron
            fillRect(10, 22, 12, 1, 0x555555);
        }
    });
    g.generateTexture('bartender', 32, 32);

    drawNpc({
        hair: 0x2f2f2f,
        shirt: COLORS.tsa,
        shirtShade: 0x30408f,
        pants: 0x2c3e50,
        pantsShade: 0x22303d,
        hat: 0x1a1a1a,
        hatShade: 0x0f0f0f,
        brim: 0x0f0f0f,
        extras: () => {
            fillRect(12, 19, 2, 2, 0xbdc3c7); // badge
            drawPixel(12, 19, 0xecf0f1);
            fillRect(7, 18, 3, 1, 0xf4f6f7); // shoulder flash
            fillRect(10, 26, 12, 1, 0x1b1b1b); // duty belt
        }
    });
    g.generateTexture('tsa', 32, 32);

    drawNpc({
        hair: 0x6d4c41,
        hairHi: 0x8d6e63,
        hairShade: 0x4e342e,
        shirt: 0x9c27b0,
        shirtShade: 0x7b1fa2,
        pants: 0x37474f,
        pantsShade: 0x2b373d,
        extras: () => {
            fillRect(11, 18, 1, 8, 0xba68c8); // strap across the chest
            fillRect(19, 20, 3, 4, 0x5d4037); // shoulder bag
        }
    });
    g.generateTexture('civilian', 32, 32);

    drawNpc({
        hair: 0x1c1c1c,
        hairHi: 0x3b3b3b,
        shirt: 0x161616,
        shirtShade: 0x0d0d0d,
        pants: 0x161616,
        pantsShade: 0x0d0d0d,
        extras: () => {
            fillRect(14, 17, 4, 9, 0xf4f6f7); // dress shirt
            fillRect(15, 18, 2, 5, 0x1a1a1a); // narrow tie
            fillRect(13, 17, 1, 4, 0x0d0d0d); // lapels
            fillRect(18, 17, 1, 4, 0x0d0d0d);
            fillRect(22, 20, 3, 5, 0x8d6e63); // menus under the arm
            fillRect(22, 20, 3, 1, 0xa1887f);
        }
    });
    g.generateTexture('host', 32, 32);

    drawNpc({
        hair: 0x3e2723,
        hairHi: 0x5d4037,
        shirt: 0xf4f6f7,
        shirtShade: 0xd7dbdd,
        pants: 0x2b2b2b,
        pantsShade: 0x1f1f1f,
        extras: () => {
            fillRect(10, 21, 12, 5, 0x333333); // apron
            fillRect(10, 21, 12, 1, 0x4d4d4d);
            fillRect(15, 18, 2, 3, 0x333333); // apron bib
            fillRect(4, 22, 6, 1, 0xbdc3c7); // serving tray
            fillRect(6, 21, 2, 1, 0xe74c3c); // drink on the tray
        }
    });
    g.generateTexture('server', 32, 32);

    drawNpc({
        hair: 0x4e342e,
        hairHi: 0x6d4c41,
        hairShade: 0x3e2723,
        shirt: 0x8e44ad,
        shirtShade: 0x71368a,
        pants: 0x34495e,
        pantsShade: 0x2c3e50,
        blush: true,
        extras: () => {
            drawPixel(11, 2, 0x6d4c41); // hair sticking up
            drawPixel(14, 0, 0x4e342e);
            drawPixel(20, 2, 0x6d4c41);
            fillRect(11, 12, 3, 1, 0xd98880); // flushed cheeks
            fillRect(18, 12, 3, 1, 0xd98880);
            fillRect(23, 20, 2, 5, 0x2e7d32); // bottle in hand
            fillRect(23, 19, 2, 1, 0x1b5e20);
            fillRect(11, 20, 10, 1, 0x71368a); // rumpled shirt
        }
    });
    g.generateTexture('drunk', 32, 32);

    drawNpc({
        hair: 0x37474f,
        hairHi: 0x546e7a,
        shirt: 0x4dd0e1,
        shirtShade: 0x26c6da,
        pants: 0x26c6da,
        pantsShade: 0x00acc1,
        shoe: 0xf4f6f7,
        shoeShade: 0xd7dbdd,
        extras: () => {
            fillRect(9, 17, 3, 9, 0xf4f6f7); // lab coat panels over scrubs
            fillRect(20, 17, 3, 9, 0xdfe4e6);
            fillRect(7, 17, 3, 6, 0xf4f6f7); // coat sleeves
            fillRect(22, 17, 3, 6, 0xdfe4e6);
            fillRect(13, 17, 1, 5, 0x37474f); // stethoscope
            fillRect(18, 17, 1, 4, 0x37474f);
            fillRect(13, 22, 5, 1, 0x37474f);
            drawPixel(18, 21, 0xbdc3c7);
            fillRect(20, 21, 2, 2, 0xecf0f1); // chest pocket
        }
    });
    g.generateTexture('doctor', 32, 32);
    
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
    // Saloon in profile: sloped cabin, glazed windows, wheels with hubs.
    g.clear();
    g.fillStyle(0x1c2833, 1);
    g.beginPath(); g.moveTo(16, 12); g.lineTo(24, 3); g.lineTo(44, 3); g.lineTo(50, 12); g.closePath(); g.fill();
    fillRect(6, 12, 52, 14, 0x22303d); // body
    fillRect(6, 12, 52, 2, 0x33475b); // beltline highlight
    fillRect(6, 24, 52, 2, 0x141d26); // sill shadow
    fillRect(24, 5, 9, 7, 0x8fd3ff); // windows
    fillRect(35, 5, 9, 7, 0x8fd3ff);
    fillRect(24, 5, 9, 2, 0xc7ebff);
    fillRect(35, 5, 9, 2, 0xc7ebff);
    fillRect(33, 5, 2, 7, 0x1c2833); // B-pillar
    fillRect(56, 14, 4, 4, 0xffe082); // headlight
    fillRect(4, 15, 3, 3, 0xc62828); // tail light
    fillRect(30, 15, 8, 4, 0x0f1720); // door line
    fillRect(31, 17, 6, 1, 0x8a9aa8); // handle
    g.fillStyle(0x101820, 1);
    g.fillCircle(17, 27, 7); g.fillCircle(47, 27, 7);
    g.fillStyle(0x9aa5b1, 1);
    g.fillCircle(17, 27, 3); g.fillCircle(47, 27, 3);
    g.fillStyle(0x00e5ff, 1); // rideshare beacon
    g.fillRect(20, 0, 10, 4);
    g.fillStyle(0x004d5a, 1);
    g.fillRect(23, 1, 4, 2);
    g.generateTexture('uber_car', 64, 40);
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
    g.fillStyle(0x1b1b28, 1); // far wing
    g.beginPath(); g.moveTo(16, 12); g.lineTo(6, 0); g.lineTo(21, 6); g.closePath(); g.fill();
    g.fillStyle(0x2f2f42, 1); // near wing, spread
    g.beginPath(); g.moveTo(17, 13); g.lineTo(30, 2); g.lineTo(36, 12); g.lineTo(22, 16); g.closePath(); g.fill();
    g.fillStyle(0x1b1b28, 1); // wing membrane ribs
    g.fillRect(24, 6, 1, 7); g.fillRect(29, 5, 1, 7);
    g.fillStyle(0x2f2f42, 1); // body
    g.fillEllipse(18, 17, 20, 10);
    g.fillStyle(0x59597a, 1);
    g.fillEllipse(17, 15, 14, 5); // back highlight
    g.fillStyle(0x2f2f42, 1); // tail
    g.beginPath(); g.moveTo(9, 16); g.lineTo(0, 22); g.lineTo(9, 20); g.closePath(); g.fill();
    g.fillStyle(0xc0392b, 1); // tail fin
    g.beginPath(); g.moveTo(4, 19); g.lineTo(0, 14); g.lineTo(2, 21); g.closePath(); g.fill();
    g.fillStyle(0x2f2f42, 1); // head
    g.fillEllipse(29, 18, 12, 9);
    g.fillStyle(0x1b1b28, 1); // ear plates swept back
    g.beginPath(); g.moveTo(26, 14); g.lineTo(22, 9); g.lineTo(28, 13); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(29, 14); g.lineTo(27, 8); g.lineTo(31, 13); g.closePath(); g.fill();
    g.fillStyle(0x59597a, 1); // snout
    g.fillEllipse(33, 19, 7, 5);
    g.fillStyle(0x4c7a1a, 1); // eye glow
    g.fillEllipse(31, 17, 7, 6);
    g.fillStyle(0xaeea00, 1);
    g.fillEllipse(31, 17, 5, 4);
    g.fillStyle(0x0b0b0b, 1); // slit pupil
    g.fillRect(31, 15, 1, 5);
    g.fillStyle(0xffffff, 0.9); // catchlight
    g.fillRect(29, 15, 1, 1);
    g.fillStyle(0x1b1b28, 1); // legs tucked under
    g.fillRect(16, 21, 4, 3); g.fillRect(22, 21, 4, 3);
    g.fillStyle(0x59597a, 1); // dorsal spines
    g.fillRect(12, 12, 2, 2); g.fillRect(16, 11, 2, 2); g.fillRect(20, 12, 2, 2);
    g.generateTexture('toothless', 40, 32);

    g.clear();
    g.fillStyle(0xb9c6d6, 1); // far wing
    g.beginPath(); g.moveTo(16, 12); g.lineTo(6, 0); g.lineTo(21, 6); g.closePath(); g.fill();
    g.fillStyle(0xe8eef5, 1); // near wing, spread
    g.beginPath(); g.moveTo(17, 13); g.lineTo(30, 2); g.lineTo(36, 12); g.lineTo(22, 16); g.closePath(); g.fill();
    g.fillStyle(0xb9c6d6, 1); // wing membrane ribs
    g.fillRect(24, 6, 1, 7); g.fillRect(29, 5, 1, 7);
    g.fillStyle(0xe8eef5, 1); // body
    g.fillEllipse(18, 17, 20, 10);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(17, 15, 14, 5); // back highlight
    g.fillStyle(0xe8eef5, 1); // tail
    g.beginPath(); g.moveTo(9, 16); g.lineTo(0, 22); g.lineTo(9, 20); g.closePath(); g.fill();
    g.fillStyle(0xb9c6d6, 1); // tail fin
    g.beginPath(); g.moveTo(4, 19); g.lineTo(0, 14); g.lineTo(2, 21); g.closePath(); g.fill();
    g.fillStyle(0xe8eef5, 1); // head
    g.fillEllipse(29, 18, 12, 9);
    g.fillStyle(0xb9c6d6, 1); // ear plates swept back
    g.beginPath(); g.moveTo(26, 14); g.lineTo(22, 9); g.lineTo(28, 13); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(29, 14); g.lineTo(27, 8); g.lineTo(31, 13); g.closePath(); g.fill();
    g.fillStyle(0xffffff, 1); // snout
    g.fillEllipse(33, 19, 7, 5);
    g.fillStyle(0x1a4a63, 1); // eye glow
    g.fillEllipse(31, 17, 7, 6);
    g.fillStyle(0x4fc3f7, 1);
    g.fillEllipse(31, 17, 5, 4);
    g.fillStyle(0x0b0b0b, 1); // slit pupil
    g.fillRect(31, 15, 1, 5);
    g.fillStyle(0xffffff, 0.9); // catchlight
    g.fillRect(29, 15, 1, 1);
    g.fillStyle(0xb9c6d6, 1); // legs tucked under
    g.fillRect(16, 21, 4, 3); g.fillRect(22, 21, 4, 3);
    g.fillStyle(0xffffff, 1); // dorsal spines
    g.fillRect(12, 12, 2, 2); g.fillRect(16, 11, 2, 2); g.fillRect(20, 12, 2, 2);
    g.generateTexture('light_fury', 40, 32);

    // Baby Night Light: white with dark dapples, oversized eyes.
    g.clear();
    g.fillStyle(0xf2f6fa, 1);
    g.fillEllipse(8, 13, 12, 9); // body
    g.beginPath(); g.moveTo(3, 12); g.lineTo(0, 6); g.lineTo(6, 10); g.closePath(); g.fill(); // wing
    g.beginPath(); g.moveTo(11, 11); g.lineTo(15, 5); g.lineTo(14, 12); g.closePath(); g.fill();
    g.fillStyle(0x2b2b3a, 1); // dapples
    g.fillRect(5, 12, 2, 2); g.fillRect(9, 15, 2, 2); g.fillRect(12, 12, 1, 2);
    g.fillStyle(0xf2f6fa, 1);
    g.fillEllipse(8, 6, 11, 8); // head
    g.fillStyle(0x2b2b3a, 1);
    g.fillRect(3, 2, 3, 2); g.fillRect(11, 2, 2, 2); // ear nubs
    g.fillStyle(0x7ed321, 1); // big eyes
    g.fillEllipse(5, 6, 5, 5); g.fillEllipse(11, 6, 5, 5);
    g.fillStyle(0x0d0d14, 1);
    g.fillRect(5, 4, 1, 4); g.fillRect(11, 4, 1, 4);
    g.fillStyle(0xffffff, 1);
    g.fillRect(4, 4, 1, 1); g.fillRect(10, 4, 1, 1);
    g.fillStyle(0xd7dee6, 1);
    g.fillRect(6, 17, 2, 3); g.fillRect(9, 17, 2, 3); // legs
    g.generateTexture('night_light', 16, 20);

    // Ice titan: slab of a body, ridge of spikes, curved tusks, glacial glow.
    g.clear();
    g.fillStyle(0xdfe9f2, 1);
    g.fillEllipse(26, 20, 40, 22); // bulk
    g.fillStyle(0xc3d4e3, 1);
    g.fillEllipse(28, 25, 34, 12); // underside shadow
    g.fillStyle(0xeef5fb, 1);
    g.fillEllipse(14, 14, 22, 16); // head
    g.fillStyle(0xaebfd0, 1); // brow ridge
    g.fillRect(6, 10, 18, 2);
    g.fillStyle(0xf7fbff, 1); // dorsal spikes
    for (const [x, h] of [[20, 6], [27, 9], [34, 8], [41, 5]]) {
        g.beginPath(); g.moveTo(x, 10); g.lineTo(x + 3, 10 - h); g.lineTo(x + 6, 10); g.closePath(); g.fill();
    }
    g.fillStyle(0xffffff, 1); // tusks
    g.beginPath(); g.moveTo(10, 18); g.lineTo(1, 26); g.lineTo(6, 27); g.lineTo(12, 21); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(18, 19); g.lineTo(14, 29); g.lineTo(19, 28); g.lineTo(22, 21); g.closePath(); g.fill();
    g.fillStyle(0x4fc3f7, 1); // glacial eyes
    g.fillEllipse(11, 12, 6, 5); g.fillEllipse(19, 12, 5, 4);
    g.fillStyle(0x0d2b3a, 1);
    g.fillRect(11, 10, 1, 4); g.fillRect(19, 10, 1, 4);
    g.fillStyle(0x8fd3ff, 0.7); // frost breath at the jaw
    g.fillEllipse(6, 20, 8, 5);
    g.generateTexture('bewilderbeast', 48, 32);

    // Plasma blast: white-hot core inside a cyan corona.
    g.clear();
    g.fillStyle(0x00e5ff, 0.35); g.fillCircle(4, 4, 4);
    g.fillStyle(0x40c4ff, 0.75); g.fillCircle(4, 4, 3);
    g.fillStyle(0xb3f0ff, 0.95); g.fillCircle(4, 4, 2);
    g.fillStyle(0xffffff, 1); g.fillRect(3, 3, 2, 2);
    g.generateTexture('blue_fire', 8, 8);
    g.clear(); g.fillStyle(0x008000, 1); g.fillCircle(4,4,4); g.generateTexture('jalapeno', 8, 8);
    // Ice breath: pale shards radiating from a frozen core.
    g.clear();
    g.fillStyle(0xccf2ff, 0.4); g.fillCircle(6, 6, 6);
    g.fillStyle(0xe8faff, 0.8); g.fillCircle(6, 6, 4);
    g.fillStyle(0xffffff, 1); g.fillCircle(6, 6, 2);
    g.fillStyle(0xa8e6ff, 0.9); // shards
    g.fillRect(6, 0, 1, 4); g.fillRect(6, 8, 1, 4);
    g.fillRect(0, 6, 4, 1); g.fillRect(8, 6, 4, 1);
    g.generateTexture('ice_breath', 12, 12);

    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(6, 6, 20, 20); g.fillStyle(0x3e2723, 1); g.fillRect(6, 6, 20, 6); g.generateTexture('chair', 32, 32);
    g.clear(); g.fillStyle(0xfff8e1, 1); g.fillRect(10, 8, 12, 16); g.fillStyle(0x000000, 1); g.fillRect(12, 10, 8, 2); g.generateTexture('menu', 32, 32);
    // Potted palm: terracotta pot, soil, and fronds fanning from a centre stem
    // so it reads as a plant rather than a green blob.
    g.clear();
    fillRect(10, 24, 12, 8, 0xa1583a); // pot
    fillRect(19, 24, 3, 8, 0x82442b);
    fillRect(9, 22, 14, 3, 0xc06744); // rim
    fillRect(9, 22, 14, 1, 0xd88a63);
    fillRect(11, 25, 10, 1, 0x4e342e); // soil
    fillRect(15, 14, 2, 10, 0x33691e); // stem
    g.fillStyle(0x2e7d32, 1);
    g.fillEllipse(16, 8, 14, 8);
    g.fillEllipse(8, 13, 10, 6);
    g.fillEllipse(24, 13, 10, 6);
    g.fillStyle(0x43a047, 1);
    g.fillEllipse(12, 7, 8, 5);
    g.fillEllipse(21, 10, 7, 4);
    g.fillStyle(0x1b5e20, 1);
    g.fillEllipse(16, 12, 10, 5);
    g.fillStyle(0x66bb6a, 1); // new shoots catching the light
    g.fillEllipse(13, 5, 5, 3);
    g.fillEllipse(19, 6, 4, 3);
    g.generateTexture('plant', 32, 32);
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
    // Airliner: nose cone, swept wings, tail fin, engine and cabin windows.
    g.clear();
    fillRect(6, 13, 22, 5, 0xf4f6f7); // fuselage
    fillRect(6, 16, 22, 2, 0xc9d2d6);
    g.fillStyle(0xf4f6f7, 1); // nose
    g.beginPath(); g.moveTo(28, 13); g.lineTo(31, 16); g.lineTo(28, 18); g.fill();
    g.fillStyle(0x2980b9, 1); // near wing, swept back
    g.beginPath(); g.moveTo(19, 15); g.lineTo(9, 24); g.lineTo(14, 24); g.lineTo(22, 17); g.fill();
    g.fillStyle(0x3498db, 1); // far wing
    g.beginPath(); g.moveTo(19, 14); g.lineTo(11, 7); g.lineTo(15, 7); g.lineTo(22, 13); g.fill();
    g.fillStyle(0x2980b9, 1); // tail fin
    g.beginPath(); g.moveTo(7, 13); g.lineTo(4, 5); g.lineTo(9, 12); g.fill();
    fillRect(4, 12, 7, 2, 0x3498db); // tailplane
    fillRect(15, 18, 4, 3, 0x5d6d7e); // engine
    fillRect(15, 19, 4, 1, 0x8a9aa8);
    fillRect(11, 14, 14, 1, 0x8fd3ff); // cabin windows
    fillRect(26, 14, 2, 1, 0x1c2833); // cockpit
    g.generateTexture('mini_plane', 32, 32);
    
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

    // A dog in profile: muzzle, ear, collar, four legs and a curled tail.
    g.clear();
    fillRect(6, 14, 16, 9, 0xa1785f); // body
    fillRect(6, 21, 16, 2, 0x82604a);
    fillRect(19, 9, 8, 8, 0xa1785f); // head
    fillRect(25, 12, 4, 4, 0xbb8f74); // muzzle
    fillRect(28, 13, 1, 2, 0x2b2b2b); // nose
    fillRect(23, 12, 2, 2, 0x1d1a17); // eye
    drawPixel(23, 12, 0xffffff);
    g.fillStyle(0x82604a, 1); // ear
    g.beginPath(); g.moveTo(20, 9); g.lineTo(23, 3); g.lineTo(25, 10); g.fill();
    fillRect(10, 14, 8, 3, 0xbb8f74); // lighter back patch
    fillRect(19, 16, 8, 1, 0xc62828); // collar
    drawPixel(23, 17, 0xf1c40f); // tag
    fillRect(7, 23, 3, 6, 0xa1785f); // legs
    fillRect(12, 23, 3, 6, 0x8f6a53);
    fillRect(17, 23, 3, 6, 0xa1785f);
    fillRect(7, 29, 3, 1, 0x6b4f3d); // paws
    fillRect(12, 29, 3, 1, 0x6b4f3d);
    fillRect(17, 29, 3, 1, 0x6b4f3d);
    g.fillStyle(0xbb8f74, 1); // tail, curled up
    g.fillRect(3, 12, 4, 2); g.fillRect(1, 8, 2, 5); g.fillRect(2, 6, 4, 2);
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

    // --- FAMILY AND GUESTS ---------------------------------------------------
    // Every relative used to be the same `civilian` sprite under a different
    // tint (and Alex was literally Mike's sprite), so a table of family read as
    // one person recoloured. These are distinct builds: different hair, ages,
    // silhouettes and clothes.

    /** Hair that falls past the shoulders, framing the face on both sides. */
    const drawLongHair = (top, hi, shade, fallTo = 20) => {
        fillRect(9, 1, 14, 4, top);
        fillRect(8, 4, 3, fallTo - 4, top);
        fillRect(21, 4, 3, fallTo - 4, top);
        fillRect(10, 2, 5, 1, hi);
        fillRect(8, fallTo - 3, 3, 3, shade);
        fillRect(21, fallTo - 3, 3, 3, shade);
        fillRect(9, 4, 14, 1, shade);
    };

    /** Reading glasses, drawn as frames around the eyes rather than over them. */
    const drawGlasses = (frame = 0x37474f) => {
        fillRect(11, 8, 5, 1, frame);
        fillRect(11, 11, 5, 1, frame);
        fillRect(11, 9, 1, 2, frame);
        fillRect(15, 9, 1, 2, frame);
        fillRect(17, 8, 5, 1, frame);
        fillRect(17, 11, 5, 1, frame);
        fillRect(17, 9, 1, 2, frame);
        fillRect(21, 9, 1, 2, frame);
        drawPixel(16, 9, frame);
    };

    /**
     * A woman's build: narrower shoulders than drawNpc, with either a skirt or
     * trousers below the waist.
     */
    const drawWoman = ({
        hair,
        hairHi,
        hairShade,
        top,
        topShade,
        topHi = null,
        lower,
        lowerShade,
        shoe = 0x212121,
        shoeShade = 0x121212,
        bareArms = false,
        skirt = true,
        hairFall = 20,
        bun = false,
        extras = null
    }) => {
        g.clear();
        drawFace(5, { brow: hairShade, blush: true });
        drawLongHair(hair, hairHi, hairShade, hairFall);
        if (bun) {
            fillRect(13, 0, 6, 2, hair); // hair gathered up
            fillRect(14, 0, 3, 1, hairHi);
            fillRect(8, 4, 3, 6, hair); // shorter fall
            fillRect(21, 4, 3, 6, hair);
        }
        fillRect(13, 15, 6, 2, SKIN_SHADE); // neck
        fillRect(11, 17, 10, 8, top); // bodice
        fillRect(19, 17, 2, 8, topShade);
        if (topHi !== null) fillRect(12, 18, 1, 4, topHi);
        fillRect(11, 17, 10, 1, topShade); // neckline
        if (bareArms) {
            fillRect(9, 17, 2, 6, SKIN);
            fillRect(21, 17, 2, 6, SKIN_SHADE);
        } else {
            fillRect(9, 17, 2, 6, top);
            fillRect(21, 17, 2, 6, topShade);
        }
        fillRect(9, 23, 2, 2, SKIN); // hands
        fillRect(21, 23, 2, 2, SKIN_SHADE);
        if (skirt) {
            fillRect(10, 25, 12, 4, lower);
            fillRect(19, 25, 3, 4, lowerShade);
            fillRect(10, 28, 12, 1, lowerShade);
            fillRect(12, 29, 3, 2, SKIN);
            fillRect(17, 29, 3, 2, SKIN_SHADE);
        } else {
            fillRect(11, 25, 4, 6, lower);
            fillRect(17, 25, 4, 6, lowerShade);
        }
        fillRect(11, 31, 4, 1, shoe);
        fillRect(17, 31, 4, 1, shoeShade);
        if (extras !== null) extras();
    };

    // Yvy's dad: greying hair, moustache, weekend polo.
    drawNpc({
        hair: 0x2b2b2b,
        hairHi: 0x8a8a8a,
        hairShade: 0x1c1c1c,
        shirt: 0xc0392b,
        shirtShade: 0x96281b,
        pants: 0x8d7b62,
        pantsShade: 0x6f6150,
        shoe: 0x4e342e,
        shoeShade: 0x3e2723,
        extras: () => {
            fillRect(9, 3, 5, 1, 0x9e9e9e); // grey at the temple
            fillRect(19, 3, 4, 1, 0x9e9e9e);
            fillRect(13, 12, 6, 1, 0x2b2b2b); // moustache
            fillRect(11, 17, 10, 1, 0x96281b); // polo collar
            fillRect(15, 17, 2, 4, 0x96281b); // placket
        }
    });
    g.generateTexture('yvy_dad', 32, 32);

    // Yvy's stepmom: hair up in a bun, coral blouse.
    drawWoman({
        hair: 0x3e2723,
        hairHi: 0x6d4c41,
        hairShade: 0x2b1a14,
        top: 0xff7043,
        topShade: 0xe64a19,
        topHi: 0xffab91,
        lower: 0x37474f,
        lowerShade: 0x2b373d,
        bun: true,
        hairFall: 12
    });
    g.generateTexture('yvy_stepmom', 32, 32);

    // Yvy's mom: silver hair, soft lavender cardigan.
    drawWoman({
        hair: 0xbdbdbd,
        hairHi: 0xe0e0e0,
        hairShade: 0x9e9e9e,
        top: 0xb39ddb,
        topShade: 0x9575cd,
        topHi: 0xd1c4e9,
        lower: 0x78909c,
        lowerShade: 0x62757f,
        hairFall: 16,
        extras: () => {
            fillRect(15, 17, 2, 8, 0x9575cd); // cardigan opening
            drawPixel(15, 19, 0xede7f6);
            drawPixel(15, 22, 0xede7f6);
        }
    });
    g.generateTexture('yvy_mom', 32, 32);

    // Mike's mom: short auburn bob, green blouse.
    drawWoman({
        hair: 0x8d4b2a,
        hairHi: 0xb06a42,
        hairShade: 0x6b3720,
        top: 0x2e7d32,
        topShade: 0x1b5e20,
        topHi: 0x66bb6a,
        lower: 0x37474f,
        lowerShade: 0x2b373d,
        hairFall: 13,
        skirt: false,
        extras: () => {
            fillRect(12, 16, 8, 1, 0xf1c40f); // necklace
        }
    });
    g.generateTexture('mike_mom', 32, 32);

    // Mike's dad: grey hair, glasses, sweater over a collar.
    drawNpc({
        hair: 0x9e9e9e,
        hairHi: 0xcfcfcf,
        hairShade: 0x757575,
        shirt: 0x37474f,
        shirtShade: 0x2b373d,
        pants: 0x6f6150,
        pantsShade: 0x574c3f,
        shoe: 0x3e2723,
        shoeShade: 0x2b1a14,
        extras: () => {
            drawGlasses();
            fillRect(13, 17, 6, 2, 0xf4f6f7); // shirt collar under the sweater
            fillRect(12, 20, 8, 1, 0x2b373d); // knit line
        }
    });
    g.generateTexture('mike_dad', 32, 32);

    // Jocelyn: long auburn hair, plum top and jeans.
    drawWoman({
        hair: 0x6d4c41,
        hairHi: 0x8d6e63,
        hairShade: 0x4e342e,
        top: 0x8e44ad,
        topShade: 0x71368a,
        topHi: 0xbb8fce,
        lower: 0x2c3e8f,
        lowerShade: 0x233073,
        skirt: false,
        bareArms: true,
        hairFall: 21
    });
    g.generateTexture('jocelyn', 32, 32);

    // Alex: Yvy's teenage half-brother — slighter build, messy hair, hoodie.
    g.clear();
    fillRect(11, 6, 10, 10, SKIN);
    fillRect(20, 6, 1, 10, SKIN_SHADE);
    fillRect(11, 16, 10, 1, SKIN_SHADE);
    fillRect(10, 3, 12, 4, 0x1c1c1c); // mop of hair
    fillRect(10, 6, 2, 5, 0x1c1c1c);
    fillRect(20, 6, 2, 5, 0x111111);
    drawPixel(12, 2, 0x1c1c1c);
    drawPixel(16, 2, 0x333333);
    drawPixel(19, 2, 0x1c1c1c);
    fillRect(11, 4, 4, 1, 0x3b3b3b);
    fillRect(12, 9, 3, 2, EYE_WHITE);
    fillRect(17, 9, 3, 2, EYE_WHITE);
    fillRect(13, 9, 1, 2, EYE);
    fillRect(18, 9, 1, 2, EYE);
    fillRect(14, 13, 4, 1, MOUTH);
    fillRect(13, 17, 6, 2, SKIN_SHADE);
    fillRect(10, 18, 12, 8, 0x2e7d32); // hoodie
    fillRect(20, 18, 2, 8, 0x1b5e20);
    fillRect(12, 18, 8, 2, 0x1b5e20); // hood
    fillRect(11, 20, 1, 4, 0x66bb6a);
    fillRect(15, 21, 1, 4, 0x145a17);
    fillRect(8, 18, 2, 6, 0x2e7d32);
    fillRect(22, 18, 2, 6, 0x1b5e20);
    fillRect(8, 24, 2, 2, SKIN);
    fillRect(22, 24, 2, 2, SKIN_SHADE);
    fillRect(11, 26, 4, 5, 0x37474f);
    fillRect(17, 26, 4, 5, 0x2b373d);
    fillRect(10, 31, 5, 1, 0xecf0f1);
    fillRect(17, 31, 5, 1, 0xd5dbdb);
    g.generateTexture('alex', 32, 32);

    // Kevin: fair cropped hair, orange tee.
    drawNpc({
        hair: 0xd7b56d,
        hairHi: 0xefd79a,
        hairShade: 0xa8894f,
        shirt: 0xef6c00,
        shirtShade: 0xc25500,
        pants: 0x5d6d7e,
        pantsShade: 0x4a5765,
        shoe: 0xecf0f1,
        shoeShade: 0xd5dbdb,
        extras: () => {
            fillRect(13, 17, 6, 1, 0xc25500); // crew neck
        }
    });
    g.generateTexture('kevin', 32, 32);

    // A second background build so crowds aren't all the same silhouette.
    drawWoman({
        hair: 0x4e342e,
        hairHi: 0x6d4c41,
        hairShade: 0x3e2723,
        top: 0x26a69a,
        topShade: 0x00897b,
        topHi: 0x80cbc4,
        lower: 0x455a64,
        lowerShade: 0x37474f,
        hairFall: 18,
        extras: () => {
            fillRect(21, 4, 3, 8, 0x4e342e); // ponytail swept to one side
            fillRect(22, 11, 2, 4, 0x3e2723);
        }
    });
    g.generateTexture('civilian_f', 32, 32);
}
