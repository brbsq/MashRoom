# Original MashRoom artwork

## Figma creation screens and original Roomie

`public/creation/` contains unchanged assets downloaded from MashRoom Figma file `13X03GNMt4ukNUfYYNIm4C`: Maker main `75:214`, Closet main `15:986`, controls `75:167` and `75:263`, colour bars/dialogs `74:165`, `75:276`, `75:181`, `75:185`, `75:290`, `75:297`, Map main `33:86`, loading `15:714`, Info `33:29`, and Metro `46:3`. Filename identifiers retain the exported source identity. `map-refraction.png` is the background-only rendered shader layer `15:715`, used with the approved ordinary-browser fade fallback; it is not a UI screenshot used as an implementation.

Creation backgrounds: Closet `233ad.png`, Maker `37094.png`, Map placeholder `b9961.png`. Logos: MashRoom `cbbb1.png`, Rooma `6f910.png`, sample business `aeb51.png`. Downloaded SVG source roots are unchanged. Non-square shoes/body icons and the Metro line preserve intrinsic proportions.

`roomie-renderer.tsx` keeps the original `/rooms/cd2bd.png` unchanged for idle, Maker and Closet previews. The room and student's plaza avatar use matching generated profile poses while moving: `/rooms/roomie-left.png` and `/rooms/roomie-right.png`. These depict side-facing anatomy, glasses and clothing rather than flipping or distorting the front image. All three poses are preloaded; the room's image box accommodates the wider side canvases so pose changes preserve character height and the floor anchor. The MashRoom logo tee uses real composited garment layers; other appearance choices remain UI-test data until matching parts are supplied. Pose selection preserves saved selections. Existing furniture illustrations in `decor-art.tsx` are original code-native artwork with fitted bounds. Mirror/Maker phone icons are original SVGs in `/rooms/mirror.svg` and `maker.svg`.

The supplied Metro heading uses the open-source Zen Dots font, served locally as `creation/zen-dots.ttf`, from Google Fonts (`fonts.gstatic.com/s/zendots/v14/XRXX3ICfm00IGoesQeaE.ttf`). Upstream source/license: Google Fonts `ofl/zendots`. SF Pro / SF Pro Rounded use the macOS system font stack with accessible fallbacks.

## Figma home screen (October 2026)

The new home screen uses the exact supplied Figma assets, not generated replacements:

- `public/landing/room.png`: 1254 × 1254 room illustration, Figma asset `b9961.png`; background slot in both frames. Its crop follows the supplied reference code, with display-only blur matching the reference screenshot.
- `public/landing/logo.png`: 1536 × 1024 transparent logo, Figma asset `cbbb1.png`; large intro slot and small navigation slot. The same image element animates between these positions.
- Source file: `13X03GNMt4ukNUfYYNIm4C`, nodes `14:304` (logo composition) and `17:12` (interactive welcome composition). Figma's layer labels are reversed relative to the requested viewing sequence; the logo composition appears first.
- `public/landing/google-sans-bold.ttf` and `google-sans-black.ttf`: Google Sans Flex 700 and 900, served locally from the official Google Fonts files. The italic greeting uses the bold font with CSS italic. Other text uses the platform rounded system font with fallbacks.

No temporary Figma asset URLs are used at runtime. The existing pet and plaza assets below are unchanged.

## Figma login overlays (October 2026)

Source: the same MashRoom file, nodes `17:59` (`teacher-login`) and `17:78` (`student-login`). Both reuse `public/landing/room.png` behind the glass overlay and `public/landing/logo.png` in the left branding slot.

Exact downloaded assets in `public/login/`:

| Local file | Figma asset | UI slot |
| --- | --- | --- |
| `username.svg` | `22a13.svg` | Username/email field background |
| `password.svg` | `2bed7.svg` | Password field background |
| `google-button.svg` | `4a3cd.svg` | Round Google button background |
| `submit-button.svg` | `8b934.svg` | Arrow button background |
| `google.png` | `45c7f.png` | Google icon |
| `arrow.png` | `39828.png` | Submit arrow |
| `close.png` | `b6307.png` | Close icon |

SVG source dimensions and paths are unchanged; CSS uses them as decorative backgrounds behind native controls. Typography reuses the local heading fonts and system rounded-font fallback. The no-account demo link and inline connection explanations are small functional additions to the supplied composition.

## Figma pet room (October 2026)

Source file: `13X03GNMt4ukNUfYYNIm4C`. Main room `1:2`, room switch `20:209`, phone `19:113`; needs: happiness `2:15`, hunger `2:18`, hygiene `2:21`, sleep `2:8`, bladder `2:9`, health `2:12`.

All supplied image/icon assets are downloaded under `public/rooms/` with their original Figma filenames. No temporary URLs are used at runtime.

| Asset | Slot / callsite |
| --- | --- |
| `3551a.png` | Empty room background in `pet-room.tsx`, original crop retained on desktop |
| `cd2bd.png` | Original character, separate positioning and idle/walking wrappers |
| `public/landing/logo.png` (`cbbb1.png`) | Exact existing logo in the room's header |
| `00432.svg`, `cb4e9.svg` | Door button icon and circular backing |
| `49f16.svg`, `7cd28.svg`, `8877d.svg`, `a5bf3.svg`, `17ebb.svg`, `9ff62.svg` | Header classroom, notes, news, activities, notification and more icons |
| `55bb7.svg`, `18539.svg`, `1a6b4.svg`, `208a2.svg`, `4e125.svg`, `95f6b.svg` | Need centre icons in `need-ring.tsx` |
| `92859.svg`, `6fb50.svg`, `8027d.svg`, `dccd9.svg`, `c03f8.svg`, `c7e81.svg`, `31c32.svg`, `42289.svg`, `54242.svg` | Phone's 3×3 app grid, in Figma order |
| `e2657.svg`, `263d1.svg`, `ef28f.svg`, `9ff62.svg` | Phone dock and page dots |

The fixed blue 75% ring exports are retained as references (`b5056.svg`, `897a4.svg`, `b8590.svg`, `fa435.svg`, `81acb.svg`, `121e3.svg`, `ab8ac.svg`). The visible arcs are data-driven SVG circles with the same track geometry and rounded caps, explicitly replacing blue with the user's green/yellow/red thresholds. Icon files and all downloaded SVG roots/paths are unchanged. The phone bezel and glass controls are native CSS, as in the supplied design context.

Figma returned no authored keyframes for the main room or phone. Fades and character motion implement the user's written animation request using CSS, with reduced-motion support. New furnished room art and a character sprite/3D rig are future additions; indoor variants currently share the empty room with lighting overlays.

`public/favicon.png` is an unchanged copy of the user-supplied `/Users/br/Downloads/logo1.png`. The older SVG favicon is retained but no longer referenced by metadata.

## Generated demo assets

### Body-fitted tops (16 October 2026)

The detached tee rectangle is superseded at runtime by `fitted-top.tsx` and the pose registrations in `lib/garment-rig.ts`. The renderer uses the original body silhouette, sleeve folds and arm/hand occlusion. A clipped fabric-colour mask changes only the baked shirt; registered crew-neck geometry replaces its old high collar/mark. The supplied shirt's flat chest print is composited independently with its pale reference background removed in an SVG filter. Original PNG files remain unchanged. Other top choices use the same fitted fabric system and colours; pocket and stripe details are code-native. Hair, facial-feature and other sample styles still require their final artwork.

Every front/left/right idle pose and all four cells in each walking cycle use the same outfit renderer, shared by Closet, Maker, room and plaza. `node scripts/review-garments.mjs` creates a temporary local-only `/MashRoom/qa-garments.html` fixture in the Pages build for visual checks without writing profile data. A normal Pages rebuild removes that fixture. Evidence: `../outputs/refinement-fitted-outfit-all-poses.png`.

### Front-facing walk (15 October 2026)

`public/rooms/roomie-walk-front.png` is a 912 × 1500 RGBA 2×2 sheet with four registered 456 × 750 body frames. Built-in image generation used the original glasses-free front reference to create alternating contact/passing poses, with a forward shoe, bent knee and opposing arm swing. Raw source and full prompt: `../output/roomie-poses/front-walk/`. `node scripts/pack-roomie-front-walk.mjs` registers cells and produces the atlas, GIF and frame-strip previews.

At runtime the renderer clips away the generated head and draws the unchanged original front head above the moving body. Its existing `SpecsLayer` handles legacy, removable and recoloured glasses in every frame, so the original face and accessories stay consistent. Front-specific tee placements and seam underlays keep the equipped logo shirt registered with the new torso/arm poses. The generated atlas is a body-animation source rather than a replacement for the original idle character.

`lib/roomie-motion.ts` shares direction selection between the room and plaza: downward-dominant travel selects front, horizontal travel selects a side, and upward-only travel retains the last direction. The front cycle uses the existing 160ms frame / 640ms loop timing and reduced-motion support. Idle and editor previews, saved appearance fields and existing side artwork are preserved. Work remains in the local program and production outputs.

### Optional original Roomie specs (15 October 2026)

`public/accessories/roomie-specs/front.svg`, `left.svg` and `right.svg` are standalone transparent vector accessory assets traced to the original silver-gray frame style. The Closet card shows only the specs; the same assets are registered to the shared character renderer, including the walk atlas. Fabric and eyewear have separate saved colour values.

Built-in image generation removed the baked-in glasses in three non-destructive sibling references: `bare-front.png`, `bare-left.png`, `bare-right.png`. Only softly masked face regions from those references are composited at runtime; original hair silhouettes, body, clothes, hands and shoes remain from the existing sprites. The original source files are not overwritten. The asset paths and complete prompts are in `../output/accessories/roomie-specs/prompts.json`.

Two additional glasses-free 2×2 walk references (`bare-walk-left.png`, `bare-walk-right.png`) provide frame-specific face windows. The renderer samples each corresponding cell rather than reusing the still-view face, keeps the original gait/body atlas underneath, and masks overlays to the original silhouette. The separated SVG frames use pose-specific eye registration. The two edit prompts are included in the same prompt file.

`accessories:6` equips the separated pair; `accessories:2` removes eyewear. Earlier sample selection indices keep their previous look rather than being silently remapped. The new pair supports saved per-item colour, favourites, undo/redo and save/cancel. Temporary legacy preview items still do not become additional real wearable designs.

### Wearable MashRoom logo tee (15 October 2026)

`public/clothing/mashroom-tee/reference.png` is the unchanged user-supplied garment reference sheet. The Closet thumbnail displays its front panel through an SVG crop. `front.png`, `left.png` and `right.png` are transparent, shirt-only adaptations created with built-in image generation to fit the existing chibi Roomie. They do not replace the character artwork. The white cotton tee retains the small coloured left-chest logo; the opposite profile naturally hides it.

The shared renderer composites the garment over the original front/profile sprites and every walking frame. Pose-specific native SVG seam underlays conceal the old baked-in collar and sleeves. `lib/wearables.ts` records native canvas dimensions and registered placements. Fabric colour is optional, with the colourful print protected by an SVG colour mask. Full generation prompts and saved asset paths are recorded in `../output/clothing/mashroom-tee/prompts.json`. Other catalogue choices remain UI previews until their own wearable parts are supplied.

The tee is appended as `tops:6`, preserving all previous saved selection indices. Per-item colours migrate safely into the existing appearance record; its first equip is white and does not inherit another top's tint. Existing save/cancel, undo/redo, favourites and profile/class isolation apply unchanged.

### Roomie walking cycles (14 October 2026)

`public/rooms/roomie-walk-left.png` and `roomie-walk-right.png` are transparent 912 × 1500 sprite sheets, each with four 456 × 750 cells in a 2×2 grid. The built-in image-generation tool created contact, passing, opposite-contact and opposite-passing drawings from the original front and approved direction-specific profile references. The character's curls, glasses, complexion, charcoal shirt, gray trousers and trainers remain consistent with those references. Full prompts and raw 1024 × 1536 sheets are in `../output/roomie-poses/walk/`.

The fourth left-facing cell was refined separately as `left-passing-v2.png` so the opposite shoe lifts forward. The first three source cells remain unchanged; the refinement prompt is included in the same prompt set. `scripts/pack-roomie-walk.mjs` crops the cells, registers their head centre and floor baseline without redrawing features, checks that no frame clips, and packages the runtime sheets. It also exports animated GIF previews in `../outputs/`. Run it from `app/` with `node scripts/pack-roomie-walk.mjs` to regenerate the packed assets.

The shared renderer displays one cell at a time through a clipped SVG viewport. CSS advances frames every 160ms, looping after 640ms, only during left/right movement. Both cycles preload with the original poses. The room's old whole-body walking sway is disabled so the frame animation supplies the gait; idle breathing and care effects remain. Stopping restores the original front PNG. Reduced-motion preferences disable frame playback. Maker, Closet and saved appearance data are unchanged.

### Roomie side poses (14 October 2026)

`public/rooms/roomie-left.png` (977 × 1610) and `roomie-right.png` (977 × 1609) are RGBA sprites with genuine transparency. Generated separately with the built-in image-generation tool using the original front Roomie as the identity/style reference; the right pose also references the completed left pose. The original front sprite and creation assets are unchanged. Raw generation outputs remain in the Codex generated-images directory. Full prompts are recorded in `../output/roomie-poses/prompts.json`.

Prompt intent for both poses: preserve the same voluminous dark-brown swept curls, chibi proportions, warm peach skin, gray glasses, brown eye, blush and smile, charcoal high-neck tee with collar emblem, loose gray trousers, chunky gray/white trainers and painterly texture; draw actual left/right side anatomy with one near eye and glasses lens, a modest walking stride, complete head/hands/shoes and transparent margins. No background, ground shadow, UI or labels. The opposite profile retains readable shoe details.

### Map comparison artwork (October 2026)

`public/maps/town.png` and `public/maps/city.png` are continuous map backgrounds generated with the built-in image tool from the H town and J city concept previews. The concepts used the existing landing room and character as style references. All visible map pins, labels, controls and destination cards are rendered in React; no UI text is baked into these backgrounds. Both full-screen/overlay variants share their town or city artwork; the district preview adds native overlays to the city map.

Edit prompt for each source concept: “Edit this MashRoom map screenshot into a CLEAN MAP BACKGROUND ASSET. Remove absolutely ALL UI: header bars, brand/logo, letters, text, labels, pins, markers, icons, circular buttons, glass panels, side cards, avatar, footer. Reconstruct the streets and buildings underneath every removed interface area. Keep the illustrated world and composition: home northwest, fountain plaza near centre, school in the original location, parks, roads, shops. Preserve the warm cream terracotta sage painterly illustration and perspective. Entire image must be a continuous urban map landscape edge to edge, no interface, no text, no labels, no logo. Preserve 16:9 landscape composition.”

Generated with the built-in image-generation tool, exactly one generation per asset, with no third-party character references. Original files are retained in `../work/art/`.

### Roomie eyelids (16 October 2026)

Natural blinking is a code-native SVG overlay (`blink-layer.tsx`), not replacement raster artwork. Soft skin-gradient patches and curved closed eyelids are registered separately for front/side idle poses and every side-walk atlas cell. The front walk shares its existing registered idle head. The existing bare-face artwork is composed beneath original-colour or equipped SVG spectacles, so eyelids do not distort the frames. Original PNG assets remain unchanged.

## Pet

File: `public/pet.png` (1254 × 1254, RGBA transparency).

Prompt: One original adorable mint-green round bunny/sprout pet, full body, front view. Tiny feet, two short leaf ears, peach blush, small dark teal glossy eyes and a sweet simple smile. No accessories. Polished glossy soft clay 3D render, candy pastel mint color with dark teal facial accents, soft studio lighting. Square canvas, character centered large with safe transparent margins around every edge, both ears and feet fully visible. Genuinely transparent background; no floor plane. Exactly one pet; no text, UI, brands, watermark, or accessories.

## Plaza

File: `public/plaza.png` (1536 × 1024).

Prompt: Wide landscape scene, approximately 3:2 aspect ratio, charming lush mint and teal park, viewed from friendly elevated orthographic/isometric game perspective. A broad round cream walking clearing occupies the lower 65% and remains empty and spacious for gameplay. On the upper left sits a rounded pastel pink mushroom-roof cottage; on the upper right sits a pale blue school/library. Rounded lush trees, shrubs and small flowers frame the edges. Polished 2D illustrated game environment, soft rounded forms, candy pastel colors, dark teal accents, warm welcoming lighting, clean readable shapes. Complete landscape background reaching every canvas edge, buildings concentrated toward upper corners, broad open cream lower-center plaza. Original design, no characters, pets, text, signs with writing, UI, brands, or watermark.
