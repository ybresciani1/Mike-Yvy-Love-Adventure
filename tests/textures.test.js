import { describe, it, expect } from 'vitest';
import { collectTextures } from './helpers.js';

const textures = collectTextures();
const keys = textures.map((t) => t.key);

describe('generateTextures', () => {
    it('draws the full sprite sheet in one pass', () => {
        // Every sprite in the game is drawn here; scenes only reuse the keys.
        expect(textures).toHaveLength(96);
    });

    it('never registers the same key twice, which would silently overwrite art', () => {
        const duplicates = keys.filter((key, i) => keys.indexOf(key) !== i);
        expect(duplicates).toEqual([]);
    });

    it('includes every character and outfit the story needs', () => {
        expect(keys).toEqual(
            expect.arrayContaining([
                'mike',
                'mike_suit',
                'mike_casual',
                'yvy',
                'aiden',
                'aiden_older'
            ])
        );
    });

    it('gives each texture a positive size', () => {
        for (const { key, width, height } of textures) {
            expect(width, key).toBeGreaterThan(0);
            expect(height, key).toBeGreaterThan(0);
        }
    });

    it('keeps characters on the 32x32 tile grid', () => {
        const characters = ['mike', 'mike_suit', 'mike_casual', 'yvy', 'aiden', 'civilian'];
        for (const key of characters) {
            const texture = textures.find((t) => t.key === key);
            expect(texture, key).toMatchObject({ width: 32, height: 32 });
        }
    });
});
