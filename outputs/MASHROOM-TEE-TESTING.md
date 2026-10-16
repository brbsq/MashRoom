# Wearable MashRoom tee — 15 October 2026

Local-only delivery. No GitHub push or deployment.

## Using it

Open Wardrobe → Tops → MashRoom logo tee (first card). It changes the character immediately. Use the floating colour controls if wanted, then Save. The saved outfit is shared by Closet, Maker, room and plaza. Exit → LEAVE discards an unsaved draft. Other catalogue clothes still use the previous preview-only implementation.

## Verified

- TypeScript checking, 37 core regression tests, and GitHub Pages static build pass. The build still reports the existing large-chunk advisory.
- Desktop browser: actual white tee and chest print on the original Roomie; blue fabric recolour preserves the coloured print and skin; Undo returns to white.
- Favouriting and Save work; refreshing Closet restores the tee and favourite.
- Switching to the old hoodie, Undo, Redo, then leaving without saving preserves the saved tee.
- Saved outfit renders on the room character and local plaza avatar. Pointer movement reviewed facing left and right; the atlas advances garment overlays with the same frames. Side collar/sleeve seam underlays prevent old dark clothing showing through.
- 390 × 844 mobile Closet reviewed: character, catalogue, wearable card and controls remain accessible.
- Unit tests cover old-data migration, original selection indices, item-specific colours, validation, save round-trip, undo/redo, pose asset dimensions and all four walking placements.
- Original Roomie rasters are not edited. Pet needs, points and other progress are not reset. Test fitting saved the white tee and added its favourite to the current device-local demo profile.

## Artwork

Built-in image generation produced only fitted front/left/right garment layers. The user's source sheet is retained unchanged. Prompts and asset paths: `../output/clothing/mashroom-tee/prompts.json`; fitting coordinates: `../app/lib/wearables.ts`.

Screenshots: `mashroom-tee-closet.png`, `mashroom-tee-room-left.png`, `mashroom-tee-room-right.png`, `mashroom-tee-plaza.png`, `mashroom-tee-mobile.png`.
