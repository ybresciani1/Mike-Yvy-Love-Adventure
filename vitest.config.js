import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Node by default (most tests are pure); the DOM-facing suites opt into
        // jsdom with an `@vitest-environment` docblock.
        environment: 'node',
        include: ['tests/**/*.test.js'],
        restoreMocks: true
    }
});
