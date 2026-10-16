# Shop wallet, collectibles & arcade tokens — 16 October 2026

Local-only expansion. No publication or real-money payments. The active student's points, tokens, appearance and room were not changed by purchase QA.

## Delivered

- Closet-style glass shop with 14 products; three newly drawn SVG collectibles: Starlight lamp (60 demo points), Pocket arcade cabinet (120), Guava heart cushion (40). Cabinet is decorative, not a playable game.
- Arcade Tokens section: 1 token / 10 points; 5 / 45; 12 / 100. Repeatable packs, visible balances, exact confirmation cost and remaining points, cancel, receipt and history.
- Identity/class-isolated local wallet. Demo starter balance 250; Google identities receive no invented earned credit. Six free starter decorations plus currently equipped legacy Shop clothing retained. Existing Closet customization is not newly gated.
- A purchase stores debit, ownership/token grant, optional clothing colour and receipt together. Web Locks serialize tabs; stale revisions, duplicate requests, already-owned collectibles and insufficient points are rejected. Storage failures do not update the displayed purchase or spend points. Corrupt data fails closed rather than refilling. A 1,000-receipt cap stops purchases instead of dropping idempotency history.
- New room collectibles appear in Storeroom and unlock reusable room placement. Tokens are counted in the wallet/Storeroom, not fabricated as clothing. Bank/Wallet and the shared app header use the same local balance. Reset demo clears its local wallet.

## Verification

- 60 regression tests, type checking and both builds pass. Existing Pages chunk-size advisory remains. Whitespace check passes.
- Pure tests cover starter/migration rules, immutable purchases, debit/grant/receipt consistency, repeated token packs, duplicate-request idempotency, stale balances, insufficient points, invalid/corrupt records, identity/class isolation, selected clothing colour, single-record writes and simulated quota failure.
- Browser purchase QA used `scripts/review-shop.mjs`, an isolated fixture with profile `shop-qa-disposable-v1` / class `shop-qa-only`, never the active student. It uses the actual Shop, wallet, Storeroom and decorator components. Its files are removed by a normal Pages build.
- Rapid double confirmation of a 5-token pack deducted 45 points once: 250 → 205, tokens 0 → 5, one receipt. Reload retained balances/history.
- Two-tab check: a 1-token purchase in tab B changed 205 → 195 / 5 → 6 and disabled tab A's older lamp confirmation. Reopening that confirmation purchased the lamp correctly: 195 → 135.
- Lamp appeared in Storeroom, Add Starlight lamp unlocked in the decorator while other unpurchased new art stayed absent. Placed and saved in the disposable QA room.
- A 12-token pack then changed 135 → 35 / 6 → 18. The 5-token buy button became disabled with “You need 10 more demo points.” All disposable wallet/layout data was reset through the fixture's explicit Reset QA wallet control afterward.
- Actual Shop was reviewed without confirming a purchase: active balance remained 250 / 0. Desktop product and token sections checked. At 320 × 740, no horizontal overflow; confirmation was 286px wide, 501px tall, with no internal overflow. Cancel kept the real profile unchanged. Viewport override restored.

## Boundaries

This is a working device-local demo economy, not trusted classroom/account credit. No earning backend, server-enforced ownership, cloud sync, monetary value, real-money checkout or arcade game/redemption implementation. Prices are provisional. Existing Closet previews/customization remain available without purchasing; the Shop collects/unlocks items rather than turning existing editor options into paywalls. Physical touch and OS-level reduced motion remain manual checks. No real browser quota failure was forced; the failure path is tested with an isolated storage double.

Evidence: `shop-collectibles-points.png`, `shop-arcade-tokens.png`, `shop-tokens-mobile.png`.
