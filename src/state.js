// Story flags shared by every scene. Scenes read and advance these; a "new game"
// means resetting them (resetGameState) or reloading the page.
const INITIAL_STATE = {
    hasTicket: false,
    hasSuitcase: false,
    bagScreened: false,
    bagRetrieved: false,
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
};

export const gameState = { ...INITIAL_STATE };

export function resetGameState() {
    Object.assign(gameState, INITIAL_STATE);
}
