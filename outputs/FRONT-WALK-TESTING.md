# Front-facing walking — 15 October 2026

The current program now has front, left and right walking. Moving downward with the keyboard, plaza controls or a floor click toward the viewer selects the front cycle. Horizontal-dominant movement keeps side walking. Upward-only travel retains the previous facing because no back-facing artwork is supplied. Stopping returns to the normal front idle pose.

## Integration

- New body atlas: `app/public/rooms/roomie-walk-front.png`, 912 × 1500 RGBA, four 456 × 750 cells.
- Raw generated sheet and full built-in imagegen prompt: `output/roomie-poses/front-walk/`.
- Reproducible registration/preview script: `app/scripts/pack-roomie-front-walk.mjs` (run with Node.js 24 from `app/`).
- The renderer keeps the exact original front head, and applies the existing optional glasses layer to every frame. The generated head is clipped away; both the raw drawing and original front file remain intact.
- Front tee placements cover the new torso and move with the atlas. Existing side tee/specs code and appearance storage are preserved.
- `app/lib/roomie-motion.ts` provides the shared facing rule and head registration used by the app and exported preview.

## Checks

- TypeScript checking and all 42 regression tests passed, including a new direction-selection regression and front wearable placement bounds.
- The static Pages and framework production builds passed; the existing Pages large-bundle warning remains non-blocking.
- The front source frames and composed four-frame strip were visually reviewed. Packing checks that no frame clips, and the new asset has alpha transparency.
- Browser checks used a separate Front Walk Preview demo. Pointer travel toward the viewer activated `data-pose=front` and `walk-cycle` in the room. Plaza Move down activated the same cycle; CSS matrices advanced through the atlas cells. Original head, alternating feet and arm poses were visible.
- Saved logo tee plus Original Roomie specs remained equipped through front walking: four front shirt layers and four editable glasses layers were present, and the composed outfit was visually reviewed. Stopping returned to idle with the outfit retained.
- A render of the current component's four front cells with both wearables was reviewed, including shoulder coverage. The outfit render is exported as `front-walk-outfit-frames.png` and `front-walk-outfit.gif`.
- Preview captures: `front-walk-room.jpg`, `front-walk-room-outfit.jpg`, `front-walk-plaza.jpg`; animated preview: `roomie-walk-front.gif`; all four default poses: `roomie-walk-front-frames.png`.

These checks use local simulated movement. Physical touch hardware and OS reduced-motion settings were not changed. Browser logs and production asset copies are checked before delivery. No live-site publication is included.
