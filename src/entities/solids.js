/**
 * Furniture the player walks around rather than over.
 *
 * A solid is an invisible static body the size of the art it stands for. The
 * scene collects them in `scene.solids` — which it must reset in `create()`,
 * since Phaser reuses a scene instance and last run's blocks are gone — and
 * `collideWithSolids` covers the lot with one collider.
 *
 * Adding one changes what the interaction zone beside it has to cover. Zones
 * are drawn centred on the thing they belong to, which works while the player
 * can stand on it; once it is solid he is stopped alongside instead, so the
 * zone has to reach past the body to find him there — without growing into a
 * neighbouring zone, because two zones that overlap share one keypress and
 * whichever handler runs first swallows it.
 */
export function addSolid(scene, x, y, w, h) {
    const block = scene.add.rectangle(x, y, w, h, 0xff0000, 0);
    scene.physics.add.existing(block, true);
    scene.solids.push(block);
    return block;
}

/** One collider for every solid in the scene. */
export function collideWithSolids(scene, player) {
    return scene.physics.add.collider(player, scene.solids);
}
