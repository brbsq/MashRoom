# Editor, phone and inventory refinements — 15 October 2026

Local-only changes. No publication, Git push, account changes or data resets.

## Changes

- Accessories → Original Roomie specs is a separate wearable with its own transparent front/left/right SVG assets. It appears first in Accessories. No accessories removes eyewear. The new item is appended as `accessories:6`, preserving existing selection indices.
- Glasses-free sibling references, generated with built-in image generation, supply softly masked face regions only. Walking uses matching per-frame references; original sprites and gait sheets are not overwritten. Paths and full prompts: `../output/accessories/roomie-specs/prompts.json`.
- Removed the separate Room link from Closet and Maker. Exit and Save → LEAVE remain the guarded way back.
- Maker's name input has more room to its right. At the reviewed 1280 px desktop width its right edge is about 39 px inside the header edge.
- Maker logo → Options now includes optional Roomie gender: Not set, Girl, Boy and Non-binary. It is appearance draft data, not the student's gender. It does not restrict styles or change body artwork. Save commits it; undo and unsaved-exit cancellation apply.
- Phone home pages accept horizontal trackpad wheel gestures and touch swipes. Horizontal gestures use a non-passive listener attached after the portal screen mounts, so browser history gestures are prevented. Momentum is locked to one page change until the gesture ends. Vertical movement and pinch/zoom are not treated as page changes.
- Phone page buttons are 48 × 44 px and sit higher above the dock. Both phone sizes share the page state.
- Clock uses dotted a.m./p.m.; date uses a two-digit day and full month, e.g. 05 October.
- Storeroom desktop cards use 132 px minimum columns, tighter gaps/padding and 72 px artwork. Existing categories, filtering and search remain intact; saved specs have their own inventory thumbnail.

## Verification

- Type checking, all 41 core tests, Pages production build and git diff whitespace checks pass. Existing large-bundle advisory remains.
- Browser: specs equip and remove; saving, returning from the room and refresh restore the selected wearable. Reviewed the front and both walking directions with the tee still equipped.
- Browser: horizontal scrolling switches phone page 1 → 2 and 2 → 1; direct page controls also work. Date/period formatting and the larger touch targets are visible.
- Browser: Maker gender changes trigger the unsaved-exit confirmation; Undo returns the selection to Not set. No gender was inferred or saved during QA.
- Desktop and 390 × 844 mobile Maker Options and phone were reviewed. The original Room link is absent. No browser errors were reported in the final check.
- Unit regressions cover midnight/noon period formatting, DD Month, gesture accumulation/vertical rejection/momentum, optional gender migration/history/round-trip, wearable specs and old selection compatibility, artwork availability and walk-sheet aspect ratios.

The existing device-local demo now has Original Roomie specs equipped for testing. Its teal logo tee, pet needs, points, name and other progress were preserved.

## Screenshots

- `closet-wearable-specs.png`
- `specs-walking-left.png` / `specs-walking-right.png`
- `phone-swipes-date-controls.png` / `phone-controls-mobile.png`
- `maker-gender-options.png` / `maker-name-spacing.png`
- `storeroom-compact.png`
