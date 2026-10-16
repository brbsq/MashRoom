# Needs pop-up and Figma button sizing

Local-only changes; no publication or demo-data reset.

- Needs pop-up: descriptive paragraph removed. Browser inspection confirmed zero paragraphs and `blur(32px) saturate(1.15)` applied to the frosted surface. Standard backdrop-filter follows its Safari-prefixed declaration so CSS minification retains both.
- Room button: Figma ellipse `3:203` is 110×110, with icon `20:202` at 60×60. The app now scales these together from the 1920×1080 artboard, with a 44px minimum touch target. Verified base size: 110px at native size, 73.328px at 1280×720, and 44px on mobile. Existing hover enlargement is preserved.
- Closet/Maker controls: Figma `75:167` and `75:263` each use five 98×98 circles, at offsets 0/120/240/364/484 within a 582×98 group. Icon sizes are 65/60/60/70/60. Flexible stretching was replaced with exact scaled grid dimensions. Icons retain native SVG roots and now centre correctly while scaling.
- Browser measurements: circles were 98px at 1920×1080, 65.328px at 1280×720, 52.266px at 1024×768, and 60.281px at 390×844. Width equalled height for every button. All mobile controls fitted between x=16 and x=374.
- Room switcher opened on mobile and closed with Escape. Temporary viewport overrides were reset. A separate QA tab was used so the user's editor could stay open.
- Type checking, all 29 tests and the static Pages production build passed. The build retains its existing non-blocking large-bundle warning.

Screenshot: `needs-frosted-sizing.png`.
