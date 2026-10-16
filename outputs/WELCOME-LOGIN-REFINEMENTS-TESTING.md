# Welcome and login refinements — 2026-10-15

Local preview: http://127.0.0.1:4173/MashRoom/ and `/MashRoom/login`. No publication, account creation or demo-data changes were performed.

## Implemented

- Version is sourced from app/package.json, currently alpha 0.1.0; build timestamp is available in its hover title. Both Vite configurations inject the timestamp.
- Removed Skip intro and its manual skip action; automatic staging and reduced-motion bypass remain.
- Removed the greeting text stroke that exposed overlapping contours inside the R. Browser screenshot confirms seamless lettering. “Let’s get started.” has computed opacity 0.5.
- Login uses original logo and room artwork, rounded typography, frosted panels and glass controls. Heading is “Hello, Roomie.” Old bunny, YOUR NEW CHAPTER and buddy caption are removed.
- Desktop short-screen spacing fits the full login card at 1280 × 720 (card bottom 663px). Mobile uses natural vertical scrolling.

## Verification

- Type checking passes; all 44 regression tests pass; both Pages and server production builds pass. Existing Pages large-chunk advisory remains.
- Browser: welcome automatically reaches ready without Skip intro. Log in here still opens the existing Students’ Panel; its demo link reaches the redesigned login.
- Browser: class selector opens with three options and dismisses with Escape; existing-profile Continue link remains available. No login form was submitted, preserving active progress.
- Browser: unconfigured Google button gives the existing actionable toast and remains on login; no external sign-in was attempted.
- Browser: 390 × 844 and 320 × 740 have no horizontal overflow (document widths match viewport). Full mobile screenshot reviewed; inputs and primary controls retain touch-friendly sizes.
- Reduced-motion guards were reviewed in code; OS-level reduced-motion and real Google authentication were not exercised.

## Screenshots and quick walkthrough

1. Open the welcome route and allow its intro to finish. Check seamless Roomie lettering, faint tagline and package version.
2. Open login directly, or Log in here → No account? Try the demo. Check original logo and glass styling.
3. Open the class selector; on mobile scroll down to Google and the return link. Continue resumes your existing profile; Try the demo starts the established profile-creation flow.

Screenshots: `welcome-seamless-roomie.png`, `login-liquid-glass.png`, `login-mobile.png`.
