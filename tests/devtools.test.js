import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { ROOT, readSrc, sceneFiles } from './helpers.js';

// The chapter select is a developer tool that must never reach players, and the
// only thing keeping it out of the bundle is how main.js reaches for it: a
// dynamic import inside an `import.meta.env.DEV` branch, which Vite drops
// wholesale for a production build. That is easy to undo by accident — a tidy-up
// turning the dynamic import into a static one at the top of the file would ship
// the whole module without failing anything else — so these checks read the
// source rather than importing it, the way tests/sceneFlow.test.js guards wiring.

const devtools = readSrc('src/dev/devtools.js');
const main = readSrc('src/main.js');
const html = readSrc('index.html');

const srcFiles = (dir) =>
    fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
        const rel = path.join(dir, entry.name);
        if (entry.isDirectory()) return srcFiles(rel);
        return entry.name.endsWith('.js') ? [rel] : [];
    });

describe('developer tools stay out of the public build', () => {
    it('is reached only by a dynamic import, so Vite can drop it', () => {
        expect(main).toMatch(/import\(['"]\.\/dev\/devtools\.js['"]\)/);
        expect(main).not.toMatch(/^import .* from ['"]\.\/dev\//m);
    });

    it('keeps that import inside the import.meta.env.DEV branch', () => {
        const guard = main.indexOf('if (import.meta.env.DEV)');
        expect(guard, 'main.js no longer guards the dev branch').toBeGreaterThan(-1);
        expect(main.indexOf("import('./dev/devtools.js')")).toBeGreaterThan(guard);
    });

    it('is imported by nothing that ships', () => {
        const importers = srcFiles('src')
            .filter((file) => !file.startsWith(path.join('src', 'dev')))
            .filter((file) => file !== path.join('src', 'main.js'))
            .filter((file) => /from\s+['"][^'"]*\/dev\//.test(readSrc(file)));

        expect(importers).toEqual([]);
    });

    it('leaves no trace in the page shell the public downloads', () => {
        for (const marker of ['chapter', 'dev-', 'devtools']) {
            expect(html.toLowerCase()).not.toContain(marker);
        }
    });

    it('builds its own DOM rather than relying on index.html', () => {
        expect(devtools).toContain('document.createElement');

        // The overlays a jump has to clear are looked up through OVERLAY_IDS, so
        // they reach getElementById as a variable — the page-shell check in
        // sceneFlow.test.js only matches literal ids and would miss a typo here.
        const block = devtools.slice(
            devtools.indexOf('const OVERLAY_IDS'),
            devtools.indexOf('function clearOverlays')
        );
        const ids = [...block.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]);

        expect(ids.length).toBeGreaterThan(3);
        for (const id of ids) expect(html, id).toContain(`id="${id}"`);
    });
});

describe('chapter list', () => {
    const registered = new Set(sceneFiles().map((f) => f.replace('.js', '')));

    it('draws its order from the scene registry rather than a second copy', () => {
        expect(devtools).toContain("import { STORY_ORDER } from '../scenes/index.js'");
    });

    it('has no label for a scene that no longer exists', () => {
        const block = devtools.slice(
            devtools.indexOf('const CHAPTER_LABELS'),
            devtools.indexOf('const labelFor')
        );
        const labelled = [...block.matchAll(/^\s{4}([A-Za-z]+):/gm)].map((m) => m[1]);

        expect(labelled.length).toBeGreaterThan(20);
        expect(labelled.filter((key) => !registered.has(key))).toEqual([]);
    });
});
