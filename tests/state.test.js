import { describe, it, expect, afterEach } from 'vitest';
import { gameState, resetGameState } from '../src/state.js';

afterEach(() => resetGameState());

describe('gameState', () => {
    it('starts a new game with nothing collected or completed', () => {
        expect(gameState).toEqual({
            hasTicket: false,
            hasSuitcase: false,
            bagScreened: false,
            bodyScanned: false,
            securityCleared: false,
            hasCoffee: false,
            drinksConsumed: 0,
            clubProgress: 0,
            farewellDone: false,
            callFinished: false,
            dressedForWork: false,
            hasVR: false,
            demosGiven: 0
        });
    });

    it('is a single shared object, so scene progress is visible everywhere', () => {
        gameState.hasTicket = true;
        gameState.drinksConsumed = 2;
        expect(gameState.hasTicket).toBe(true);
        expect(gameState.drinksConsumed).toBe(2);
    });

    it('restores every flag on reset without replacing the object', () => {
        const identity = gameState;
        gameState.securityCleared = true;
        gameState.clubProgress = 3;

        resetGameState();

        expect(gameState).toBe(identity);
        expect(gameState.securityCleared).toBe(false);
        expect(gameState.clubProgress).toBe(0);
    });
});
