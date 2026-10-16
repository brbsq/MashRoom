# Local UI upgrade testing — 13 October 2026

Follow-up on 14 October: the side-view character-art gap described below is now complete. See `ROOMIE-POSE-TESTING.md` for the new artwork, movement integration and current verification. The remaining appearance-layer limitation is unchanged.

## Current scope

Map, Closet and Roomie Maker are available locally, with phone shortcuts and the 2D furniture upgrade. The existing map-comparison archive is unchanged. No publication or GitHub push was performed.

The latest character instruction is applied: all four screens use the original `/rooms/cd2bd.png`, even when customised appearance data exists. Temporary replacement drawings were removed. Saved feature/outfit selections are UI-test data until matching original-style layers and true side-view sprites are supplied; the editor labels this explicitly. Direction and movement remain functional, but the current artwork is a front-view sprite, not a genuine sideways pose.

## Automated checks

- TypeScript checking passed.
- All 27 focused/regression tests passed. Coverage includes appearance validation, clothing-only favourites, swatches, history branching, storage-key isolation, furniture migration, scaling, rotated bounding corners, depth/manual ordering, existing needs and Google/Classroom permissions/imports.
- Framework production build and static GitHub Pages build passed. The static build reports a non-blocking large-bundle warning. Static build is run after framework build because framework output replaces the parent `dist` directory.
- A final rerun encountered host disk exhaustion while copying generated assets. Only the ignored, reproducible `app/dist` build output was cleared; source artwork and demo storage were preserved. The retry passed both builds.
- All downloaded creation assets were non-empty; no temporary Figma asset URLs are referenced by runtime code. Shoes/body icons and Metro line retain source proportions. Final original-character source URLs were checked in the browser.

## Browser checks performed

- New demo profile enters Maker. Name changes, item selection, Undo/Redo, Save and LEAVE/STAY dialogs worked.
- Saved appearance data loads correctly after switching screens and refreshing; an initialization race was found and fixed.
- Closet category/header changes, image-only hair cards, clothing stars, custom hex colour/swatch saving, filtering, Save and unsaved-exit flow were exercised. Favourites survive refresh; hair has no favourite control.
- Phone page 2 shows Mirror and Maker; both open their matching screens. Page 1 Map and Classmates routes were tested. Both phone sizes use the same app-page contents. Navigation waits for the closing transition.
- Map loading stage, Info, five-station Metro, BACK cancellation, GO neighbourhood change and refresh persistence were exercised. Closing Map restored the prior room.
- Furniture add, scaling, reset size, rotation, layer choice, duplicate, keyboard nudge, Save/refresh and Cancel were exercised. Pointer dragging a plant onto the wall correctly clamped its floor anchor to 83%. Placed furniture and actor share one scene stack.
- Original-art movement was checked in the room and plaza. Before the latest artwork change, temporary side poses were tested; those drawings are no longer used and sideways artwork is now explicitly pending.
- Desktop 1280×720, tablet 1024×768 and mobile 390×844 layouts were reviewed, including saved/unsaved dialogs, mobile Closet/Maker and Metro.

## Verification limits

Browser tests used mouse/pointer and keyboard on responsive phone-sized layouts, not physical touch hardware. OS Reduce Motion branches/CSS were reviewed, but the user's OS setting was not changed. Quota/storage failures were inspected for draft retention and retry messages, not forced in the user's browser. Live Google credentials/imports were not exercised; existing mocked backend regression tests passed. Existing need-ring icon visibility varies with backdrop-filter support; that pre-existing styling was not changed in this upgrade.

## Try it

Open `http://127.0.0.1:4173/MashRoom/pet/` after entering a demo profile. Phone page 1 → Map; phone page 2 → Mirror or Maker. More options → Decorate room opens placement controls. For a fresh profile, visit `/MashRoom/login/` with a new display name and sample class.
