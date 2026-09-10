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
    const YVY_HAIR = 0x14141a; // black, with a blue sheen where the light hits
    const YVY_HAIR_HI = 0x3c3c50;
    const YVY_HAIR_SHADE = 0x08080c;

    /**
     * Yvy's face: a narrower head than the shared drawFace, with larger eyes,
     * lashes, thinner arched brows and fuller lips.
     */
    const drawYvyFace = (y) => {
        fillRect(11, y, 10, 11, SKIN);
        fillRect(20, y, 1, 11, SKIN_SHADE); // cheek shadow
        fillRect(12, y + 10, 8, 1, SKIN_SHADE); // narrow chin
        fillRect(11, y + 1, 4, 1, 0x2b2b33); // brows, a clear row above the lashes
        fillRect(17, y + 1, 4, 1, 0x2b2b33);
        fillRect(11, y + 3, 4, 1, YVY_HAIR); // lash line
        fillRect(17, y + 3, 4, 1, YVY_HAIR);
        fillRect(11, y + 4, 4, 3, EYE_WHITE); // big eyes
        fillRect(17, y + 4, 4, 3, EYE_WHITE);
        fillRect(12, y + 4, 2, 3, 0x4a2f22); // irises
        fillRect(18, y + 4, 2, 3, 0x4a2f22);
        drawPixel(12, y + 4, 0xffffff); // catchlights
        drawPixel(18, y + 4, 0xffffff);
        drawPixel(15, y + 7, SKIN_SHADE); // small nose
        fillRect(14, y + 8, 4, 1, 0xd6607a); // lips
        fillRect(15, y + 9, 2, 1, 0xb84a63);
        fillRect(11, y + 7, 2, 1, BLUSH);
        fillRect(19, y + 7, 2, 1, BLUSH);
    };

    /** Long black hair with a side-swept fringe. */
    const drawYvyHair = () => {
        fillRect(9, 1, 14, 4, YVY_HAIR); // crown
        fillRect(8, 4, 3, 15, YVY_HAIR); // falls past the shoulders
        fillRect(21, 4, 3, 15, YVY_HAIR);
        fillRect(10, 5, 4, 2, YVY_HAIR); // fringe swept to one side
        fillRect(10, 2, 5, 1, YVY_HAIR_HI); // sheen
        drawPixel(20, 3, YVY_HAIR_HI);
        fillRect(8, 16, 3, 3, YVY_HAIR_SHADE); // tips
        fillRect(21, 16, 3, 3, YVY_HAIR_SHADE);
        fillRect(9, 4, 14, 1, YVY_HAIR_SHADE);
    };
    g.clear();
    drawYvyFace(5);
    drawYvyHair();
    fillRect(13, 15, 6, 2, SKIN_SHADE); // neck
    fillRect(11, 17, 10, 8, 0xe91e63); // bodice
    fillRect(19, 17, 2, 8, 0xc2185b);
    fillRect(12, 18, 1, 4, 0xf06292);
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
    fillRect(11, 31, 4, 1, 0x212121); // heels
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

    // Upholstered seat: headrest, buttoned back, cushion and wooden arms.
    g.clear();
    fillRect(5, 6, 22, 22, 0xa8201a); // back
    fillRect(5, 6, 22, 3, 0xc62828); // lit top of the headrest
    fillRect(22, 6, 5, 22, 0x8c1713); // shaded side
    fillRect(8, 11, 16, 12, 0xbb2a24); // centre panel
    drawPixel(12, 15, 0x7a1310); // buttons
    drawPixel(19, 15, 0x7a1310);
    fillRect(5, 24, 22, 4, 0x8c1713); // seam above the cushion
    fillRect(6, 28, 20, 4, 0x9c1c17); // cushion
    fillRect(6, 28, 20, 1, 0xc62828);
    fillRect(0, 14, 5, 18, 0x4e342e); // arms
    fillRect(27, 14, 5, 18, 0x3e2723);
    fillRect(0, 14, 5, 2, 0x6d4c41);
    fillRect(27, 14, 5, 2, 0x54372c);
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
    
    // Board floor: planks with staggered end joints and grain.
    // Board floor: long planks with soft seams and grain. End joints are rare —
    // one per tile — because a joint on every board reads as brickwork.
    g.clear();
    fillRect(0, 0, 32, 32, COLORS.floor);
    for (let row = 0; row < 4; row++) {
        const y = row * 8;
        fillRect(0, y, 32, 1, 0x6f5142); // seam
        fillRect(0, y + 1, 32, 1, 0x9a7b6b); // lit edge of the next board
        fillRect(3 + row * 7, y + 4, 11, 1, 0x81614f); // grain
        fillRect(20 - row * 3, y + 6, 6, 1, 0x81614f);
    }
    fillRect(19, 9, 1, 6, 0x6f5142); // the single end joint
    g.generateTexture('floor_wood', 32, 32);
    // Polished terminal floor: large tiles, grout lines and a faint sheen.
    g.clear();
    fillRect(0, 0, 32, 32, 0xd6dbdd);
    fillRect(0, 0, 32, 1, 0xaeb6b8); // grout
    fillRect(0, 0, 1, 32, 0xaeb6b8);
    fillRect(2, 2, 12, 12, 0xe4e8ea); // quadrant sheen
    fillRect(18, 18, 11, 11, 0xdde2e4);
    drawPixel(24, 6, 0xc3cacd);
    drawPixel(7, 22, 0xc3cacd);
    g.generateTexture('floor_tile', 32, 32);
    // Paving slabs with a kerb edge and a little wear.
    g.clear();
    fillRect(0, 0, 32, 32, 0x5b5b5b);
    fillRect(0, 0, 32, 1, 0x6f6f6f); // slab joints
    fillRect(0, 16, 32, 1, 0x4a4a4a);
    fillRect(0, 0, 1, 32, 0x4a4a4a);
    fillRect(16, 0, 1, 16, 0x4a4a4a); // staggered courses
    fillRect(8, 16, 1, 16, 0x4a4a4a);
    fillRect(4, 6, 5, 1, 0x6a6a6a); // scuffs
    fillRect(21, 22, 6, 1, 0x545454);
    drawPixel(26, 9, 0x6a6a6a);
    drawPixel(12, 25, 0x505050);
    g.generateTexture('pavement', 32, 32);
    g.clear(); g.fillStyle(0x2e7d32, 1); g.fillRect(0, 0, 32, 32); g.fillStyle(0x1b5e20, 0.5); g.fillRect(0,30,32,2); g.generateTexture('grass', 32, 32);
    // Roller case: shell with straps, a telescoping handle and wheels.
    g.clear();
    fillRect(6, 9, 20, 17, 0x6d4c41); // shell
    fillRect(22, 9, 4, 17, 0x543a31); // shadow side
    fillRect(6, 9, 20, 1, 0x8d6e63);
    fillRect(11, 9, 2, 17, 0x4e342e); // straps
    fillRect(19, 9, 2, 17, 0x4e342e);
    fillRect(6, 16, 20, 1, 0x4e342e); // centre seam
    fillRect(14, 5, 2, 4, 0x9aa5b1); // handle
    fillRect(14, 4, 6, 1, 0x9aa5b1);
    fillRect(19, 5, 2, 4, 0x9aa5b1);
    fillRect(8, 12, 3, 2, 0xf1c40f); // luggage tag
    fillRect(7, 26, 4, 3, 0x2b2b2b); // wheels
    fillRect(21, 26, 4, 3, 0x2b2b2b);
    g.generateTexture('suitcase', 32, 32);
    // Boarding pass: stub, perforation and a barcode.
    g.clear();
    fillRect(5, 11, 22, 11, 0xfdfefe);
    fillRect(5, 11, 22, 1, 0xd5dbdb);
    fillRect(5, 21, 22, 1, 0xc8cfd0);
    fillRect(5, 11, 7, 11, 0x2980b9); // airline stub
    fillRect(6, 13, 5, 1, 0xecf0f1);
    fillRect(6, 15, 4, 1, 0xaed6f1);
    fillRect(12, 11, 1, 11, 0xbdc3c7); // perforation
    for (let i = 14; i < 26; i += 2) fillRect(i, 13, 1, 5, 0x2c3e50); // barcode
    fillRect(14, 19, 9, 1, 0x7f8c8d);
    g.generateTexture('ticket', 32, 32);
    // Takeaway cup: domed lid, corrugated sleeve, green roundel.
    g.clear();
    fillRect(11, 12, 11, 16, 0xfdfefe); // cup
    fillRect(19, 12, 3, 16, 0xe5e8e8); // shadow side
    fillRect(10, 9, 13, 3, 0xf4f6f7); // lid
    fillRect(10, 9, 13, 1, 0xffffff);
    fillRect(14, 7, 5, 2, 0xe5e8e8); // sip lid rise
    fillRect(10, 17, 13, 6, 0x9c6b4f); // sleeve
    fillRect(10, 17, 13, 1, 0xb98263);
    for (let i = 11; i < 23; i += 2) fillRect(i, 18, 1, 4, 0x8a5c43); // corrugation
    g.fillStyle(COLORS.starbucks, 1); // roundel
    g.fillCircle(16, 14, 3);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 14, 1);
    fillRect(12, 28, 9, 1, 0xd5dbdb);
    g.generateTexture('coffee', 32, 32);
    // Pint: amber body, foam head, bubbles and a glass highlight.
    g.clear();
    fillRect(10, 12, 12, 16, 0xd68910); // beer
    fillRect(10, 12, 12, 3, 0xf5b041); // lighter near the head
    fillRect(9, 8, 14, 5, 0xfdfefe); // foam
    fillRect(9, 8, 14, 2, 0xffffff);
    fillRect(10, 12, 2, 16, 0xf0c75e); // highlight down the glass
    drawPixel(17, 18, 0xf7dc6f); // bubbles
    drawPixel(15, 22, 0xf7dc6f);
    drawPixel(19, 24, 0xf7dc6f);
    fillRect(10, 27, 12, 2, 0xb9770e); // base of the liquid
    fillRect(9, 29, 14, 2, 0xd7dbdd); // glass foot
    g.generateTexture('beer', 32, 32);
    // Martini: coupe of liquor, stem, foot and an olive on a stick.
    g.clear();
    g.fillStyle(0xd7dbdd, 1); // glass bowl
    g.beginPath(); g.moveTo(8, 8); g.lineTo(24, 8); g.lineTo(16, 20); g.closePath(); g.fill();
    g.fillStyle(COLORS.cocktail, 1); // drink
    g.beginPath(); g.moveTo(10, 10); g.lineTo(22, 10); g.lineTo(16, 18); g.closePath(); g.fill();
    fillRect(10, 10, 12, 1, 0xf5b7f0); // surface highlight
    fillRect(15, 20, 2, 7, 0xd7dbdd); // stem
    fillRect(11, 27, 10, 2, 0xd7dbdd); // foot
    fillRect(11, 27, 10, 1, 0xf4f6f7);
    fillRect(18, 4, 1, 7, 0xecf0f1); // cocktail stick
    g.fillStyle(0x6b8e23, 1); // olive
    g.fillCircle(18, 4, 2);
    drawPixel(18, 4, 0xc0392b);
    g.generateTexture('cocktail', 32, 32);
    // Held slice, drawn to match the slice on the shop's neon sign: golden
    // cheese and red pepperoni rather than a dark sauce wedge.
    g.clear();
    fillRect(3, 5, 26, 6, 0xd9a441); // browned crust along the wide end
    fillRect(3, 5, 26, 2, 0xe6b95c);
    fillRect(3, 10, 26, 1, 0xb9822c);
    g.fillStyle(0xffd166, 1); // cheese
    g.beginPath(); g.moveTo(4, 11); g.lineTo(28, 11); g.lineTo(16, 29); g.closePath(); g.fill();
    g.fillStyle(0xe8b84e, 1); // shaded side of the wedge
    g.beginPath(); g.moveTo(23, 11); g.lineTo(28, 11); g.lineTo(16, 29); g.closePath(); g.fill();
    g.fillStyle(0xff6b6b, 1); // pepperoni, same red as the sign
    g.fillCircle(11, 16, 2); g.fillCircle(20, 15, 2); g.fillCircle(16, 22, 2);
    g.fillStyle(0xd94f4f, 1);
    g.fillRect(10, 17, 3, 1); g.fillRect(19, 16, 3, 1); g.fillRect(15, 23, 3, 1);
    g.generateTexture('pizza_slice', 32, 32);
    g.clear(); g.fillStyle(COLORS.pizza_sauce, 1); g.fillCircle(16,16,16); g.fillStyle(COLORS.pizza_crust, 1); g.fillCircle(16,16,12); g.generateTexture('pizza_logo', 32, 32);
    // Chest of drawers with a lipped top and brass handles.
    g.clear();
    fillRect(0, 0, 64, 5, 0x8d6e63); // top with an overhang
    fillRect(0, 0, 64, 2, 0xa1887f);
    fillRect(2, 5, 60, 25, COLORS.furniture);
    fillRect(54, 5, 8, 25, 0x4a2f26); // shaded side
    for (const y of [7, 15, 23]) {
        fillRect(5, y, 46, 6, 0x6d4c41);
        fillRect(5, y, 46, 1, 0x8d6e63);
        fillRect(14, y + 2, 6, 2, 0xd4a017);
        fillRect(36, y + 2, 6, 2, 0xd4a017);
    }
    fillRect(2, 30, 60, 2, 0x3e2723);
    g.generateTexture('dresser', 64, 32);
    // Sofa: back cushions, two seat cushions, rolled arms and feet.
    g.clear();
    fillRect(0, 2, 64, 12, 0x8d6e63); // back
    fillRect(0, 2, 64, 2, 0xa1887f);
    fillRect(2, 5, 28, 8, 0x9c7b6e); // back cushions
    fillRect(34, 5, 28, 8, 0x9c7b6e);
    fillRect(4, 14, 56, 11, 0x8d6e63); // seat
    fillRect(4, 14, 27, 11, 0x96736a);
    fillRect(33, 14, 27, 11, 0x96736a);
    fillRect(4, 14, 56, 1, 0xa1887f);
    fillRect(0, 4, 8, 22, 0x6d4c41); // arms
    fillRect(56, 4, 8, 22, 0x5d4037);
    fillRect(0, 4, 8, 2, 0x8d6e63);
    fillRect(4, 25, 56, 3, 0x5d4037); // base rail
    fillRect(6, 28, 5, 4, 0x3e2723); // feet
    fillRect(53, 28, 5, 4, 0x3e2723);
    g.generateTexture('couch', 64, 32);
    g.clear(); g.fillStyle(0x1b5e20, 1); g.fillRect(0,0,64,32); g.fillStyle(0x0a3d0a, 1); g.fillRect(0,0,10,32); g.fillRect(54,0,10,32); g.fillRect(0,0,64,10); g.generateTexture('couch_green', 64, 32); 
    g.clear(); g.fillStyle(0x111111, 1); g.fillRect(0,0,64,40); g.fillStyle(0x444444, 1); g.fillRect(2,2,60,36); g.generateTexture('tv', 64, 40); 
    // Lamp post: fluted column, curved arm and a lit head.
    g.clear();
    fillRect(14, 6, 4, 26, 0x4a4a52); // column
    fillRect(14, 6, 1, 26, 0x6a6a74);
    fillRect(12, 29, 8, 3, 0x3a3a42); // base
    fillRect(14, 4, 7, 2, 0x4a4a52); // arm
    fillRect(19, 5, 2, 3, 0x4a4a52);
    g.fillStyle(0x3a3a42, 1); // lamp head
    g.beginPath(); g.moveTo(16, 8); g.lineTo(24, 8); g.lineTo(22, 12); g.lineTo(18, 12); g.closePath(); g.fill();
    g.fillStyle(0xfff3b0, 1);
    g.fillRect(18, 11, 4, 2);
    g.fillStyle(0xfff3b0, 0.35); // glow under the lamp
    g.fillCircle(20, 14, 5);
    g.fillStyle(0xfff3b0, 0.15);
    g.fillCircle(20, 17, 8);
    g.generateTexture('streetlight', 32, 32);
    g.clear(); g.fillStyle(0x5d4037, 1); g.fillRect(12, 16, 8, 16); g.fillStyle(COLORS.lamp_shade, 1); g.beginPath(); g.moveTo(6, 16); g.lineTo(26, 16); g.lineTo(22, 6); g.lineTo(10, 6); g.closePath(); g.fill(); g.generateTexture('lamp', 32, 32);
    // Hotel room door: panelled, with a lever handle, card reader and a number.
    g.clear();
    fillRect(0, 0, 32, 48, 0x4a2f26); // frame
    fillRect(2, 1, 28, 46, 0x6d4c41); // leaf
    fillRect(2, 1, 28, 2, 0x8d6e63);
    fillRect(5, 6, 22, 15, 0x5d4037); // upper panel
    fillRect(6, 7, 20, 13, 0x7b5a49);
    fillRect(5, 26, 22, 15, 0x5d4037); // lower panel
    fillRect(6, 27, 20, 13, 0x7b5a49);
    fillRect(24, 22, 5, 2, 0xd4a017); // lever handle
    fillRect(27, 21, 2, 4, 0xb8860b);
    fillRect(6, 22, 9, 3, 0x2b2b33); // key-card reader
    drawPixel(13, 23, 0x00e676);
    fillRect(12, 3, 9, 3, 0xd4a017); // room number plate
    drawPixel(14, 4, 0x4a2f26); drawPixel(16, 4, 0x4a2f26); drawPixel(18, 4, 0x4a2f26);
    fillRect(1, 8, 2, 4, 0x9aa5b1); // hinges
    fillRect(1, 36, 2, 4, 0x9aa5b1);
    g.generateTexture('door', 32, 48);
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
    
    // Striped tub with a mound of popped kernels spilling over the rim.
    g.clear();
    g.fillStyle(0xfdfdfd, 1); // tapered tub
    g.beginPath(); g.moveTo(7, 18); g.lineTo(25, 18); g.lineTo(22, 31); g.lineTo(10, 31); g.closePath(); g.fill();
    g.fillStyle(0xd93b30, 1); // stripes
    g.fillRect(11, 18, 3, 13);
    g.fillRect(18, 18, 3, 13);
    g.fillStyle(0xe8e8e8, 1); // shaded right side
    g.beginPath(); g.moveTo(22, 18); g.lineTo(25, 18); g.lineTo(22, 31); g.lineTo(20, 31); g.closePath(); g.fill();
    g.fillStyle(0xf4f6f7, 1); // rim
    g.fillRect(6, 16, 20, 3);
    g.fillRect(6, 16, 20, 1);
    // kernels: a light body with a paler pop on top of each
    const kernels = [[9, 11], [14, 8], [19, 10], [7, 14], [22, 13], [16, 12], [12, 14], [20, 15], [5, 16], [24, 16]];
    for (const [kx, ky] of kernels) {
        g.fillStyle(0xf1d9a0, 1);
        g.fillRect(kx, ky, 4, 4);
        g.fillStyle(0xfff6dd, 1);
        g.fillRect(kx + 1, ky - 1, 3, 3);
        g.fillStyle(0xe3c07e, 1);
        g.fillRect(kx + 3, ky + 2, 1, 2);
    }
    g.generateTexture('popcorn', 32, 32);
    
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

    // Modern hotel wall: warm greige with a fine grasscloth weave.
    g.clear();
    fillRect(0, 0, 32, 32, 0xbdb2a4);
    for (let x = 0; x < 32; x += 2) fillRect(x, 0, 1, 32, 0xb5a99a); // vertical weave
    for (let y = 3; y < 32; y += 7) fillRect(0, y, 32, 1, 0xc6bcae); // slubs
    drawPixel(6, 12, 0xa89c8d);
    drawPixel(21, 25, 0xa89c8d);
    fillRect(0, 31, 32, 1, 0xa89c8d);
    g.generateTexture('fancy_wallpaper', 32, 32);

    // Low-pile rug in soft taupe with a woven border.
    g.clear();
    fillRect(0, 0, 64, 64, 0xa89880);
    fillRect(2, 2, 60, 60, 0xb8a992);
    fillRect(5, 5, 54, 54, 0xc3b49c); // inner field
    fillRect(5, 5, 54, 1, 0xcec0a9);
    for (let y = 8; y < 58; y += 4) fillRect(6, y, 52, 1, 0xbdae96); // pile texture
    for (let x = 8; x < 58; x += 9) fillRect(x, 6, 1, 52, 0xbcac94);
    fillRect(10, 10, 44, 2, 0x9c8d76); // quiet border lines
    fillRect(10, 52, 44, 2, 0x9c8d76);
    g.generateTexture('fancy_rug', 64, 64);

    // Modern king: upholstered headboard, white duvet, folded runner.
    g.clear();
    fillRect(0, 0, 80, 15, 0x6f6558); // headboard
    fillRect(0, 0, 80, 2, 0x8a7f70);
    for (let x = 4; x < 78; x += 8) fillRect(x, 3, 6, 11, 0x7b7063); // channel tufting
    fillRect(0, 15, 80, 2, 0x574e44); // shadow under it
    fillRect(3, 18, 34, 12, 0xfbfaf7); // pillows
    fillRect(43, 18, 34, 12, 0xfbfaf7);
    fillRect(3, 18, 34, 2, 0xffffff);
    fillRect(3, 28, 34, 2, 0xe8e5df);
    fillRect(43, 28, 34, 2, 0xe8e5df);
    fillRect(8, 21, 12, 6, 0x33566b); // accent cushions
    fillRect(56, 21, 12, 6, 0x33566b);
    fillRect(2, 31, 76, 31, 0xf7f5f0); // duvet
    fillRect(2, 31, 76, 3, 0xffffff);
    fillRect(70, 31, 8, 31, 0xe6e2da); // shadowed side
    fillRect(2, 45, 76, 10, 0x33566b); // runner across the foot
    fillRect(2, 45, 76, 2, 0x3f6a84);
    fillRect(2, 62, 76, 2, 0xdad5cb);
    fillRect(39, 31, 2, 14, 0xeceae3); // fold between the halves
    g.generateTexture('fancy_bed', 80, 64);

    // Three slim pendants on brushed stems.
    g.clear();
    fillRect(4, 0, 24, 2, 0x8a8176); // ceiling plate
    for (const [x, drop] of [[8, 9], [16, 14], [24, 7]]) {
        fillRect(x, 2, 1, drop, 0x9a9186); // stem
        g.fillStyle(0xf6e7c3, 1); // glass globe
        g.fillCircle(x, drop + 5, 4);
        g.fillStyle(0xfff7e2, 1);
        g.fillCircle(x - 1, drop + 4, 2);
        g.fillStyle(0xffe9a8, 0.28); // glow
        g.fillCircle(x, drop + 6, 7);
    }
    g.generateTexture('chandelier', 32, 32);

    // Drum-shade table lamp on a brushed stem.
    g.clear();
    fillRect(11, 6, 10, 10, 0xf2ece0); // shade
    fillRect(11, 6, 10, 2, 0xfbf7ee);
    fillRect(19, 6, 2, 10, 0xdfd6c6);
    fillRect(15, 16, 2, 10, 0xa39a8c); // stem
    fillRect(12, 26, 8, 2, 0x8a8176); // base
    fillRect(12, 26, 8, 1, 0xb0a698);
    g.fillStyle(0xffe9a8, 0.22); // light spill
    g.fillEllipse(16, 18, 22, 12);
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

    // Moving walkway: treads running lengthways between metal comb edges.
    g.clear();
    fillRect(0, 0, 32, 32, 0x8a9699);
    fillRect(0, 0, 32, 3, 0x6c7679); // comb edges
    fillRect(0, 29, 32, 3, 0x6c7679);
    for (let i = 0; i < 32; i += 4) fillRect(i, 4, 2, 24, 0x9fabae); // treads
    for (let i = 0; i < 32; i += 4) fillRect(i + 2, 4, 1, 24, 0x778285);
    g.fillStyle(0xf1c40f, 1); // direction chevron
    g.beginPath(); g.moveTo(12, 10); g.lineTo(20, 16); g.lineTo(12, 22); g.lineTo(15, 16); g.closePath(); g.fill();
    g.generateTexture('walkway', 32, 32);
    // Burger Queen: red storefront, gold crown over the burger, menu boards.
    g.clear();
    fillRect(0, 6, 64, 42, 0xc0392b); // shopfront
    fillRect(0, 0, 64, 7, 0x922b21); // fascia
    fillRect(0, 6, 64, 1, 0xe74c3c);
    fillRect(6, 12, 22, 16, 0x7b241c); // menu board
    fillRect(8, 14, 18, 2, 0xf7dc6f);
    fillRect(8, 18, 14, 1, 0xf4f6f7);
    fillRect(8, 21, 16, 1, 0xf4f6f7);
    fillRect(8, 24, 11, 1, 0xf4f6f7);
    // burger sign
    fillRect(36, 16, 22, 5, 0xd9a441); // top bun
    fillRect(36, 15, 22, 2, 0xe6b95c);
    fillRect(36, 21, 22, 3, 0x2e7d32); // lettuce
    fillRect(36, 24, 22, 3, 0x8d4b2a); // patty
    fillRect(36, 27, 22, 3, 0xd9a441); // bottom bun
    for (let i = 38; i < 58; i += 5) drawPixel(i, 17, 0xf7e2a8); // sesame
    g.fillStyle(0xf1c40f, 1); // crown above the burger
    g.beginPath();
    g.moveTo(38, 14); g.lineTo(40, 8); g.lineTo(44, 12); g.lineTo(47, 6);
    g.lineTo(50, 12); g.lineTo(54, 8); g.lineTo(56, 14); g.closePath(); g.fill();
    g.fillStyle(0xc0392b, 1);
    g.fillRect(41, 11, 1, 1); g.fillRect(51, 11, 1, 1);
    fillRect(0, 32, 64, 12, 0xe6b0aa); // counter front
    fillRect(0, 32, 64, 2, 0xf2d7d5);
    fillRect(0, 44, 64, 4, 0x7b241c);
    g.generateTexture('store_food', 64, 48);
    // Newsstand: awning, magazine racks with coloured spines, service counter.
    g.clear();
    fillRect(0, 6, 64, 42, 0x2e4a5c); // kiosk body
    fillRect(0, 0, 64, 7, 0x1f3442); // fascia
    for (let i = 0; i < 64; i += 8) fillRect(i, 7, 4, 3, 0xecf0f1); // striped awning
    for (let i = 4; i < 64; i += 8) fillRect(i, 7, 4, 3, 0x2980b9);
    fillRect(4, 14, 26, 20, 0xd7dbdd); // magazine rack
    const spines = [0xe74c3c, 0xf1c40f, 0x27ae60, 0x8e44ad, 0x3498db, 0xe67e22];
    spines.forEach((c, i) => {
        fillRect(6 + i * 4, 16, 3, 7, c);
        fillRect(6 + i * 4, 25, 3, 7, spines[(i + 3) % spines.length]);
    });
    fillRect(34, 14, 26, 12, 0x1b2f3a); // window
    fillRect(36, 16, 22, 8, 0x5d8aa8);
    fillRect(36, 16, 22, 2, 0x8fb8ce);
    fillRect(34, 30, 26, 14, 0x8d6e63); // counter
    fillRect(34, 30, 26, 2, 0xa1887f);
    fillRect(40, 34, 6, 4, 0xf4f6f7); // newspapers on the counter
    fillRect(48, 34, 6, 4, 0xecf0f1);
    fillRect(0, 44, 64, 4, 0x16242d); // kick plate
    g.generateTexture('store_news', 64, 48);
    
    // Framed travel poster: sun over a headland with the sea below.
    g.clear();
    fillRect(0, 0, 32, 48, 0x4e342e); // frame
    fillRect(2, 2, 28, 44, 0xf6d8a0); // sky
    fillRect(2, 2, 28, 14, 0xf3b664);
    g.fillStyle(0xf39c12, 1); // sun
    g.fillCircle(22, 12, 6);
    g.fillStyle(0x1a6985, 1); // sea
    g.fillRect(2, 28, 28, 18);
    g.fillStyle(0x2e86ab, 1);
    g.fillRect(2, 28, 28, 4);
    g.fillStyle(0x3d5a3a, 1); // headland
    g.beginPath(); g.moveTo(2, 30); g.lineTo(12, 18); g.lineTo(22, 30); g.closePath(); g.fill();
    fillRect(6, 34, 4, 1, 0x9fd6e8); // surf
    fillRect(16, 38, 7, 1, 0x9fd6e8);
    fillRect(4, 41, 24, 4, 0xf9f3e3); // caption strip
    fillRect(6, 42, 20, 2, 0xc0392b);
    g.generateTexture('poster', 32, 48);
    // Terminal glazing: mullions, sky, distant tarmac and a reflection streak.
    g.clear();
    fillRect(0, 0, 100, 100, 0x6b7679); // frame
    fillRect(4, 4, 92, 92, 0x86c5e0); // sky
    fillRect(4, 4, 92, 30, 0x9ed4ea);
    fillRect(4, 66, 92, 30, 0x7a8b90); // tarmac
    fillRect(4, 66, 92, 2, 0x5f6d71);
    fillRect(10, 78, 40, 2, 0xf1c40f); // runway markings
    fillRect(58, 86, 30, 2, 0xf1c40f);
    fillRect(4, 60, 92, 6, 0xb8c4c7); // distant terminal
    fillRect(12, 54, 10, 6, 0xa4b1b5);
    fillRect(60, 52, 14, 8, 0xa4b1b5);
    g.fillStyle(0xffffff, 0.35); // reflection
    g.fillRect(14, 8, 10, 80);
    g.fillRect(30, 8, 4, 80);
    fillRect(48, 4, 4, 92, 0x6b7679); // mullions
    fillRect(4, 48, 92, 4, 0x6b7679);
    g.generateTexture('large_window', 100, 100);
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

    // Bar: polished top with a lip, panelled front and a brass foot rail.
    g.clear();
    fillRect(0, 0, 32, 5, 0x8d6e63); // top
    fillRect(0, 0, 32, 2, 0xa9846f); // sheen
    fillRect(0, 5, 32, 2, 0x4e342e); // lip shadow
    fillRect(0, 7, 32, 19, 0x5d4037); // front
    fillRect(0, 7, 1, 19, 0x4e342e);
    fillRect(6, 10, 8, 13, 0x4e342e); // panels
    fillRect(18, 10, 8, 13, 0x4e342e);
    fillRect(7, 11, 6, 11, 0x63483c);
    fillRect(19, 11, 6, 11, 0x63483c);
    fillRect(0, 26, 32, 2, 0xd4a017); // brass foot rail
    fillRect(0, 26, 32, 1, 0xf0c75e);
    fillRect(0, 28, 32, 4, 0x3e2723); // kick
    g.generateTexture('bar_counter', 32, 32);
    // Stool: buttoned leather seat, chrome column and foot ring.
    g.clear();
    g.fillStyle(0x7b241c, 1); // seat
    g.fillEllipse(16, 10, 20, 11);
    g.fillStyle(0x9c3226, 1);
    g.fillEllipse(16, 8, 16, 7);
    g.fillStyle(0x5b1a14, 1);
    g.fillRect(6, 12, 20, 3); // seat rim
    drawPixel(16, 8, 0x5b1a14); // button
    fillRect(14, 15, 4, 11, 0xaeb6b8); // column
    fillRect(14, 15, 1, 11, 0xd7dbdd);
    fillRect(9, 21, 14, 2, 0x9aa5b1); // foot ring
    g.fillStyle(0x8a9699, 1); // base
    g.fillEllipse(16, 29, 20, 5);
    g.fillStyle(0x6c7679, 1);
    g.fillRect(6, 30, 20, 2);
    g.generateTexture('bar_stool', 32, 32);
    // Backbar: bottles of different heights on a lit timber shelf.
    g.clear();
    fillRect(0, 22, 32, 3, 0x4e342e); // shelf
    fillRect(0, 22, 32, 1, 0x7b5a49);
    fillRect(0, 25, 32, 1, 0x2b1a14); // shadow under the shelf
    const bottles = [
        { x: 2, h: 16, body: 0x2e7d32, cap: 0xd4a017 },
        { x: 8, h: 20, body: 0x8b1a1a, cap: 0xecf0f1 },
        { x: 14, h: 13, body: 0xd4a017, cap: 0x4e342e },
        { x: 19, h: 18, body: 0x1a5276, cap: 0xd7dbdd },
        { x: 25, h: 15, body: 0x6c3483, cap: 0xd4a017 }
    ];
    for (const b of bottles) {
        const top = 22 - b.h;
        fillRect(b.x, top + 3, 4, b.h - 3, b.body); // body
        fillRect(b.x + 1, top, 2, 4, b.body); // neck
        fillRect(b.x + 1, top - 1, 2, 1, b.cap); // cap
        fillRect(b.x, top + 3, 1, b.h - 3, 0xffffff); // glass highlight
        fillRect(b.x, top + 8, 4, 3, 0xf4f6f7); // label
    }
    g.generateTexture('bar_shelf', 32, 32);
    // Exposed brick: offset courses, mortar lines and slight tone variation.
    g.clear();
    fillRect(0, 0, 32, 32, 0x6b4235); // mortar
    const brick = [0x8d5a45, 0x7d4e3b, 0x99644d, 0x84543f];
    for (let row = 0; row < 4; row++) {
        const y = row * 8;
        const offset = row % 2 ? -8 : 0;
        for (let i = 0; i < 3; i++) {
            const x = offset + i * 16;
            fillRect(Math.max(x, 0), y + 1, x < 0 ? 16 + x : Math.min(15, 32 - x), 6, brick[(row + i) % 4]);
        }
    }
    fillRect(0, 1, 32, 1, 0x9c6b55); // top highlight on each course
    fillRect(0, 17, 32, 1, 0x9c6b55);
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
    // --- AIRPORT TERMINAL FURNITURE ------------------------------------------
    // Check-in desk: counter, agent monitor, bag scale and queue signage.
    g.clear();
    fillRect(0, 10, 64, 22, 0x34495e); // counter body
    fillRect(0, 10, 64, 3, 0x4a6076); // worktop
    fillRect(0, 29, 64, 3, 0x22303d); // kick shadow
    for (let i = 4; i < 64; i += 12) fillRect(i, 15, 8, 12, 0x2c3e50); // panel seams
    fillRect(6, 2, 18, 9, 0x1b2631); // monitor
    fillRect(8, 4, 14, 5, 0x5dade2);
    fillRect(8, 4, 14, 1, 0xaeddf5);
    fillRect(13, 11, 4, 2, 0x1b2631); // monitor stand
    fillRect(40, 4, 20, 7, 0xecf0f1); // bag scale platform
    fillRect(40, 4, 20, 2, 0xffffff);
    fillRect(44, 11, 12, 2, 0x95a5a6);
    fillRect(28, 0, 10, 12, 0x2980b9); // hanging sign
    fillRect(30, 2, 6, 2, 0xecf0f1);
    g.generateTexture('checkin_desk', 64, 32);

    // Departures board: dark panel with flip rows and a status column.
    g.clear();
    fillRect(0, 0, 96, 56, 0x1b2631);
    fillRect(0, 0, 96, 8, 0x2c3e50);
    fillRect(4, 2, 30, 4, 0xf1c40f); // "DEPARTURES" bar
    for (let r = 0; r < 6; r++) {
        const y = 11 + r * 7;
        fillRect(4, y, 24, 4, 0xd7dbdd); // destination
        fillRect(32, y, 14, 4, 0x95a5a6); // flight no
        fillRect(50, y, 16, 4, 0x95a5a6); // time
        fillRect(70, y, 22, 4, r % 3 === 0 ? 0x27ae60 : 0xe67e22); // status
        fillRect(0, y + 5, 96, 1, 0x141d26); // row divider
    }
    fillRect(0, 53, 96, 3, 0x0e1519);
    g.generateTexture('departure_board', 96, 56);

    // Gate seating: a run of linked chairs on a steel rail.
    g.clear();
    for (let i = 0; i < 4; i++) {
        const x = i * 16;
        fillRect(x + 1, 4, 14, 9, 0x2980b9); // seat back
        fillRect(x + 1, 4, 14, 2, 0x5dade2);
        fillRect(x + 1, 13, 14, 5, 0x22648f); // cushion
        fillRect(x, 6, 2, 12, 0x7f8c8d); // arm rest
    }
    fillRect(62, 6, 2, 12, 0x7f8c8d);
    fillRect(0, 18, 64, 3, 0x95a5a6); // rail
    for (let i = 6; i < 64; i += 16) fillRect(i, 21, 3, 3, 0x6c7679); // legs
    g.generateTexture('gate_seats', 64, 24);

    // Security arch: metal detector with a status light and a scuffed base.
    g.clear();
    fillRect(2, 0, 10, 64, 0xd7dbdd); // uprights
    fillRect(36, 0, 10, 64, 0xc3cacd);
    fillRect(2, 0, 44, 10, 0xe5e8e8); // header
    fillRect(2, 0, 44, 2, 0xf4f6f7);
    fillRect(20, 3, 8, 4, 0x27ae60); // status light
    fillRect(4, 12, 6, 40, 0xaeb6b8); // sensor strips
    fillRect(38, 12, 6, 40, 0x9aa5b1);
    fillRect(0, 58, 14, 6, 0x7f8c8d); // feet
    fillRect(34, 58, 14, 6, 0x6c7679);
    g.generateTexture('security_arch', 48, 64);

    // Coffee kiosk: green fascia, cup sign, counter with a machine.
    g.clear();
    fillRect(0, 8, 64, 40, 0x0b6b4f); // body
    fillRect(0, 0, 64, 9, COLORS.starbucks);
    fillRect(0, 8, 64, 1, 0x138a68);
    g.fillStyle(0xffffff, 1); // cup roundel on the fascia
    g.fillCircle(12, 4, 3);
    fillRect(20, 2, 30, 4, 0xd5f5e3);
    fillRect(4, 14, 24, 18, 0x0e5c45); // menu panel
    fillRect(6, 16, 20, 2, 0xf7dc6f);
    fillRect(6, 20, 16, 1, 0xd5f5e3);
    fillRect(6, 23, 18, 1, 0xd5f5e3);
    fillRect(6, 26, 12, 1, 0xd5f5e3);
    fillRect(34, 14, 26, 14, 0x8d6e63); // counter top
    fillRect(34, 14, 26, 2, 0xa1887f);
    fillRect(38, 6, 14, 9, 0x95a5a6); // espresso machine
    fillRect(40, 8, 4, 4, 0x2c3e50);
    fillRect(46, 8, 4, 4, 0x2c3e50);
    fillRect(52, 18, 4, 6, 0xfdfefe); // cups stacked
    fillRect(57, 18, 4, 6, 0xfdfefe);
    fillRect(0, 44, 64, 4, 0x074231);
    g.generateTexture('coffee_kiosk', 64, 48);

    // Restroom door pair with pictograms.
    g.clear();
    fillRect(0, 0, 32, 48, 0x6d4c41); // frame
    fillRect(2, 2, 13, 44, 0x3f6fa5); // men
    fillRect(17, 2, 13, 44, 0x9b5aa5); // women
    fillRect(2, 2, 13, 2, 0x5487bd);
    fillRect(17, 2, 13, 2, 0xb277bb);
    g.fillStyle(0xf4f6f7, 1);
    g.fillCircle(8, 12, 2); // male pictogram
    g.fillRect(6, 15, 5, 8);
    g.fillRect(6, 23, 2, 7); g.fillRect(9, 23, 2, 7);
    g.fillCircle(23, 12, 2); // female pictogram
    g.beginPath(); g.moveTo(23, 15); g.lineTo(19, 26); g.lineTo(27, 26); g.closePath(); g.fill();
    g.fillRect(21, 26, 2, 5); g.fillRect(24, 26, 2, 5);
    fillRect(13, 22, 2, 3, 0xf1c40f); // handles
    fillRect(17, 22, 2, 3, 0xf1c40f);
    g.generateTexture('restroom_door', 32, 48);

    // Luggage trolley stacked with cases.
    g.clear();
    fillRect(4, 20, 40, 4, 0x95a5a6); // deck
    fillRect(4, 8, 3, 14, 0x7f8c8d); // upright
    fillRect(4, 6, 16, 3, 0x7f8c8d); // handle
    fillRect(10, 10, 16, 10, 0x6d4c41); // case
    fillRect(10, 10, 16, 2, 0x8d6e63);
    fillRect(16, 10, 2, 10, 0x4e342e);
    fillRect(26, 13, 14, 7, 0x2c3e50); // second case
    fillRect(26, 13, 14, 2, 0x3f5872);
    fillRect(31, 13, 2, 7, 0x1b2631);
    g.fillStyle(0x2b2b2b, 1); // wheels
    g.fillCircle(11, 27, 4); g.fillCircle(38, 27, 4);
    g.fillStyle(0x95a5a6, 1);
    g.fillCircle(11, 27, 1); g.fillCircle(38, 27, 1);
    g.generateTexture('luggage_cart', 48, 32);

    // Terminal bin with a swing flap.
    g.clear();
    fillRect(2, 6, 12, 18, 0x5d6d7e); // body
    fillRect(10, 6, 4, 18, 0x4a5765);
    fillRect(1, 3, 14, 4, 0x34495e); // lid
    fillRect(1, 3, 14, 1, 0x5d6d7e);
    fillRect(5, 5, 6, 1, 0x22303d); // flap slot
    fillRect(3, 11, 10, 1, 0x8a9aa8); // band
    fillRect(2, 23, 12, 1, 0x2c3e50);
    g.generateTexture('trash_bin', 16, 24);
    // --- BAR FITTINGS AND PLANT VARIETIES ------------------------------------
    // Beer tap tower: three handles on a chrome column with a drip tray.
    g.clear();
    fillRect(12, 4, 8, 18, 0xaeb6b8); // column
    fillRect(12, 4, 2, 18, 0xd7dbdd);
    fillRect(11, 2, 10, 3, 0x8a9699); // cap
    for (let i = 0; i < 3; i++) {
        const x = 4 + i * 8;
        fillRect(x, 10, 3, 6, 0x9aa5b1); // spout arm
        fillRect(x, 8, 3, 3, [0x2e7d32, 0xc0392b, 0xd4a017][i]); // handle
    }
    fillRect(2, 22, 28, 3, 0x6c7679); // drip tray
    fillRect(2, 22, 28, 1, 0x9aa5b1);
    for (let i = 4; i < 30; i += 4) drawPixel(i, 23, 0x4a5257);
    g.generateTexture('bar_taps', 32, 32);

    // Neon sign: a glowing cocktail glass inside a tube border.
    g.clear();
    g.fillStyle(0x14121c, 1);
    g.fillRect(0, 0, 64, 32);
    g.fillStyle(0xff2d95, 0.25); // outer glow
    g.fillRect(2, 2, 60, 28);
    g.fillStyle(0xff2d95, 1); // tube border
    g.fillRect(4, 4, 56, 2); g.fillRect(4, 26, 56, 2);
    g.fillRect(4, 4, 2, 24); g.fillRect(58, 4, 2, 24);
    g.fillStyle(0x00e5ff, 0.3); // glass glow
    g.fillRect(20, 8, 24, 18);
    g.fillStyle(0x00e5ff, 1); // martini glass in neon
    g.beginPath(); g.moveTo(22, 10); g.lineTo(42, 10); g.lineTo(34, 19); g.lineTo(30, 19); g.closePath(); g.fill();
    g.fillRect(31, 19, 2, 5);
    g.fillRect(27, 23, 10, 2);
    g.fillStyle(0xffffff, 0.85);
    g.fillRect(24, 11, 14, 1);
    g.generateTexture('neon_sign', 64, 32);

    // Dartboard with two darts in the top scoring beds.
    g.clear();
    g.fillStyle(0x2b1a14, 1); g.fillCircle(12, 12, 12); // surround
    g.fillStyle(0xf4f0d8, 1); g.fillCircle(12, 12, 10); // board
    g.fillStyle(0x1c1c1c, 1);
    for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i;
        g.beginPath();
        g.moveTo(12, 12);
        g.lineTo(12 + Math.cos(a) * 10, 12 + Math.sin(a) * 10);
        g.lineTo(12 + Math.cos(a + 0.39) * 10, 12 + Math.sin(a + 0.39) * 10);
        g.closePath(); g.fill();
    }
    g.fillStyle(0x2e7d32, 1); g.fillCircle(12, 12, 4);
    g.fillStyle(0xc0392b, 1); g.fillCircle(12, 12, 2);
    g.fillStyle(0xecf0f1, 1); // darts
    g.fillRect(14, 4, 5, 1); g.fillRect(17, 3, 2, 3);
    g.fillRect(6, 7, 5, 1); g.fillRect(5, 6, 2, 3);
    g.generateTexture('dartboard', 24, 24);

    // Pendant lamp: flex, brass cone and the pool of light under it.
    g.clear();
    fillRect(7, 0, 2, 8, 0x2b2b2b); // flex
    g.fillStyle(0xb8860b, 1); // shade
    g.beginPath(); g.moveTo(8, 8); g.lineTo(1, 18); g.lineTo(15, 18); g.closePath(); g.fill();
    g.fillStyle(0xd4a017, 1);
    g.beginPath(); g.moveTo(8, 9); g.lineTo(4, 17); g.lineTo(9, 17); g.closePath(); g.fill();
    fillRect(1, 18, 14, 1, 0x8a6508);
    g.fillStyle(0xffe9a8, 1); // bulb
    g.fillCircle(8, 19, 2);
    g.fillStyle(0xffd76e, 0.35); // light pool
    g.fillEllipse(8, 24, 16, 8);
    g.fillStyle(0xffd76e, 0.18);
    g.fillEllipse(8, 26, 14, 6);
    g.generateTexture('pendant_lamp', 16, 28);

    // Fern in a woven basket.
    g.clear();
    fillRect(9, 23, 14, 9, 0xa9762f); // basket
    fillRect(20, 23, 3, 9, 0x8a5f24);
    for (let i = 10; i < 23; i += 3) fillRect(i, 24, 2, 7, 0xc08a3e); // weave
    fillRect(9, 22, 14, 2, 0xc9a05a); // rim
    g.fillStyle(0x2e7d32, 1); // arching fronds
    g.fillEllipse(16, 16, 8, 14);
    g.fillEllipse(8, 15, 8, 11);
    g.fillEllipse(24, 15, 8, 11);
    g.fillEllipse(11, 8, 7, 9);
    g.fillEllipse(21, 8, 7, 9);
    g.fillStyle(0x43a047, 1);
    g.fillEllipse(16, 12, 6, 10);
    g.fillEllipse(10, 12, 5, 7);
    g.fillEllipse(22, 12, 5, 7);
    g.fillStyle(0x1b5e20, 1); // depth between fronds
    fillRect(15, 18, 2, 5, 0x1b5e20);
    g.fillStyle(0x81c784, 1); // new growth
    g.fillEllipse(16, 5, 4, 5);
    g.generateTexture('plant_fern', 32, 32);

    // Snake plant: tall upright blades in a cylinder pot.
    g.clear();
    fillRect(10, 24, 12, 8, 0xcfd8dc); // pot
    fillRect(18, 24, 4, 8, 0xb0bec5);
    fillRect(10, 23, 12, 2, 0xeceff1); // rim
    fillRect(11, 26, 10, 1, 0xb0bec5);
    const blades = [
        { x: 11, top: 6, w: 3 },
        { x: 14, top: 2, w: 3 },
        { x: 17, top: 5, w: 3 },
        { x: 20, top: 9, w: 2 }
    ];
    for (const b of blades) {
        fillRect(b.x, b.top, b.w, 24 - b.top, 0x2e7d32);
        fillRect(b.x, b.top, 1, 24 - b.top, 0x66bb6a); // lit edge
        fillRect(b.x + b.w - 1, b.top + 2, 1, 22 - b.top, 0x1b5e20);
        fillRect(b.x, b.top, b.w, 2, 0xd4c04a); // yellow tip
    }
    g.generateTexture('plant_snake', 32, 32);

    // Flowering pot: mounded foliage with blooms.
    g.clear();
    fillRect(10, 23, 12, 9, 0xb5651d); // pot
    fillRect(18, 23, 4, 9, 0x8f4e15);
    fillRect(9, 21, 14, 3, 0xcd7f32); // rim
    fillRect(9, 21, 14, 1, 0xe09a4e);
    g.fillStyle(0x2e7d32, 1); // foliage
    g.fillEllipse(16, 15, 20, 14);
    g.fillStyle(0x43a047, 1);
    g.fillEllipse(12, 13, 11, 9);
    g.fillEllipse(21, 14, 10, 8);
    const blooms = [
        { x: 9, y: 12, c: 0xe91e63 },
        { x: 16, y: 8, c: 0xffeb3b },
        { x: 23, y: 12, c: 0xe91e63 },
        { x: 13, y: 17, c: 0xff7043 },
        { x: 20, y: 18, c: 0xffeb3b }
    ];
    for (const b of blooms) {
        g.fillStyle(b.c, 1);
        g.fillCircle(b.x, b.y, 2);
        drawPixel(b.x, b.y, 0xfff59d);
    }
    g.generateTexture('plant_flowers', 32, 32);
    // --- MIKE'S DANCE POSES --------------------------------------------------
    // Held-F dancing cycles these instead of flashing random tints. Same 32x32
    // footprint and the same blue tee as 'mike', so only the limbs change.
    const TEE = 0x3498db;
    const TEE_SHADE = 0x2f86c4;
    const JEANS = 0x34495e;
    const JEANS_SHADE = 0x2c3e50;
    const SHOE_L = 0xecf0f1;
    const SHOE_R = 0xd5dbdb;

    const danceHead = () => {
        drawFace(5, { brow: HAIR_SHADE });
        drawShortHair(HAIR, HAIR_HI, HAIR_SHADE);
        fillRect(13, 15, 6, 2, SKIN_SHADE); // neck
    };

    // Arms swung across to the right, hips counter-swung left.
    g.clear();
    danceHead();
    fillRect(9, 17, 12, 9, TEE);
    fillRect(19, 17, 2, 9, TEE_SHADE);
    fillRect(12, 17, 6, 2, 0x2980b9); // collar
    fillRect(21, 14, 6, 3, TEE); // lead arm out high
    fillRect(26, 13, 3, 3, SKIN);
    fillRect(11, 22, 10, 3, TEE_SHADE); // trailing arm across the body
    fillRect(7, 22, 4, 3, SKIN);
    fillRect(9, 26, 12, 1, 0x2c2c2c); // belt
    fillRect(12, 27, 4, 4, JEANS);
    fillRect(17, 27, 4, 4, JEANS_SHADE);
    fillRect(11, 31, 5, 1, SHOE_L);
    fillRect(17, 31, 5, 1, SHOE_R);
    g.generateTexture('mike_dance_1', 32, 32);

    // The mirror of it — the swing back the other way.
    g.clear();
    danceHead();
    fillRect(11, 17, 12, 9, TEE);
    fillRect(21, 17, 2, 9, TEE_SHADE);
    fillRect(14, 17, 6, 2, 0x2980b9);
    fillRect(5, 14, 6, 3, TEE); // lead arm out high, other side
    fillRect(3, 13, 3, 3, SKIN);
    fillRect(11, 22, 10, 3, TEE_SHADE);
    fillRect(21, 22, 4, 3, SKIN);
    fillRect(11, 26, 12, 1, 0x2c2c2c);
    fillRect(12, 27, 4, 4, JEANS);
    fillRect(17, 27, 4, 4, JEANS_SHADE);
    fillRect(11, 31, 5, 1, SHOE_L);
    fillRect(17, 31, 5, 1, SHOE_R);
    g.generateTexture('mike_dance_2', 32, 32);

    // One arm bent to the forehead, opposite leg kicked out.
    // Arm bent over the brow in an L, opposite leg kicked out.
    g.clear();
    danceHead();
    fillRect(10, 17, 12, 9, TEE);
    fillRect(20, 17, 2, 9, TEE_SHADE);
    fillRect(13, 17, 6, 2, 0x2980b9);
    fillRect(22, 9, 3, 9, TEE); // upper arm straight up from the shoulder
    fillRect(16, 6, 9, 3, TEE); // forearm folded back across the brow
    fillRect(13, 6, 3, 3, SKIN); // hand resting on the forehead
    fillRect(7, 18, 3, 7, TEE); // other arm hanging
    fillRect(7, 25, 3, 3, SKIN);
    fillRect(10, 26, 12, 1, 0x2c2c2c);
    fillRect(12, 27, 4, 5, JEANS); // planted leg
    fillRect(16, 26, 6, 3, JEANS_SHADE); // thigh swinging out
    fillRect(21, 24, 5, 3, JEANS_SHADE); // shin kicked up
    fillRect(25, 23, 5, 2, SHOE_R);
    fillRect(11, 31, 5, 1, SHOE_L);
    g.generateTexture('mike_dance_3', 32, 32);

    // Both arms up in a V, feet apart and off the floor.
    g.clear();
    danceHead();
    fillRect(10, 17, 12, 9, TEE);
    fillRect(20, 17, 2, 9, TEE_SHADE);
    fillRect(13, 17, 6, 2, 0x2980b9);
    fillRect(6, 9, 3, 9, TEE); // arms up and out
    fillRect(4, 6, 3, 3, SKIN);
    fillRect(23, 9, 3, 9, TEE_SHADE);
    fillRect(25, 6, 3, 3, SKIN);
    fillRect(10, 26, 12, 1, 0x2c2c2c);
    fillRect(9, 27, 4, 3, JEANS); // legs apart, airborne
    fillRect(19, 27, 4, 3, JEANS_SHADE);
    fillRect(8, 30, 5, 1, SHOE_L);
    fillRect(19, 30, 5, 1, SHOE_R);
    g.generateTexture('mike_dance_4', 32, 32);

    // --- CLUB FITTINGS -------------------------------------------------------
    // Lit glass dance-floor panel. Scenes tint these to chase colour on the beat.
    g.clear();
    fillRect(0, 0, 32, 32, 0xffffff);
    fillRect(0, 0, 32, 2, 0xd9d9d9); // panel edges
    fillRect(0, 30, 32, 2, 0xbfbfbf);
    fillRect(0, 0, 2, 32, 0xd9d9d9);
    fillRect(30, 0, 2, 32, 0xbfbfbf);
    fillRect(4, 4, 12, 12, 0xf2f2f2); // glass sheen
    fillRect(18, 18, 9, 9, 0xe8e8e8);
    g.generateTexture('dance_floor_tile', 32, 32);

    // DJ booth: decks, mixer, laptop and a lit front panel.
    g.clear();
    fillRect(0, 12, 64, 28, 0x161622); // booth body
    fillRect(0, 12, 64, 2, 0x2a2a40);
    fillRect(2, 18, 60, 10, 0xff2d95); // lit front
    fillRect(2, 18, 60, 2, 0xff7ac0);
    for (let i = 4; i < 62; i += 6) fillRect(i, 21, 3, 5, 0x8e0f52); // grille slots
    fillRect(0, 34, 64, 6, 0x0d0d16);
    fillRect(4, 2, 18, 11, 0x2b2b3a); // left deck
    fillRect(26, 4, 12, 9, 0x1f1f2b); // mixer
    fillRect(42, 2, 18, 11, 0x2b2b3a); // right deck
    g.fillStyle(0x0d0d14, 1);
    g.fillCircle(13, 7, 4); g.fillCircle(51, 7, 4); // platters
    g.fillStyle(0xd7dbdd, 1);
    g.fillCircle(13, 7, 1); g.fillCircle(51, 7, 1);
    fillRect(28, 6, 8, 1, 0x00e5ff); // mixer faders
    fillRect(28, 9, 8, 1, 0x00e5ff);
    drawPixel(31, 6, 0xffffff);
    drawPixel(34, 9, 0xffffff);
    g.generateTexture('dj_booth', 64, 40);

    // PA stack: two woofers, a horn and a status LED.
    g.clear();
    fillRect(0, 0, 32, 64, 0x1b1b22);
    fillRect(0, 0, 32, 2, 0x33333f);
    fillRect(0, 62, 32, 2, 0x0d0d12);
    fillRect(2, 2, 28, 60, 0x24242e);
    g.fillStyle(0x12121a, 1); // woofers
    g.fillCircle(16, 18, 11); g.fillCircle(16, 44, 11);
    g.fillStyle(0x2f2f3d, 1);
    g.fillCircle(16, 18, 7); g.fillCircle(16, 44, 7);
    g.fillStyle(0x0a0a10, 1);
    g.fillCircle(16, 18, 3); g.fillCircle(16, 44, 3);
    fillRect(8, 4, 16, 6, 0x12121a); // horn
    fillRect(10, 5, 12, 4, 0x2f2f3d);
    drawPixel(28, 60, 0x00ff88); // power LED
    g.generateTexture('speaker_stack', 32, 64);

    // Mirror ball: facet grid with a highlight and a hanging stem.
    g.clear();
    fillRect(15, 0, 2, 5, 0x555561); // stem
    g.fillStyle(0x8f9bb3, 1);
    g.fillCircle(16, 18, 12);
    g.fillStyle(0xb9c6de, 1);
    g.fillCircle(13, 15, 8); // lit side
    g.fillStyle(0x6b7690, 1);
    for (let y = 7; y < 30; y += 4) fillRect(4, y, 24, 1, 0x6b7690); // facet lines
    for (let x = 5; x < 29; x += 4) fillRect(x, 7, 1, 22, 0x6b7690);
    g.fillStyle(0xffffff, 1); // specular hits
    g.fillRect(10, 11, 3, 3);
    g.fillRect(19, 21, 2, 2);
    g.generateTexture('disco_ball', 32, 32);

    // Neon-fronted bar panel.
    // Bar face. The club bar runs top-to-bottom, so the neon accent runs down
    // the tile edge — a horizontal strip would ladder every 32px when stacked.
    g.clear();
    fillRect(0, 0, 32, 32, 0x14141c);
    fillRect(0, 0, 3, 32, 0x00e5ff); // lit edge facing the room
    fillRect(1, 0, 1, 32, 0x9ff6ff);
    fillRect(3, 0, 3, 32, 0x08323d); // glow spill
    fillRect(29, 0, 3, 32, 0x1d1d28); // shadowed back edge
    fillRect(10, 0, 1, 32, 0x1b1b26); // panel seams, vertical
    fillRect(20, 0, 1, 32, 0x1b1b26);
    g.generateTexture('club_bar_front', 32, 32);

    // Backlit spirits shelf.
    g.clear();
    fillRect(0, 0, 32, 32, 0x101018);
    fillRect(0, 22, 32, 3, 0x2b2b3a); // shelf
    fillRect(0, 22, 32, 1, 0x00e5ff); // underlight
    const clubBottles = [
        { x: 3, h: 15, c: 0x00e5ff },
        { x: 9, h: 19, c: 0xff2d95 },
        { x: 15, h: 13, c: 0xaeea00 },
        { x: 20, h: 17, c: 0xffc400 },
        { x: 26, h: 15, c: 0xb388ff }
    ];
    for (const b of clubBottles) {
        const top = 22 - b.h;
        fillRect(b.x, top + 3, 4, b.h - 3, b.c);
        fillRect(b.x + 1, top, 2, 4, b.c);
        fillRect(b.x, top + 3, 1, b.h - 3, 0xffffff);
    }
    g.generateTexture('club_shelf', 32, 32);

    // Music note that floats off Mike while he dances.
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(3, 6, 2);
    g.fillRect(4, 1, 1, 5);
    g.fillRect(5, 1, 3, 1);
    g.generateTexture('music_note', 8, 8);
    // --- MARINE DANCE POSES --------------------------------------------------
    // The squad dances too, but with their own moves — nothing shared with
    // Mike's set, so a glance at the floor tells you who is who.
    const USMC = COLORS.marine;
    const USMC_SHADE = 0x24471f;
    const USMC_DARK = 0x1e3a1a;

    const marineHead = () => {
        drawFace(5, { brow: 0x2b1e13 });
        drawShortHair(0x3e2b1c, 0x5a412a, 0x2b1e13);
        fillRect(9, 1, 14, 4, USMC_DARK); // cap
        fillRect(9, 4, 14, 1, 0x152b13);
        fillRect(8, 5, 16, 1, 0x152b13); // brim
        fillRect(13, 15, 6, 2, SKIN_SHADE); // neck
    };

    const marineTorso = () => {
        fillRect(10, 17, 12, 9, USMC);
        fillRect(20, 17, 2, 9, USMC_SHADE);
        fillRect(12, 18, 2, 1, 0xf1c40f); // collar insignia
        fillRect(10, 26, 12, 1, 0x1b1b1b); // belt
    };

    // Disco point: one arm thrown up on the diagonal, the other hand on the hip.
    g.clear();
    marineHead();
    marineTorso();
    fillRect(22, 12, 3, 6, USMC); // upper arm angled up
    fillRect(25, 7, 3, 6, USMC);
    fillRect(27, 4, 3, 3, SKIN); // pointing hand
    fillRect(7, 19, 3, 5, USMC_SHADE); // hand on the hip
    fillRect(7, 23, 4, 3, SKIN);
    fillRect(12, 27, 4, 4, USMC_SHADE);
    fillRect(17, 27, 4, 4, USMC_DARK);
    fillRect(11, 31, 5, 1, 0x1b1b1b);
    fillRect(17, 31, 5, 1, 0x111111);
    g.generateTexture('marine_dance_1', 32, 32);

    // Raise the roof: both forearms up, palms to the ceiling.
    g.clear();
    marineHead();
    marineTorso();
    fillRect(6, 12, 3, 6, USMC); // left arm bent up
    fillRect(6, 9, 4, 3, SKIN);
    fillRect(23, 12, 3, 6, USMC_SHADE); // right arm bent up
    fillRect(22, 9, 4, 3, SKIN_SHADE);
    fillRect(11, 27, 4, 4, USMC_SHADE);
    fillRect(17, 27, 4, 4, USMC_DARK);
    fillRect(10, 31, 5, 1, 0x1b1b1b);
    fillRect(17, 31, 5, 1, 0x111111);
    g.generateTexture('marine_dance_2', 32, 32);

    // The robot: one forearm level at the chest, the other cranked up square.
    g.clear();
    marineHead();
    marineTorso();
    fillRect(4, 19, 7, 3, USMC); // arm straight out
    fillRect(2, 19, 3, 3, SKIN);
    fillRect(22, 19, 3, 3, USMC_SHADE); // elbow out
    fillRect(24, 12, 3, 8, USMC_SHADE); // forearm straight up
    fillRect(24, 9, 3, 3, SKIN_SHADE);
    fillRect(12, 27, 4, 5, USMC_SHADE); // stiff stance
    fillRect(17, 27, 4, 5, USMC_DARK);
    fillRect(11, 31, 5, 1, 0x1b1b1b);
    fillRect(17, 31, 5, 1, 0x111111);
    g.generateTexture('marine_dance_3', 32, 32);

    // --- CLUB BAR FITTINGS ---------------------------------------------------
    // Counter top: black gloss with a neon edge and a wet-look reflection.
    // Counter top: black gloss with the lit rim down the customer side.
    g.clear();
    fillRect(0, 0, 32, 32, 0x16161f);
    fillRect(0, 0, 2, 32, 0xff2d95); // neon rim
    fillRect(2, 0, 2, 32, 0x4a0c2b);
    fillRect(8, 0, 3, 32, 0x24242f); // long reflection down the gloss
    fillRect(17, 0, 1, 32, 0x20202a);
    fillRect(30, 0, 2, 32, 0x0e0e16); // back edge
    g.generateTexture('bar_top_tile', 32, 32);

    // Stemware hanging from an overhead rail.
    g.clear();
    fillRect(0, 0, 32, 3, 0x8a9699); // rail
    fillRect(0, 0, 32, 1, 0xc3cacd);
    for (const x of [5, 15, 25]) {
        fillRect(x, 3, 2, 6, 0xd7dbdd); // stem
        g.fillStyle(0xbcd7e6, 1); // bowl
        g.beginPath();
        g.moveTo(x - 4, 9); g.lineTo(x + 6, 9); g.lineTo(x + 1, 18); g.closePath(); g.fill();
        fillRect(x - 3, 10, 8, 1, 0xeaf6ff); // rim highlight
    }
    g.generateTexture('glass_rack', 32, 24);

    // LED wall panel: an equaliser frozen mid-bar.
    g.clear();
    fillRect(0, 0, 32, 32, 0x0b0b12);
    fillRect(0, 0, 32, 1, 0x1d1d2a);
    const bars = [
        { x: 3, h: 18, c: 0x00e5ff },
        { x: 8, h: 26, c: 0xff2d95 },
        { x: 13, h: 12, c: 0xaeea00 },
        { x: 18, h: 22, c: 0xffc400 },
        { x: 23, h: 16, c: 0xb388ff },
        { x: 28, h: 9, c: 0x00e5ff }
    ];
    for (const b of bars) {
        fillRect(b.x, 30 - b.h, 3, b.h, b.c);
        fillRect(b.x, 30 - b.h, 3, 2, 0xffffff); // hot tip
        for (let y = 30 - b.h + 3; y < 30; y += 3) fillRect(b.x, y, 3, 1, 0x0b0b12); // segments
    }
    g.generateTexture('led_panel', 32, 32);

    // --- LIGHTING RIG --------------------------------------------------------
    // Truss segment: two rails with diagonal bracing.
    g.clear();
    fillRect(0, 1, 32, 3, 0x9aa5b1);
    fillRect(0, 1, 32, 1, 0xc3cacd);
    fillRect(0, 12, 32, 3, 0x7f8c8d);
    for (let i = 0; i < 32; i += 8) {
        g.fillStyle(0x8a9699, 1);
        g.beginPath();
        g.moveTo(i, 4); g.lineTo(i + 6, 12); g.lineTo(i + 8, 12); g.lineTo(i + 2, 4); g.closePath(); g.fill();
        g.beginPath();
        g.moveTo(i + 8, 4); g.lineTo(i + 2, 12); g.lineTo(i + 4, 12); g.lineTo(i + 10, 4); g.closePath(); g.fill();
    }
    g.generateTexture('truss', 32, 16);

    // Par can: yoke, ribbed housing and a bright lens. Scenes tint the whole
    // fixture, so the lens colour follows the beam colour.
    g.clear();
    fillRect(10, 0, 4, 4, 0x6c7679); // hanging clamp
    fillRect(4, 3, 16, 3, 0x8a9699); // yoke
    fillRect(4, 3, 3, 12, 0x8a9699);
    fillRect(17, 3, 3, 12, 0x8a9699);
    fillRect(6, 6, 12, 12, 0x2b2b34); // housing
    fillRect(6, 6, 12, 1, 0x494957);
    for (let y = 8; y < 18; y += 3) fillRect(6, y, 12, 1, 0x1d1d24); // cooling ribs
    fillRect(5, 17, 14, 4, 0x3a3a46); // barn doors
    g.fillStyle(0xffffff, 1); // lens
    g.fillCircle(12, 20, 4);
    g.fillStyle(0xdff6ff, 1);
    g.fillCircle(12, 20, 2);
    g.generateTexture('par_can', 24, 24);
    // --- YVY'S DANCE POSES ---------------------------------------------------
    // Her own moves, distinct from Mike's and the squad's: hair flip, arms
    // overhead, a hip pop and a twirl with the skirt flaring.
    const DRESS = 0xe91e63;
    const DRESS_SHADE = 0xc2185b;
    const DRESS_HI = 0xf06292;
    const DRESS_DARK = 0xad1457;

    const yvyHead = () => {
        drawYvyFace(5);
        drawYvyHair();
        fillRect(13, 15, 6, 2, SKIN_SHADE);
    };

    // Hair flip: one hand up through her hair, weight on the other hip.
    g.clear();
    yvyHead();
    fillRect(12, 17, 10, 8, DRESS); // bodice, shifted with the hip
    fillRect(20, 17, 2, 8, DRESS_SHADE);
    fillRect(13, 18, 1, 4, DRESS_HI);
    fillRect(12, 17, 10, 1, 0xf8bbd0);
    fillRect(12, 24, 10, 1, DRESS_DARK);
    fillRect(11, 25, 12, 4, DRESS); // skirt swung right
    fillRect(20, 25, 3, 4, DRESS_SHADE);
    fillRect(11, 28, 12, 1, DRESS_DARK);
    fillRect(23, 12, 2, 6, SKIN); // arm raised to the hair
    fillRect(22, 9, 3, 3, SKIN);
    fillRect(10, 18, 2, 6, SKIN_SHADE); // other arm on the hip
    fillRect(10, 23, 3, 2, SKIN_SHADE);
    fillRect(13, 29, 3, 2, SKIN);
    fillRect(18, 29, 3, 2, SKIN_SHADE);
    fillRect(12, 31, 4, 1, 0x212121);
    fillRect(18, 31, 4, 1, 0x121212);
    g.generateTexture('yvy_dance_1', 32, 32);

    // Both arms overhead, swaying the other way.
    g.clear();
    yvyHead();
    fillRect(10, 17, 10, 8, DRESS);
    fillRect(18, 17, 2, 8, DRESS_SHADE);
    fillRect(11, 18, 1, 4, DRESS_HI);
    fillRect(10, 17, 10, 1, 0xf8bbd0);
    fillRect(10, 24, 10, 1, DRESS_DARK);
    fillRect(9, 25, 12, 4, DRESS); // skirt swung left
    fillRect(18, 25, 3, 4, DRESS_SHADE);
    fillRect(9, 28, 12, 1, DRESS_DARK);
    fillRect(7, 11, 2, 7, SKIN); // arms up
    fillRect(6, 8, 3, 3, SKIN);
    fillRect(21, 11, 2, 7, SKIN_SHADE);
    fillRect(21, 8, 3, 3, SKIN_SHADE);
    fillRect(11, 29, 3, 2, SKIN);
    fillRect(16, 29, 3, 2, SKIN_SHADE);
    fillRect(10, 31, 4, 1, 0x212121);
    fillRect(16, 31, 4, 1, 0x121212);
    g.generateTexture('yvy_dance_2', 32, 32);

    // Hands on hips, hip popped, one knee bent.
    g.clear();
    yvyHead();
    fillRect(11, 17, 10, 8, DRESS);
    fillRect(19, 17, 2, 8, DRESS_SHADE);
    fillRect(12, 18, 1, 4, DRESS_HI);
    fillRect(11, 17, 10, 1, 0xf8bbd0);
    fillRect(11, 24, 11, 1, DRESS_DARK);
    fillRect(11, 25, 12, 4, DRESS); // skirt kicked out to one side
    fillRect(20, 25, 3, 4, DRESS_SHADE);
    fillRect(11, 28, 12, 1, DRESS_DARK);
    fillRect(8, 18, 2, 5, SKIN); // elbows out, hands on hips
    fillRect(8, 22, 4, 2, SKIN);
    fillRect(22, 18, 2, 5, SKIN_SHADE);
    fillRect(20, 22, 4, 2, SKIN_SHADE);
    fillRect(13, 29, 3, 2, SKIN);
    fillRect(18, 28, 3, 3, SKIN_SHADE); // bent knee
    fillRect(12, 31, 4, 1, 0x212121);
    fillRect(18, 31, 4, 1, 0x121212);
    g.generateTexture('yvy_dance_3', 32, 32);

    // Mid-twirl: arms out, hair and skirt flaring with the spin.
    g.clear();
    yvyHead();
    fillRect(8, 3, 3, 9, YVY_HAIR); // hair thrown out by the turn
    fillRect(21, 3, 4, 8, YVY_HAIR);
    fillRect(24, 6, 2, 4, YVY_HAIR_SHADE);
    fillRect(11, 17, 10, 8, DRESS);
    fillRect(19, 17, 2, 8, DRESS_SHADE);
    fillRect(12, 18, 1, 4, DRESS_HI);
    fillRect(11, 17, 10, 1, 0xf8bbd0);
    fillRect(11, 24, 10, 1, DRESS_DARK);
    fillRect(7, 25, 18, 4, DRESS); // skirt flared wide
    fillRect(20, 25, 5, 4, DRESS_SHADE);
    fillRect(7, 28, 18, 1, DRESS_DARK);
    fillRect(6, 19, 4, 2, SKIN); // arms out for the spin
    fillRect(4, 18, 3, 2, SKIN);
    fillRect(22, 19, 4, 2, SKIN_SHADE);
    fillRect(25, 18, 3, 2, SKIN_SHADE);
    fillRect(13, 29, 3, 2, SKIN);
    fillRect(17, 29, 3, 2, SKIN_SHADE);
    fillRect(12, 31, 4, 1, 0x212121);
    fillRect(17, 31, 4, 1, 0x121212);
    g.generateTexture('yvy_dance_4', 32, 32);

    // --- LATE-NIGHT STREET ---------------------------------------------------
    // Pizza storefront: awning, window with a counter behind it, and the door.
    g.clear();
    fillRect(0, 10, 96, 54, 0xb03028); // facade
    fillRect(0, 10, 96, 2, 0xd2453c);
    fillRect(0, 0, 96, 10, 0x7d1f19); // sign band
    for (let i = 0; i < 96; i += 12) fillRect(i, 10, 6, 5, 0xf4f4f4); // striped awning
    for (let i = 6; i < 96; i += 12) fillRect(i, 10, 6, 5, 0xc0392b);
    fillRect(0, 15, 96, 1, 0x6b1712);
    fillRect(6, 20, 52, 30, 0x2a1f1b); // window
    fillRect(8, 22, 48, 26, 0xffd88a); // warm interior
    fillRect(8, 22, 48, 3, 0xfff0c4);
    fillRect(10, 38, 44, 10, 0x8d6e63); // counter behind the glass
    fillRect(10, 38, 44, 2, 0xa1887f);
    fillRect(14, 30, 10, 7, 0xd7a04a); // pizzas on display
    fillRect(28, 30, 10, 7, 0xd7a04a);
    fillRect(42, 30, 8, 7, 0xd7a04a);
    fillRect(16, 32, 6, 3, 0xc0392b);
    fillRect(30, 32, 6, 3, 0xc0392b);
    fillRect(66, 20, 24, 44, 0x5d4037); // door
    fillRect(68, 22, 20, 26, 0xffd88a);
    fillRect(68, 22, 20, 2, 0xfff0c4);
    fillRect(66, 20, 24, 2, 0x7b5a49);
    fillRect(85, 40, 2, 5, 0xd4a017); // handle
    fillRect(0, 60, 96, 4, 0x4a1410); // plinth
    g.generateTexture('pizza_storefront', 96, 64);

    // Neon slice sign that hangs over the pavement.
    g.clear();
    g.fillStyle(0xff2d95, 0.18);
    g.fillRect(0, 0, 48, 24);
    fillRect(1, 1, 46, 2, 0xff4d6d); // tube frame
    fillRect(1, 21, 46, 2, 0xff4d6d);
    fillRect(1, 1, 2, 22, 0xff4d6d);
    fillRect(45, 1, 2, 22, 0xff4d6d);
    g.fillStyle(0xffd166, 1); // slice
    g.beginPath(); g.moveTo(14, 5); g.lineTo(26, 5); g.lineTo(20, 19); g.closePath(); g.fill();
    g.fillStyle(0xff6b6b, 1);
    g.fillCircle(18, 9, 1); g.fillCircle(22, 11, 1); g.fillCircle(19, 14, 1);
    fillRect(30, 8, 12, 2, 0x00e5ff); // "open" bars
    fillRect(30, 13, 8, 2, 0x00e5ff);
    g.generateTexture('neon_pizza_sign', 48, 24);

    // Fire hydrant.
    g.clear();
    fillRect(5, 6, 6, 15, 0xc0392b);
    fillRect(9, 6, 2, 15, 0x922b21);
    fillRect(4, 4, 8, 3, 0xe74c3c); // cap
    fillRect(6, 2, 4, 2, 0xc0392b);
    fillRect(2, 10, 3, 3, 0x922b21); // side ports
    fillRect(11, 10, 3, 3, 0x922b21);
    fillRect(4, 14, 8, 1, 0x7b241c);
    fillRect(3, 21, 10, 3, 0x5d2018); // base
    g.generateTexture('fire_hydrant', 16, 24);

    // The moon: craters and a soft halo.
    g.clear();
    g.fillStyle(0xfff4c4, 0.10);
    g.fillCircle(24, 24, 23);
    g.fillStyle(0xfff4c4, 0.18);
    g.fillCircle(24, 24, 19);
    g.fillStyle(0xfdf1c0, 1);
    g.fillCircle(24, 24, 15);
    g.fillStyle(0xf2e2a8, 1);
    g.fillCircle(20, 20, 4);
    g.fillCircle(30, 27, 3);
    g.fillCircle(22, 31, 2);
    g.fillStyle(0xe8d492, 1);
    g.fillCircle(20, 20, 2);
    g.fillCircle(30, 27, 1);
    g.fillStyle(0xfffbe8, 1);
    g.fillCircle(18, 16, 3);
    g.generateTexture('moon', 48, 48);

    // --- THE DJ --------------------------------------------------------------
    // Two frames swapped on the beat: hands working the decks, then a fist up.
    const djBase = () => {
        drawFace(5, { brow: 0x1b1b1b });
        drawShortHair(0x1f1f1f, 0x3b3b3b, 0x121212);
        fillRect(8, 5, 3, 6, 0x2b2b34); // headphone cups
        fillRect(21, 5, 3, 6, 0x2b2b34);
        fillRect(8, 4, 3, 1, 0x5a5a68);
        fillRect(21, 4, 3, 1, 0x5a5a68);
        fillRect(9, 0, 14, 2, 0x2b2b34); // headband
        fillRect(9, 0, 14, 1, 0x5a5a68);
        fillRect(13, 15, 6, 2, SKIN_SHADE); // neck
        fillRect(10, 17, 12, 9, 0x14141c); // black tee
        fillRect(20, 17, 2, 9, 0x0b0b12);
        fillRect(13, 17, 6, 2, 0x00e5ff); // luminous print
        fillRect(14, 20, 4, 3, 0xff2d95);
    };

    g.clear();
    djBase();
    fillRect(6, 19, 4, 6, 0x14141c); // both arms down on the decks
    fillRect(5, 24, 4, 3, SKIN);
    fillRect(22, 19, 4, 6, 0x0b0b12);
    fillRect(23, 24, 4, 3, SKIN_SHADE);
    g.generateTexture('dj_1', 32, 32);

    g.clear();
    djBase();
    fillRect(6, 19, 4, 6, 0x14141c); // one hand still cueing
    fillRect(5, 24, 4, 3, SKIN);
    fillRect(23, 10, 3, 9, 0x0b0b12); // other fist thrown up
    fillRect(22, 6, 4, 4, SKIN_SHADE);
    g.generateTexture('dj_2', 32, 32);
    // --- BUFF DRUNKS ---------------------------------------------------------
    // Wider shoulders and thicker arms than the standard build, with a smaller
    // head so they read as gym-huge at 32px. Each has an idle and a swing.
    const buffBody = ({ vest, vestShade, skin = SKIN, skinShade = SKIN_SHADE, shorts, shortsShade }) => {
        fillRect(7, 14, 18, 11, vest); // barrel chest
        fillRect(21, 14, 4, 11, vestShade);
        fillRect(11, 14, 3, 11, skin); // vest straps leave the pecs bare
        fillRect(18, 14, 3, 11, skinShade);
        fillRect(7, 14, 18, 1, vestShade);
        fillRect(11, 25, 10, 2, 0x2b2b2b); // belt
        fillRect(11, 27, 4, 4, shorts); // legs
        fillRect(17, 27, 4, 4, shortsShade);
        fillRect(10, 31, 5, 1, 0x3e2723);
        fillRect(17, 31, 5, 1, 0x2b1a14);
    };

    const buffHead = (hair, hairHi, hairShade, beard = null) => {
        fillRect(12, 4, 9, 8, SKIN); // small head
        fillRect(20, 4, 1, 8, SKIN_SHADE);
        fillRect(11, 1, 11, 4, hair);
        fillRect(11, 4, 2, 4, hair);
        fillRect(20, 4, 2, 4, hairShade);
        fillRect(12, 2, 4, 1, hairHi);
        fillRect(13, 6, 3, 1, hairShade); // heavy brows
        fillRect(17, 6, 3, 1, hairShade);
        fillRect(13, 7, 2, 2, EYE_WHITE);
        fillRect(17, 7, 2, 2, EYE_WHITE);
        fillRect(14, 7, 1, 2, EYE);
        fillRect(18, 7, 1, 2, EYE);
        fillRect(14, 10, 5, 1, 0x8c4a3c); // grimace
        if (beard !== null) {
            fillRect(12, 9, 9, 3, beard);
            fillRect(14, 10, 5, 1, 0x6b3328);
        }
        fillRect(13, 12, 7, 2, SKIN_SHADE); // thick neck
    };

    // Guy one: red vest, blond flat-top.
    g.clear();
    buffHead(0xd7b56d, 0xefd79a, 0xa8894f);
    buffBody({ vest: 0xc0392b, vestShade: 0x922b21, shorts: 0x37474f, shortsShade: 0x2b373d });
    fillRect(3, 14, 4, 9, SKIN); // slab arms
    fillRect(25, 14, 4, 9, SKIN_SHADE);
    fillRect(3, 23, 5, 4, SKIN); // fists
    fillRect(24, 23, 5, 4, SKIN_SHADE);
    fillRect(4, 16, 2, 3, 0xe8c49a); // bicep highlight
    g.generateTexture('buff_red', 32, 32);

    // Guy one, mid-swing: leaning in behind a straight right.
    g.clear();
    buffHead(0xd7b56d, 0xefd79a, 0xa8894f);
    buffBody({ vest: 0xc0392b, vestShade: 0x922b21, shorts: 0x37474f, shortsShade: 0x2b373d });
    fillRect(4, 18, 4, 7, SKIN); // rear arm cocked
    fillRect(3, 24, 5, 4, SKIN);
    fillRect(25, 15, 7, 4, SKIN_SHADE); // lead arm thrown out
    fillRect(28, 13, 4, 5, SKIN_SHADE);
    fillRect(21, 12, 4, 3, SKIN_SHADE); // shoulder into it
    g.generateTexture('buff_red_punch', 32, 32);

    // Guy two: green vest, dark hair and a beard.
    g.clear();
    buffHead(0x2b1e13, 0x4a3524, 0x1a1109, 0x2b1e13);
    buffBody({ vest: 0x2e7d32, vestShade: 0x1b5e20, shorts: 0x4e342e, shortsShade: 0x3e2723 });
    fillRect(3, 14, 4, 9, SKIN);
    fillRect(25, 14, 4, 9, SKIN_SHADE);
    fillRect(3, 23, 5, 4, SKIN);
    fillRect(24, 23, 5, 4, SKIN_SHADE);
    fillRect(26, 16, 2, 3, 0xc79a72);
    fillRect(7, 17, 4, 2, 0x1b5e20); // tattoo band
    g.generateTexture('buff_green', 32, 32);

    // Guy two, mid-swing: haymaker from the other side.
    g.clear();
    buffHead(0x2b1e13, 0x4a3524, 0x1a1109, 0x2b1e13);
    buffBody({ vest: 0x2e7d32, vestShade: 0x1b5e20, shorts: 0x4e342e, shortsShade: 0x3e2723 });
    fillRect(0, 15, 7, 4, SKIN); // lead arm swung out left
    fillRect(0, 13, 4, 5, SKIN);
    fillRect(7, 12, 4, 3, SKIN); // shoulder drop
    fillRect(24, 18, 4, 7, SKIN_SHADE);
    fillRect(24, 24, 5, 4, SKIN_SHADE);
    g.generateTexture('buff_green_punch', 32, 32);

    // --- BRAWL EFFECTS -------------------------------------------------------
    // The classic scuffle cloud, with a fist and a boot sticking out of it.
    g.clear();
    g.fillStyle(0xe8e8ee, 1);
    g.fillCircle(16, 24, 12);
    g.fillCircle(32, 20, 14);
    g.fillCircle(48, 25, 11);
    g.fillCircle(24, 14, 10);
    g.fillCircle(40, 12, 9);
    g.fillStyle(0xc9c9d6, 1); // shaded underside
    g.fillCircle(18, 30, 8);
    g.fillCircle(34, 31, 9);
    g.fillCircle(47, 30, 6);
    g.fillStyle(0xfafaff, 1); // lit tops
    g.fillCircle(24, 10, 5);
    g.fillCircle(40, 9, 4);
    fillRect(4, 16, 5, 4, SKIN); // fist poking out
    fillRect(2, 17, 3, 3, SKIN);
    fillRect(52, 26, 6, 4, 0x3e2723); // boot poking out
    fillRect(56, 24, 4, 3, 0x2b1a14);
    fillRect(30, 4, 2, 5, 0xd7b56d); // a lock of hair flying
    g.generateTexture('fight_cloud', 64, 40);

    // Impact star.
    g.clear();
    g.fillStyle(0xffd166, 1);
    g.beginPath();
    g.moveTo(12, 0); g.lineTo(15, 8); g.lineTo(24, 7); g.lineTo(17, 13);
    g.lineTo(21, 22); g.lineTo(12, 17); g.lineTo(4, 22); g.lineTo(7, 13);
    g.lineTo(0, 7); g.lineTo(9, 8);
    g.closePath(); g.fill();
    g.fillStyle(0xfff3b0, 1);
    g.fillCircle(12, 11, 4);
    g.fillStyle(0xc0392b, 1);
    g.fillCircle(12, 11, 2);
    g.generateTexture('pow_star', 24, 24);

    // Phone held up to film it.
    g.clear();
    fillRect(2, 0, 12, 20, 0x1b1b22);
    fillRect(3, 2, 10, 15, 0x5dade2); // screen
    fillRect(3, 2, 10, 3, 0x9fd6f0);
    fillRect(5, 7, 6, 6, 0x1b3a4a); // what it is filming
    fillRect(4, 18, 8, 1, 0x3b3b46);
    drawPixel(12, 1, 0xffe082); // lens flash
    g.generateTexture('phone_cam', 16, 20);

    // --- AIRLINER ------------------------------------------------------------
    // Side view facing right; the flight scenes flip scaleX to fly the other way.
    g.clear();
    g.fillStyle(0x2980b9, 1); // tail fin, swept back
    g.beginPath(); g.moveTo(20, 18); g.lineTo(8, 2); g.lineTo(16, 2); g.lineTo(30, 18); g.closePath(); g.fill();
    g.fillStyle(0x1f6698, 1); // tailplane
    g.beginPath(); g.moveTo(16, 20); g.lineTo(2, 12); g.lineTo(2, 17); g.lineTo(16, 24); g.closePath(); g.fill();
    g.fillStyle(0x2471a3, 1); // far wing, going up and back
    g.beginPath(); g.moveTo(52, 20); g.lineTo(28, 4); g.lineTo(40, 4); g.lineTo(64, 20); g.closePath(); g.fill();
    g.fillStyle(0xf4f6f7, 1); // fuselage
    g.fillRect(12, 18, 72, 13);
    g.fillStyle(0xf4f6f7, 1); // nose cone
    g.beginPath(); g.moveTo(84, 18); g.lineTo(94, 25); g.lineTo(84, 31); g.closePath(); g.fill();
    g.fillStyle(0xd7dbdd, 1); // belly shadow
    g.fillRect(12, 28, 74, 3);
    g.fillStyle(0x2980b9, 1); // cheatline
    g.fillRect(12, 25, 72, 2);
    g.fillStyle(0x8fd3ff, 1); // cabin windows
    for (let i = 20; i < 78; i += 6) g.fillRect(i, 20, 3, 3);
    g.fillStyle(0x1b2631, 1); // flight deck glass
    g.fillRect(80, 20, 6, 3);
    g.fillStyle(0x2980b9, 1); // near wing, swept down and back
    g.beginPath(); g.moveTo(50, 30); g.lineTo(26, 44); g.lineTo(40, 44); g.lineTo(64, 31); g.closePath(); g.fill();
    g.fillStyle(0x4a5765, 1); // pylon onto the wing
    g.fillRect(45, 30, 5, 4);
    g.fillStyle(0x5d6d7e, 1); // engine nacelle
    g.fillRect(38, 33, 18, 8);
    g.fillStyle(0x8a9aa8, 1);
    g.fillRect(38, 34, 18, 2); // lit top of the cowling
    g.fillStyle(0x9aa5b1, 1);
    g.fillRect(54, 33, 2, 8); // intake lip
    g.fillStyle(0x1b2631, 1);
    g.fillRect(52, 35, 2, 5); // intake shadow
    g.fillStyle(0x3a4550, 1);
    g.fillRect(38, 40, 18, 1) // exhaust line
    g.fillStyle(0xd7dbdd, 1);
    g.fillRect(12, 18, 72, 1); // lit upper edge
    g.generateTexture('airliner', 96, 48);

    // Soft cloud for the sky scenes.
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(20, 20, 11);
    g.fillCircle(34, 16, 13);
    g.fillCircle(48, 21, 10);
    g.fillCircle(28, 24, 9);
    g.fillStyle(0xe4edf5, 1); // shaded underside
    g.fillCircle(20, 27, 7);
    g.fillCircle(34, 28, 8);
    g.fillCircle(47, 27, 6);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(34, 12, 6);
    g.generateTexture('cloud', 64, 40);
    // Cinema soda: lidded cup with a straw.
    g.clear();
    g.fillStyle(0xfdfdfd, 1);
    g.beginPath(); g.moveTo(2, 7); g.lineTo(14, 7); g.lineTo(12, 23); g.lineTo(4, 23); g.closePath(); g.fill();
    fillRect(5, 7, 2, 16, 0xd93b30); // stripes
    fillRect(9, 7, 2, 16, 0xd93b30);
    fillRect(1, 4, 14, 4, 0xd7dbdd); // lid
    fillRect(1, 4, 14, 1, 0xf4f6f7);
    fillRect(9, 0, 2, 5, 0xe74c3c); // straw
    fillRect(9, 0, 2, 1, 0xff8a80);
    g.generateTexture('soda_cup', 16, 24);

    // Illuminated EXIT sign.
    g.clear();
    fillRect(0, 0, 24, 14, 0x14201a);
    fillRect(0, 0, 24, 1, 0x2b3b32);
    g.fillStyle(0x00e676, 0.25);
    g.fillRect(1, 1, 22, 12);
    g.fillStyle(0x00e676, 1); // blocky EXIT
    fillRect(3, 4, 1, 6, 0x00e676); fillRect(3, 4, 3, 1, 0x00e676); fillRect(3, 6, 2, 1, 0x00e676); fillRect(3, 9, 3, 1, 0x00e676);
    fillRect(7, 4, 1, 1, 0x00e676); fillRect(8, 5, 1, 1, 0x00e676); fillRect(9, 6, 1, 2, 0x00e676); fillRect(8, 8, 1, 1, 0x00e676); fillRect(7, 9, 1, 1, 0x00e676); fillRect(11, 4, 1, 1, 0x00e676); fillRect(10, 5, 1, 1, 0x00e676); fillRect(10, 8, 1, 1, 0x00e676); fillRect(11, 9, 1, 1, 0x00e676);
    fillRect(13, 4, 1, 6, 0x00e676);
    fillRect(15, 4, 5, 1, 0x00e676); fillRect(17, 4, 1, 6, 0x00e676);
    g.fillStyle(0x69f0ae, 0.5);
    g.fillRect(2, 11, 20, 1);
    g.generateTexture('exit_sign', 24, 14);
    // --- HOTEL ROOM ----------------------------------------------------------
    // Bed seen from above: headboard, two pillows, turned-down duvet and a runner.
    g.clear();
    fillRect(2, 0, 60, 10, 0x5d4037); // headboard
    fillRect(2, 0, 60, 3, 0x7b5a49);
    fillRect(4, 8, 56, 2, 0x3e2723);
    fillRect(6, 11, 22, 13, 0xfdfdfd); // pillows
    fillRect(36, 11, 22, 13, 0xfdfdfd);
    fillRect(6, 11, 22, 2, 0xffffff);
    fillRect(6, 22, 22, 2, 0xe3e6e8);
    fillRect(36, 22, 22, 2, 0xe3e6e8);
    fillRect(4, 25, 56, 68, 0xf4f2ed); // duvet
    fillRect(4, 25, 56, 3, 0xffffff); // turned-down edge
    fillRect(52, 25, 8, 68, 0xe3e0d8); // shadowed side
    fillRect(4, 44, 56, 12, 0x8e2f3f); // runner across the foot
    fillRect(4, 44, 56, 2, 0xa84152);
    fillRect(4, 90, 56, 3, 0xd8d4ca); // foot of the bed
    fillRect(28, 25, 2, 19, 0xe8e5dd); // fold between the halves
    g.generateTexture('hotel_bed', 64, 96);

    // Bedside table with two drawers.
    g.clear();
    fillRect(1, 2, 22, 20, 0x6d4c41);
    fillRect(1, 2, 22, 2, 0x8d6e63);
    fillRect(18, 2, 5, 20, 0x54372c);
    fillRect(3, 6, 14, 6, 0x5d4037); // drawers
    fillRect(3, 14, 14, 6, 0x5d4037);
    drawPixel(10, 9, 0xd4a017);
    drawPixel(10, 17, 0xd4a017);
    fillRect(2, 22, 3, 2, 0x3e2723); // legs
    fillRect(19, 22, 3, 2, 0x3e2723);
    g.generateTexture('nightstand', 24, 24);

    // Desk phone.
    g.clear();
    fillRect(2, 6, 12, 8, 0x2b2b33);
    fillRect(2, 6, 12, 1, 0x4a4a56);
    fillRect(4, 9, 8, 4, 0x1b1b22); // keypad
    for (let i = 5; i < 12; i += 3) { drawPixel(i, 10, 0x8a8a99); drawPixel(i, 12, 0x8a8a99); }
    fillRect(1, 2, 14, 4, 0x3b3b46); // handset
    fillRect(1, 2, 3, 4, 0x2b2b33);
    fillRect(12, 2, 3, 4, 0x2b2b33);
    drawPixel(14, 8, 0xe74c3c); // message light
    g.generateTexture('hotel_phone', 16, 16);

    // Patterned hotel carpet.
    g.clear();
    fillRect(0, 0, 32, 32, 0x6d4550);
    fillRect(0, 0, 32, 1, 0x7d5260);
    g.fillStyle(0x8a5a68, 1); // diamond motif
    g.beginPath(); g.moveTo(16, 6); g.lineTo(26, 16); g.lineTo(16, 26); g.lineTo(6, 16); g.closePath(); g.fill();
    g.fillStyle(0x5b3945, 1);
    g.beginPath(); g.moveTo(16, 11); g.lineTo(21, 16); g.lineTo(16, 21); g.lineTo(11, 16); g.closePath(); g.fill();
    drawPixel(3, 3, 0x8a5a68);
    drawPixel(29, 29, 0x8a5a68);
    drawPixel(29, 3, 0x5b3945);
    drawPixel(3, 29, 0x5b3945);
    g.generateTexture('hotel_carpet', 32, 32);

    // Striped wallpaper with a chair rail along the bottom.
    g.clear();
    fillRect(0, 0, 32, 32, 0xd9cdb8);
    for (let i = 0; i < 32; i += 8) fillRect(i, 0, 3, 26, 0xcfc0a8);
    for (let i = 4; i < 32; i += 8) drawPixel(i, 8, 0xbfae94);
    fillRect(0, 26, 32, 3, 0x8d6e63); // rail
    fillRect(0, 26, 32, 1, 0xa1887f);
    fillRect(0, 29, 32, 3, 0xbfae94); // skirting
    g.generateTexture('hotel_wall', 32, 32);

    // Window over a city at night.
    g.clear();
    fillRect(0, 0, 64, 48, 0x4e342e); // frame
    fillRect(3, 3, 58, 42, 0x0d1b2a); // night sky
    fillRect(3, 3, 58, 14, 0x16273a);
    for (let i = 0; i < 26; i++) {
        const bx = 4 + ((i * 7 + (i % 3) * 3) % 55);
        const by = 6 + ((i * 5) % 30);
        drawPixel(bx, by, i % 4 === 0 ? 0xfff3b0 : 0x9fd6f0);
    }
    fillRect(6, 26, 12, 19, 0x101c28); // buildings
    fillRect(22, 20, 14, 25, 0x152430);
    fillRect(40, 30, 16, 15, 0x101c28);
    for (let bx = 8; bx < 17; bx += 4) for (let by = 29; by < 43; by += 5) drawPixel(bx, by, 0xffe082);
    for (let bx = 24; bx < 35; bx += 4) for (let by = 23; by < 43; by += 5) drawPixel(bx, by, 0xffd166);
    for (let bx = 42; bx < 55; bx += 4) for (let by = 33; by < 43; by += 5) drawPixel(bx, by, 0xffe082);
    fillRect(31, 3, 2, 42, 0x4e342e); // mullion
    fillRect(3, 22, 58, 2, 0x4e342e);
    fillRect(0, 0, 6, 48, 0x7b1e2b); // curtains
    fillRect(58, 0, 6, 48, 0x7b1e2b);
    fillRect(1, 0, 2, 48, 0x93303d);
    fillRect(59, 0, 2, 48, 0x93303d);
    g.generateTexture('hotel_window_night', 64, 48);

    // Framed print for the wall.
    g.clear();
    fillRect(0, 0, 32, 24, 0xb08d3f); // gilt frame
    fillRect(1, 1, 30, 22, 0x8a6f31);
    fillRect(3, 3, 26, 18, 0xdfe9f2); // sky
    fillRect(3, 13, 26, 8, 0x4f7a52); // hills
    g.fillStyle(0x3d5f40, 1);
    g.beginPath(); g.moveTo(3, 14); g.lineTo(12, 6); g.lineTo(21, 14); g.closePath(); g.fill();
    g.fillStyle(0xf3c969, 1);
    g.fillCircle(24, 8, 3);
    g.generateTexture('wall_art', 32, 24);

    // --- TECH EXPO -----------------------------------------------------------
    // Booth: backdrop with a header panel, side pillars, counter and a screen.
    // Drawn in neutral tones so scenes can tint each booth its own brand colour.
    g.clear();
    fillRect(4, 6, 88, 40, 0xe8ecef); // backdrop
    fillRect(4, 6, 88, 3, 0xf7f9fa);
    fillRect(4, 0, 88, 7, 0xb9c3cc); // header band
    fillRect(4, 0, 88, 2, 0xd3dae0);
    fillRect(0, 0, 6, 52, 0x9aa5b1); // pillars
    fillRect(90, 0, 6, 52, 0x8a95a1);
    fillRect(12, 12, 26, 20, 0x5d6d7e); // wall screen
    fillRect(14, 14, 22, 16, 0x9fd6f0);
    fillRect(14, 14, 22, 4, 0xc9e9fb);
    fillRect(16, 22, 4, 6, 0x2980b9); // little bar chart on it
    fillRect(22, 19, 4, 9, 0x2980b9);
    fillRect(28, 24, 4, 4, 0x2980b9);
    fillRect(46, 12, 40, 8, 0xcfd6dc); // strapline block
    fillRect(46, 22, 30, 4, 0xcfd6dc);
    fillRect(46, 28, 34, 4, 0xcfd6dc);
    fillRect(6, 40, 84, 12, 0x7f8c8d); // counter
    fillRect(6, 40, 84, 3, 0x9aa5b1);
    fillRect(10, 44, 10, 5, 0xf4f6f7); // leaflets on the counter
    fillRect(24, 44, 10, 5, 0xf4f6f7);
    fillRect(70, 43, 8, 6, 0x5d6d7e); // a demo unit
    g.generateTexture('expo_booth', 96, 52);

    // Roll-up banner.
    g.clear();
    fillRect(4, 0, 24, 54, 0xf4f6f7);
    fillRect(4, 0, 24, 2, 0xd7dbdd);
    fillRect(4, 0, 3, 54, 0xe4e8ea);
    fillRect(7, 6, 18, 10, 0x2980b9); // logo block
    fillRect(9, 9, 6, 4, 0xf7f9fa);
    fillRect(7, 20, 18, 3, 0xb9c3cc); // strapline bars
    fillRect(7, 26, 14, 3, 0xb9c3cc);
    fillRect(7, 32, 16, 3, 0xb9c3cc);
    fillRect(7, 40, 10, 8, 0x27ae60); // QR-ish square
    fillRect(9, 42, 3, 3, 0xf7f9fa);
    fillRect(2, 54, 28, 4, 0x5d6d7e); // foot
    fillRect(14, 52, 4, 4, 0x7f8c8d);
    g.generateTexture('expo_banner', 32, 58);

    // Monitor on a stand for the demo tables.
    g.clear();
    fillRect(2, 0, 28, 18, 0x2b2b33);
    fillRect(4, 2, 24, 14, 0x1b4f72);
    fillRect(4, 2, 24, 3, 0x2e86c1);
    fillRect(6, 8, 6, 6, 0x5dade2); // ui blocks
    fillRect(14, 6, 12, 3, 0x85c1e9);
    fillRect(14, 11, 9, 3, 0x85c1e9);
    fillRect(13, 18, 6, 4, 0x4a4a56); // stand
    fillRect(9, 22, 14, 2, 0x5d6d7e);
    g.generateTexture('expo_monitor', 32, 24);

    // Expo hall carpet: flat weave with a subtle grid.
    g.clear();
    fillRect(0, 0, 32, 32, 0x39424b);
    fillRect(0, 0, 32, 1, 0x454f59);
    fillRect(0, 0, 1, 32, 0x454f59);
    for (let i = 2; i < 32; i += 6) drawPixel(i, (i * 3) % 30 + 1, 0x4c5760);
    for (let i = 4; i < 32; i += 6) drawPixel(i, (i * 5) % 28 + 2, 0x323a42);
    g.generateTexture('expo_carpet', 32, 32);
    // --- BUSINESS-HOTEL FURNITURE --------------------------------------------
    // Nothing here is meant to be smart: laminate, fabric and plastic.
    // Work desk with a laptop, a notepad and a drawer.
    g.clear();
    fillRect(0, 4, 64, 6, 0x9c7b5c); // laminate top
    fillRect(0, 4, 64, 2, 0xb08e6c);
    fillRect(2, 10, 60, 14, 0x7b6047); // carcass
    fillRect(54, 10, 8, 14, 0x634c38);
    fillRect(6, 13, 24, 8, 0x634c38); // drawer
    fillRect(14, 16, 8, 2, 0xc0a882);
    fillRect(3, 24, 4, 6, 0x5a4432); // legs
    fillRect(57, 24, 4, 6, 0x5a4432);
    fillRect(34, 0, 18, 5, 0x3b3b46); // laptop screen
    fillRect(36, 1, 14, 3, 0x5dade2);
    fillRect(33, 5, 20, 2, 0x6b6b78); // keyboard deck
    fillRect(10, 2, 10, 3, 0xf4f6f7); // notepad
    fillRect(11, 3, 8, 1, 0xb9c3cc);
    g.generateTexture('hotel_desk', 64, 30);

    // Desk chair.
    g.clear();
    fillRect(4, 0, 16, 13, 0x4a5765); // back
    fillRect(4, 0, 16, 2, 0x5d6d7e);
    fillRect(5, 3, 14, 8, 0x556577);
    fillRect(2, 13, 20, 6, 0x4a5765); // seat
    fillRect(2, 13, 20, 1, 0x5d6d7e);
    fillRect(10, 19, 4, 5, 0x8a9aa8); // column
    fillRect(4, 24, 16, 2, 0x6c7679); // base
    fillRect(3, 26, 3, 2, 0x2b2b33); // castors
    fillRect(18, 26, 3, 2, 0x2b2b33);
    g.generateTexture('desk_chair', 24, 28);

    // Low credenza the television sits on.
    g.clear();
    fillRect(0, 2, 64, 18, 0x7b6047);
    fillRect(0, 2, 64, 2, 0x9c7b5c);
    fillRect(54, 2, 10, 18, 0x634c38);
    fillRect(4, 7, 24, 9, 0x634c38); // doors
    fillRect(32, 7, 24, 9, 0x634c38);
    fillRect(14, 11, 6, 2, 0xc0a882);
    fillRect(42, 11, 6, 2, 0xc0a882);
    fillRect(2, 20, 60, 3, 0x5a4432);
    g.generateTexture('tv_unit', 64, 24);

    // Tub chair in the corner.
    g.clear();
    fillRect(3, 4, 26, 12, 0x6b7a5a); // back
    fillRect(3, 4, 26, 2, 0x7d8d6a);
    fillRect(0, 8, 5, 16, 0x5b6a4c); // arms
    fillRect(27, 8, 5, 16, 0x4f5d42);
    fillRect(5, 16, 22, 9, 0x768663); // seat cushion
    fillRect(5, 16, 22, 1, 0x8a9a76);
    fillRect(5, 25, 22, 3, 0x4f5d42);
    fillRect(6, 28, 4, 4, 0x3e2723); // feet
    fillRect(22, 28, 4, 4, 0x3e2723);
    g.generateTexture('armchair', 32, 32);

    // Standing lamp with a fabric shade.
    g.clear();
    fillRect(6, 8, 4, 26, 0x8a8a99); // stem
    fillRect(6, 8, 1, 26, 0xb0b0bd);
    g.fillStyle(0xe8d9a8, 1); // shade
    g.beginPath(); g.moveTo(1, 8); g.lineTo(15, 8); g.lineTo(12, 0); g.lineTo(4, 0); g.closePath(); g.fill();
    fillRect(1, 7, 14, 1, 0xc9b57e);
    fillRect(4, 0, 8, 1, 0xf2e8c8);
    fillRect(2, 34, 12, 3, 0x6c7679); // base
    fillRect(2, 34, 12, 1, 0x9aa5b1);
    g.fillStyle(0xffe9a8, 0.22); // pool of light
    g.fillEllipse(8, 12, 22, 12);
    g.generateTexture('floor_lamp', 16, 38);

    // Folding luggage rack with a case on it.
    g.clear();
    fillRect(2, 10, 28, 3, 0x8d6e63); // webbing straps
    fillRect(2, 15, 28, 3, 0x8d6e63);
    fillRect(1, 9, 3, 15, 0x5d4037); // frame
    fillRect(28, 9, 3, 15, 0x5d4037);
    fillRect(4, 22, 24, 2, 0x4e342e);
    fillRect(6, 2, 20, 9, 0x37474f); // case
    fillRect(6, 2, 20, 2, 0x4a5765);
    fillRect(21, 2, 5, 9, 0x2b373d);
    fillRect(14, 0, 5, 2, 0x9aa5b1); // handle
    fillRect(8, 5, 3, 2, 0xd4a017); // tag
    g.generateTexture('luggage_rack', 32, 24);

    // Mini fridge with the kettle and cups on top.
    g.clear();
    fillRect(1, 8, 22, 20, 0xe4e8ea); // fridge
    fillRect(1, 8, 22, 2, 0xf4f6f7);
    fillRect(18, 8, 5, 20, 0xcfd6dc);
    fillRect(3, 12, 16, 13, 0xd7dbdd); // door
    fillRect(16, 17, 2, 4, 0x9aa5b1); // handle
    fillRect(4, 2, 9, 6, 0x2b2b33); // kettle
    fillRect(5, 3, 6, 2, 0x4a4a56);
    fillRect(12, 3, 2, 3, 0x2b2b33);
    fillRect(15, 4, 4, 4, 0xf4f6f7); // cups
    fillRect(19, 5, 3, 3, 0xf4f6f7);
    g.generateTexture('mini_fridge', 24, 28);

    // Through-wall air conditioner under the window.
    g.clear();
    fillRect(0, 2, 40, 14, 0xd7dbdd);
    fillRect(0, 2, 40, 2, 0xeceff1);
    fillRect(0, 14, 40, 2, 0xb0bec5);
    for (let i = 3; i < 37; i += 3) fillRect(i, 6, 2, 7, 0xb0bec5); // vent slats
    fillRect(30, 3, 8, 2, 0x90a4ae); // control panel
    drawPixel(36, 4, 0x00e676);
    g.generateTexture('ac_unit', 40, 16);
    // --- PLANTS AND PICTURES -------------------------------------------------
    // Pothos: trailing vines of heart-shaped, variegated leaves.
    g.clear();
    fillRect(10, 22, 12, 10, 0xd8d3c8); // pot
    fillRect(18, 22, 4, 10, 0xbdb7ab);
    fillRect(9, 20, 14, 3, 0xe8e3d8); // rim
    fillRect(9, 20, 14, 1, 0xf4f0e6);
    fillRect(11, 23, 10, 1, 0x4e342e); // soil
    const vine = (x, y, dir) => {
        for (let i = 0; i < 5; i++) {
            const lx = x + dir * i * 2;
            const ly = y + i * 3;
            fillRect(lx, ly, 3, 3, i % 2 ? 0x2e7d32 : 0x43a047);
            drawPixel(lx + 1, ly, 0xa5d6a7); // variegation
        }
    };
    vine(6, 8, -0); // one vine straight down the left
    vine(22, 8, 1); // one spilling right
    g.fillStyle(0x2e7d32, 1); // the crown of leaves
    g.fillEllipse(16, 12, 18, 12);
    g.fillStyle(0x43a047, 1);
    g.fillEllipse(12, 10, 9, 7);
    g.fillEllipse(20, 13, 8, 6);
    g.fillStyle(0xa5d6a7, 1);
    drawPixel(11, 9, 0xa5d6a7);
    drawPixel(19, 12, 0xa5d6a7);
    drawPixel(16, 7, 0xa5d6a7);
    fillRect(15, 16, 2, 5, 0x33691e); // stem into the pot
    g.generateTexture('pothos', 32, 32);

    // Gilt-framed picture for a smarter wall.
    g.clear();
    fillRect(0, 0, 32, 40, 0xc9a227); // ornate frame
    fillRect(1, 1, 30, 38, 0x8a6f14);
    fillRect(2, 2, 28, 36, 0xd9b93b);
    fillRect(4, 4, 24, 32, 0x2b1a3d); // canvas
    fillRect(4, 4, 24, 12, 0x3d2456);
    g.fillStyle(0x6b4f8a, 1); // abstract hills
    g.beginPath(); g.moveTo(4, 26); g.lineTo(14, 14); g.lineTo(24, 26); g.closePath(); g.fill();
    g.fillStyle(0x8e6bb0, 1);
    g.beginPath(); g.moveTo(14, 27); g.lineTo(22, 18); g.lineTo(28, 27); g.closePath(); g.fill();
    g.fillStyle(0xf3d98b, 1); // moon
    g.fillCircle(22, 11, 3);
    fillRect(4, 28, 24, 8, 0x1c1029); // dark foreground
    fillRect(6, 30, 20, 1, 0x4a3568);
    g.generateTexture('fancy_art', 32, 40);

    // --- BREWPUB KITCHEN -----------------------------------------------------
    // Service pass: tiled surround, heat lamps and plated food waiting to go out.
    g.clear();
    fillRect(0, 0, 96, 48, 0xd7dbdd); // tiled wall
    for (let x = 0; x < 96; x += 12) fillRect(x, 0, 1, 48, 0xbcc3c6);
    for (let y = 0; y < 48; y += 12) fillRect(0, y, 96, 1, 0xbcc3c6);
    fillRect(6, 6, 84, 30, 0x2b1a14); // the opening
    fillRect(8, 8, 80, 26, 0x7a4a22); // warm kitchen light beyond
    fillRect(8, 8, 80, 6, 0xb5701f);
    fillRect(10, 10, 76, 2, 0xffb74d); // heat lamps
    for (let x = 16; x < 84; x += 16) fillRect(x, 12, 6, 2, 0xffd08a);
    fillRect(8, 28, 80, 8, 0xcfd6dc); // stainless ledge
    fillRect(8, 28, 80, 2, 0xeceff1);
    for (const px of [16, 36, 56, 74]) { // plated dishes
        g.fillStyle(0xf4f6f7, 1);
        g.fillCircle(px, 32, 5);
        g.fillStyle(0xc0392b, 1);
        g.fillCircle(px, 32, 2);
    }
    fillRect(0, 36, 96, 12, 0x8d6e63); // timber below the pass
    fillRect(0, 36, 96, 2, 0xa1887f);
    g.generateTexture('kitchen_pass', 96, 48);

    // Range with an extractor hood, pots and a lick of flame.
    g.clear();
    fillRect(2, 0, 60, 10, 0xb0bec5); // hood
    fillRect(2, 0, 60, 3, 0xcfd8dc);
    fillRect(8, 10, 48, 3, 0x78909c);
    fillRect(4, 20, 56, 18, 0x9aa5b1); // range body
    fillRect(4, 20, 56, 3, 0xc3cacd);
    fillRect(6, 26, 24, 10, 0x6c7679); // oven door
    fillRect(32, 26, 24, 10, 0x6c7679);
    fillRect(10, 30, 16, 2, 0xffb74d); // oven glow
    fillRect(36, 30, 16, 2, 0xffb74d);
    g.fillStyle(0x2b2b33, 1); // pots on the burners
    g.fillEllipse(18, 18, 16, 7);
    g.fillEllipse(44, 18, 14, 6);
    g.fillStyle(0x4a4a56, 1);
    g.fillEllipse(18, 16, 14, 5);
    g.fillStyle(0xff8a3d, 1); // flame
    g.beginPath(); g.moveTo(44, 14); g.lineTo(47, 8); g.lineTo(50, 14); g.closePath(); g.fill();
    g.fillStyle(0xffd166, 1);
    g.beginPath(); g.moveTo(46, 14); g.lineTo(47, 11); g.lineTo(48, 14); g.closePath(); g.fill();
    g.generateTexture('kitchen_range', 64, 40);

    // Copper brewing tank — it is a brewpub, after all.
    g.clear();
    fillRect(4, 8, 24, 48, 0xb87333); // vessel
    fillRect(20, 8, 8, 48, 0x8c5424); // shaded side
    fillRect(4, 8, 6, 48, 0xd9915a); // lit side
    g.fillStyle(0xc9803c, 1); // domed top
    g.fillEllipse(16, 8, 24, 8);
    g.fillStyle(0xe0a56a, 1);
    g.fillEllipse(14, 6, 14, 4);
    fillRect(13, 0, 6, 4, 0x8c5424); // chimney
    fillRect(4, 20, 24, 2, 0x7a4a22); // bands
    fillRect(4, 38, 24, 2, 0x7a4a22);
    fillRect(11, 44, 10, 7, 0x5d3a1a); // hatch
    fillRect(12, 45, 8, 5, 0x8c5424);
    g.fillStyle(0xd7dbdd, 1); // gauge
    g.fillCircle(23, 30, 3);
    drawPixel(23, 30, 0xc0392b);
    fillRect(14, 56, 4, 5, 0x6c7679); // valve and stand
    fillRect(6, 58, 20, 4, 0x4a5257);
    g.generateTexture('brew_tank', 32, 64);

    // High-backed booth bench.
    g.clear();
    fillRect(0, 0, 64, 18, 0x6b3f2a); // back
    fillRect(0, 0, 64, 3, 0x855033);
    fillRect(4, 4, 26, 12, 0x7a4830); // buttoned panels
    fillRect(34, 4, 26, 12, 0x7a4830);
    drawPixel(16, 10, 0x4e2b1c);
    drawPixel(46, 10, 0x4e2b1c);
    fillRect(0, 18, 64, 9, 0x7a4830); // seat
    fillRect(0, 18, 64, 1, 0x9c6242);
    fillRect(0, 27, 64, 5, 0x4e2b1c); // plinth
    g.generateTexture('booth_seat', 64, 32);

    // --- SUITE FURNISHINGS ---------------------------------------------------
    // French doors onto a balcony, city lights beyond.
    g.clear();
    fillRect(0, 0, 64, 64, 0x4a3520); // frame
    fillRect(3, 3, 58, 58, 0x0d1b2a); // night beyond
    fillRect(3, 3, 58, 20, 0x16273a);
    for (let i = 0; i < 22; i++) drawPixel(5 + ((i * 9 + (i % 4) * 3) % 54), 8 + ((i * 7) % 34), i % 3 ? 0xffe082 : 0x9fd6f0);
    fillRect(6, 34, 14, 24, 0x101c28); // towers
    fillRect(26, 28, 12, 30, 0x152430);
    fillRect(44, 38, 14, 20, 0x101c28);
    for (let bx = 8; bx < 18; bx += 4) for (let by = 37; by < 56; by += 5) drawPixel(bx, by, 0xffd166);
    for (let bx = 28; bx < 37; bx += 4) for (let by = 31; by < 56; by += 5) drawPixel(bx, by, 0xffe082);
    fillRect(31, 3, 3, 58, 0x4a3520); // centre mullion
    fillRect(3, 30, 58, 2, 0x4a3520); // glazing bars
    fillRect(17, 3, 2, 58, 0x3b2a19);
    fillRect(46, 3, 2, 58, 0x3b2a19);
    fillRect(28, 30, 2, 6, 0xd4a017); // handles
    fillRect(35, 30, 2, 6, 0xd4a017);
    fillRect(0, 0, 5, 64, 0x6b1f33); // drapes
    fillRect(59, 0, 5, 64, 0x6b1f33);
    fillRect(1, 0, 2, 64, 0x8a2b45);
    fillRect(60, 0, 2, 64, 0x8a2b45);
    g.generateTexture('balcony_doors', 64, 64);

    // Console table with a round mirror above it.
    g.clear();
    g.fillStyle(0xc9a227, 1); // mirror frame
    g.fillCircle(24, 14, 13);
    g.fillStyle(0x8a6f14, 1);
    g.fillCircle(24, 14, 11);
    g.fillStyle(0x5b6d7e, 1); // glass
    g.fillCircle(24, 14, 10);
    g.fillStyle(0x7d90a1, 1);
    g.fillCircle(20, 10, 5);
    g.fillStyle(0xffffff, 0.35);
    g.fillRect(17, 6, 3, 14);
    fillRect(4, 28, 40, 5, 0x5d4037); // console top
    fillRect(4, 28, 40, 2, 0x7b5a49);
    fillRect(6, 33, 36, 4, 0x4e342e); // apron
    fillRect(7, 37, 3, 10, 0x4e342e); // legs
    fillRect(38, 37, 3, 10, 0x4e342e);
    fillRect(18, 22, 3, 6, 0xd4a017); // a little vase on top
    fillRect(16, 20, 7, 3, 0xe8c96a);
    g.generateTexture('console_mirror', 48, 48);

    // Champagne on ice with two flutes.
    g.clear();
    fillRect(4, 10, 14, 12, 0xc0c8cc); // bucket
    fillRect(13, 10, 5, 12, 0x9aa5b1);
    fillRect(3, 8, 16, 3, 0xd7dbdd);
    fillRect(3, 8, 16, 1, 0xeceff1);
    fillRect(6, 2, 5, 8, 0x2e5b2e); // bottle
    fillRect(6, 2, 2, 8, 0x437a43);
    fillRect(7, 0, 3, 3, 0xd4a017); // foil
    fillRect(5, 11, 3, 2, 0xf4f6f7); // ice
    fillRect(14, 12, 3, 2, 0xf4f6f7);
    for (const fx of [20, 24]) { // flutes
        fillRect(fx, 6, 3, 7, 0xe8f4f8);
        fillRect(fx, 7, 3, 4, 0xf3e5ab);
        fillRect(fx + 1, 13, 1, 6, 0xd7dbdd);
        fillRect(fx - 1, 19, 5, 1, 0xd7dbdd);
    }
    g.generateTexture('champagne_service', 32, 24);

    // Chaise longue.
    // Chaise in muted blue-grey on pale wood legs, to match the suite.
    g.clear();
    fillRect(0, 6, 12, 18, 0x4d6274); // raised end
    fillRect(0, 6, 12, 3, 0x64798b);
    fillRect(10, 12, 38, 12, 0x5a7085); // seat
    fillRect(10, 12, 38, 2, 0x6f8598);
    fillRect(10, 22, 38, 3, 0x3f5364); // shadow beneath the cushion
    fillRect(14, 15, 14, 6, 0x64798b); // cushions
    fillRect(30, 15, 14, 6, 0x64798b);
    fillRect(16, 9, 8, 4, 0xd8cdb8); // throw cushion
    fillRect(4, 24, 4, 4, 0xa9906c); // pale wood legs
    fillRect(40, 24, 4, 4, 0xa9906c);
    g.generateTexture('chaise', 48, 28);
    // Walnut slat accent panel — the wall treatment behind every modern hotel bed.
    g.clear();
    fillRect(0, 0, 32, 64, 0x4a3527);
    for (let x = 0; x < 32; x += 4) {
        fillRect(x, 0, 3, 64, 0x6b4c36); // slat face
        fillRect(x, 0, 1, 64, 0x7d5a41); // lit edge
        fillRect(x + 3, 0, 1, 64, 0x33241a); // shadow gap
    }
    for (let y = 9; y < 64; y += 17) fillRect(0, y, 32, 1, 0x5c4230); // grain
    g.generateTexture('wood_slat_panel', 32, 64);

    // Wide abstract canvas in muted tones.
    g.clear();
    fillRect(0, 0, 48, 32, 0x2b2b2b); // slim frame
    fillRect(2, 2, 44, 28, 0xe8e2d6); // canvas
    g.fillStyle(0x8c9c92, 1);
    g.fillRect(4, 8, 40, 8);
    g.fillStyle(0x33566b, 1);
    g.fillRect(4, 16, 40, 5);
    g.fillStyle(0xc2a878, 1);
    g.fillRect(4, 21, 40, 3);
    g.fillStyle(0xf4f1ea, 1);
    g.fillCircle(33, 12, 5);
    g.fillStyle(0x6f6558, 1);
    g.fillRect(9, 5, 18, 2);
    g.generateTexture('abstract_art', 48, 32);
    // --- CANTINA DRESSING ----------------------------------------------------
    // Papel picado: a run of cut-paper flags on a string.
    g.clear();
    fillRect(0, 0, 64, 1, 0xe8dcc8); // the string
    const flagColors = [0xe94f37, 0xf5b700, 0x2a9d8f, 0xe76f9e, 0x5b8ed6];
    for (let i = 0; i < 4; i++) {
        const x = i * 16;
        const c = flagColors[i % flagColors.length];
        g.fillStyle(c, 1);
        g.beginPath();
        g.moveTo(x + 1, 1); g.lineTo(x + 15, 1); g.lineTo(x + 8, 22);
        g.closePath(); g.fill();
        // punched-out pattern
        g.fillStyle(0x2b1a14, 1);
        g.fillRect(x + 6, 5, 4, 3);
        g.fillRect(x + 5, 10, 2, 2);
        g.fillRect(x + 9, 10, 2, 2);
        g.fillRect(x + 7, 14, 2, 3);
    }
    g.generateTexture('papel_picado', 64, 32);

    // Talavera tile for the splashback behind the bar.
    g.clear();
    fillRect(0, 0, 32, 32, 0xf2ede0);
    fillRect(0, 0, 32, 1, 0xd8d0bd);
    fillRect(0, 0, 1, 32, 0xd8d0bd);
    fillRect(16, 0, 1, 32, 0xd8d0bd);
    fillRect(0, 16, 32, 1, 0xd8d0bd);
    for (const [ox, oy] of [[0, 0], [16, 0], [0, 16], [16, 16]]) {
        g.fillStyle(0x2a5ca8, 1); // cobalt motif
        g.beginPath();
        g.moveTo(ox + 8, oy + 2); g.lineTo(ox + 14, oy + 8); g.lineTo(ox + 8, oy + 14); g.lineTo(ox + 2, oy + 8);
        g.closePath(); g.fill();
        g.fillStyle(0xf5b700, 1);
        g.fillRect(ox + 7, oy + 7, 2, 2);
        g.fillStyle(0x2a9d8f, 1);
        drawPixel(ox + 4, oy + 4, 0x2a9d8f);
        drawPixel(ox + 11, oy + 11, 0x2a9d8f);
    }
    g.generateTexture('talavera_tile', 32, 32);

    // Potted agave.
    g.clear();
    fillRect(9, 22, 14, 10, 0xb5651d); // terracotta pot
    fillRect(18, 22, 5, 10, 0x8f4e15);
    fillRect(8, 20, 16, 3, 0xcd7f32);
    fillRect(8, 20, 16, 1, 0xe09a4e);
    const blade = (x, top, w, tilt) => {
        for (let i = 0; i < 22 - top; i++) {
            const bx = x + Math.round(tilt * i * 0.35);
            fillRect(bx, top + i, w, 1, 0x6b9c62);
        }
    };
    blade(15, 2, 3, 0);
    blade(11, 6, 3, -0.8);
    blade(19, 6, 3, 0.8);
    blade(8, 12, 2, -1.1);
    blade(22, 12, 2, 1.1);
    g.fillStyle(0x8fbf83, 1); // lit edges
    g.fillRect(15, 2, 1, 18);
    g.fillRect(12, 7, 1, 10);
    g.fillStyle(0xd8cf8a, 1); // pale spines
    drawPixel(15, 2, 0xd8cf8a);
    drawPixel(9, 12, 0xd8cf8a);
    drawPixel(23, 12, 0xd8cf8a);
    g.generateTexture('agave_plant', 32, 32);

    // Neon agave sign.
    g.clear();
    fillRect(0, 0, 64, 32, 0x14121c);
    g.fillStyle(0x2a9d8f, 0.22);
    g.fillRect(2, 2, 60, 28);
    g.fillStyle(0x3ddc97, 1); // neon blades
    for (const [x1, y1, x2, y2] of [[32, 28, 32, 6], [32, 26, 22, 10], [32, 26, 42, 10], [32, 24, 16, 16], [32, 24, 48, 16]]) {
        const steps = 14;
        for (let i = 0; i <= steps; i++) {
            const px = Math.round(x1 + ((x2 - x1) * i) / steps);
            const py = Math.round(y1 + ((y2 - y1) * i) / steps);
            g.fillRect(px, py, 2, 2);
        }
    }
    g.fillStyle(0xb9ffe3, 1);
    g.fillRect(31, 12, 2, 10);
    g.fillStyle(0xf5b700, 1); // warm base glow
    g.fillRect(26, 28, 12, 2);
    g.generateTexture('neon_agave', 64, 32);

    // Shelf of tequila and mezcal.
    g.clear();
    fillRect(0, 22, 32, 3, 0x4e342e); // shelf
    fillRect(0, 22, 32, 1, 0x7b5a49);
    fillRect(0, 25, 32, 1, 0x2b1a14);
    const agaveBottles = [
        { x: 2, h: 19, body: 0xe8e2c8, cap: 0x2a5ca8 },
        { x: 8, h: 15, body: 0xd9a441, cap: 0x8c1713 },
        { x: 13, h: 21, body: 0xc9d6c0, cap: 0x2a9d8f },
        { x: 19, h: 16, body: 0xb87333, cap: 0xf5b700 },
        { x: 25, h: 20, body: 0x8fbf83, cap: 0xe94f37 }
    ];
    for (const b of agaveBottles) {
        const top = 22 - b.h;
        fillRect(b.x, top + 4, 5, b.h - 4, b.body); // tall tapered bottle
        fillRect(b.x + 1, top, 3, 5, b.body);
        fillRect(b.x + 1, top - 1, 3, 1, b.cap);
        fillRect(b.x, top + 4, 1, b.h - 4, 0xffffff); // glass highlight
        fillRect(b.x, top + 9, 5, 3, 0xf7f3e8); // label
        drawPixel(b.x + 2, top + 10, b.cap);
    }
    g.generateTexture('tequila_shelf', 32, 32);

    // Margarita: salted rim and a lime wheel.
    g.clear();
    g.fillStyle(0xd7dbdd, 1); // coupe
    g.beginPath(); g.moveTo(5, 8); g.lineTo(27, 8); g.lineTo(16, 20); g.closePath(); g.fill();
    g.fillStyle(0xdff3c9, 1); // drink
    g.beginPath(); g.moveTo(7, 10); g.lineTo(25, 10); g.lineTo(16, 19); g.closePath(); g.fill();
    fillRect(5, 7, 22, 2, 0xf7f7f7); // salted rim
    for (let i = 6; i < 27; i += 3) drawPixel(i, 6, 0xffffff);
    fillRect(15, 20, 2, 7, 0xd7dbdd); // stem
    fillRect(11, 27, 10, 2, 0xd7dbdd); // foot
    g.fillStyle(0x7cb342, 1); // lime wheel on the rim
    g.fillCircle(24, 7, 3);
    g.fillStyle(0xc5e1a5, 1);
    g.fillCircle(24, 7, 2);
    drawPixel(24, 7, 0x7cb342);
    g.generateTexture('margarita', 32, 32);

    // Festoon lights.
    g.clear();
    fillRect(0, 3, 64, 1, 0x3b3b46);
    for (let x = 6; x < 64; x += 12) {
        fillRect(x, 4, 1, 2, 0x6b6b78);
        g.fillStyle(0xffd166, 1);
        g.fillCircle(x, 8, 3);
        g.fillStyle(0xfff3c4, 1);
        g.fillCircle(x - 1, 7, 1);
        g.fillStyle(0xffd166, 0.25);
        g.fillCircle(x, 8, 6);
    }
    g.generateTexture('string_lights', 64, 16);

    // Painted mural panel: sun over agave hills.
    g.clear();
    fillRect(0, 0, 64, 48, 0xc25c3a); // stucco ground
    fillRect(0, 0, 64, 2, 0xd97a52);
    g.fillStyle(0xf5b700, 1); // sun
    g.fillCircle(46, 14, 8);
    g.fillStyle(0xf7d365, 1);
    g.fillCircle(46, 14, 5);
    for (let i = 0; i < 8; i++) { // rays
        const a = (Math.PI / 4) * i;
        g.fillStyle(0xf5b700, 1);
        g.fillRect(46 + Math.round(Math.cos(a) * 11), 14 + Math.round(Math.sin(a) * 11), 2, 2);
    }
    g.fillStyle(0x7a3b2a, 1); // hills
    g.beginPath(); g.moveTo(0, 40); g.lineTo(18, 24); g.lineTo(36, 40); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(28, 40); g.lineTo(46, 28); g.lineTo(64, 40); g.closePath(); g.fill();
    g.fillStyle(0x6b9c62, 1); // agaves in the foreground
    for (const ax of [10, 26, 52]) {
        g.fillRect(ax, 34, 2, 10);
        g.fillRect(ax - 3, 37, 2, 7);
        g.fillRect(ax + 3, 37, 2, 7);
    }
    fillRect(0, 44, 64, 4, 0x8c3f26);
    g.generateTexture('mural_panel', 64, 48);
}
