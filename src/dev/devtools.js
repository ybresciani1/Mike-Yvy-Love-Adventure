// Developer-only tools: the console helpers plus a chapter-select overlay.
//
// Nothing in here reaches players. main.js imports this module dynamically from
// inside an `import.meta.env.DEV` branch, so Vite replaces the condition with
// `false` for `npm run build` and drops the whole branch — the module is never
// pulled into the production bundle and no chunk is emitted for it. Keep it
// that way: never import this file from anything that ships.
//
// The overlay is built with createElement rather than markup in index.html, so
// the page shell the public downloads has no trace of it either.

import { STORY_ORDER } from '../scenes/index.js';
import { resetDialogue } from '../ui/dialogue.js';
import { stopMusic } from '../audio/music.js';
import { resetGameState } from '../state.js';

// Scene keys read fine as chapter names once the camel case is split up; these
// are the handful that read better with a human name. Anything not listed falls
// back to the derived label, so a new scene shows up here without extra wiring.
const CHAPTER_LABELS = {
    TitleScene: 'Title Screen',
    AirportScene: 'DCA Airport',
    FlightScene: 'The Flight',
    BarScene: 'Hotel Bar',
    ClubScene: 'The Club',
    PizzaScene: 'Late-Night Pizza',
    MorningScene: 'The Morning After',
    ConferenceScene: 'The Conference',
    UberScene: 'Uber Ride',
    RestaurantScene: 'Dinner Out',
    MovieScene: 'The Movie',
    DriveToHotelScene: 'Drive to the Hotel',
    FancyHotelScene: 'The Fancy Hotel',
    DowntownScene: 'Downtown',
    CostumeNightScene: 'Costume Night',
    FifthRoseScene: 'Fifth & Rose',
    CoinOpWalkScene: 'Walk to Coin-Op',
    CoinOpScene: 'Coin-Op',
    TravelScene: 'Travelling',
    HouseScene: 'The House',
    SurgeryScene: 'Surgery',
    BurialScene: 'The Burial',
    NewYearsScene: 'New Year’s',
    ApartmentScene: 'The Apartment',
    ThanksgivingScene: 'Thanksgiving',
    HomeScene: 'Home',
    PresentScene: 'The Present'
};

const labelFor = (key) =>
    CHAPTER_LABELS[key] ?? key.replace(/Scene$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');

// Every DOM overlay a scene can leave showing. A jump skips the code that would
// normally tidy these up, so the chapter select clears them itself.
const OVERLAY_IDS = [
    'scrolling-banner',
    'wardrobe-modal',
    'restaurant-menu-modal',
    'interaction-hint',
    'dialogue-box'
];

function clearOverlays() {
    resetDialogue();
    for (const id of OVERLAY_IDS) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }
}

/**
 * Jump straight to a scene, as if starting that chapter fresh.
 *
 * Use this rather than game.scene.start(key): on the global SceneManager
 * start() runs the target *alongside* whatever is already active, and two live
 * scenes share one keyboard and one DOM dialogue box — the older scene's
 * overlap handlers keep firing dialogue over the new scene. Inside a scene
 * this.scene.start() stops the caller, which is why normal play never hits this.
 *
 * Story flags are reset too, so the chapter plays from its own beginning. Pass
 * { keepState: true } to jump with the current gameState left alone.
 */
export function jumpToScene(game, key, { keepState = false } = {}) {
    stopMusic();
    clearOverlays();
    if (!keepState) resetGameState();
    game.scene.getScenes(true).forEach((s) => game.scene.stop(s.scene.key));
    game.scene.start(key);
    return key;
}

function buildOverlay(game, onJump) {
    const root = document.createElement('div');
    root.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:9999',
        'display:none',
        'align-items:center',
        'justify-content:center',
        'background:rgba(0,0,0,0.75)',
        'font-family:\'Courier New\', Courier, monospace'
    ].join(';');

    const panel = document.createElement('div');
    panel.style.cssText = [
        'background:#1b1b1b',
        'border:4px solid #8b4513',
        'border-radius:5px',
        'box-shadow:0 5px 25px rgba(0,0,0,0.6)',
        'padding:16px 20px',
        'width:520px',
        'max-height:78vh',
        'display:flex',
        'flex-direction:column',
        'gap:10px'
    ].join(';');

    const heading = document.createElement('div');
    heading.textContent = 'CHAPTER SELECT — dev build only';
    heading.style.cssText = 'color:#0f0;font-weight:bold;letter-spacing:1px;font-size:15px';

    const list = document.createElement('div');
    list.style.cssText = 'overflow-y:auto;display:flex;flex-direction:column;gap:2px';

    const footer = document.createElement('div');
    // ASCII only: Courier New has no glyph for the arrow characters.
    footer.textContent = 'ARROW KEYS move  -  ENTER jump  -  ` or ESC close';
    footer.style.cssText =
        'color:#8a8a8a;font-size:12px;border-top:1px solid #3a3a3a;padding-top:8px';

    let selected = 0;
    // Hovering picks a chapter, but only once the pointer has actually moved:
    // opening the panel under a resting cursor should not steal the selection
    // away from the chapter that is playing.
    let pointerMoved = false;
    root.addEventListener('mousemove', () => {
        pointerMoved = true;
    });

    function select(index) {
        selected = (index + rows.length) % rows.length;
        rows.forEach((row, i) => {
            const active = i === selected;
            row.style.background = active ? '#8b4513' : 'transparent';
            row.style.color = active ? '#fff' : '#e1c699';
        });
        rows[selected].scrollIntoView({ block: 'nearest' });
    }

    const rows = STORY_ORDER.map((key, i) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.dataset.sceneKey = key;
        row.textContent = `${String(i + 1).padStart(2, '0')}.  ${labelFor(key)}`;
        row.style.cssText = [
            'all:unset',
            'cursor:pointer',
            'padding:5px 10px',
            'border-radius:3px',
            'color:#e1c699',
            'font-size:14px',
            'font-family:\'Courier New\', Courier, monospace'
        ].join(';');
        row.addEventListener('click', () => onJump(key));
        row.addEventListener('mouseenter', () => {
            if (pointerMoved) select(i);
        });
        list.append(row);
        return row;
    });

    panel.append(heading, list, footer);
    root.append(panel);
    document.body.append(root);

    // Clicking the backdrop closes; clicking the panel does not.
    root.addEventListener('click', (event) => {
        if (event.target === root) onJump(null);
    });

    return {
        root,
        move: (delta) => select(selected + delta),
        current: () => rows[selected].dataset.sceneKey,
        // Open on whichever chapter is actually playing.
        sync: () => {
            pointerMoved = false;
            const running = game.scene.getScenes(true)[0]?.scene.key;
            const index = STORY_ORDER.indexOf(running);
            select(index === -1 ? 0 : index);
        }
    };
}

export function installDevTools(game) {
    window.game = game;
    window.gotoScene = (key, options) => jumpToScene(game, key, options);
    window.listScenes = () => STORY_ORDER.map((key, i) => `${i + 1}. ${key}`).join('\n');

    let open = false;
    const ui = buildOverlay(game, (key) => {
        setOpen(false);
        if (key) jumpToScene(game, key);
    });

    function setOpen(next) {
        open = next;
        ui.root.style.display = open ? 'flex' : 'none';
        if (open) ui.sync();

        // Stopping the event below is not enough on its own — it only wins if
        // this listener runs before Phaser's, which depends on the event's
        // propagation path. Switching the scene's KeyboardPlugin off is
        // unconditional, so the scene underneath cannot act on overlay keys
        // however the event reached the page. resetKeys clears anything held
        // down, which would otherwise stay down: the scene never sees the keyup.
        // Both live on the scene's plugin, not on game.input.keyboard — that is
        // the game-level KeyboardManager and has neither method.
        game.scene.getScenes(true).forEach((scene) => {
            const keyboard = scene.input?.keyboard;
            if (!keyboard) return;
            keyboard.resetKeys();
            keyboard.enabled = !open;
        });
    }

    // Match the physical key and the character it printed: `code` covers layouts
    // where the character sits elsewhere, `key` covers the shifted tilde and any
    // source that leaves `code` empty.
    const isToggleKey = (event) =>
        event.code === 'Backquote' || event.key === '`' || event.key === '~';

    // Capture phase, so this runs before the game's own handlers on a real key
    // event (whose path reaches window on the way down, and Phaser on the way
    // back up).
    window.addEventListener(
        'keydown',
        (event) => {
            // Leave browser shortcuts alone — reload and devtools still need to
            // work while the overlay is up.
            if (event.ctrlKey || event.metaKey || event.altKey) return;

            if (isToggleKey(event)) {
                event.preventDefault();
                event.stopPropagation();
                setOpen(!open);
                return;
            }
            if (!open) return;

            const actions = {
                Escape: () => setOpen(false),
                ArrowUp: () => ui.move(-1),
                ArrowDown: () => ui.move(1),
                PageUp: () => ui.move(-5),
                PageDown: () => ui.move(5),
                Enter: () => {
                    const key = ui.current();
                    setOpen(false);
                    jumpToScene(game, key);
                }
            };
            const action = actions[event.code === 'NumpadEnter' ? 'Enter' : event.key];

            // Swallow the rest, handled or not, so a stray SPACE does not also
            // land on the scene underneath. F-keys stay live for devtools.
            if (!/^F\d+$/.test(event.key)) {
                event.preventDefault();
                event.stopPropagation();
            }
            action?.();
        },
        true
    );

    console.info('[dev] chapter select: press ` — console: gotoScene(key), listScenes()');
}
