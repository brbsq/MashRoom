# Figma welcome screen review

Reviewed locally on 2026-10-05. No live Google or student data was changed.

## Verified in the browser

- Both supplied Figma image assets load from non-empty local files. Desktop room geometry matches the exported crop, and the logo retains its 3:2 aspect ratio in both states.
- At 1440 × 810, the opening composition fades in, the intermediate `entering` frame moves the same logo toward the header, and the final view presents the greeting and glass controls.
- Skip intro changes to `ready` and removes `inert` from the controls.
- Hovering each greeting word independently produces scale 1.085 and the soft double glow. Sparkles appear near the mouse, without intercepting clicks.
- Features, help, credits, submissions, and teacher dialogs open; Escape and Close dismiss them.
- Students and Log in here reach the existing login form.
- The 390 × 844 and 320 × 740 layouts have no horizontal page overflow. Mobile role buttons and navigation remain usable.
- No browser warnings or errors were captured during these checks.

## Code-level safeguards

- Reduced-motion preference skips the intro and disables continuous motion and mouse particles. The test browser does not expose media emulation; an OS-level reduced-motion session was not tested.
- Coarse/touch pointers do not create cursor particles. At most 64 particles are retained, with requestAnimationFrame stopped when they expire. Event listeners and timers are cleaned up on unmount.
- The full app's existing 14 behavioral/security tests pass. Type checking and the production build pass.

Figma returned no keyframe tracks for either supplied node. The motion is authored from the user's requested sequence, not claimed to be an exported prototype timeline. The pet, plaza, and other app screens are outside this visual update.
