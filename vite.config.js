import { defineConfig } from 'vite';

// Vite binds 5173 by default and does not look at PORT on its own. When two
// sessions have the repo open at once the second one needs a different port, so
// honour PORT when something assigns it — and bind it strictly in that case,
// since a silent fallback to 5174 would just leave whoever set it pointed at the
// wrong server. With PORT unset this is exactly Vite's default behaviour.
const assignedPort = Number(process.env.PORT) || undefined;

export default defineConfig({
    // Relative asset URLs so the build works from any path (Vercel, a sub-folder,
    // or opened straight off disk after `npm run build`).
    base: './',
    server: { port: assignedPort ?? 5173, strictPort: assignedPort !== undefined },
    preview: { port: assignedPort ?? 4173, strictPort: assignedPort !== undefined },
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
