# Original MashRoom artwork

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

Generated with the built-in image-generation tool, exactly one generation per asset, with no third-party character references. Original files are retained in `../work/art/`.

## Pet

File: `public/pet.png` (1254 × 1254, RGBA transparency).

Prompt: One original adorable mint-green round bunny/sprout pet, full body, front view. Tiny feet, two short leaf ears, peach blush, small dark teal glossy eyes and a sweet simple smile. No accessories. Polished glossy soft clay 3D render, candy pastel mint color with dark teal facial accents, soft studio lighting. Square canvas, character centered large with safe transparent margins around every edge, both ears and feet fully visible. Genuinely transparent background; no floor plane. Exactly one pet; no text, UI, brands, watermark, or accessories.

## Plaza

File: `public/plaza.png` (1536 × 1024).

Prompt: Wide landscape scene, approximately 3:2 aspect ratio, charming lush mint and teal park, viewed from friendly elevated orthographic/isometric game perspective. A broad round cream walking clearing occupies the lower 65% and remains empty and spacious for gameplay. On the upper left sits a rounded pastel pink mushroom-roof cottage; on the upper right sits a pale blue school/library. Rounded lush trees, shrubs and small flowers frame the edges. Polished 2D illustrated game environment, soft rounded forms, candy pastel colors, dark teal accents, warm welcoming lighting, clean readable shapes. Complete landscape background reaching every canvas edge, buildings concentrated toward upper corners, broad open cream lower-center plaza. Original design, no characters, pets, text, signs with writing, UI, brands, or watermark.
