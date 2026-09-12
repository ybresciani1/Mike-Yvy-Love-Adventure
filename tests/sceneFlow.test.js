import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { ROOT, readSrc, sceneFiles, collectTextures } from './helpers.js';
import { TOTAL_PHOTOS, PHOTOS_PER_PAGE } from '../src/ui/scrapbook.js';

// These checks read the source rather than importing it: booting Phaser needs a
// real canvas, and the risk worth guarding here is wiring (a scene that is no
// longer registered, a transition to a scene that no longer exists, an element
// id that only lives in index.html) rather than runtime behaviour.

const files = sceneFiles();
const sources = new Map(files.map((f) => [f, readSrc(path.join('src/scenes', f))]));
const registry = readSrc('src/scenes/index.js');
const html = readSrc('index.html');

const matchAll = (text, re) => [...text.matchAll(re)].map((m) => m[1]);

const sceneKeys = new Map(
    [...sources].map(([file, src]) => [file, matchAll(src, /super\('([A-Za-z]+)'\)/g)])
);
const registeredScenes = matchAll(
    registry.slice(registry.indexOf('export const SCENES')),
    /^\s{4}([A-Za-z]+),?$/gm
);
const transitions = new Map(
    [...sources].map(([file, src]) => [
        file.replace('.js', ''),
        [...new Set(matchAll(src, /scene\.start\('([A-Za-z]+)'/g))]
    ])
);

const srcFiles = (dir) =>
    fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
        const rel = path.join(dir, entry.name);
        if (entry.isDirectory()) return srcFiles(rel);
        return entry.name.endsWith('.js') ? [rel] : [];
    });

describe('scene registry', () => {
    it('gives every scene a key that matches its filename', () => {
        for (const [file, keys] of sceneKeys) {
            expect(keys, file).toEqual([file.replace('.js', '')]);
        }
    });

    it('registers every scene file exactly once', () => {
        expect([...registeredScenes].sort()).toEqual(files.map((f) => f.replace('.js', '')).sort());
    });

    it('imports every registered scene', () => {
        for (const scene of registeredScenes) {
            expect(registry, scene).toContain(`import { ${scene} } from './${scene}.js';`);
        }
    });

    it('boots into the title screen', () => {
        expect(registeredScenes[0]).toBe('TitleScene');
    });
});

describe('story flow', () => {
    it('only transitions to scenes that exist', () => {
        for (const [scene, targets] of transitions) {
            for (const target of targets) {
                expect(registeredScenes, `${scene} -> ${target}`).toContain(target);
            }
        }
    });

    it('is a single linear chain that reaches every scene', () => {
        const chain = [];
        let current = 'TitleScene';
        while (current && !chain.includes(current)) {
            chain.push(current);
            const targets = transitions.get(current) ?? [];
            expect(targets.length, `${current} has ambiguous transitions`).toBeLessThan(2);
            current = targets[0];
        }
        expect(chain).toHaveLength(registeredScenes.length);
        expect(transitions.get(chain.at(-1))).toEqual([]);
    });

    it('keeps the registry in narrative order', () => {
        const chain = [];
        let current = 'TitleScene';
        while (current && !chain.includes(current)) {
            chain.push(current);
            current = (transitions.get(current) ?? [])[0];
        }
        expect(registeredScenes).toEqual(chain);
    });
});

describe('texture keys used by scenes', () => {
    const generated = new Set(collectTextures().map((t) => t.key));
    const loaded = new Set(
        [...sources.values()].flatMap((src) => matchAll(src, /load\.image\('([a-z_0-9]+)'/g))
    );

    it('all resolve to a generated or loaded texture', () => {
        const used = new Map();
        for (const [file, src] of sources) {
            const re =
                /\.(?:add\.image|add\.sprite|add\.staticSprite|add\.staticImage|create)\(\s*[^,()']+,\s*[^,()']+,\s*'([a-z_0-9]+)'/g;
            for (const key of matchAll(src, re)) used.set(key, file);
        }

        expect(used.size).toBeGreaterThan(20);
        const missing = [...used].filter(([key]) => !generated.has(key) && !loaded.has(key));
        expect(missing).toEqual([]);
    });

    it('does not shadow a generated texture with a downloaded one', () => {
        const clashes = [...loaded].filter((key) => generated.has(key));
        expect(clashes).toEqual([]);
    });
});

describe('the album', () => {
    // The album lays out TOTAL_PHOTOS frames whether or not the photographs
    // behind them were taken, so a photo added to a scene without raising the
    // count is one the last page can never show.
    const keys = [...sources.values()].flatMap((src) =>
        matchAll(src, /takePhoto\(\{\s*key: '([a-z]+)'/g)
    );

    it('gives every photograph its own key', () => {
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('counts every photograph the scenes can take', () => {
        expect(keys).toHaveLength(TOTAL_PHOTOS);
    });

    it('fills whole pages', () => {
        expect(TOTAL_PHOTOS % PHOTOS_PER_PAGE).toBe(0);
    });
});

describe('page shell', () => {
    it('defines every element the game code looks up', () => {
        const ids = new Set(
            srcFiles('src').flatMap((file) =>
                matchAll(readSrc(file), /getElementById\('([a-z-]+)'\)/g)
            )
        );

        expect(ids.size).toBeGreaterThan(5);
        for (const id of ids) expect(html, id).toContain(`id="${id}"`);
    });

    it('loads the game as an ES module entry point', () => {
        expect(html).toContain('<script type="module" src="/src/main.js"></script>');
    });
});
