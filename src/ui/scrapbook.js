import { playSound } from '../audio/sfx.js';

/**
 * The photographs Mike and Yvy take as they go.
 *
 * They were already taking pictures in three different scenes — the donut wall,
 * the brawl outside the pizza place, the theatre — and every one of them
 * vanished the moment its dialogue closed. This keeps them, so the end of the
 * game can hand the whole lot back.
 *
 * A photo is { key, title, caption, sprites }. `sprites` is what to draw in the
 * frame: an array of { texture, x, y, scale, flip, tint } in frame-local
 * coordinates, so the album is rendered from the same art as the scenes rather
 * than from saved images. An entry can also be a plain shape —
 * { rect: [w, h], color, alpha } or { circle: radius, color, alpha } — for a
 * picture with no sprite to stand in for it, like the sunset on the last page.
 * `window` overrides the colour behind the sprites.
 */
const album = [];

export function takePhoto(photo) {
    if (album.some(p => p.key === photo.key)) return false;
    album.push(photo);
    playSound('shutter');
    return true;
}

export function getAlbum() {
    return album.slice();
}

export function photoCount() {
    return album.length;
}

/** Every photo the game can produce, so the album can show what was missed. */
export const TOTAL_PHOTOS = 18;

/** Photographs to a page in the album, as two rows of three. */
export const PHOTOS_PER_PAGE = 6;

export function resetAlbum() {
    album.length = 0;
}
