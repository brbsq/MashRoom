# MashRoom UI refinement pass — 16 October 2026

Local-only implementation of the 30 browser comments. No publication, new account, saved outfit, gender or pet-care changes were made during QA. Existing 16% volume remains a saved preference; the new default is 20% for devices without a chosen volume.

## Changes by comment

| Comments | Result |
| --- | --- |
| 1–3 | Loading logo/text share the screen centre, with a compact gap. Both login overlays use a shared centred branding column and stroke-free, seamless letters. Original logo retained. |
| 4 | Google and sign-in actions share one height variable in both role overlays. |
| 5 | “Sign up here” uses a slowly flowing mint/guava gradient and hover glow; reduced motion stops the flow. It retains the existing student-panel flow, not an invented signup backend. |
| 6 | New BGM default is 20%. Saved volume/mute choices are retained. |
| 7–8 | Optional Girl/Boy icon squircles; neither selected initially. Clear/toggle-off supported; no Non-binary option shown. Legacy saved data is preserved. Maker name has more right inset. |
| 9–14 | Clear liquid-glass colour and narrower Filter dialogs; hue has no outer white border. Selected cards glow around their background. Filter icon artwork is centred by its visible path bounds. |
| 15–16 | Four-direction trackpad/touch gesture logic, momentum lock, reverse direction, end wrapping and suppression of accidental post-swipe taps. Shared glass page-indicator capsule with 44px targets above dock. |
| 17–18, 30 | 800ms exit/entry fades for Maker, Closet and Map, phone-close handoff first, reduced-motion bypass, Map loading-to-map crossfade. |
| 19–21, 23 | Removed square blur-edge layers; retained Figma glass frame/card ratios and brand-above-item captions. Product-image background is transparent. No accessories comes first without changing stored item indices. |
| 22, 24 | Body-registered fabric, neckline and independent print replace detached tee rectangle. Original silhouette, sleeves/folds and arm occlusion are shared across idle and all walk frames in editors, room and plaza. |
| 25 | Room changes fade out and in at 800ms each. |
| 26–28 | Every room navigation button opens a compact anchored control panel. Classroom has an explicit full-classroom link. Student name is left-aligned; room/demo caption is removed. |
| 29 | Clicked needs automatically dismiss after three seconds; second click, outside click and Escape can dismiss sooner. |

## Verification

- Type checking, 50 regression tests, Pages build and server build pass. Existing Pages large-chunk advisory remains.
- Original Figma Closet context fetched from file `13X03GNMt4ukNUfYYNIm4C`, node `15:986`. Existing local assets reused, including 298 × 411 card surface and 1073 × 748 catalogue surface. Dynamic clothing/specs thumbnails replace sample-product imagery.
- Browser: Figma-style cards, transparent image region, glow, brand/item labels, No accessories ordering, Filter search, colour overlay and zero-pixel Hue border checked. Final card ratio measured 0.72508 (298/411); image-region background is rgba(0,0,0,0), with two surrounding glow shadows rather than an outline.
- Browser: both role overlays checked; Google and submit actions both measure 80px at desktop. Loading logo and wordmark bounding-box centres both measured x=640px in a 1280px viewport. No text stroke remains.
- Browser: five room panels opened and closed without navigating or covering the entire room. Clicked Hunger popup automatically disappeared. Kitchen transition measured 0.8s and the original living room was restored.
- Browser: right, down, left and up trackpad gestures all changed phone pages. Maker launch and clean exit, Closet unsaved LEAVE, Map entry/loading/exit all reached their expected routes with fade state set before navigation. Final Map loading crossfade reaches opacity 0 / visibility hidden after its 0.8s transition.
- Browser: optional gender initially had both choices unpressed. Saved volume was not reset. No form was submitted and no outfit was committed in QA.
- Thirty outfit views visually reviewed: white and mint, each with front/left/right idle plus four walking frames per direction. Live room keyboard movement and idle outfit also checked. Other catalogue styles remain demo previews, not a complete final artwork collection.
- Desktop and narrow responsive layouts reviewed. A physical touchscreen, OS-level reduced-motion session and actual cursor-hover glow were not exercised; touch direction/locking and reduced-motion guards are covered by logic/source checks.

## Quick test

1. Refresh the local preview. Watch the welcome intro, open both role panels, then close them.
2. In the room, open a top-bar panel and a need status. The panel floats; the need closes automatically.
3. Open the phone and swipe in any direction. Page 2 → Maker → logo opens Options. Gender stays a draft until Save.
4. Wardrobe → Tops → logo tee. Try colour, Filter, Undo/Redo; Exit → LEAVE discards edits. Save commits normally.
5. Use arrows/tap the room floor to inspect the saved outfit during movement. Map and room switches should fade slowly.

Screenshots: `refinement-student-login.png`, `refinement-teacher-login.png`, `refinement-welcome-signup.png`, `refinement-maker-options.png`, `refinement-liquid-colour.png`, `refinement-phone-indicator.png`, `refinement-room-control-panel.png`, `refinement-room-wearing-idle.png`, `refinement-room-wearing-walk.png`, `refinement-fitted-outfit-all-poses.png`.

Glass styling is a browser-native interpretation, informed by [Apple’s Liquid Glass materials guidance](https://developer.apple.com/design/human-interface-guidelines/materials), not a claim of an exact native iOS/macOS implementation.

## Follow-up audit — 16 October

- Guarded the phone's close-to-app handoff against duplicate rapid activation. Reopening cancels any pending phone route and resets transient touch/click suppression; unmount cleanup remains in place.
- Added gesture regression coverage for the exact 48px boundary, diagonal intent, quiet reset and immutability. The handoff guard/cancellation check is a source-contract test, not a simulated touchscreen test.
- Browser: rapid double activation of Maker reached the expected Maker route. Keyboard Right changed saturation from 0% to 1%; invalid `#oops` disabled both Apply and Save to swatches. A temporary mint tee applied correctly, Undo restored white, and Redo restored mint. Adding a favourite updated its pressed state.
- Exit → LEAVE discarded the temporary colour and favourite. The room still showed the saved white tee, Alex/Mochi and the original six need values. Girl/Boy selection, toggle-off and Clear selection worked without saving; saved BGM remained 16%.
- Remaining validation is device-specific: physical touchscreen, actual cursor hover and OS-level reduced-motion settings. Other sample catalogue styles are still previews rather than a complete set of finished artwork. No account/backend or publication work was added.

Additional evidence: `refinement-followup-draft-controls.png` shows the temporary mint draft, not the saved outfit. `refinement-followup-saved-outfit.png` shows the original white outfit after the test edits were discarded and a fresh Closet visit confirmed the favourites list was still empty.
