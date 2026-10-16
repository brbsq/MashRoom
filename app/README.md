# MashRoom application

## Shop

Phone → Shop opens `/shop`, a Closet-style shop with 14 finds across Clothing, Furniture, Decorations and Arcade Tokens. Three new code-native collectibles (Starlight lamp, Pocket arcade cabinet and Guava heart cushion) are featured first. Search, A–Z/featured sorting, Saved filters, colour and front/left/right Roomie try-ons remain available. Narrow-screen selection brings the preview back into view.

The device-local demo wallet starts demo identities with 250 points (Google identities get no fabricated earned points). Review → Confirm debits points, grants ownership/tokens and records a receipt in one local-storage write protected by Web Locks across tabs. Existing six starter room assets and equipped legacy Shop clothing stay available. Purchased room art appears in Storeroom and unlocks reusable placement in Decorate room; clothing is collected separately from the worn outfit. Try-ons never auto-equip. Bank/Wallet and the app header share the same balance. Reset demo also clears its wallet.

Arcade packs cost 10 points for 1 token, 45 for 5, or 100 for 12. Packs are repeatable; collectibles are one-time unlocks. These prices and points are provisional demo data, not real money or classroom-earned rewards. Games/token redemption and a server-authoritative economy are not connected. Local data can be edited by the device user and must never be trusted as real account credit. Purchases require Web Locks; unsupported browsers stay browse-only. Corrupt records and storage failures never silently refill or partially spend a wallet. At 1,000 receipts further purchases stop rather than discarding idempotency history.

Saved finds remain separate (`mashroom:shop-saved:v1`); wallet and ownership use `mashroom:wallet:v1`, both isolated per identity/class. Both builds include Shop. Current verification: `../outputs/SHOP-WALLET-TOKENS-TESTING.md`.

## Welcome and login

Welcome and login use the original MashRoom logo, warm room artwork and frosted glass. The login heading is “Hello, Roomie.”; the old bunny and introductory captions are removed. Skip intro is removed while automatic loading and reduced-motion bypass remain. The welcome tagline is 50% opaque, and greeting letters use a seamless clipped fill without an internal stroke.

Both screens read their release label from `package.json` (currently `alpha 0.1.0`), with a build timestamp on hover. Vite injects build time for both Pages and server builds. Update the package version for a new numbered release; rebuilding refreshes the timestamp. Existing demo login and Google configuration behavior are unchanged. Browser checks and screenshots: `../outputs/WELCOME-LOGIN-REFINEMENTS-TESTING.md`.

## Wearable MashRoom tee

Original Roomie specs are also wearable in Accessories (first card). Choose No accessories to take them off. The new entry is appended as `accessories:6`, preserving old selections. The editor's separate Room link is removed; use Exit or Save → LEAVE. Maker's name field has extra right spacing, and the logo's Options panel includes optional Roomie gender (draft until Save, without restricting clothing or changing the character artwork).

The phone supports left/right/up/down trackpad gestures and touch swipes between its home pages, wrapping at the ends with one page change per gesture to avoid momentum skips. Its glass capsule contains two 44 × 44 px page targets above the dock. Date/time use `15 October` and `10:11 a.m.` / `p.m.`. Both miniature and expanded phone share page state. Storeroom cards are smaller and more densely arranged; search, categories and filtering are unchanged.

Wardrobe → Tops → MashRoom logo tee changes the actual Roomie outfit. It starts in white; colour controls recolour fabric while preserving the chest print. Save commits the outfit for Closet, Maker, the room and the plaza, including sideways walking. Favourites, undo/redo and unsaved-exit cancellation work as usual. Other catalogue clothes remain sample previews. Artwork prompts and fitting notes are in `../output/clothing/mashroom-tee/prompts.json` and `../outputs/MASHROOM-TEE-TESTING.md`.

See [the main README](../README.md) for local startup, the demo walkthrough, Google setup, API behavior, tests, and how to add live multiplayer.

From this directory, run `npm run dev -- --host 127.0.0.1 --port 3000` and open http://127.0.0.1:3000.

## Natural Roomie blinking

The shared character renderer blinks at irregular 2.6–7 second intervals, with a quick 210ms close/reopen and occasional double blinks. Eyelids follow front/side idle poses and all walking frames, underneath equipped glasses. The original PNG artwork and saved outfits are unchanged. Live characters blink in the room, plaza, editor and Shop; editor catalogue thumbnails stay still. Blinks pause when the page is hidden or reduced motion is enabled. Visual review: `node scripts/review-blinks.mjs` after `npm run build:pages` creates a storage-free local fixture; rebuilding Pages removes it. See `../outputs/ROOMIE-BLINK-TESTING.md`.

## Background music controls

Room → More options contains BGM volume and mute controls. Volume starts at 20%; existing chosen volumes are preserved. Preferences are device-local and separate from the welcome screen's sound-effects toggle. Muting keeps the chosen volume.

Closet loops the user-supplied `public/audio/closet.mp3`; Roomie Maker loops `public/audio/roomie-maker.mp3` (Zen Universe, Slower & Dreamier). Music stops when leaving the editor. Browsers may require a first click, tap or keypress before playback; a Play music button is offered if autoplay is blocked. Missing audio never blocks editing. Original MP3s remain unchanged in Downloads. Confirm music distribution rights before publishing these tracks.

## Room overlays and colour picker

Need rings retain the six original Figma icons with adaptive black/white contrast. Hover previews a compact frosted popup; click/tap holds it briefly, with automatic dismissal after three seconds. A second click, outside click or Escape dismisses sooner. The phone preview sits partly below the screen; its expanded controls remain fully accessible.

Phone page 2 → Storeroom opens a full-screen blurred overlay. Categories, search, placement filters and name sorting compose together; Reset filters restores all ten demo items (six free furniture/decorations and four current-outfit entries). No purchases or earned ownership are implied.

Closet and Maker share a clear liquid-glass colour picker with a saturation/brightness square, border-free rainbow hue slider, preview, hex entry and liquid-glass buttons. Drag/tap the square or use arrow keys (Shift for larger steps), then save a swatch or Apply colour. Invalid hex values disable those actions. Appearance changes and swatches remain drafts until the editor's main Save action. Filter is a narrower matching liquid-glass panel. Selected cards have a surrounding glow; product-image backgrounds are transparent, and No accessories is listed first without renumbering saved items.

In Closet, colour controls are not permanently displayed. Selecting clothing (including an item in Favourites) opens the floating Figma palette (frame 74:165): favourite star, palette button, divider and scrolling swatches. Outside clicks and category changes dismiss it; the palette button opens the larger liquid-glass picker. Hair and makeup do not open clothing controls. Favourite stars have no button border and glow yellow while saved in the draft. Routine selection status text is hidden; actionable save errors remain visible.

The header logo in Closet and Maker opens Options, with the same device-local BGM volume/mute preferences used in the room. Maker offers optional Girl/Boy icon squircles, with neither selected for new profiles; tapping a selected choice or Clear selection removes it. Legacy saved values remain readable. Options never discards edits; use Exit to leave. Maker/Closet and Map use 800ms entry/exit fades, with reduced-motion bypass. Room switching fades out and in at 800ms per phase. Room navigation opens compact, anchored liquid-glass panels; the classroom panel includes an explicit link to the full classroom.
