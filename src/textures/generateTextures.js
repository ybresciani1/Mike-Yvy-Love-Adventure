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

    /**
     * The seated lower body, from the belt line down. Sitting is not standing
     * with the legs hidden: the thighs come forward towards the viewer and read
     * wide and short, the knees turn the corner, and the shins drop to feet flat
     * on the floor. That needs six rows more than a standing sprite has, which
     * is why the seated textures are 32x38 rather than 32x32.
     */
    const drawSeatedLegs = (pants, pantsShade, shoe, shoeShade, { hips = 26, skirt = false } = {}) => {
        const y = hips;
        if (skirt) {
            fillRect(9, y, 14, 5, pants); // skirt spread over the seat
            fillRect(19, y, 4, 5, pantsShade);
            fillRect(9, y + 4, 14, 1, pantsShade);
        } else {
            fillRect(9, y, 6, 5, pants); // thighs, foreshortened so they read wide
            fillRect(16, y, 7, 5, pantsShade);
            fillRect(9, y, 14, 1, pantsShade); // waistband shadow
            fillRect(15, y, 1, 5, pantsShade); // the gap between them
        }
        fillRect(10, y + 5, 5, 2, pants); // knees
        fillRect(17, y + 5, 5, 2, pantsShade);
        if (skirt) {
            fillRect(11, y + 7, 3, 4, SKIN); // bare shins
            fillRect(18, y + 7, 3, 4, SKIN_SHADE);
        } else {
            fillRect(11, y + 7, 3, 4, pants); // shins
            fillRect(18, y + 7, 3, 4, pantsShade);
        }
        fillRect(10, y + 11, 5, 2, shoe); // feet flat on the floor
        fillRect(17, y + 11, 5, 2, shoeShade);
        fillRect(10, y + 11, 5, 1, shoe);
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
        seated = false,
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
        if (seated) drawSeatedLegs(pants, pantsShade, shoe, shoeShade);
        else drawLegs(pants, pantsShade, shoe, shoeShade);
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
    fillRect(6, 9, 20, 17, 0xcfd6da); // shell
    fillRect(22, 9, 4, 17, 0xa3acb2); // shadow side
    fillRect(6, 9, 20, 1, 0xe8edf0);
    fillRect(11, 9, 2, 17, 0x8b949a); // straps
    fillRect(19, 9, 2, 17, 0x8b949a);
    fillRect(6, 16, 20, 1, 0x8b949a); // centre seam
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
    
    // Two filled tacos on a plate: folded shells, meat, lettuce, cheese, salsa
    // and a lime wedge.
    g.clear();
    g.fillStyle(0xf4f6f7, 1); // plate
    g.fillEllipse(16, 25, 30, 11);
    g.fillStyle(0xe4e8ea, 1);
    g.fillEllipse(16, 26, 24, 7);
    for (const cx of [9, 22]) {
        g.fillStyle(0xdca63c, 1); // shell
        g.fillEllipse(cx, 20, 13, 15);
        g.fillStyle(0xefc169, 1); // lit side of the fold
        g.fillEllipse(cx - 2, 20, 5, 13);
        g.fillStyle(0xb9821f, 1); // shadow inside the fold
        g.fillRect(cx + 4, 14, 2, 11);
        fillRect(cx - 5, 13, 10, 4, 0x6b4226); // seasoned meat
        fillRect(cx - 5, 13, 10, 1, 0x8a5730);
        fillRect(cx - 6, 11, 12, 2, 0x4caf50); // lettuce
        drawPixel(cx - 4, 12, 0x81c784);
        drawPixel(cx + 3, 12, 0x81c784);
        drawPixel(cx - 3, 14, 0xf5c542); // cheese
        drawPixel(cx + 1, 15, 0xf5c542);
        drawPixel(cx + 4, 13, 0xf5c542);
        drawPixel(cx - 1, 12, 0xd94f4f); // salsa
        drawPixel(cx + 2, 11, 0xd94f4f);
    }
    g.fillStyle(0x9ccc65, 1); // lime wedge
    g.fillEllipse(28, 22, 7, 5);
    g.fillStyle(0xc5e1a5, 1);
    g.fillEllipse(28, 22, 4, 3);
    g.generateTexture('tacos', 32, 32);

    // Nest of spaghetti under sauce, with meatballs, basil and parmesan.
    g.clear();
    g.fillStyle(0xf4f6f7, 1); // plate and rim
    g.fillEllipse(16, 20, 30, 18);
    g.fillStyle(0xe4e8ea, 1);
    g.fillEllipse(16, 21, 25, 14);
    g.fillStyle(0xf0d68c, 1); // nest of pasta
    g.fillEllipse(16, 19, 22, 12);
    g.fillStyle(0xe3c169, 1); // strands
    for (let i = 0; i < 5; i++) g.fillRect(6 + i * 4, 14 + (i % 2) * 2, 3, 9);
    g.fillStyle(0xf7e4ac, 1);
    g.fillRect(8, 16, 2, 7);
    g.fillRect(19, 15, 2, 8);
    g.fillStyle(0xb5322a, 1); // sauce
    g.fillEllipse(16, 17, 16, 8);
    g.fillStyle(0xd04236, 1);
    g.fillEllipse(15, 16, 11, 5);
    g.fillStyle(0x5a3221, 1); // meatballs
    g.fillCircle(12, 16, 4);
    g.fillCircle(21, 18, 3);
    g.fillStyle(0x7a4a30, 1);
    g.fillCircle(11, 15, 2);
    g.fillCircle(20, 17, 1);
    drawPixel(13, 20, 0x3f7d3f); // basil
    drawPixel(18, 13, 0x3f7d3f);
    drawPixel(9, 19, 0xfdfdfd); // parmesan
    drawPixel(23, 15, 0xfdfdfd);
    drawPixel(16, 22, 0xfdfdfd);
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
    // Pickled jalapeno slice — the nacho kind, cut across the pepper. A slice is
    // a small thing next to a person, so it is drawn at 7px rather than shrunk
    // down from a bigger sprite: dark rind, a wall lit from the top left, and a
    // pale seed pocket. Laid out by hand — at this size every pixel is a
    // quarter of the picture.
    g.clear();
    const jalapenoRows = [
        '..ddd..',
        '.dllwd.',
        'dllmwsd',
        'dlmpmsd',
        'dwlmssd',
        '.dwssd.',
        '..ddd..'
    ];
    const jalapenoInk = { d: 0x2e4d12, l: 0x8fb63a, w: 0x6f9128, s: 0x54711c, m: 0xc9d49a, p: 0xf2f4d4 };
    jalapenoRows.forEach((row, y) => {
        [...row].forEach((ch, x) => {
            if (ch !== '.') drawPixel(x, y, jalapenoInk[ch]);
        });
    });
    g.generateTexture('jalapeno', 7, 7);
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
        seated = false,
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
        if (seated) {
            drawSeatedLegs(lower, lowerShade, shoe, shoeShade, { hips: 25, skirt });
        } else {
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
        }
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
    // --- SEATED POSES --------------------------------------------------------
    // Everyone who sits down in the gate seats needs one of these. They are the
    // same head and torso as the standing sprite with a seated lower body under
    // it, and they are six pixels taller so the shins and feet have somewhere to
    // go — the whole point is that you can see the legs rather than tucking them
    // out of sight behind the furniture.
    g.clear();
    drawFace(5, { brow: HAIR_SHADE });
    drawShortHair(HAIR, HAIR_HI, HAIR_SHADE);
    drawTorso(0x3498db, 0x2f86c4, { hi: 0x5dade2 });
    fillRect(13, 17, 6, 2, 0x2980b9); // collar
    fillRect(10, 26, 12, 1, 0x2c2c2c); // belt
    drawSeatedLegs(0x34495e, 0x2c3e50, 0xecf0f1, 0xd5dbdb);
    g.generateTexture('mike_sit', 32, 38);

    g.clear();
    drawFace(5, { brow: HAIR_SHADE });
    drawShortHair(HAIR, HAIR_HI, HAIR_SHADE);
    drawTorso(0x2c3e50, 0x22303d);
    fillRect(14, 17, 4, 9, 0xf4f6f7); // shirt placket
    fillRect(15, 18, 2, 7, 0xc0392b); // tie
    fillRect(15, 25, 2, 1, 0x96281b);
    fillRect(13, 17, 1, 4, 0x22303d); // lapels
    fillRect(18, 17, 1, 4, 0x1a242f);
    drawPixel(12, 20, 0xf1c40f); // pocket square
    drawSeatedLegs(0x2c3e50, 0x22303d, 0x1b1b1b, 0x121212);
    g.generateTexture('mike_suit_sit', 32, 38);

    g.clear();
    drawFace(5, { brow: HAIR_SHADE });
    drawShortHair(HAIR, HAIR_HI, HAIR_SHADE);
    drawTorso(0x95a5a6, 0x7f8c8d, { hi: 0xbdc3c7 });
    fillRect(15, 17, 2, 4, 0x7f8c8d); // placket
    drawPixel(15, 18, 0xecf0f1);
    drawPixel(15, 20, 0xecf0f1);
    fillRect(10, 26, 12, 1, 0x5d4037); // belt
    drawSeatedLegs(0x1a237e, 0x151c66, 0xf5f5f5, 0xdcdcdc);
    g.generateTexture('mike_casual_sit', 32, 38);

    drawNpc({
        hair: 0x6d4c41, hairHi: 0x8d6e63, hairShade: 0x4e342e,
        shirt: 0x9c27b0, shirtShade: 0x7b1fa2,
        pants: 0x37474f, pantsShade: 0x2b373d,
        seated: true,
        extras: () => {
            fillRect(11, 18, 1, 8, 0xba68c8); // strap across the chest
            fillRect(19, 20, 3, 4, 0x5d4037); // shoulder bag
        }
    });
    g.generateTexture('civilian_sit', 32, 38);

    drawNpc({
        hair: 0x3b2f1e, hairHi: 0x54402e, hairShade: 0x2b2214,
        shirt: 0x3a5c32, shirtShade: 0x24471f,
        pants: 0x24471f, pantsShade: 0x1e3a1a,
        shoe: 0x1b1b1b, shoeShade: 0x111111,
        hat: 0x1e3a1a, hatShade: 0x152b13, brim: 0x152b13,
        seated: true,
        extras: () => {
            fillRect(7, 19, 3, 1, 0xf1c40f); // sleeve chevrons
            fillRect(7, 21, 3, 1, 0xf1c40f);
            fillRect(12, 18, 2, 1, 0xf1c40f); // collar insignia
            fillRect(10, 26, 12, 1, 0x1b1b1b); // belt
        }
    });
    g.generateTexture('marine_sit', 32, 38);

    drawWoman({
        hair: 0x4e342e, hairHi: 0x6d4c41, hairShade: 0x3e2723,
        top: 0x26a69a, topShade: 0x00897b, topHi: 0x80cbc4,
        lower: 0x455a64, lowerShade: 0x37474f,
        hairFall: 18,
        seated: true,
        extras: () => {
            fillRect(21, 4, 3, 8, 0x4e342e); // ponytail swept to one side
            fillRect(22, 11, 2, 4, 0x3e2723);
        }
    });
    g.generateTexture('civilian_f_sit', 32, 38);

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

    // Gate seating, in two halves. A person sitting down has to be drawn between
    // them — behind the cushions they are sitting on, in front of the backrest
    // they are leaning against. One flat bench sprite can only ever be in front
    // of them or behind them, and either way they look like they are standing on
    // the furniture.
    //
    // Chairs are on a 16px pitch, so their centres are at 8, 24, 40 and 56 —
    // anyone sat down has to line up with one of those or they end up straddling
    // the armrest between two. The back is kept low: a seat whose backrest comes
    // up past a passenger's shoulders dwarfs them.
    g.clear();
    for (let i = 0; i < 4; i++) {
        const x = i * 16;
        fillRect(x + 2, 2, 13, 11, 0x2980b9); // backrest
        fillRect(x + 2, 2, 13, 2, 0x5dade2); // top edge in the light
        fillRect(x + 13, 4, 2, 9, 0x22648f); // shaded side
        fillRect(x + 2, 12, 13, 2, 0x1f5a80); // shadow where the back meets the seat
    }
    for (let i = 0; i < 4; i++) fillRect(i * 16, 3, 2, 12, 0x7f8c8d); // armrest posts
    fillRect(62, 3, 2, 12, 0x7f8c8d);
    fillRect(0, 0, 64, 2, 0x95a5a6); // top rail
    g.generateTexture('gate_seats_back', 64, 16);

    g.clear();
    for (let i = 0; i < 4; i++) {
        const x = i * 16;
        fillRect(x + 2, 0, 13, 6, 0x2f86c0); // cushion
        fillRect(x + 2, 0, 13, 2, 0x4ba3dc);
        fillRect(x + 2, 5, 13, 2, 0x1f5a80); // underside
    }
    for (let i = 0; i < 4; i++) fillRect(i * 16, 0, 2, 8, 0x7f8c8d); // armrest fronts
    fillRect(62, 0, 2, 8, 0x7f8c8d);
    fillRect(0, 8, 64, 2, 0x95a5a6); // steel rail
    for (let i = 6; i < 64; i += 16) fillRect(i, 10, 3, 4, 0x6c7679); // legs
    g.generateTexture('gate_seats_front', 64, 14);

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

    // The detector again, laid on its side. The arch above has its uprights to
    // the left and right of the lane, which means walking the length of the
    // terminal takes you across it rather than through it — it reads as a tall
    // vertical slot. This one is a panel on the far side of the lane and a panel
    // on the near side, with the walk-through open between them.
    g.clear();
    fillRect(2, 0, 60, 18, 0xd7dbdd); // far panel
    fillRect(2, 0, 60, 3, 0xf4f6f7);
    fillRect(2, 15, 60, 3, 0xaeb6b8);
    fillRect(2, 0, 4, 18, 0xb9c2c5); // end posts
    fillRect(58, 0, 4, 18, 0xaeb6b8);
    fillRect(29, 4, 6, 4, 0x27ae60); // status lights
    fillRect(8, 4, 3, 4, 0x27ae60);
    fillRect(53, 4, 3, 4, 0x27ae60);
    for (let i = 14; i < 52; i += 8) fillRect(i, 10, 3, 4, 0x9aa5b1);
    fillRect(5, 18, 6, 3, 0x6c7679); // feet
    fillRect(53, 18, 6, 3, 0x6c7679);
    fillRect(6, 23, 52, 1, 0xc9b76a); // the painted lane between the panels
    fillRect(6, 40, 52, 1, 0xc9b76a);
    fillRect(2, 46, 60, 18, 0xc3cacd); // near panel
    fillRect(2, 46, 60, 3, 0xdfe4e6);
    fillRect(2, 61, 60, 3, 0x8b9497);
    fillRect(2, 46, 4, 18, 0xaeb6b8);
    fillRect(58, 46, 4, 18, 0x9aa5b1);
    fillRect(29, 50, 6, 4, 0x27ae60);
    fillRect(8, 50, 3, 4, 0x27ae60);
    fillRect(53, 50, 3, 4, 0x27ae60);
    for (let i = 14; i < 52; i += 8) fillRect(i, 56, 3, 4, 0x7f8c8d);
    g.generateTexture('metal_detector', 64, 64);

    // The ordinary bag machine: a belt, a lead curtain, and everything you own
    // out of the case first.
    g.clear();
    fillRect(0, 10, 80, 16, 0x4a5158); // belt bed
    fillRect(0, 10, 80, 2, 0x6b747c);
    fillRect(0, 24, 80, 2, 0x2f353b);
    for (let i = 2; i < 80; i += 6) fillRect(i, 13, 3, 10, 0x394046); // rollers
    fillRect(26, 0, 28, 30, 0x7f8c8d); // hood
    fillRect(26, 0, 28, 4, 0x95a5a6);
    fillRect(30, 6, 20, 14, 0x1c2126); // the mouth
    fillRect(30, 6, 20, 2, 0x11151a);
    fillRect(32, 8, 4, 10, 0x2b323a); // lead curtain strips
    fillRect(38, 8, 4, 10, 0x2b323a);
    fillRect(44, 8, 4, 10, 0x2b323a);
    fillRect(56, 2, 20, 8, 0x2c3e50); // operator screen
    fillRect(58, 4, 16, 4, 0xe8a33d);
    fillRect(2, 26, 76, 4, 0x5a6265);
    fillRect(4, 30, 6, 6, 0x3c4248);
    fillRect(70, 30, 6, 6, 0x3c4248);
    g.generateTexture('xray_machine', 80, 36);

    // The Smithson: same belt, but a CT ring instead of a curtain. The bag goes
    // in as it is and the laptop stays where it is.
    g.clear();
    fillRect(0, 10, 110, 16, 0x3b4450);
    fillRect(0, 10, 110, 2, 0x5a687a);
    fillRect(0, 24, 110, 2, 0x242b34);
    for (let i = 2; i < 110; i += 6) fillRect(i, 13, 3, 10, 0x2f3743); // rollers
    fillRect(6, 2, 22, 8, 0x16212b); // the in-feed hood
    fillRect(8, 4, 18, 4, 0x2f6ea8);
    fillRect(36, 0, 38, 30, 0x1f4f7a); // ring housing
    fillRect(36, 0, 38, 4, 0x2f6ea8);
    fillRect(40, 5, 30, 16, 0x0d1c2b); // the bore
    g.fillStyle(0x3fb7e8, 1);
    g.fillCircle(55, 13, 7);
    g.fillStyle(0x0d1c2b, 1);
    g.fillCircle(55, 13, 4);
    fillRect(38, 22, 34, 2, 0x3fb7e8); // underlight
    fillRect(78, 2, 26, 8, 0x16212b); // operator screen
    fillRect(80, 4, 22, 4, 0x3fb7e8);
    fillRect(2, 26, 106, 4, 0x4a535f);
    fillRect(4, 30, 6, 6, 0x2f3743);
    fillRect(52, 30, 6, 6, 0x2f3743);
    fillRect(100, 30, 6, 6, 0x2f3743);
    g.generateTexture('smithson_machine', 110, 36);

    // Millimetre-wave booth: two panels, a sweep bar, and the yellow feet you
    // are told to stand on.
    g.clear();
    fillRect(2, 6, 10, 52, 0xdfe4e6);
    fillRect(2, 6, 10, 3, 0xf4f6f7);
    fillRect(32, 6, 10, 52, 0xc3cacd);
    fillRect(32, 6, 10, 3, 0xdfe4e6);
    fillRect(12, 10, 20, 44, 0x8fb9d6); // the glazed middle
    fillRect(12, 10, 20, 3, 0xbcdcef);
    fillRect(12, 30, 20, 2, 0x5fa3cc); // sweep bar
    fillRect(2, 0, 40, 7, 0xb0b8bb); // header
    fillRect(18, 2, 8, 3, 0x27ae60);
    fillRect(10, 58, 24, 6, 0x6c7679); // floor pad
    fillRect(13, 59, 7, 4, 0xf4d03f); // painted footprints
    fillRect(24, 59, 7, 4, 0xf4d03f);
    g.generateTexture('body_scanner', 44, 66);

    // CLEAR+ kiosk: a podium with an eye at head height.
    g.clear();
    fillRect(4, 14, 22, 26, 0x1b3a6b);
    fillRect(4, 14, 22, 3, 0x2b56a0);
    fillRect(4, 37, 22, 3, 0x12284b);
    fillRect(6, 0, 18, 14, 0x11151a);
    fillRect(8, 2, 14, 10, 0x2b8ce0);
    fillRect(8, 2, 14, 3, 0x5fb4ef);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(15, 7, 2);
    g.fillStyle(0x11151a, 1);
    g.fillCircle(15, 7, 1);
    fillRect(9, 20, 12, 3, 0xf4f6f7);
    fillRect(9, 26, 8, 2, 0xa8c4e8);
    fillRect(2, 40, 26, 4, 0x0d1c2b);
    g.generateTexture('clear_pod', 30, 44);

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
    // A proper picture window rather than a porthole — the suite's one view, so
    // it runs most of the wall: skyline below, a band of city glow above it, and
    // sheer drapes pushed to either end.
    g.clear();
    fillRect(0, 0, 160, 88, 0x3a3f47); // bronze frame
    fillRect(4, 4, 152, 74, 0x0b1420); // night sky
    fillRect(4, 4, 152, 22, 0x14263a); // haze near the horizon glow
    fillRect(4, 20, 152, 10, 0x1d3350);
    for (let i = 0; i < 46; i++) { // stars
        drawPixel(7 + ((i * 17 + (i % 5) * 7) % 146), 6 + ((i * 11) % 20), i % 4 ? 0x9fb8d0 : 0xdfe9f5);
    }
    const skyline = [[8, 44, 18, 34], [28, 34, 14, 44], [44, 52, 12, 26], [58, 28, 16, 50], [76, 46, 10, 32],
        [88, 38, 15, 40], [105, 30, 13, 48], [120, 50, 12, 28], [134, 40, 18, 38]];
    skyline.forEach(([bx, by, bw, bh], i) => {
        fillRect(bx, by, bw, bh, i % 2 ? 0x121e2b : 0x0d1822);
        fillRect(bx, by, bw, 1, 0x24384c); // parapet catching the light
        for (let wy = by + 4; wy < by + bh - 2; wy += 5) {
            for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) {
                if ((wx + wy + i) % 3) drawPixel(wx, wy, (wx + wy) % 5 ? 0xffd166 : 0xbfe3ff);
            }
        }
    });
    fillRect(4, 74, 152, 4, 0x1a2c3e); // the river taking the reflection
    for (let rx = 8; rx < 152; rx += 11) fillRect(rx, 75, 5, 1, 0x3f6a8a);
    fillRect(52, 4, 3, 74, 0x3a3f47); // mullions
    fillRect(104, 4, 3, 74, 0x3a3f47);
    fillRect(4, 32, 152, 2, 0x2f343b); // transom
    fillRect(0, 78, 160, 10, 0x6f6a62); // stone sill
    fillRect(0, 78, 160, 2, 0x8d877d);
    fillRect(0, 0, 12, 88, 0xd8cdb8); // sheer drapes pushed to the ends
    fillRect(148, 0, 12, 88, 0xd8cdb8);
    fillRect(2, 0, 3, 88, 0xe8e0cf);
    fillRect(153, 0, 3, 88, 0xe8e0cf);
    fillRect(9, 0, 2, 88, 0xbdb3a0);
    fillRect(147, 0, 2, 88, 0xbdb3a0);
    g.generateTexture('suite_window', 160, 88);

    // Kitchenette uppers: handleless doors with a strip light underneath.
    g.clear();
    fillRect(0, 0, 112, 24, 0xe6e2d9); // door fronts
    fillRect(0, 0, 112, 2, 0xf2efe8);
    for (let dx = 28; dx < 112; dx += 28) fillRect(dx - 1, 1, 1, 22, 0xc6c0b4); // shadow gaps
    fillRect(0, 21, 112, 3, 0xbdb6a8); // rail below the doors
    fillRect(84, 2, 26, 20, 0x6b4c36); // one bay left open in walnut
    fillRect(86, 4, 22, 8, 0x543a28);
    fillRect(89, 6, 5, 6, 0xf4f6f7); // mugs on the open shelf
    fillRect(96, 6, 5, 6, 0xf4f6f7);
    fillRect(102, 7, 4, 5, 0xd9b48a);
    fillRect(2, 24, 108, 2, 0xffe9b0); // under-cabinet strip light
    g.generateTexture('kitchenette_uppers', 112, 26);

    // Kitchenette run: stone top, sink and tap, cabinets under.
    g.clear();
    fillRect(0, 0, 112, 7, 0xd8d6d0); // stone counter
    fillRect(0, 0, 112, 2, 0xeceae4);
    drawPixel(19, 4, 0xb9b6ae); // veining
    drawPixel(20, 3, 0xb9b6ae);
    drawPixel(63, 5, 0xb9b6ae);
    drawPixel(88, 3, 0xb9b6ae);
    fillRect(0, 7, 112, 2, 0xa8a49b); // counter edge
    fillRect(60, 1, 26, 5, 0x9aa5b1); // stainless sink basin
    fillRect(62, 2, 22, 3, 0x7d8792);
    fillRect(71, 0, 3, 2, 0xc0c8cc); // tap rising against the wall
    fillRect(72, 0, 1, 3, 0xdfe4e7);
    fillRect(0, 9, 112, 30, 0x8a8378); // cabinet fronts
    fillRect(0, 9, 112, 1, 0x9d968a);
    for (let dx = 28; dx < 112; dx += 28) fillRect(dx - 1, 9, 1, 30, 0x6d675e); // gaps
    for (let hx = 8; hx < 108; hx += 28) fillRect(hx, 13, 12, 2, 0xc9a227); // brass bar pulls
    fillRect(0, 39, 112, 5, 0x5e5951); // recessed plinth
    fillRect(0, 39, 112, 1, 0x746e65);
    g.generateTexture('kitchenette_base', 112, 44);

    // Espresso machine, because it is that kind of hotel.
    g.clear();
    fillRect(2, 2, 14, 12, 0x2b2b33); // body
    fillRect(2, 2, 14, 2, 0x44444f);
    fillRect(3, 5, 9, 4, 0x8a9aa8); // chrome front
    fillRect(4, 6, 7, 2, 0xc0c8cc);
    fillRect(13, 6, 2, 4, 0xd44c3c); // indicator
    fillRect(5, 14, 6, 3, 0x9aa5b1); // group head
    fillRect(6, 17, 4, 3, 0xf4f6f7); // cup
    fillRect(6, 17, 4, 1, 0xd7dbdd);
    g.generateTexture('coffee_machine', 20, 20);

    // Botanical study — tall, cream, a single stem. Nothing like the horizon
    // canvas next to it; two identical frames on one wall look like a mistake.
    g.clear();
    fillRect(0, 0, 32, 44, 0xb9a07a); // oak frame
    fillRect(2, 2, 28, 40, 0x8a7658);
    fillRect(3, 3, 26, 38, 0xf3efe4); // mount and paper
    fillRect(15, 12, 2, 26, 0x4f6b3a); // stem
    for (const [lx, ly, dir] of [[10, 14, -1], [18, 18, 1], [9, 22, -1], [19, 26, 1], [11, 30, -1]]) {
        g.fillStyle(0x5f7f45, 1);
        g.fillEllipse(lx + dir * 2, ly, 9, 5);
        g.fillStyle(0x7b9c5c, 1);
        g.fillEllipse(lx + dir * 2, ly - 1, 6, 3);
    }
    fillRect(14, 8, 4, 5, 0x3f5730); // bud at the top
    drawPixel(15, 7, 0x7b9c5c);
    g.generateTexture('suite_art_botanical', 32, 44);

    // Terracotta arch print — flat shapes, no horizon, no leaves.
    g.clear();
    fillRect(0, 0, 40, 40, 0x2b2b2b); // slim black frame
    fillRect(2, 2, 36, 36, 0xf0e7db); // paper
    g.fillStyle(0xc0623c, 1); // the arch
    g.fillCircle(20, 20, 11);
    fillRect(9, 20, 23, 14, 0xc0623c);
    fillRect(2, 34, 36, 4, 0xf0e7db); // cut off above the base
    g.fillStyle(0xf0e7db, 1); // the arch is hollow
    g.fillCircle(20, 20, 6);
    fillRect(14, 20, 13, 14, 0xf0e7db);
    fillRect(2, 34, 36, 4, 0xf0e7db);
    g.fillStyle(0x2f4858, 1); // a disc behind the shoulder of the arch
    g.fillCircle(30, 12, 5);
    fillRect(6, 33, 28, 2, 0xc9a86a); // ground line
    g.generateTexture('suite_art_arch', 40, 40);

    // Daytime sidewalk. The existing 'pavement' slab is deliberately dark — it
    // doubles as the road in the driving scenes — and tint can only darken, so
    // the sunlit version has to be its own texture.
    g.clear();
    fillRect(0, 0, 32, 32, 0xcfc9bd);
    fillRect(0, 0, 32, 2, 0xdcd6ca); // slab catching the sun
    fillRect(0, 15, 32, 2, 0xb6afa2); // joints
    fillRect(0, 31, 32, 1, 0xb6afa2);
    fillRect(0, 0, 2, 32, 0xb6afa2);
    fillRect(16, 0, 2, 15, 0xb6afa2); // staggered courses
    fillRect(8, 17, 2, 15, 0xb6afa2);
    for (let i = 0; i < 22; i++) { // aggregate
        const ax = (i * 13 + (i % 5) * 3) % 32, ay = (i * 9 + (i % 3) * 4) % 32;
        drawPixel(ax, ay, i % 3 ? 0xc4bdb0 : 0xdad4c8);
    }
    drawPixel(23, 7, 0xa9a294);
    drawPixel(6, 24, 0xa9a294);
    g.generateTexture('sidewalk_slab', 32, 32);

    // Plaza fountain — the open half of the square was a car park's worth of
    // empty slabs, and a square this size would have something in the middle.
    g.clear();
    g.fillStyle(0x9b9384, 1); // outer basin
    g.fillEllipse(36, 40, 70, 26);
    g.fillStyle(0xb4ac9c, 1);
    g.fillEllipse(36, 38, 70, 24);
    g.fillStyle(0xc9c1b0, 1); // coping catching the sun
    g.fillEllipse(36, 36, 66, 20);
    g.fillStyle(0x3f7f9e, 1); // water
    g.fillEllipse(36, 37, 56, 15);
    g.fillStyle(0x59a3c4, 1);
    g.fillEllipse(35, 36, 48, 11);
    g.fillStyle(0x8fd0e6, 1);
    g.fillEllipse(30, 34, 20, 5);
    fillRect(32, 20, 8, 16, 0xb4ac9c); // pedestal
    fillRect(32, 20, 2, 16, 0xc9c1b0);
    g.fillStyle(0xb4ac9c, 1); // upper bowl
    g.fillEllipse(36, 20, 34, 12);
    g.fillStyle(0xc9c1b0, 1);
    g.fillEllipse(36, 18, 32, 10);
    g.fillStyle(0x59a3c4, 1);
    g.fillEllipse(36, 18, 24, 6);
    fillRect(34, 4, 4, 12, 0xa9a294); // spout
    g.fillStyle(0xd8f0fa, 0.85); // the jet, and what falls back
    g.fillEllipse(36, 3, 8, 6);
    for (const [wx, wy] of [[26, 22], [46, 22], [24, 26], [48, 26], [23, 30], [49, 30]]) {
        fillRect(wx, wy, 1, 5, 0xbfe6f4);
    }
    drawPixel(20, 36, 0xffffff); // sparkle on the water
    drawPixel(50, 39, 0xffffff);
    g.generateTexture('plaza_fountain', 72, 52);

    // --- THE STREET OUTSIDE THE PIZZA SHOP -----------------------------------
    // Night storefronts. The daytime Gaslamp shells do not work here: at night
    // what you actually see is the lit window and the sign, with the building
    // above them nearly black. So these are built the other way round — dark
    // mass, bright glass, and a spill of light onto the pavement.
    const drawNightShop = (w, h, o, dressWindow) => {
        g.clear();
        fillRect(0, 6, w, h - 6, o.wall); // building mass
        fillRect(0, 6, w, 2, o.wallLit); // parapet catching the streetlight
        fillRect(0, 8, w, 2, 0x0d0d12);
        fillRect(0, 6, 2, h - 6, 0x14141a); // corner shadow
        fillRect(w - 2, 6, 2, h - 6, 0x14141a);
        for (let ux = 8; ux < w - 14; ux += 22) { // flats above, a couple lit
            const lit = (ux / 22) % 3 === 1;
            fillRect(ux, 14, 14, 16, lit ? 0x5c4a2a : 0x191922);
            fillRect(ux, 14, 14, 1, 0x2a2a34);
            if (lit) {
                fillRect(ux + 1, 15, 12, 8, 0x8a6c34);
                fillRect(ux + 4, 18, 6, 9, 0x241d10); // someone at the window
            }
            fillRect(ux + 6, 14, 2, 16, 0x101016); // sash bar
        }
        // A dark plate with neon piping top and bottom, rather than a solid bar
        // of neon — the shop's name has to sit on this and be readable at 9px.
        fillRect(4, 34, w - 8, 15, o.signBack);
        fillRect(5, 35, w - 10, 2, o.neon);
        fillRect(5, 35, w - 10, 1, o.neonGlow);
        fillRect(5, 46, w - 10, 2, o.neon);
        fillRect(5, 47, w - 10, 1, o.neonGlow);
        fillRect(4, 34, 1, 15, o.neon);
        fillRect(w - 5, 34, 1, 15, o.neon);
        fillRect(2, 50, w - 4, 3, 0x101016); // fascia below the sign

        fillRect(5, 54, w - 10, h - 66, 0x0a0a0e); // window reveal
        fillRect(7, 56, w - 14, h - 70, o.glass); // lit interior
        dressWindow(w, h);
        fillRect(w - 24, 56, 18, h - 70, 0x14141a); // door
        fillRect(w - 22, 58, 14, h - 76, o.glass);
        fillRect(w - 12, h - 30, 2, 4, 0xb9a06a); // handle
        g.fillStyle(0xffffff, 0.06); // reflection down the glass
        g.fillRect(11, 56, 4, h - 70);
        g.fillRect(21, 56, 2, h - 70);
        fillRect(0, h - 12, w, 12, 0x1b1b22); // stall riser
        fillRect(0, h - 12, w, 1, 0x2c2c36);
        g.fillStyle(o.spill, 0.18); // light spilling onto the pavement
        g.fillRect(6, h - 4, w - 26, 4);
    };

    // Taqueria — open late, which is the whole point of it.
    drawNightShop(104, 100, {
        wall: 0x241f1c, wallLit: 0x3a322c, signBack: 0x1a1411, neon: 0xf2a03c, neonGlow: 0xffd88a,
        glass: 0x6b4a1e, spill: 0xffc266
    }, (w, h) => {
        fillRect(10, 74, 62, 4, 0x8a6a3a); // counter
        fillRect(10, 74, 62, 1, 0xb08c50);
        fillRect(14, 62, 10, 12, 0x2b1c0e); // cook behind it
        fillRect(15, 58, 8, 5, 0x6b4a2c);
        fillRect(14, 57, 10, 2, 0xe8e2d6); // paper hat
        fillRect(44, 63, 9, 11, 0x35240f); // customer, back to us
        fillRect(45, 59, 7, 5, 0x4a3320);
        for (let px = 30, i = 0; px < 66; px += 8, i++) { // menu board
            fillRect(px, 60, 6, 2, i % 2 ? 0xffd88a : 0xf2a03c);
        }
        g.fillStyle(0xffe9b0, 0.35); // heat lamps
        g.fillCircle(24, 62, 5);
        g.fillCircle(58, 62, 5);
    });
    g.generateTexture('night_shop_taco', 104, 100);

    // Laundromat — the coldest light on any street at night.
    drawNightShop(104, 100, {
        wall: 0x1c2028, wallLit: 0x2e3540, signBack: 0x121620, neon: 0x4fc3f7, neonGlow: 0xbfe9ff,
        glass: 0x9fb8c4, spill: 0xcfe8f5
    }, (w, h) => {
        for (let mx = 10; mx < 70; mx += 16) { // washers along the back wall
            fillRect(mx, 60, 13, 20, 0xdfe6ea);
            fillRect(mx, 60, 13, 2, 0xf2f6f8);
            fillRect(mx, 78, 13, 2, 0x9aa5b1);
            g.fillStyle(0x37474f, 1);
            g.fillCircle(mx + 6, 69, 5);
            g.fillStyle(0x8fd0e6, 1);
            g.fillCircle(mx + 6, 69, 4);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(mx + 4, 67, 1);
        }
        fillRect(74, 62, 8, 18, 0x2b3439); // a lone customer waiting
        fillRect(75, 57, 6, 5, 0x6b4a2c);
        fillRect(8, 82, 66, 2, 0x8fa0aa); // bench
    });
    g.generateTexture('night_shop_laundry', 104, 100);

    // Liquor store — bottles all the way up, red neon in the window.
    drawNightShop(104, 100, {
        wall: 0x261a1c, wallLit: 0x3d2a2c, signBack: 0x180f10, neon: 0xe53950, neonGlow: 0xff9aa6,
        glass: 0x4a2c2e, spill: 0xff8a96
    }, (w, h) => {
        const bottles = [0x2f5d3a, 0x7a4a1e, 0x3a4a7a, 0x6b2b2b, 0x8a7a2a];
        for (let shelf = 60; shelf < 84; shelf += 11) {
            for (let bx = 10; bx < 72; bx += 5) {
                fillRect(bx, shelf, 3, 8, bottles[(bx + shelf) % bottles.length]);
                fillRect(bx, shelf, 1, 8, 0xd8cfae); // the light through the glass
                drawPixel(bx + 1, shelf - 1, 0x2a2018); // neck
            }
            fillRect(8, shelf + 8, 66, 2, 0x3a2a24); // shelf
        }
        fillRect(12, 56, 20, 3, 0xff9aa6); // OPEN sign
        fillRect(12, 56, 20, 1, 0xffffff);
    });
    g.generateTexture('night_shop_liquor', 104, 100);

    // Tattoo parlour — purple neon, one artist still working.
    drawNightShop(104, 100, {
        wall: 0x1e1826, wallLit: 0x332a40, signBack: 0x140f1a, neon: 0xb14ef2, neonGlow: 0xe0b0ff,
        glass: 0x3a2b4c, spill: 0xd09aff
    }, (w, h) => {
        for (let fx = 10; fx < 72; fx += 15) { // flash sheets on the wall
            fillRect(fx, 58, 12, 14, 0xe8e2d6);
            fillRect(fx + 2, 60, 8, 2, 0x2b2b33);
            fillRect(fx + 3, 64, 6, 5, [0xd94f4f, 0x4f7fd9, 0x2f7d4f][(fx / 15) % 3]);
        }
        fillRect(14, 78, 30, 4, 0x2b2b33); // the chair
        fillRect(16, 74, 26, 4, 0x3f3f4a);
        fillRect(20, 70, 8, 5, 0xe6cbb0); // client's arm on the rest
        fillRect(46, 70, 9, 12, 0x24202c); // artist leaning in
        fillRect(47, 65, 7, 5, 0x5a4030);
        g.fillStyle(0xf4f0ff, 0.4); // lamp over the chair
        g.fillCircle(30, 66, 7);
    });
    g.generateTexture('night_shop_tattoo', 104, 100);

    // The pizza shop, built from the same shell as its neighbours instead of a
    // flat red slab — it is the destination, so it is simply wider and taller.
    drawNightShop(160, 140, {
        wall: 0x2c1a18, wallLit: 0x4a2c26, signBack: 0x1a0f0e, neon: 0xe03c2c, neonGlow: 0xffb0a0,
        glass: 0x7a4a20, spill: 0xffb066
    }, (w, h) => {
        // Wood-fired oven on the left, with the fire actually visible in it.
        fillRect(12, 74, 40, 44, 0x6b4a3a);
        fillRect(12, 74, 40, 2, 0x8a6450);
        g.fillStyle(0x3a2418, 1); // the arch
        g.fillCircle(32, 96, 15);
        fillRect(17, 96, 30, 22, 0x3a2418);
        g.fillStyle(0xd4641e, 1); // fire
        g.fillCircle(32, 100, 10);
        g.fillStyle(0xf5a623, 1);
        g.fillCircle(32, 103, 7);
        g.fillStyle(0xffe08a, 1);
        g.fillCircle(31, 105, 4);
        for (let bx = 14; bx < 50; bx += 8) fillRect(bx, 72, 6, 2, 0x8a6450); // brick course

        // Counter running the width, with pies on it.
        fillRect(58, 104, 74, 5, 0xb08c50);
        fillRect(58, 104, 74, 1, 0xd4ab6a);
        fillRect(58, 109, 74, 9, 0x6b4a2c);
        for (const cx of [70, 94, 118]) {
            g.fillStyle(0xe8b45c, 1); // crust
            g.fillCircle(cx, 100, 9);
            g.fillStyle(0xc4402c, 1); // sauce
            g.fillCircle(cx, 100, 7);
            g.fillStyle(0xf0d68c, 1); // cheese
            g.fillCircle(cx, 99, 6);
            drawPixel(cx - 3, 98, 0x9c2a22); // pepperoni
            drawPixel(cx + 2, 101, 0x9c2a22);
            drawPixel(cx + 3, 96, 0x9c2a22);
        }

        // The guy working the peel.
        fillRect(80, 76, 11, 22, 0xe8e2d6);
        fillRect(80, 76, 11, 2, 0xf6f4ee);
        fillRect(82, 70, 7, 6, 0x6b4a2c); // head
        fillRect(80, 68, 11, 3, 0xf6f4ee); // hat
        fillRect(91, 80, 20, 2, 0xa9906c); // the peel, held out towards the oven
        fillRect(108, 76, 9, 8, 0xc0c8cc);
        fillRect(60, 62, 62, 3, 0xffb0a0); // menu strip above the counter
        for (let mx = 62; mx < 120; mx += 9) fillRect(mx, 66, 6, 2, 0xd4ab6a);
    });
    g.generateTexture('night_shop_pizza', 160, 140);

    // SDPD bike patrol — downtown at night is bicycles, not cruisers.
    g.clear();
    fillRect(11, 4, 10, 4, 0x1b2436); // cap
    fillRect(11, 4, 10, 1, 0x2b3852);
    fillRect(11, 8, 11, 2, 0x141b29); // peak
    drawPixel(15, 5, 0xd4a017); // cap badge
    drawFace(9, { brow: 0x3a2f28 });
    fillRect(10, 15, 12, 12, 0x1f2a3f); // uniform shirt
    fillRect(10, 15, 12, 1, 0x2f3d58);
    fillRect(10, 15, 3, 12, 0x182131); // shaded side
    fillRect(11, 17, 4, 3, 0xc9c9d2); // shoulder patch and badge
    drawPixel(19, 18, 0xd4a017);
    drawPixel(19, 19, 0xd4a017);
    fillRect(9, 19, 2, 6, 0xe0b48c); // arms
    fillRect(21, 19, 2, 6, 0xe0b48c);
    fillRect(10, 26, 12, 3, 0x14181f); // duty belt
    drawPixel(12, 27, 0xc9c9d2);
    drawPixel(19, 27, 0x2b2b33);
    fillRect(11, 29, 4, 3, 0x1b2436); // shorts, because bike patrol
    fillRect(17, 29, 4, 3, 0x1b2436);
    g.generateTexture('cop', 32, 32);

    // The bicycle, drawn side on so it can ride in from off screen.
    g.clear();
    g.lineStyle(2, 0x1a1a20, 1); // wheels
    g.strokeCircle(9, 17, 8);
    g.strokeCircle(35, 17, 8);
    g.lineStyle(1, 0x6b7280, 1);
    g.strokeCircle(9, 17, 5);
    g.strokeCircle(35, 17, 5);
    fillRect(9, 9, 26, 2, 0x2c4a7a); // top tube
    fillRect(13, 11, 2, 7, 0x2c4a7a); // seat tube
    fillRect(22, 10, 2, 8, 0x2c4a7a); // down tube run
    fillRect(9, 10, 2, 8, 0x2c4a7a);
    fillRect(33, 8, 2, 10, 0x2c4a7a); // fork
    fillRect(30, 6, 8, 2, 0x1a1a20); // bars
    fillRect(10, 6, 7, 3, 0x1a1a20); // saddle
    fillRect(12, 14, 4, 3, 0xc9c9d2); // pannier
    fillRect(36, 4, 4, 4, 0xe53935); // the light on the bars
    fillRect(36, 4, 2, 4, 0x1e88e5);
    drawPixel(4, 17, 0xc9c9d2); // spoke glints
    drawPixel(40, 17, 0xc9c9d2);
    g.generateTexture('police_bike', 44, 28);

    // Airline ground staff — one sprite serving every desk and every gate, so
    // the people behind the counters read as staff rather than as more of the
    // randomly tinted crowd.
    g.clear();
    drawLongHair(6, 0x3a2a1e, 0x54402e);
    drawFace(9, { brow: 0x3a2a1e });
    fillRect(10, 15, 12, 13, 0x2a3a5c); // blazer
    fillRect(10, 15, 12, 1, 0x3a4e78);
    fillRect(10, 15, 3, 13, 0x1e2b45); // shaded side
    fillRect(14, 15, 4, 8, 0xdfe4ea); // blouse in the vee of the lapels
    fillRect(13, 15, 1, 9, 0x1e2b45);
    fillRect(18, 15, 1, 9, 0x1e2b45);
    fillRect(14, 16, 4, 2, 0xc0392b); // neck scarf
    drawPixel(15, 18, 0xe05c4a);
    fillRect(9, 19, 2, 7, SKIN); // arms
    fillRect(21, 19, 2, 7, SKIN);
    drawPixel(19, 20, 0xd4a017); // name badge
    fillRect(11, 28, 4, 4, 0x22293a); // skirt and legs
    fillRect(17, 28, 4, 4, 0x22293a);
    g.generateTexture('airline_agent', 32, 32);

    // The consequence of the liquor store, on the pavement.
    g.clear();
    g.fillStyle(0x6f7a24, 1);
    g.fillEllipse(11, 7, 20, 9);
    g.fillStyle(0x93a032, 1);
    g.fillEllipse(10, 6, 16, 7);
    g.fillStyle(0xb5c04a, 1);
    g.fillEllipse(8, 5, 9, 4);
    drawPixel(4, 4, 0xd4dc86); // the light catching it
    drawPixel(14, 8, 0x6f7a24);
    g.fillStyle(0x93a032, 1); // splashes
    g.fillEllipse(19, 9, 5, 3);
    g.fillEllipse(2, 9, 4, 2);
    drawPixel(17, 4, 0x93a032);
    g.generateTexture('sick_puddle', 22, 13);

    // --- 54TH STREET -----------------------------------------------------------
    // Yvy's room. Teal sheets, and a four-year-old's worth of things on the floor.
    g.clear();
    fillRect(0, 0, 32, 32, 0xe9e2d4); // painted wall
    fillRect(0, 0, 32, 1, 0xf4efe4);
    for (let i = 0; i < 5; i++) drawPixel((i * 13 + 3) % 32, (i * 9 + 5) % 32, 0xded6c6); // roller texture
    // No rail in the tile: it would repeat down every row of the wall and
    // ladder. The scene draws it once along the bottom edge instead.
    g.generateTexture('bedroom_wall', 32, 32);

    g.clear();
    fillRect(2, 0, 60, 10, 0x8d6e4f); // pale wood headboard
    fillRect(2, 0, 60, 3, 0xa88a68);
    fillRect(4, 8, 56, 2, 0x6f553c);
    fillRect(6, 11, 22, 13, 0xf6f4ee); // pillows
    fillRect(36, 11, 22, 13, 0xf6f4ee);
    fillRect(6, 11, 22, 2, 0xffffff);
    fillRect(6, 22, 22, 2, 0xdcd8ce);
    fillRect(36, 22, 22, 2, 0xdcd8ce);
    fillRect(4, 25, 56, 68, 0x2f8f8a); // teal duvet
    fillRect(4, 25, 56, 3, 0x4fb3ad); // turned-down edge
    fillRect(52, 25, 8, 68, 0x25706c); // shadowed side
    fillRect(4, 25, 3, 68, 0x3ea19b); // the side the window is on
    for (let sy = 32; sy < 92; sy += 12) fillRect(7, sy, 46, 1, 0x28807b); // quilting
    fillRect(4, 52, 56, 10, 0xe8c46a); // a mustard throw across the foot
    fillRect(4, 52, 56, 2, 0xf2d68a);
    fillRect(4, 90, 56, 3, 0x1f5f5c); // foot of the bed
    fillRect(28, 25, 2, 27, 0x3ea19b);
    g.generateTexture('bed_teal', 64, 96);

    // Toy chest with the lid up and the contents visible.
    g.clear();
    fillRect(0, 8, 40, 20, 0xc98a4b); // body
    fillRect(0, 8, 40, 2, 0xe0a462);
    fillRect(0, 24, 40, 4, 0x9c6532);
    fillRect(2, 12, 36, 3, 0x2f8f8a); // painted band
    for (let bx = 4; bx < 36; bx += 7) fillRect(bx, 3, 5, 6, [0xd94f4f, 0x4f7fd9, 0xf2c14e, 0x5bbf6a][(bx / 7) % 4]); // toys poking out
    fillRect(0, 0, 40, 4, 0x9c6532); // open lid, seen edge on
    fillRect(0, 0, 40, 1, 0xc98a4b);
    drawPixel(19, 20, 0xf2e3c0); // catch
    g.generateTexture('toy_chest', 40, 30);

    // Wooden blocks, spilled.
    g.clear();
    const blockCols = [0xd94f4f, 0x4f7fd9, 0xf2c14e, 0x5bbf6a, 0xb46fd9];
    const blockShade = [0xa63838, 0x385da6, 0xc49a34, 0x44934f, 0x8a51a6];
    [[0, 10], [8, 12], [16, 9], [4, 3], [13, 2], [19, 14]].forEach(([bx, by], i) => {
        fillRect(bx, by, 7, 6, blockCols[i % blockCols.length]);
        fillRect(bx, by, 7, 1, 0xffffff);
        fillRect(bx, by + 5, 7, 1, blockShade[i % blockShade.length]);
        drawPixel(bx + 3, by + 2, 0xf6f4ee); // the letter on the face
    });
    g.generateTexture('toy_blocks', 26, 20);

    // A stuffed dinosaur, much loved.
    g.clear();
    g.fillStyle(0x5bbf6a, 1);
    g.fillEllipse(11, 14, 16, 12); // body
    g.fillCircle(6, 8, 5); // head
    fillRect(14, 12, 8, 3, 0x4aa657); // tail
    fillRect(19, 13, 3, 2, 0x4aa657);
    for (let i = 0; i < 4; i++) fillRect(8 + i * 3, 7 + (i % 2), 2, 2, 0xf2c14e); // back plates
    fillRect(4, 18, 4, 3, 0x4aa657); // feet
    fillRect(12, 18, 4, 3, 0x4aa657);
    drawPixel(4, 7, 0x1d1a17); // eye
    drawPixel(3, 10, 0xe86f6f); // snout
    g.generateTexture('toy_dino', 22, 22);

    // Push-along car.
    g.clear();
    fillRect(2, 4, 18, 6, 0xd94f4f); // body
    fillRect(2, 4, 18, 2, 0xe87a7a);
    fillRect(6, 1, 9, 4, 0x8fd0e6); // cabin
    fillRect(7, 2, 7, 2, 0xcfeaf5);
    g.fillStyle(0x2b2b33, 1);
    g.fillCircle(6, 11, 3);
    g.fillCircle(16, 11, 3);
    g.fillStyle(0x9aa5b1, 1);
    g.fillCircle(6, 11, 1);
    g.fillCircle(16, 11, 1);
    g.generateTexture('toy_car', 22, 14);

    // Penny's corner: two bowls on a wipe-clean mat.
    g.clear();
    fillRect(0, 6, 40, 13, 0x6f8fa8); // mat
    fillRect(0, 6, 40, 2, 0x8aa8bf);
    fillRect(0, 17, 40, 2, 0x57748a);
    g.fillStyle(0xc7452f, 1); // food bowl
    g.fillEllipse(11, 10, 16, 9);
    g.fillStyle(0x9c3423, 1);
    g.fillEllipse(11, 11, 13, 6);
    g.fillStyle(0x8a5a30, 1); // kibble
    g.fillEllipse(11, 10, 10, 4);
    drawPixel(9, 9, 0xa9723f);
    drawPixel(13, 10, 0xa9723f);
    g.fillStyle(0x3f7fa8, 1); // water bowl
    g.fillEllipse(29, 10, 16, 9);
    g.fillStyle(0x2f6280, 1);
    g.fillEllipse(29, 11, 13, 6);
    g.fillStyle(0x7fc4e0, 1);
    g.fillEllipse(29, 10, 10, 4);
    drawPixel(26, 9, 0xd8f0fa);
    g.generateTexture('dog_bowls', 40, 20);

    // The rug everything happens on.
    g.clear();
    fillRect(0, 0, 72, 52, 0xdcc9a8);
    fillRect(0, 0, 72, 3, 0xe8d9bd);
    fillRect(0, 49, 72, 3, 0xc4ae8c);
    fillRect(4, 4, 64, 44, 0x8fc4bf); // teal field, to match the bed
    fillRect(4, 4, 64, 2, 0xa9d6d2);
    fillRect(10, 10, 52, 32, 0xdcc9a8); // border bands
    fillRect(16, 16, 40, 20, 0x8fc4bf);
    for (let i = 0; i < 9; i++) { // little motifs
        drawPixel(20 + i * 4, 20 + (i % 3) * 5, 0xe8a24e);
        drawPixel(22 + i * 4, 30 - (i % 2) * 4, 0xd97f7f);
    }
    for (let fx = 2; fx < 72; fx += 5) { // fringe
        fillRect(fx, 0, 2, 2, 0xc4ae8c);
        fillRect(fx, 50, 2, 2, 0xc4ae8c);
    }
    g.generateTexture('kid_rug', 72, 52);

    // --- HOSPITAL ------------------------------------------------------------
    // Curtain rail and privacy curtain, the thing every ward actually looks like.
    g.clear();
    fillRect(0, 0, 64, 3, 0xb0b8bd); // rail
    fillRect(0, 0, 64, 1, 0xd2d8dc);
    for (let i = 2; i < 64; i += 6) drawPixel(i, 3, 0x8a9297); // hooks
    fillRect(0, 4, 64, 60, 0x9fc7c4); // curtain
    for (let fx = 0; fx < 64; fx += 8) { // folds
        fillRect(fx, 4, 3, 60, 0xb4d6d3);
        fillRect(fx + 5, 4, 2, 60, 0x84aeab);
    }
    fillRect(0, 4, 64, 2, 0xc6e0de);
    fillRect(0, 60, 64, 4, 0x84aeab); // weighted hem
    g.generateTexture('ward_curtain', 64, 64);

    // Trolley of supplies beside the bed.
    g.clear();
    fillRect(2, 6, 32, 4, 0xd7dbdd); // top shelf
    fillRect(2, 6, 32, 1, 0xeceff1);
    fillRect(4, 0, 7, 6, 0xe8f0f2); // kidney dish and bottles
    fillRect(13, 1, 4, 5, 0x7fb3a8);
    fillRect(19, 2, 3, 4, 0xd98f8f);
    fillRect(24, 0, 6, 6, 0xf4f6f7);
    fillRect(2, 18, 32, 4, 0xc9ced1); // lower shelf
    fillRect(6, 14, 10, 4, 0xbfc8cc);
    fillRect(20, 13, 8, 5, 0xa8b4ba);
    fillRect(4, 10, 2, 14, 0x9aa5b1); // frame
    fillRect(30, 10, 2, 14, 0x9aa5b1);
    fillRect(4, 24, 3, 3, 0x546e7a); // castors
    fillRect(29, 24, 3, 3, 0x546e7a);
    g.generateTexture('med_trolley', 36, 28);

    // Get-well balloon, because a four year old is having surgery.
    g.clear();
    g.fillStyle(0xd94f7e, 1);
    g.fillEllipse(9, 10, 16, 19);
    g.fillStyle(0xe87aa0, 1);
    g.fillEllipse(7, 8, 9, 11);
    g.fillStyle(0xf6c6d6, 1);
    g.fillEllipse(6, 6, 4, 5);
    fillRect(8, 19, 2, 2, 0xb03c66); // knot
    for (let ty = 21; ty < 34; ty++) drawPixel(9 + Math.round(Math.sin(ty / 3) * 2), ty, 0xf0f0f0); // string
    g.generateTexture('balloon', 20, 34);

    // --- BACK GARDEN ----------------------------------------------------------
    // The spot under the tree, with the earth turned over.
    g.clear();
    fillRect(0, 6, 40, 16, 0x5a4128); // turned soil
    fillRect(0, 6, 40, 2, 0x6f5133);
    for (let i = 0; i < 14; i++) drawPixel((i * 11 + 3) % 40, 8 + (i * 5) % 12, i % 2 ? 0x4a351f : 0x7a5b3a);
    fillRect(2, 20, 36, 3, 0x3f2d1a); // shadow in the cut
    fillRect(0, 0, 40, 7, 0x4c8b3f); // the grass lip around it
    for (let i = 0; i < 8; i++) drawPixel(i * 5 + 2, 4 + (i % 3), 0x3f7434);
    g.generateTexture('grave_plot', 40, 24);

    // A small stone with her name cut into it.
    g.clear();
    fillRect(3, 4, 20, 22, 0x9aa0a4); // stone
    fillRect(3, 4, 20, 2, 0xb8bec2);
    fillRect(21, 6, 2, 20, 0x7d8286);
    g.fillStyle(0x9aa0a4, 1);
    g.fillEllipse(13, 5, 20, 8); // rounded top
    g.fillStyle(0xb8bec2, 1);
    g.fillEllipse(12, 4, 16, 5);
    fillRect(7, 12, 12, 2, 0x6b7074); // the name, too small to read
    fillRect(8, 16, 10, 1, 0x6b7074);
    fillRect(9, 19, 8, 1, 0x6b7074);
    fillRect(1, 26, 24, 3, 0x6f7a3f); // grass banked against the base
    g.generateTexture('pet_stone', 26, 30);

    // Shovel, left leaning where he finished.
    g.clear();
    fillRect(7, 0, 3, 26, 0x8d6e4f); // handle
    fillRect(7, 0, 1, 26, 0xa88a68);
    fillRect(5, 0, 7, 3, 0x6f553c); // grip
    fillRect(4, 26, 9, 4, 0x9aa5b1); // collar
    g.fillStyle(0xb0b8bd, 1); // blade
    g.fillEllipse(8, 34, 14, 12);
    fillRect(1, 28, 14, 6, 0xb0b8bd);
    g.fillStyle(0x8a9297, 1);
    g.fillEllipse(9, 35, 10, 8);
    drawPixel(4, 36, 0x5a4128); // soil still on it
    drawPixel(11, 33, 0x5a4128);
    g.generateTexture('shovel', 17, 41);

    // --- FIRST APARTMENT -------------------------------------------------------
    // Moving boxes, taped and labelled in marker.
    g.clear();
    fillRect(0, 4, 30, 24, 0xc9a86a); // carton
    fillRect(0, 4, 30, 2, 0xdcbd80);
    fillRect(0, 26, 30, 2, 0xa8873f);
    fillRect(13, 4, 4, 24, 0xb8955a); // the seam down the middle
    fillRect(0, 8, 30, 3, 0xe8dcc0); // packing tape
    fillRect(0, 8, 30, 1, 0xf4ecd8);
    fillRect(5, 16, 20, 2, 0x3a3a44); // marker writing
    fillRect(5, 20, 13, 2, 0x3a3a44);
    fillRect(2, 0, 26, 4, 0xb8955a); // flaps folded over
    g.generateTexture('moving_box', 30, 28);

    // A lamp still in its box, and a rolled rug — the week you move in.
    g.clear();
    g.fillStyle(0xb58a4a, 1);
    g.fillEllipse(8, 8, 15, 13); // rolled rug, end on
    g.fillStyle(0x8fc4bf, 1);
    g.fillEllipse(8, 8, 10, 9);
    g.fillStyle(0xd97f7f, 1);
    g.fillEllipse(8, 8, 5, 5);
    fillRect(8, 2, 34, 12, 0xb58a4a); // the length of it
    fillRect(8, 2, 34, 2, 0xcfa062);
    fillRect(8, 12, 34, 2, 0x8f6c36);
    for (let rx = 12; rx < 42; rx += 7) fillRect(rx, 5, 2, 6, 0x8fc4bf);
    g.generateTexture('rolled_rug', 44, 17);

    // --- THANKSGIVING ----------------------------------------------------------
    // Dining chair, seen from the side of the table.
    g.clear();
    fillRect(3, 0, 18, 14, 0x7b4f2c); // back
    fillRect(3, 0, 18, 2, 0x9c6a3f);
    fillRect(5, 3, 14, 9, 0x8d5c35);
    fillRect(5, 6, 14, 1, 0x6b4326);
    fillRect(1, 14, 22, 5, 0x8d5c35); // seat
    fillRect(1, 14, 22, 1, 0xa87043);
    fillRect(2, 19, 3, 7, 0x6b4326); // legs
    fillRect(19, 19, 3, 7, 0x6b4326);
    g.generateTexture('dining_chair', 24, 26);

    // Autumn wreath for the door.
    g.clear();
    g.lineStyle(5, 0x4f6b2f, 1);
    g.strokeCircle(16, 16, 12);
    g.lineStyle(2, 0x6b8a42, 1);
    g.strokeCircle(16, 16, 13);
    const leafCols = [0xc4622a, 0xd99a2b, 0x8a3b22, 0xb8862f];
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const lx = Math.round(16 + Math.cos(a) * 12);
        const ly = Math.round(16 + Math.sin(a) * 12);
        fillRect(lx - 1, ly - 1, 3, 3, leafCols[i % leafCols.length]);
        drawPixel(lx, ly, 0xe8b45c);
    }
    fillRect(14, 1, 4, 4, 0xc4622a); // bow
    fillRect(12, 2, 3, 2, 0xa84a1e);
    fillRect(17, 2, 3, 2, 0xa84a1e);
    g.generateTexture('autumn_wreath', 32, 32);

    // Sideboard with the overflow dishes on it.
    g.clear();
    fillRect(0, 8, 56, 20, 0x7b4f2c); // carcass
    fillRect(0, 8, 56, 2, 0x9c6a3f);
    fillRect(0, 26, 56, 3, 0x5c3a20);
    for (let dx = 3; dx < 54; dx += 18) { // doors
        fillRect(dx, 12, 15, 13, 0x8d5c35);
        fillRect(dx + 6, 17, 4, 2, 0xd4a017);
    }
    fillRect(0, 5, 56, 4, 0x9c6a3f); // top
    fillRect(0, 5, 56, 1, 0xb87c4c);
    fillRect(5, 0, 12, 5, 0xf4f6f7); // dishes waiting
    fillRect(5, 0, 12, 2, 0xffffff);
    fillRect(21, 1, 9, 4, 0xe8c46a);
    fillRect(34, 0, 14, 5, 0xc7452f);
    fillRect(34, 0, 14, 1, 0xdd6a52);
    g.generateTexture('sideboard', 56, 30);

    // A laid place: plate, fork, knife. Small enough to sit on the table
    // without burying the food.
    g.clear();
    fillRect(2, 3, 1, 6, 0xb0b4b8); // fork
    drawPixel(2, 2, 0xd2d6da);
    fillRect(13, 3, 1, 6, 0xb0b4b8); // knife
    drawPixel(13, 2, 0xd2d6da);
    g.fillStyle(0xcfd3d6, 1); // plate rim
    g.fillEllipse(8, 6, 11, 9);
    g.fillStyle(0xf6f7f8, 1);
    g.fillEllipse(8, 6, 9, 7);
    g.fillStyle(0xe4e7e9, 1);
    g.fillEllipse(8, 6, 5, 4);
    drawPixel(6, 4, 0xffffff);
    g.generateTexture('place_setting', 16, 12);

    // Downtown after dark, for the New Year and for the drive across town. The
    // daytime sd_skyline cannot just be tinted for this: tint only darkens, and
    // what makes a night skyline is the windows being brighter than the sky.
    g.clear();
    const nightTowers = [[0, 40, 26, 56], [28, 22, 20, 74], [50, 52, 16, 44], [68, 10, 22, 86],
        [92, 34, 18, 62], [112, 20, 24, 76], [138, 46, 16, 50], [156, 14, 20, 82], [178, 36, 22, 60]];
    nightTowers.forEach(([bx, by, bw, bh], i) => {
        fillRect(bx, by, bw, bh, i % 2 ? 0x161d2e : 0x1b2436);
        fillRect(bx, by, bw, 1, 0x2a3752); // parapet
        fillRect(bx + bw - 2, by + 1, 2, bh - 1, 0x101623);
        for (let wy = by + 4; wy < by + bh - 3; wy += 6) {
            for (let wx = bx + 3; wx < bx + bw - 3; wx += 5) {
                if ((wx * 3 + wy * 7 + i) % 5 < 3) {
                    drawPixel(wx, wy, (wx + wy) % 7 ? 0xffd98a : 0xbfe3ff);
                    drawPixel(wx + 1, wy, (wx + wy) % 4 ? 0xe8bf6a : 0x8fc4e0);
                }
            }
        }
        if (bh > 70) { // aircraft warning light on the tall ones
            drawPixel(bx + (bw >> 1), by - 1, 0xff4d4d);
        }
    });
    g.generateTexture('night_skyline', 200, 96);

    // Somebody on a bike, side on, for the lane between the kerb and the cars.
    g.clear();
    g.lineStyle(2, 0x2b2b33, 1); // wheels
    g.strokeCircle(7, 22, 6);
    g.strokeCircle(27, 22, 6);
    g.lineStyle(1, 0x6f7680, 1);
    g.strokeCircle(7, 22, 3);
    g.strokeCircle(27, 22, 3);
    fillRect(9, 15, 16, 2, 0x3aa0c4); // frame
    fillRect(13, 16, 2, 7, 0x3aa0c4);
    fillRect(21, 16, 2, 7, 0x3aa0c4);
    fillRect(24, 12, 2, 8, 0x3aa0c4);
    fillRect(22, 11, 7, 2, 0x2b2b33); // bars
    fillRect(8, 12, 6, 2, 0x2b2b33); // saddle
    fillRect(14, 4, 8, 9, 0xd94f4f); // rider's back
    fillRect(14, 4, 8, 2, 0xe87a7a);
    fillRect(20, 6, 5, 2, 0xe6cbb0); // arm out to the bars
    fillRect(16, 0, 6, 5, 0xe6cbb0); // head
    fillRect(15, 0, 8, 2, 0x2b3a5c); // helmet
    drawPixel(22, 2, 0x1d1a17);
    fillRect(14, 13, 4, 5, 0x2b3a5c); // legs, one up one down
    fillRect(18, 15, 4, 6, 0x24314d);
    drawPixel(29, 11, 0xf2e3c0); // a light on the bars
    g.generateTexture('cyclist', 32, 30);

    // --- THE NIGHT IN THE DINOSAUR COSTUMES ------------------------------------
    // Drawn at 44x54 rather than scaled up from a smaller sprite: an inflatable
    // suit makes the wearer half again as big as everyone else, and a fractional
    // setScale on pixel art gives you pixels of two different sizes.
    //
    // Both suits are the same brown. Yvy is told apart by the bow on the skull,
    // not by the colour.
    const drawDinoSuit = ({ extras = null } = {}) => {
        g.clear();
        const skin = 0xb5773f, lit = 0xcf9152, shade = 0x8a5a2b, dark = 0x6b4520;

        // Skull, with the snout out to the right and the jaw dropped open.
        fillRect(12, 3, 17, 11, skin);
        fillRect(12, 3, 17, 3, lit);
        fillRect(27, 6, 13, 7, skin); // snout
        fillRect(27, 6, 13, 2, lit);
        fillRect(28, 14, 12, 4, shade); // lower jaw
        fillRect(28, 13, 12, 1, 0x6b2f2f); // the dark of the mouth
        for (let tx = 29; tx < 40; tx += 3) {
            fillRect(tx, 12, 2, 2, 0xf4f0e4); // upper teeth
            fillRect(tx + 1, 14, 2, 2, 0xf4f0e4); // lower
        }
        fillRect(10, 6, 3, 8, shade); // back of the skull
        fillRect(23, 4, 6, 2, shade); // brow ridge
        fillRect(24, 7, 3, 3, 0xf4f0e4); // eye
        fillRect(25, 8, 2, 2, 0x1d1a17);
        drawPixel(37, 8, dark); // nostril

        fillRect(15, 16, 10, 8, skin); // neck
        fillRect(15, 16, 3, 8, lit);
        fillRect(24, 17, 2, 7, shade);

        // Chest and belly.
        fillRect(12, 24, 17, 19, skin);
        fillRect(12, 24, 4, 19, lit);
        fillRect(26, 25, 3, 18, shade);
        fillRect(12, 24, 17, 2, shade);
        for (let by = 29; by < 42; by += 4) fillRect(15, by, 11, 1, lit); // belly scutes

        fillRect(8, 27, 5, 4, skin); // the famously short arms
        fillRect(28, 27, 5, 4, shade);
        fillRect(6, 29, 2, 2, dark);
        fillRect(33, 29, 2, 2, dark);

        // Legs, heavy at the thigh.
        fillRect(12, 43, 8, 7, skin);
        fillRect(22, 43, 8, 7, shade);
        fillRect(14, 50, 5, 2, dark);
        fillRect(24, 50, 5, 2, dark);
        fillRect(10, 51, 11, 3, dark); // feet
        fillRect(22, 51, 11, 3, dark);
        fillRect(10, 51, 11, 1, shade);
        fillRect(22, 51, 11, 1, shade);
        for (const cx of [10, 14, 18, 22, 26, 30]) drawPixel(cx, 53, 0xf4f0e4); // claws

        if (extras !== null) extras();
    };

    drawDinoSuit({
        extras: () => {
            // The bow tie, taped to the neck. Both the bow and the tape are drawn
            // large enough to read at the size he is on screen.
            fillRect(11, 22, 21, 3, 0xe4ded0); // the strip of packing tape
            fillRect(9, 22, 2, 2, 0xc4bdaa);
            fillRect(32, 23, 2, 2, 0xc4bdaa);
            fillRect(13, 18, 6, 8, 0x1f2b3a); // left wing
            fillRect(24, 18, 6, 8, 0x1f2b3a); // right wing
            fillRect(19, 20, 5, 4, 0x101820); // knot
            fillRect(13, 18, 6, 2, 0x3a4e68);
            fillRect(24, 18, 6, 2, 0x3a4e68);
        }
    });
    g.generateTexture('mike_dino', 44, 54);

    drawDinoSuit({
        extras: () => {
            fillRect(11, 1, 7, 6, 0xe0559a); // a bow stuck on the skull
            fillRect(21, 1, 7, 6, 0xe0559a);
            fillRect(18, 2, 4, 4, 0xb03c78);
            fillRect(11, 1, 7, 2, 0xf07ab0);
            fillRect(21, 1, 7, 2, 0xf07ab0);
        }
    });
    g.generateTexture('yvy_dino', 44, 54);

    // --- FIFTH & ROSE ----------------------------------------------------------
    // The corner entrance: brick pier either side, a curved glass canopy on
    // cables, the revolving door under it, and the rose roundel above.
    g.clear();
    fillRect(0, 0, 160, 120, 0xa89c86); // brick
    for (let by = 4; by < 120; by += 7) fillRect(0, by, 160, 1, 0x8f8470);
    for (let bx = 0; bx < 160; bx += 16) fillRect(bx, 0, 1, 120, 0x94896f);
    fillRect(0, 0, 160, 3, 0xc4b89e);
    fillRect(0, 96, 160, 24, 0xb8ad94); // pale stone base course
    fillRect(0, 96, 160, 2, 0xd2c7ad);

    fillRect(10, 6, 140, 40, 0x1d232b); // the tall curved window above
    for (let wx = 14; wx < 148; wx += 22) fillRect(wx, 8, 18, 36, 0x35506b);
    for (let wx = 14; wx < 148; wx += 22) fillRect(wx, 8, 18, 10, 0x4a6d8c);
    for (let wx = 22; wx < 148; wx += 22) fillRect(wx, 6, 3, 40, 0x1d232b); // mullions
    for (let i = 0; i < 14; i++) drawPixel(18 + i * 10, 20 + (i % 4) * 5, 0xdfe8f5);

    g.fillStyle(0xe8a0b4, 1); // the rose roundel over the door
    g.fillCircle(80, 56, 11);
    g.fillStyle(0xc4647e, 1);
    g.fillCircle(80, 56, 8);
    g.fillStyle(0xf2c4d2, 1);
    g.fillCircle(78, 54, 4);
    drawPixel(80, 56, 0x8a3d52);

    fillRect(10, 62, 140, 5, 0x22262c); // the curved canopy
    fillRect(10, 62, 140, 2, 0x3a404a);
    fillRect(6, 64, 148, 3, 0x2b3038);
    for (let cx = 14; cx < 148; cx += 18) fillRect(cx, 67, 14, 2, 0x4a5560);
    fillRect(28, 48, 1, 15, 0x6b7480); // tension cables
    fillRect(132, 48, 1, 15, 0x6b7480);

    fillRect(24, 70, 112, 50, 0x171b21); // the entrance recess
    fillRect(28, 72, 104, 46, 0x2a3a4a);
    for (let i = 0; i < 10; i++) drawPixel(34 + i * 10, 80 + (i % 3) * 7, 0xffd9a8);
    fillRect(78, 70, 4, 50, 0x22262c); // the revolving door
    fillRect(48, 74, 3, 44, 0x2b3038);
    fillRect(110, 74, 3, 44, 0x2b3038);
    fillRect(28, 70, 104, 3, 0x3a404a);
    fillRect(24, 116, 112, 4, 0x2b3038);
    fillRect(18, 84, 4, 20, 0xb0b8bd); // patio heaters
    fillRect(139, 84, 4, 20, 0xb0b8bd);
    fillRect(17, 80, 6, 4, 0xd2d8dc);
    fillRect(138, 80, 6, 4, 0xd2d8dc);
    g.generateTexture('fifth_rose_front', 160, 120);

    // --- THE SHOUT HOUSE -------------------------------------------------------
    // Duelling pianos. You can hear it from the pavement.
    g.clear();
    fillRect(0, 0, 128, 110, 0x2b2119);
    fillRect(0, 0, 128, 3, 0x453425);
    for (let by = 6; by < 60; by += 8) fillRect(2, by, 124, 1, 0x1f1811);
    fillRect(6, 8, 116, 26, 0x120d09);
    fillRect(8, 10, 112, 22, 0x1d1510);
    fillRect(10, 12, 108, 4, 0xf2c14e);
    fillRect(10, 27, 108, 4, 0xf2c14e);
    for (let nx = 14; nx < 114; nx += 9) fillRect(nx, 17, 5, 8, 0xffe08a);
    for (let bx = 8; bx < 122; bx += 10) drawPixel(bx, 6, 0xffe9b0);

    fillRect(6, 40, 116, 52, 0x0e0a07);
    fillRect(8, 42, 112, 48, 0x3a2414);
    for (let i = 0; i < 20; i++) {
        drawPixel(12 + (i * 13) % 104, 46 + (i * 7) % 40, i % 3 ? 0xd98f3c : 0xf2c14e);
    }
    [[28, 72], [86, 72]].forEach(([px, py], i) => { // two pianos, back to back
        fillRect(px - 14, py, 28, 10, 0x140f0a);
        fillRect(px - 14, py, 28, 2, 0x2b2119);
        for (let kx = px - 12; kx < px + 12; kx += 3) fillRect(kx, py + 3, 2, 5, 0xf4f0e4);
        for (let kx = px - 11; kx < px + 11; kx += 3) fillRect(kx, py + 3, 1, 3, 0x140f0a);
        fillRect(px - 2 + (i ? 6 : -6), py - 12, 9, 12, 0x2b3a5c);
        fillRect(px + (i ? 5 : -7), py - 17, 6, 5, 0x8a6a4a);
    });
    fillRect(0, 92, 128, 18, 0x1a1410);
    fillRect(0, 92, 128, 2, 0x2b2119);
    fillRect(96, 40, 26, 52, 0x0e0a07);
    fillRect(99, 43, 20, 46, 0x3a2414);
    fillRect(108, 66, 3, 4, 0xd4a017);
    g.generateTexture('shout_house_front', 128, 110);

    // --- COIN-OP ---------------------------------------------------------------
    // The Gaslamp corner: red brick pier up the middle, black awnings either
    // side of it, the round enamel sign on the pier, festoon bulbs under the
    // awning, and the cabinets going in the windows.
    g.clear();
    fillRect(0, 0, 150, 120, 0x1b1d24); // the dark upper storey
    fillRect(0, 0, 150, 3, 0x2e323d);
    fillRect(0, 6, 150, 22, 0x14161c); // steel-framed window above
    for (let wx = 6; wx < 146; wx += 18) fillRect(wx, 8, 14, 18, 0x232833);
    for (let wx = 4; wx < 148; wx += 18) fillRect(wx, 6, 2, 22, 0x3a404d);

    fillRect(0, 28, 62, 14, 0x121419); // the awnings, one to each face
    fillRect(88, 28, 62, 14, 0x121419);
    fillRect(0, 28, 62, 2, 0x2a2e38);
    fillRect(88, 28, 62, 2, 0x2a2e38);
    fillRect(0, 40, 62, 3, 0x0a0b0e); // their shadowed hems
    fillRect(88, 40, 62, 3, 0x0a0b0e);
    fillRect(6, 22, 2, 8, 0x2a2e38); // gooseneck lamps on the brickwork
    fillRect(4, 20, 7, 3, 0x3a404d);
    fillRect(140, 22, 2, 8, 0x2a2e38);
    fillRect(138, 20, 7, 3, 0x3a404d);

    fillRect(62, 0, 26, 120, 0x8c3f32); // the brick pier
    for (let by = 3; by < 120; by += 6) fillRect(62, by, 26, 1, 0x6f2f24);
    for (let by = 0; by < 120; by += 12) { fillRect(74, by, 1, 6, 0x6f2f24); fillRect(68, by + 6, 1, 6, 0x6f2f24); }
    fillRect(62, 0, 2, 120, 0xa04f3e);

    g.fillStyle(0x1a1c22, 1); // the round sign, bolted to the pier
    g.fillCircle(75, 40, 21);
    g.fillStyle(0xe8e4da, 1);
    g.fillCircle(75, 40, 19);
    g.fillStyle(0x2b2e36, 1);
    g.fillCircle(75, 40, 17);
    g.fillStyle(0xe8e4da, 1);
    g.fillCircle(75, 40, 15);
    fillRect(63, 37, 24, 6, 0x2b2e36); // COIN-OP across the middle
    for (let lx = 65; lx < 86; lx += 4) fillRect(lx, 38, 3, 4, 0xe8e4da);
    fillRect(66, 31, 18, 2, 0x2b2e36); // GAME above
    fillRect(66, 47, 18, 2, 0x2b2e36); // ROOM below
    fillRect(70, 55, 10, 4, 0x14161c); // the bracket it hangs on

    // Festoon bulbs strung under each awning.
    for (let bx = 6; bx < 60; bx += 9) { drawPixel(bx, 45, 0x3a404d); fillRect(bx - 1, 46, 3, 3, 0xffe9b0); }
    for (let bx = 92; bx < 146; bx += 9) { drawPixel(bx, 45, 0x3a404d); fillRect(bx - 1, 46, 3, 3, 0xffe9b0); }

    // Windows: cabinets, screens, and the neon behind them.
    [[4, 56], [92, 56]].forEach(([wx]) => {
        fillRect(wx, 52, 54, 46, 0x0b0d12);
        fillRect(wx + 2, 54, 50, 42, 0x1d2030);
        const screens = [0x3ad6f0, 0xf03a9c, 0x7af06a, 0xf2c14e];
        for (let i = 0; i < 4; i++) {
            const cx = wx + 5 + i * 12;
            fillRect(cx, 62, 9, 34, 0x2b2f43);
            fillRect(cx, 62, 9, 2, 0x3d4258);
            fillRect(cx + 1, 65, 7, 9, 0x0a0c14);
            fillRect(cx + 2, 66, 5, 7, screens[(i + wx) % 4]);
            fillRect(cx + 1, 78, 7, 2, 0x141828);
            g.fillStyle(screens[(i + wx) % 4], 0.15);
            g.fillCircle(cx + 4, 70, 10);
        }
        fillRect(wx + 4, 56, 46, 3, 0xf03a9c); // a neon strip along the top
        fillRect(wx + 4, 56, 46, 1, 0xff8ac6);
    });

    // The rail and stools out on the pavement.
    fillRect(0, 104, 150, 2, 0x2a2e38);
    for (let rx = 4; rx < 150; rx += 16) fillRect(rx, 104, 2, 12, 0x2a2e38);
    [18, 44, 104, 130].forEach(sx => {
        fillRect(sx - 6, 98, 12, 3, 0xd8d4cc); // white stool tops
        fillRect(sx - 1, 101, 2, 12, 0xb8b4ac);
        fillRect(sx - 5, 113, 10, 2, 0xb8b4ac);
    });
    fillRect(0, 116, 150, 4, 0x14161c);
    g.generateTexture('coin_op_front', 150, 120);

    // --- INSIDE FIFTH & ROSE ---------------------------------------------------
    // The thing everyone remembers about the room: hundreds of plates held in a
    // black steel grid above the bar, lit from behind.
    g.clear();
    fillRect(0, 0, 64, 48, 0x0f1114);
    for (let gy = 0; gy < 48; gy += 16) {
        for (let gx = 0; gx < 64; gx += 16) {
            g.fillStyle(0x6f6a5c, 1); // the plate
            g.fillCircle(gx + 8, gy + 8, 6);
            g.fillStyle(0x8f8a78, 1);
            g.fillCircle(gx + 7, gy + 7, 5);
            g.fillStyle(0xb0a892, 1);
            g.fillCircle(gx + 7, gy + 7, 3);
            g.fillStyle(0x6f6a5c, 1);
            g.fillCircle(gx + 7, gy + 7, 1);
            drawPixel(gx + 5, gy + 5, 0xd2c9ae); // the light catching the rim
        }
    }
    for (let gx = 0; gx <= 64; gx += 16) fillRect(gx, 0, 2, 48, 0x1d2026); // the steel grid
    for (let gy = 0; gy <= 48; gy += 16) fillRect(0, gy, 64, 2, 0x1d2026);
    fillRect(0, 0, 64, 1, 0x343842);
    g.generateTexture('plate_wall', 64, 48);

    // Backbar: lit shelves, bottles, and the mirror behind them.
    g.clear();
    fillRect(0, 0, 64, 56, 0x14161b);
    fillRect(2, 2, 60, 52, 0x1d2129);
    for (let sy = 4; sy < 52; sy += 16) {
        fillRect(3, sy + 12, 58, 2, 0x3a4049); // shelf
        fillRect(3, sy + 11, 58, 1, 0xe8b45c); // strip light under it
        for (let bx = 5; bx < 60; bx += 4) {
            const tone = [0x8a5a2b, 0x2f5d3a, 0x6b3a52, 0xc9a34a, 0x3a4a6b][(bx + sy) % 5];
            fillRect(bx, sy + 3, 3, 9, tone);
            fillRect(bx, sy + 3, 1, 9, 0xd8cfae);
            drawPixel(bx + 1, sy + 1, 0x2a2018); // neck
            drawPixel(bx + 1, sy + 2, tone);
        }
    }
    fillRect(0, 0, 64, 2, 0x343842);
    g.generateTexture('rose_backbar', 64, 56);

    // The bar itself: black marble, warm light spilling out from under the lip.
    g.clear();
    fillRect(0, 0, 64, 9, 0x23262c); // marble top
    fillRect(0, 0, 64, 2, 0x3a3f47);
    drawPixel(11, 4, 0x565c66); // veining
    drawPixel(12, 3, 0x565c66);
    drawPixel(39, 5, 0x565c66);
    drawPixel(52, 3, 0x565c66);
    fillRect(0, 9, 64, 2, 0x14161a);
    fillRect(0, 9, 64, 11, 0x7a5f3a); // the oak front, in a dark room
    fillRect(0, 9, 64, 2, 0x967548);
    for (let px = 4; px < 64; px += 16) fillRect(px, 12, 10, 6, 0x6b5231); // panel reveals
    fillRect(0, 20, 64, 4, 0xe8b45c); // the light under the lip
    fillRect(0, 21, 64, 2, 0xffd98a);
    g.generateTexture('rose_bar', 64, 24);

    // Quilted black leather stool with a low back.
    g.clear();
    fillRect(1, 0, 14, 10, 0x1f2126); // back
    fillRect(1, 0, 14, 2, 0x33363d);
    for (let qy = 2; qy < 9; qy += 3) fillRect(2, qy, 12, 1, 0x14161a);
    for (let qx = 4; qx < 14; qx += 4) fillRect(qx, 1, 1, 8, 0x14161a);
    fillRect(0, 10, 16, 5, 0x26292f); // seat
    fillRect(0, 10, 16, 1, 0x3a3e46);
    fillRect(0, 14, 16, 2, 0x14161a);
    fillRect(7, 16, 2, 9, 0x4a4f58); // frame
    fillRect(3, 25, 10, 2, 0x3a3e46);
    fillRect(2, 20, 12, 2, 0x3a3e46); // footrail
    g.generateTexture('leather_stool', 16, 28);

    // Dark hexagonal floor tile.
    g.clear();
    fillRect(0, 0, 32, 32, 0x24272d);
    for (let hy = 0; hy < 32; hy += 8) {
        const off = (hy / 8) % 2 ? 6 : 0;
        for (let hx = -6; hx < 32; hx += 12) {
            fillRect(hx + off + 2, hy + 1, 8, 6, 0x2b2f36);
            fillRect(hx + off + 3, hy + 1, 6, 1, 0x343942);
            drawPixel(hx + off + 2, hy + 6, 0x1c1f24);
        }
    }
    g.generateTexture('hex_floor', 32, 32);

    // --- INSIDE COIN-OP --------------------------------------------------------
    // The marquee over the door, with the letters pushed into the board.
    g.clear();
    fillRect(0, 0, 96, 40, 0x141118);
    fillRect(2, 2, 92, 36, 0x1d1a22);
    fillRect(6, 4, 84, 10, 0x0e0c12); // COIN-OP in bulbs
    for (let lx = 10; lx < 88; lx += 6) fillRect(lx, 6, 4, 6, 0xf2c14e);
    fillRect(6, 16, 84, 20, 0xe8e4da); // the white letterboard
    fillRect(6, 16, 84, 2, 0xf6f4ee);
    for (let r = 0; r < 2; r++) { // the letters, too small to read
        for (let lx = 10; lx < 86; lx += 5) {
            if ((lx + r * 7) % 17 < 12) fillRect(lx, 20 + r * 8, 3, 5, 0x1d1a22);
        }
    }
    for (let bx = 4; bx < 94; bx += 8) drawPixel(bx, 1, 0xffe9b0); // bulbs round the frame
    g.generateTexture('coin_marquee', 96, 40);

    // The rainbow chevrons painted down the floor.
    g.clear();
    fillRect(0, 0, 48, 32, 0x2a2d34);
    // One clean chevron per tile. The first version mirrored the slope about the
    // middle of the tile, so tiling it produced a zigzag that swamped the room.
    const bands = [0xa8474b, 0xb36a38, 0xb99a47, 0x4f9159, 0x3a7c96, 0x6a4a96];
    bands.forEach((col, i) => {
        for (let y = 0; y < 32; y++) {
            const x = (i * 8 + y / 4) % 48;
            fillRect(Math.round(x), y, 7, 1, col);
            if (x > 41) fillRect(Math.round(x) - 48, y, 7, 1, col);
        }
    });
    g.generateTexture('rainbow_floor', 48, 32);

    // One arcade cabinet, seen head on.
    g.clear();
    fillRect(1, 0, 18, 6, 0x1d2030); // marquee
    fillRect(2, 1, 16, 4, 0xf2c14e);
    fillRect(0, 6, 20, 40, 0x2b2f43); // body
    fillRect(0, 6, 3, 40, 0x3d4258);
    fillRect(17, 6, 3, 40, 0x1d2130);
    fillRect(3, 9, 14, 13, 0x0a0c14); // bezel
    fillRect(4, 10, 12, 11, 0x3ad6f0); // screen
    for (let sy = 11; sy < 21; sy += 3) fillRect(4, sy, 12, 1, 0x0a0c14);
    fillRect(3, 25, 14, 5, 0x141828); // control panel
    g.fillStyle(0xd94f4f, 1);
    g.fillCircle(7, 27, 2);
    drawPixel(11, 27, 0xf2c14e);
    drawPixel(13, 27, 0x5bbf6a);
    drawPixel(11, 28, 0x3aa0c4);
    fillRect(3, 32, 14, 12, 0x1d2130); // the coin door
    fillRect(8, 36, 4, 2, 0xc9a34a);
    g.generateTexture('arcade_cab', 20, 46);

    // Pinball, on its legs, lit from inside.
    g.clear();
    fillRect(6, 0, 28, 14, 0x1d2030); // backbox
    fillRect(8, 2, 24, 10, 0xf03a9c);
    fillRect(8, 2, 24, 3, 0xff8ac6);
    drawPixel(14, 7, 0xffe9b0);
    drawPixel(24, 8, 0xffe9b0);
    fillRect(2, 14, 36, 12, 0x2b2f43); // the table, in perspective
    fillRect(4, 15, 32, 9, 0x1a3a5c);
    for (let i = 0; i < 7; i++) drawPixel(7 + i * 4, 17 + (i % 3) * 2, 0xf2c14e); // bumpers and lanes
    fillRect(10, 22, 5, 1, 0xd8d4cc); // flippers
    fillRect(25, 22, 5, 1, 0xd8d4cc);
    fillRect(2, 26, 36, 3, 0x14161f); // lockdown bar
    fillRect(4, 29, 3, 9, 0x3a3f47); // legs
    fillRect(33, 29, 3, 9, 0x3a3f47);
    g.generateTexture('pinball_table', 40, 38);

    // The phone that goes off at four in the morning is a mobile on the
    // nightstand, not the hotel's handset.
    g.clear();
    fillRect(3, 0, 12, 22, 0x1b1d24); // body
    fillRect(3, 0, 12, 1, 0x363a45);
    fillRect(3, 0, 2, 22, 0x2a2e38);
    fillRect(4, 2, 10, 16, 0x2e6fb0); // the screen, lit because it is ringing
    fillRect(4, 2, 10, 4, 0x4a92d8);
    fillRect(6, 7, 6, 2, 0xdfe9f5); // a name on it
    fillRect(6, 11, 6, 1, 0xbcd2e8);
    g.fillStyle(0x9fd6f0, 1); // the little handset icon
    g.fillCircle(9, 15, 2);
    fillRect(7, 19, 4, 1, 0x4a4f5a); // speaker grille
    drawPixel(9, 1, 0x4a4f5a);
    g.generateTexture('cellphone', 18, 22);

    // Yvy in the royal blue dress she wore to dinner. Her own face and her own
    // hair -- built from the generic helpers this was a different woman in a
    // blue dress, not her.
    g.clear();
    drawYvyFace(5);
    drawYvyHair();
    fillRect(13, 15, 6, 2, SKIN_SHADE); // neck
    fillRect(11, 17, 10, 8, 0x1a3fa8); // bodice
    fillRect(19, 17, 2, 8, 0x12308a);
    fillRect(12, 18, 1, 4, 0x5a86e8);
    fillRect(11, 17, 10, 1, 0xa8c4f5); // neckline
    fillRect(11, 24, 10, 1, 0x0e2570); // waist
    fillRect(10, 25, 12, 4, 0x1a3fa8); // skirt
    fillRect(19, 25, 3, 4, 0x12308a);
    fillRect(10, 28, 12, 1, 0x0e2570); // hem
    fillRect(9, 17, 2, 6, SKIN); // bare arms
    fillRect(21, 17, 2, 6, SKIN_SHADE);
    fillRect(9, 23, 2, 2, SKIN);
    fillRect(21, 23, 2, 2, SKIN_SHADE);
    fillRect(12, 29, 3, 2, SKIN); // legs
    fillRect(17, 29, 3, 2, SKIN_SHADE);
    fillRect(11, 31, 4, 1, 0x212121); // heels
    fillRect(17, 31, 4, 1, 0x121212);
    drawPixel(16, 16, 0xdfe4ea); // a little pendant
    g.generateTexture('yvy_dress', 32, 32);

    // The Jurassic Park table, which is the one they end up on.
    g.clear();
    fillRect(6, 0, 28, 15, 0x14180f); // backbox
    fillRect(8, 2, 24, 11, 0x1d2a14);
    fillRect(9, 3, 22, 5, 0xc4452a); // the red-and-yellow gate motif
    fillRect(9, 3, 22, 2, 0xe8703c);
    fillRect(13, 9, 14, 3, 0xf2c14e);
    drawPixel(15, 10, 0x14180f);
    drawPixel(19, 10, 0x14180f);
    drawPixel(23, 10, 0x14180f);
    fillRect(2, 15, 36, 12, 0x2b2f43); // the table
    fillRect(4, 16, 32, 9, 0x1f3a22); // green playfield
    for (let i = 0; i < 6; i++) drawPixel(7 + i * 5, 18 + (i % 3) * 2, 0xf2c14e); // lamps
    drawPixel(20, 19, 0xe8703c);
    fillRect(10, 23, 5, 1, 0xd8d4cc); // flippers
    fillRect(25, 23, 5, 1, 0xd8d4cc);
    fillRect(2, 27, 36, 3, 0x14161f);
    fillRect(4, 30, 3, 8, 0x3a3f47); // legs
    fillRect(33, 30, 3, 8, 0x3a3f47);
    g.generateTexture('jurassic_pinball', 40, 38);

    // --- GASLAMP QUARTER ------------------------------------------------------
    // The storefronts all share a shell — brick pier, sign band, striped awning
    // with a scalloped hem, glass, stall riser — and differ in colour and in
    // what is dressed in the window. Drawing them one at a time produced four
    // flat rectangles the first time round.
    const drawShopFront = (w, h, o, dressWindow) => {
        g.clear();
        fillRect(0, 0, w, h, o.brick);
        fillRect(0, 0, w, 2, o.brickLit);
        for (let by = 5; by < 20; by += 6) fillRect(2, by, w - 4, 1, o.brickDark);
        fillRect(0, 0, 3, h, o.brickDark); // piers either side
        fillRect(w - 3, 0, 3, h, o.brickDark);
        fillRect(4, 4, w - 8, 14, o.sign); // sign band
        fillRect(4, 4, w - 8, 1, o.signLit);
        fillRect(4, 17, w - 8, 1, o.brickDark);
        fillRect(3, 21, w - 6, 11, o.awning); // awning
        for (let ax = 3; ax < w - 6; ax += 12) fillRect(ax, 21, 6, 11, o.awningAlt);
        fillRect(3, 21, w - 6, 2, o.awningLit);
        for (let ax = 3; ax < w - 6; ax += 6) { // scalloped hem
            fillRect(ax, 32, 6, 2, ((ax / 6) | 0) % 2 ? o.awning : o.awningAlt);
            fillRect(ax + 1, 34, 4, 1, ((ax / 6) | 0) % 2 ? o.awning : o.awningAlt);
        }
        fillRect(3, 36, w - 6, 2, o.brickDark); // shadow the awning throws
        fillRect(5, 38, w - 10, h - 50, 0x1b2028); // glass
        fillRect(6, 39, w - 12, h - 52, o.glass);
        dressWindow(w, h);
        g.fillStyle(0xffffff, 0.13); // raking reflection across the glass
        for (let i = 0; i < 3; i++) g.fillRect(9 + i * 9, 39, 4, h - 52);
        fillRect(w - 26, 39, 20, h - 52, o.door); // door in the right bay
        fillRect(w - 24, 42, 16, h - 60, o.glass);
        fillRect(w - 24, 42, 16, 2, 0x1b2028);
        fillRect(w - 13, h - 21, 3, 4, 0xd4a017); // handle
        fillRect(0, h - 10, w, 10, o.riser); // stall riser
        fillRect(0, h - 10, w, 1, o.brickLit);
    };

    drawShopFront(96, 88, {
        brick: 0x9c8f80, brickLit: 0xb5a898, brickDark: 0x6f6459, sign: 0x1f6f68, signLit: 0x2d8f86,
        awning: 0x2aa198, awningAlt: 0xe8e2d6, awningLit: 0x53c2b9, glass: 0x2f4750, door: 0x1f6f68, riser: 0x6f6459
    }, (w, h) => {
        for (const [mx, dress] of [[20, 0xd76a7a], [38, 0xe8c46a], [56, 0x6a8fd7]]) { // mannequins
            fillRect(mx, 46, 8, 12, dress);
            fillRect(mx, 46, 8, 2, 0xffffff);
            fillRect(mx + 2, 41, 4, 5, 0xe6cbb0); // head and shoulders
            fillRect(mx + 3, 58, 2, 8, 0xe6cbb0);
        }
        fillRect(8, 42, w - 40, 2, 0xd4a017); // rail
    });
    g.generateTexture('shop_clothing', 96, 88);

    drawShopFront(96, 88, {
        brick: 0x8d8194, brickLit: 0xa79aae, brickDark: 0x5f5568, sign: 0x4a2f83, signLit: 0x6c47b8,
        awning: 0x7e57c2, awningAlt: 0xe8e2d6, awningLit: 0xa17fe0, glass: 0x39304f, door: 0x4a2f83, riser: 0x5f5568
    }, (w, h) => {
        const shards = [[16, 58, 6, 16, 0xb39ddb], [26, 52, 7, 22, 0xce93d8], [37, 60, 5, 14, 0x80deea],
            [46, 50, 8, 24, 0xf48fb1], [58, 57, 6, 17, 0xa5d6a7]];
        shards.forEach(([sx, sy, sw, sh, col]) => {
            fillRect(sx, sy, sw, sh, col);
            fillRect(sx, sy, 2, sh, 0xffffff); // lit facet
            fillRect(sx, sy, sw, 1, 0xffffff);
            fillRect(sx + sw - 2, sy + 2, 2, sh - 2, 0x2a2138);
        });
        fillRect(12, 74, 56, 2, 0x2a2138); // the shelf they stand on
    });
    g.generateTexture('shop_crystal', 96, 88);

    drawShopFront(96, 88, {
        brick: 0xa08a6e, brickLit: 0xbaa286, brickDark: 0x715f48, sign: 0x8a4b1e, signLit: 0xb26a30,
        awning: 0xc46a2a, awningAlt: 0xf0e0c0, awningLit: 0xe08a44, glass: 0x4a3a2a, door: 0x8a4b1e, riser: 0x715f48
    }, (w, h) => {
        const spines = [0x8b3a3a, 0x2f5d50, 0x39507e, 0x7a5c2e, 0x5d3a6b, 0x8a6b2c];
        for (let sx = 9; sx < 64; sx += 4) { // books stood on the shelf
            const hgt = 14 + ((sx * 5) % 7);
            fillRect(sx, 60 - hgt, 3, hgt, spines[(sx / 4) % spines.length]);
            fillRect(sx, 60 - hgt, 1, hgt, 0xd9d3c8);
            fillRect(sx, 56 - hgt + 4, 3, 1, 0xd4a017);
        }
        fillRect(8, 60, 58, 2, 0x6b533a); // shelf
        for (let sx = 12; sx < 60; sx += 9) fillRect(sx, 63, 8, 3, spines[(sx / 9) % spines.length]); // stacked flat
        for (let sx = 12; sx < 60; sx += 9) fillRect(sx, 66, 8, 3, spines[(sx / 7) % spines.length]);
    });
    g.generateTexture('shop_book', 96, 88);

    // Donut Bar: black tile, pink neon and a queue you can see through the glass.
    drawShopFront(112, 92, {
        brick: 0x2b2b31, brickLit: 0x45454e, brickDark: 0x17171b, sign: 0xd81b60, signLit: 0xf0518c,
        awning: 0xec407a, awningAlt: 0x2b2b31, awningLit: 0xf47da2, glass: 0x3a2530, door: 0x17171b, riser: 0x17171b
    }, (w, h) => {
        for (let ry = 46; ry < 70; ry += 11) { // trays of donuts behind the counter
            for (let rx = 10; rx < 74; rx += 11) {
                const glaze = [0xf48fb1, 0xffe0b2, 0x8d6e63, 0xfff59d][(rx + ry) % 4];
                g.fillStyle(glaze, 1);
                g.fillCircle(rx + 4, ry + 4, 4);
                g.fillStyle(0x3a2530, 1);
                g.fillCircle(rx + 4, ry + 4, 1);
                drawPixel(rx + 2, ry + 2, 0xffffff);
            }
            fillRect(8, ry + 9, 70, 1, 0x241820);
        }
        fillRect(8, 72, 70, 6, 0xd7c6a8); // counter
        fillRect(8, 72, 70, 1, 0xefe2c8);
    });
    g.generateTexture('donut_bar_front', 112, 92);

    // The Donut Bar photo wall as it actually is: a white storefront with one
    // big pink donut, glaze running off it, and a pair of spread angel wings
    // you stand between. Not a pink wall covered in painted donuts.
    g.clear();
    fillRect(0, 0, 152, 92, 0xf7f5f1); // white shopfront
    fillRect(0, 0, 152, 2, 0xffffff);
    for (const px of [34, 76, 118]) fillRect(px, 6, 1, 70, 0xe4e0d9); // panel joints
    fillRect(0, 78, 152, 14, 0x1c1c20); // dark base and threshold
    fillRect(0, 78, 152, 1, 0x3a3a42);
    fillRect(0, 0, 152, 5, 0xe8489a); // pink drip decal across the window head
    for (let dx = 2; dx < 152; dx += 8) {
        const drop = 4 + ((dx * 7) % 9);
        fillRect(dx, 4, 5, drop, 0xe8489a);
        g.fillStyle(0xe8489a, 1);
        g.fillCircle(dx + 2, 4 + drop, 2);
    }
    fillRect(0, 0, 152, 2, 0xf47ab5);

    // Angel wings. The shape that reads as a wing is an arched shoulder with
    // primaries hanging off it — a plain fan of spokes from one point does not,
    // and white feathers on a white shopfront need a grey edge to exist at all.
    const wingFeather = (sx, sy, dir, ang, len, core) => {
        for (let t = 0; t < len; t++) {
            const px = Math.round(sx + dir * Math.cos(ang) * t * 0.78);
            const py = Math.round(sy + Math.sin(ang) * t);
            fillRect(px - 2, py - 2, 5, 5, 0xd2d7e0); // edge
            fillRect(px - 1, py - 1, 3, 3, core); // core
        }
    };
    for (const dir of [-1, 1]) {
        const rootX = 76 - dir * 4, rootY = 44;
        const arc = [];
        for (let k = 0; k <= 10; k++) { // the leading edge, sweeping up and out
            const u = k / 10;
            arc.push([rootX + dir * (7 + u * 56), rootY - 4 - 20 * Math.sin(u * Math.PI * 0.8)]);
        }
        arc.forEach(([sx, sy], k) => { // solid shoulder along that edge
            fillRect(sx - 2, sy - 2, 5, 7 + (k < 5 ? 5 - k : 1), 0xc3c9d4);
            fillRect(sx - 1, sy - 1, 3, 6 + (k < 5 ? 5 - k : 1), 0xffffff);
        });
        arc.forEach(([sx, sy], k) => { // primaries hanging from it, longest mid-wing
            const u = k / 10;
            const len = 12 + Math.round(26 * Math.sin(u * Math.PI * 0.95));
            wingFeather(sx, sy + 4, dir, 0.86 - u * 0.56, len, k % 2 ? 0xffffff : 0xf4f6fa);
        });
    }

    // The donut, sat in front of the wings.
    g.fillStyle(0xc9337d, 1); // shaded underside of the glaze first
    g.fillCircle(76, 45, 18);
    g.fillStyle(0xe8489a, 1);
    g.fillCircle(76, 44, 17);
    g.fillStyle(0xf47ab5, 1); // lit top-left
    g.fillCircle(71, 39, 10);
    for (let dx = 62; dx <= 90; dx += 6) { // glaze running off the bottom
        const drop = 4 + ((dx * 5) % 7);
        fillRect(dx, 56, 4, drop, 0xe8489a);
        g.fillStyle(0xe8489a, 1);
        g.fillCircle(dx + 1, 56 + drop, 2);
    }
    g.fillStyle(0xc9337d, 1); // the hole shows the wall through it
    g.fillCircle(76, 46, 6);
    g.fillStyle(0xf7f5f1, 1);
    g.fillCircle(76, 44, 6);
    for (let s = 0; s < 14; s++) { // sprinkles
        const ang = s * 0.9;
        const rad = 10 + (s % 3) * 3;
        drawPixel(Math.round(76 + Math.cos(ang) * rad), Math.round(44 + Math.sin(ang) * rad),
            [0xffffff, 0xfdd835, 0x4fc3f7, 0x81c784][s % 4]);
    }
    fillRect(34, 82, 30, 2, 0xe8489a); // decals along the base
    fillRect(88, 82, 22, 2, 0xffffff);
    g.generateTexture('donut_wall_mural', 152, 92);

    // Downtown skyline for the horizon — towers, a couple of cranes, haze.
    g.clear();
    const towers = [[0, 30, 22, 34], [24, 16, 16, 48], [42, 36, 14, 28], [58, 8, 18, 56], [78, 26, 20, 38],
        [100, 18, 15, 46], [117, 34, 18, 30], [137, 12, 16, 52], [155, 28, 20, 36], [177, 20, 23, 44]];
    towers.forEach(([bx, by, bw, bh], i) => {
        fillRect(bx, by, bw, bh, i % 2 ? 0x8fa6bd : 0x9db2c7);
        fillRect(bx, by, bw, 2, 0xb3c5d6); // lit parapet
        fillRect(bx + bw - 2, by + 2, 2, bh - 2, 0x7b91a8); // shaded flank
        for (let wy = by + 5; wy < by + bh - 3; wy += 5) {
            for (let wx = bx + 2; wx < bx + bw - 3; wx += 4) drawPixel(wx, wy, (wx + wy) % 3 ? 0x6f8499 : 0xcfe0ee);
        }
    });
    fillRect(28, 6, 2, 12, 0x7b91a8); // crane
    fillRect(22, 6, 16, 2, 0x7b91a8);
    fillRect(160, 22, 2, 8, 0x7b91a8);
    fillRect(156, 22, 14, 2, 0x7b91a8);
    fillRect(0, 60, 200, 4, 0xaebfd0); // haze at the base
    g.generateTexture('sd_skyline', 200, 64);

    // Palm — San Diego is not San Diego without them.
    g.clear();
    fillRect(24, 30, 7, 66, 0x8d6e4f); // trunk
    fillRect(24, 30, 2, 66, 0xa88a68); // lit side
    for (let ty = 34; ty < 96; ty += 6) fillRect(24, ty, 7, 1, 0x6f553c); // ring scars
    const fronds = [[-26, -6], [-20, -18], [-8, -24], [8, -24], [20, -18], [26, -6], [-16, 4], [16, 4]];
    fronds.forEach(([ex, ey], i) => {
        const cx = 27, cy = 30;
        for (let t = 0; t <= 10; t++) { // the spine of the frond, sagging as it goes out
            const px = Math.round(cx + (ex * t) / 10);
            const py = Math.round(cy + (ey * t) / 10 + (t * t) / 9);
            fillRect(px, py, 2, 2, i % 2 ? 0x2f6b34 : 0x3d8241);
            if (t > 2) { // leaflets either side
                drawPixel(px, py - 2, 0x4f9a53);
                drawPixel(px, py + 2, 0x27562c);
            }
        }
    });
    g.fillStyle(0x8a6b2c, 1); // coconuts
    g.fillCircle(22, 32, 3);
    g.fillCircle(32, 33, 3);
    g.generateTexture('palm_tree', 56, 100);

    // Sidewalk planter with clipped hedge and flowers.
    g.clear();
    fillRect(0, 10, 44, 18, 0xa1887f); // box
    fillRect(0, 10, 44, 2, 0xc0a89c);
    fillRect(0, 24, 44, 4, 0x6d4c41);
    for (let px = 3; px < 44; px += 7) fillRect(px, 13, 4, 10, 0x8d6e63); // panel reveals
    g.fillStyle(0x2f6b34, 1); // hedge
    g.fillEllipse(22, 8, 42, 14);
    g.fillStyle(0x3d8241, 1);
    g.fillEllipse(20, 6, 34, 10);
    for (let i = 0; i < 9; i++) {
        drawPixel(4 + i * 4, 4 + (i % 3), [0xe57373, 0xfff176, 0xf06292][i % 3]);
        drawPixel(6 + i * 4, 8 - (i % 2), [0xffffff, 0xffb74d][i % 2]);
    }
    g.generateTexture('planter_box', 44, 28);

    // Bike rack with a bike locked to it.
    g.clear();
    fillRect(2, 6, 3, 16, 0x546e7a); // hoop
    fillRect(33, 6, 3, 16, 0x546e7a);
    fillRect(2, 6, 34, 3, 0x546e7a);
    fillRect(2, 6, 34, 1, 0x78909c);
    g.lineStyle(2, 0x37474f, 1); // bike
    g.strokeCircle(11, 17, 6);
    g.strokeCircle(27, 17, 6);
    fillRect(11, 11, 16, 2, 0xd94f4f); // frame
    fillRect(15, 12, 2, 6, 0xd94f4f);
    fillRect(22, 12, 2, 6, 0xd94f4f);
    fillRect(9, 9, 5, 2, 0x2b2b33); // saddle
    fillRect(25, 7, 2, 5, 0x2b2b33); // bars
    fillRect(23, 6, 7, 2, 0x2b2b33);
    g.generateTexture('bike_rack', 40, 26);

    // Parking meter.
    g.clear();
    fillRect(4, 0, 8, 12, 0x455a64); // head
    fillRect(4, 0, 8, 2, 0x62787f);
    fillRect(5, 3, 6, 6, 0x1b2327); // display
    fillRect(6, 4, 4, 2, 0x8bc34a);
    fillRect(6, 12, 4, 14, 0x546e7a); // post
    fillRect(6, 12, 1, 14, 0x78909c);
    fillRect(3, 26, 10, 2, 0x37474f); // shoe
    g.generateTexture('parking_meter', 16, 28);

    // Pavement cafe: bistro table and two chairs, seen flat on.
    g.clear();
    for (const cx of [2, 30]) { // chairs
        fillRect(cx, 6, 10, 3, 0x6d4c41);
        fillRect(cx + 1, 9, 8, 9, 0x8d6e63);
        fillRect(cx + 1, 9, 8, 1, 0xa1887f);
        fillRect(cx + 1, 18, 2, 5, 0x5d4037);
        fillRect(cx + 7, 18, 2, 5, 0x5d4037);
    }
    g.fillStyle(0xd7dbdd, 1); // table top
    g.fillEllipse(22, 12, 22, 12);
    g.fillStyle(0xeceff1, 1);
    g.fillEllipse(21, 11, 16, 8);
    fillRect(20, 17, 3, 7, 0x9aa5b1); // pedestal
    fillRect(17, 24, 9, 2, 0x78909c);
    fillRect(18, 6, 3, 6, 0x4a7c59); // a little vase
    fillRect(17, 4, 5, 3, 0xe57373);
    g.generateTexture('cafe_table_set', 44, 26);

    // Slatted park bench on cast-iron ends — it was a plain brown bar.
    g.clear();
    for (let sy = 0; sy < 9; sy += 4) { // back slats
        fillRect(6, sy, 52, 3, 0x8d6e4f);
        fillRect(6, sy, 52, 1, 0xa88a68);
    }
    fillRect(4, 11, 56, 4, 0x8d6e4f); // seat
    fillRect(4, 11, 56, 1, 0xa88a68);
    fillRect(4, 15, 56, 3, 0x6f553c);
    fillRect(2, 0, 4, 18, 0x37474f); // iron ends
    fillRect(58, 0, 4, 18, 0x37474f);
    fillRect(2, 0, 1, 18, 0x546e7a);
    fillRect(58, 0, 1, 18, 0x546e7a);
    fillRect(4, 18, 4, 6, 0x2b3439); // legs
    fillRect(56, 18, 4, 6, 0x2b3439);
    drawPixel(3, 4, 0x546e7a); // scrollwork
    drawPixel(60, 4, 0x546e7a);
    g.generateTexture('park_bench', 64, 24);

    // Pigeon, for the crumbs under the bench.
    g.clear();
    g.fillStyle(0x78909c, 1);
    g.fillEllipse(6, 6, 10, 7);
    fillRect(2, 5, 4, 3, 0x546e7a); // folded wing
    fillRect(8, 2, 4, 4, 0x90a4ae); // head
    fillRect(11, 4, 2, 1, 0xf0a030); // beak
    drawPixel(10, 3, 0x1b2327); // eye
    drawPixel(9, 6, 0x4dd0a0); // neck sheen
    fillRect(0, 5, 3, 2, 0x546e7a); // tail
    fillRect(5, 9, 1, 2, 0xf0a030); // legs
    fillRect(8, 9, 1, 2, 0xf0a030);
    g.generateTexture('pigeon', 14, 12);

    // Clipped lawn for the little dog run.
    g.clear();
    fillRect(0, 0, 32, 32, 0x4c8b3f);
    for (let i = 0; i < 26; i++) {
        const gx = (i * 11 + (i % 4) * 3) % 32, gy = (i * 7 + (i % 3) * 5) % 32;
        drawPixel(gx, gy, i % 3 ? 0x5da04c : 0x3f7434);
        drawPixel(gx + 1, gy + 1, 0x437a38);
    }
    for (let sy = 3; sy < 32; sy += 8) fillRect(0, sy, 32, 1, 0x559444); // mower stripes
    g.generateTexture('dog_lawn', 32, 32);

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

    // Notion Theory demo counter: dark top with a lit edge, a headset stand and
    // a laptop. The middle is left clear for the headset the player picks up.
    g.clear();
    fillRect(0, 8, 96, 24, 0x1f2733); // counter body
    fillRect(0, 8, 96, 3, 0x33475b); // top surface
    fillRect(0, 11, 96, 2, 0x00e5ff); // lit edge
    fillRect(0, 13, 96, 2, 0x0a3a45); // glow spill
    fillRect(0, 30, 96, 5, 0x121820); // kick shadow
    for (let i = 6; i < 92; i += 14) fillRect(i, 18, 8, 10, 0x27313f); // panel seams
    fillRect(14, 2, 4, 7, 0x5d6d7e); // headset stand
    fillRect(8, 0, 16, 3, 0x8a9aa8);
    fillRect(10, 3, 12, 2, 0x2b2b33);
    fillRect(68, 1, 22, 8, 0x2b2b33); // laptop
    fillRect(70, 2, 18, 5, 0x5dade2);
    fillRect(70, 2, 18, 2, 0x9fd6f0);
    fillRect(66, 9, 26, 2, 0x4a4a56);
    fillRect(40, 3, 14, 5, 0xf4f6f7); // leaflets
    fillRect(41, 4, 12, 1, 0x33475b);
    g.generateTexture('vr_demo_table', 96, 40);
}
