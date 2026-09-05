import { defineConfig } from 'vite';

export default defineConfig({
    // Relative asset URLs so the build works from any path (Vercel, a sub-folder,
    // or opened straight off disk after `npm run build`).
    base: './',
    build: {
        outDir: 'dist',
        target: 'es2020',
        // Phaser alone is over the default 500 kB warning threshold; this keeps
        // the build output quiet while still flagging a real size regression.
        chunkSizeWarningLimit: 1400,
        rolldownOptions: {
            output: {
                // Phaser is ~1.3 MB and only changes when the dependency is
                // upgraded; keeping it in its own chunk means game edits don't
                // invalidate it in visitors' caches.
                advancedChunks: {
                    groups: [{ name: 'phaser', test: /node_modules[\/]phaser[\/]/ }]
                }
            }
        }
    }
});
