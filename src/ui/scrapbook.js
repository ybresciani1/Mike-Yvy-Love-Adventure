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
 * than from saved images.
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
export const TOTAL_PHOTOS = 10;

export function resetAlbum() {
    album.length = 0;
}
