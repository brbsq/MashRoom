# Shop component — 16 October 2026

Initial browse-only pass. The same-day points-wallet, collectible and Arcade Tokens expansion supersedes the pricing/purchase limitations below; see `SHOP-WALLET-TOKENS-TESTING.md` for current behavior.

Local implementation at `/shop`; Phone → Shop is connected in both server and static Pages builds. Nothing published.

## Design and behavior

- Reuses the Closet's original room backdrop, logo and product-card surface, rounded clear glass, soft selection glow and restrained green accents.
- Eight products: the wearable MashRoom tee and Original Roomie specs, plus six existing furniture/decor illustrations. No new final artwork or generated imagery was substituted.
- All / Clothing / Furniture / Decorations / Saved categories; case-insensitive search, featured or A–Z sorting, filter reset and useful empty states.
- Tee and eyewear colours plus front/left/right try-on directions. Furniture and decor previews preserve their original proportions. Narrow-screen card selection scrolls the preview into view.
- Saved finds use a separate, validated, profile/class-specific local-storage key. Guests can browse and keep finds for the visit. Storage failures retain the in-memory list and report the limit.
- Try-ons never commit an outfit. Open Wardrobe opens the existing editor; home-item actions return to the room. No checkout, prices, point deductions or inventory grants are fabricated.

## Verified

- Type checking, all 54 regression tests, server build and Pages build pass. Existing large-chunk build advisory remains. `git diff --check` passes.
- Browser desktop: eight finds loaded; Furniture reduced to three; `book` search reduced to one. Sort A–Z produced Cloud sofa, Happy plant, Little bookshelf, MashRoom logo tee, Moon print, Original Roomie specs, Pebble table, Sunshine rug. Reset cleared search/category/sort.
- Saved tee survived a page reload and appeared alone in Saved. Removing it restored the empty state; the temporary saved-find test was undone.
- Mint and left-facing tee previews updated the Roomie without saving. Returning to the room still showed the original white tee, Alex/Mochi and unchanged six care values.
- Phone → Shop and Shop → room worked with existing slow fades.
- Responsive checks at 390 × 844 and 320 × 740 had no horizontal overflow; the catalogue is vertically scrollable. Mobile item selection brought the chosen preview back to scroll position zero.
- Reduced-motion CSS/navigation guards reviewed in source. Physical touch, OS-level reduced motion and storage/quota failures were not forced in the browser.

## Evidence

- `shop-desktop.png`: final desktop collection and Roomie preview.
- `shop-mobile.png`: mobile mint try-on, not a saved outfit.

Main component: `app/components/mashroom/shop.tsx`. Catalogue, filtering, preview and saved-find validation: `app/lib/shop.ts`.
