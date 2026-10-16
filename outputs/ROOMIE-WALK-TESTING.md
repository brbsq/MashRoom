# Roomie walking animation — 14 October 2026

Both side profiles now use four-frame walk cycles while moving in the room and plaza. Each cycle includes alternating contact and passing poses, knee bending, lifted shoes and arm swing. Playback is 160ms per frame / 640ms per loop. Stopping unmounts the cycle and restores the unchanged original front PNG.

## Artwork and implementation

- Runtime assets: `app/public/rooms/roomie-walk-left.png` and `roomie-walk-right.png`, each 912 × 1500 RGBA with four 456 × 750 cells.
- Built-in image generation used the original front and approved side profiles as references; raw sheets and exact prompts remain in `output/roomie-poses/walk/`.
- The fourth left-facing cell was refined separately to lift the opposite shoe forward; packing preserves the first three original cells and uses `left-passing-v2.png` for the fourth.
- Reproducible packing: `app/scripts/pack-roomie-walk.mjs` aligns head centres and the sole baseline, preserves alpha and checks against clipping.
- The shared `RoomieRenderer` selects the matching atlas only while walking and preloads both cycles. A clipped SVG image uses step-end CSS frame changes. No per-frame React state updates or additional movement timers are needed.
- Existing room/plaza movement direction, idle front artwork, appearance data and editor behavior are preserved. The room's old walking rotation/bounce is disabled; idle breathing and care effects remain. Reduced motion disables atlas playback.

## Verification

- Type checking and all 27 existing regression tests passed.
- Framework production build and static Pages build passed. The existing Pages bundle-size warning remains non-blocking.
- Both packed atlases were visually reviewed, have alpha transparency and retain all head/hands/shoes within cell bounds.
- Browser checks used the existing Roomie Pose Preview local demo. The room's actual CSS transforms were sampled over time and advanced between atlas cells, including looping back to the initial cell. Screenshots show lifted-foot passing poses rather than a static bobbing image.
- Left/right movement was previewed in the mobile room and desktop plaza, using pointer movement and plaza direction buttons. Idle returns to `/rooms/cd2bd.png`; browser error logs were inspected.
- The implementation retains the existing vertical-facing rule and appearance-editor front image. Appearance persistence is covered by unchanged regression tests and the preceding editor browser checks; no editor logic was edited here.
- Reduced-motion CSS was inspected; the user's OS preference was not changed. These checks use local simulated movement, not live multiplayer or physical touch hardware.

## Previews

- `roomie-walk-preview.gif`: both directions together, using the exact packed frames and runtime timing.
- `roomie-walk-left.gif`, `roomie-walk-right.gif`: individual animated previews.
- `roomie-walking-room-left.jpg`, `roomie-walking-room-right.jpg`: live room captures.
- `roomie-walking-plaza-left.jpg`, `roomie-walking-plaza-right.jpg`: live plaza captures.

Local preview: `http://127.0.0.1:4173/MashRoom/pet/` and `/MashRoom/plaza/`.
