# Natural Roomie blinking — 16 October 2026

Shared renderer: irregular 2.6–7 second pauses, 210ms blink, 14% chance of one extra blink after 140–219ms. Only one timer is pending; unmount, hidden pages and reduced-motion preferences stop it. No profile, outfit, wallet or artwork file changes are needed. Editor catalogue previews opt out.

Validation:

- 63 automated tests pass, including deterministic single/double-blink scheduling, cancellation/restart and directional registration/layer checks.
- TypeScript typecheck passes.
- Server and Pages production builds pass (existing large-chunk warning remains).
- Production browser checks observed live blinks in the room, plaza, Closet and Shop clothing try-on. Room/plaza retained the equipped MashRoom logo tee; plaza computed eyelid animation was active. No save/purchase/care actions were used.
- Storage-free browser fixture verified live `data-blinking` true then false after restoring Natural mode.
- Frozen closed-eye visual inspection covered front/left/right idle, all four walking frames, no accessories, original glasses and equipped spectacles. Side walking upper-eye coverage was corrected during review.
- `roomie-blink-review.png` is a frozen closure review, not evidence of timing by itself. Timings are tested separately.

The fixture imports the actual renderer and uses no profile/provider/storage. Its Open/Closed controls override only presentation CSS. Run `node scripts/review-blinks.mjs` after a Pages build; a normal Pages rebuild removes these generated QA files. Browser validation cannot substitute for checking the effect on other browsers or OS-level reduced-motion changes; those lifecycle branches are covered by source checks, not an OS preference change during this review.
