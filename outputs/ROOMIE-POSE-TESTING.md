# Roomie side-pose completion — 14 October 2026

Later on 14 October, the static walking poses gained four-frame gait animation. See `ROOMIE-WALK-TESTING.md` for the current motion implementation and checks. The notes below record the preceding pose-art verification.

The movement-art gap recorded in `UI-UPGRADE-TESTING.md` is now closed. Two transparent PNG profile sprites match the supplied Roomie's identity, outfit and painterly style. The original `app/public/rooms/cd2bd.png` is unchanged.

## Implementation

- `app/public/rooms/roomie-left.png` — 977 × 1610, RGBA with transparent pixels.
- `app/public/rooms/roomie-right.png` — 977 × 1609, RGBA with transparent pixels.
- The shared renderer maps left/right directly to these assets and preloads all three poses. Existing room and plaza walking states already supply the direction. Idle and editor previews retain the original front asset.
- Room loading now includes the new assets. Its canvas accommodates the wider profile aspect ratio so all poses fit at full height, centred on the same floor anchor.
- Appearance data, validation, storage keys, catalogues, favourites, colours, Undo/Redo and Save/exit flows are unchanged. Appearance layers remain pending and the existing editor notice remains accurate.
- Built-in image generation was used, one pose per call. Full reference prompts: `output/roomie-poses/prompts.json`. Artwork provenance is in `app/ARTWORK.md`.

## Verification

- `npm run typecheck` passed.
- `npm test` passed all 27 existing regression tests, including appearance, history and storage isolation.
- `npm run build` passed the framework production build.
- `npm run build:pages` passed after the framework build; the existing large-bundle warning remains non-blocking.
- `git diff --check` passed.
- Both new assets have genuine alpha transparency (alpha range 0–255).
- Browser preview used a separate local demo profile, Roomie Pose Preview. Left/right image URLs, loaded images, walking flags and rendered profiles were verified in the room and plaza. Pointer, keyboard and plaza direction-button movement were exercised. Plaza vertical movement retained the previous right direction. Stopping restored the original front image. Browser error logs were empty in the inspected session.
- Room sizing and both profiles were reviewed at 1280 × 720 and the browser's default 413 × 757 mobile viewport. The temporary desktop viewport override was reset.
- Maker selection, Undo/Redo and Save/STAY/Exit were exercised; its preview remained the original front PNG. Closet clothing selection, favourite and colour Save were exercised; the favourite and selection survived refresh and its preview also remained the original front PNG.

## Preview captures

- `roomie-room-left.jpg`, `roomie-room-right.jpg`: desktop room during movement.
- `roomie-room-left-mobile.jpg`, `roomie-room-right-mobile.jpg`: mobile room during movement.
- `roomie-plaza-left.jpg`, `roomie-plaza-right.jpg`: desktop plaza during movement.
- `roomie-maker-poses.jpg`, `roomie-closet-poses.jpg`: editor previews.

Preview server: `http://127.0.0.1:4173/MashRoom/pet/` and `/MashRoom/plaza/`.

Verification uses responsive browser layouts and simulated local demo movement. Physical touch hardware and live multiplayer were not tested. Reduced-motion CSS remains in place; the user's OS preference was not changed. The poses use the existing bobbing movement animation rather than a multi-frame gait. No GitHub push or publication was performed.
