# MashRoom

A working classroom pet demo with a Figma-designed room and character, an original mint-green plaza pet, class chat, and optional Google connections.

## Online demo

The GitHub Pages demo is published at **https://brbsq.github.io/MashRoom/**. It includes the welcome, account-free login, pet room, plaza, simulated class chat, sample Classroom activities, and settings. Demo progress is saved only in your browser.

GitHub Pages serves static files, so Google sign-in, real Classroom imports, and server-side sessions are unavailable there. Their integration code remains in the local app for a later backend deployment. The Pages version labels Google setup as pending and never claims to be connected.

To make the Pages build locally, run `npm ci` and `npm run build:pages` from `app/`. The generated files are in `app/dist/pages/`. Pushing to `main` automatically runs checks and publishes that build through GitHub Actions once the repository's **Settings → Pages → Build and deployment → Source** is set to **GitHub Actions**.

## Start here

### Map, Closet, Roomie Maker and Shop

The Pages build includes `/map`, `/closet`, `/roomie-maker` and `/shop`, with matching static entry files. The earlier `/map-preview` comparison remains a separate design archive. All progress and demo purchases remain device-local. The shared character now blinks naturally while idle or walking, beneath its glasses; hidden pages and reduced-motion preferences pause blinking.

1. Enter the demo with a new display name and class. Maker opens before the first room visit. Existing demo profiles keep their appearance.
2. In Maker, edit the Roomie name and features. Try body presets, skin tones, colours, filtering and Undo/Redo. Save opens the LEAVE/STAY dialog. Leaving an unsaved draft asks for confirmation; only Save commits changes.
3. Open the room phone. Page 1 has Map, Shop and Wardrobe (Closet); page 2 has Storeroom (demo inventory) and Maker. Shop has Closet-style previews, search, saved finds, a device-local demo-points wallet, confirmed purchases and Arcade Tokens. Purchased collectibles appear in Storeroom and unlock in the room decorator. Prices are provisional; no real money or earned classroom rewards are connected. Mirror has been removed. Both phone sizes share the same active app page. The phone closes before launching another screen; returning restores the room and skips its first-visit fade. See `outputs/SHOP-WALLET-TOKENS-TESTING.md` for current behavior and boundaries.
4. In Closet, choose a category and item. Only Tops, Bottoms, Shoes and Accessories have favourite stars. Hair and Makeup can still be saved. The colour wheel supports pointer selection, a native colour picker, hex entry and custom swatches. Favourites and swatches commit with Save, not Cancel.
5. Map fades from the supplied refracted background into Rooma Maps. Choose a sample destination and Info. Choose Metro station → GO, then a station → GO to change neighbourhood; BACK leaves it unchanged. Home, Plaza and School open existing pages; the boutique explains that shopping is not implemented.
6. Open More options → Decorate room. Add the six starter items, drag or use arrow keys (Shift for a larger nudge), scale 25–250%, reset size, rotate, duplicate or remove. Prints stay on walls; other current items use floor-contact anchors. Large or rotated items shrink when necessary to fit bounds. The highlighted area shows the permitted surface. Choose Behind Character, Automatic or In Front, then use ordering buttons. Rugs always remain underneath the scene.
7. Save and refresh to check persistence. Visit the plaza to see the same Roomie. Movement is 2D, with four-frame front/left/right walk cycles: arms swing, knees bend and feet lift. Downward movement (including Arrow Down/S) faces the viewer; horizontal movement uses the side cycles. The cycle loops every 640ms only while moving; idle keeps its breathing animation. Upward movement retains the previous direction until back-facing artwork is available. Stopping restores the original front pose with the equipped tee and eyewear. Reduced motion disables frame playback.

Appearance, favourites, swatches and furniture are device-local, isolated by identity and class. The student’s full name, care meters, points and other progress are not replaced by Maker. Legacy furniture migrates its front/behind intent and transforms, then fits to the correct surface. Storage failures retain drafts and show a retry message. Ceiling surfaces and furniture interaction metadata/callbacks are extension ports only: no collision, sitting, object use or interaction-settings UI is implemented.

The supplied front artwork remains the idle and appearance-editor base. Front walking reuses its exact head with new animated body frames; side movement uses matching profile artwork. The MashRoom logo tee and Original Roomie specs are real wearable layers in all three walking directions. Other catalogue selections remain saved preview data until matching parts are supplied. Map uses the supplied Figma placeholder background with sample location records; it does not invent venue gameplay. Refraction is an exported appearance with ordinary-browser fades, not an experimental live shader. OS Reduce Motion skips staged loading, marquee and walking animations.

Local static preview:

```sh
cd app
npm run build:pages
npm exec vite -- preview --config vite.pages.config.ts --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/MashRoom/login/`. Checks: `npm run typecheck`, `npm test`, `npm run build:pages` and `npm run build`.

### Map comparison preview

Open `/map-preview` on the local app to compare **H: Town plan**, **I: Town overlay**, **J: Downtown**, and **K: City districts**. Every design supports full-screen and glass-overlay views. Choose a map pin or use the destination list, then visit Home, Student plaza, or School. Future places show “Coming soon.” This preview is accessible without signing in; travel uses the existing demo pages.

Drag to pan; use the zoom buttons or pinch on a touch screen. Keyboard users can focus the map and use arrow keys, `+`/`−`, and `Home` to recenter. Escape closes the map; clicking outside closes the overlay. Reduced motion is supported. The phone Map shortcut now opens the separate Figma Rooma Maps screen.

For the static preview, run `npm run build:pages` and `npm exec vite -- preview --config vite.pages.config.ts --host 127.0.0.1 --port 4173` inside `app/`, then open `http://127.0.0.1:4173/MashRoom/map-preview/`.

The application lives in `app/`. Open a terminal in this folder and run:

```sh
cd app
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```

Open **http://127.0.0.1:3000**. After the short intro, choose **Students** (or **Log in here**), then **No account? Try the demo**. Enter a display name and sample class, and choose **Try the demo**. No Google account or password is required.

### Figma welcome screen

The home page follows the supplied room-background and logo compositions. The logo and name fade in, then move into the glass navigation as the greeting and role buttons appear. Each greeting word responds independently to hover/focus; a subtle starlight wash travels through the lettering. Mouse movement leaves short-lived sparkles, capped at 64 particles and idle when the pointer stops.

**Skip intro** bypasses the opening. The operating system's **Reduce motion** preference bypasses the intro and disables starlight animation and cursor particles. Touch devices do not need hover to use any action. Features, help, credits, and submissions open accessible information dialogs.

### Teacher and student login overlays

**Teachers** and **Students** open their respective full-screen glass overlays from the updated Figma designs (`17:59` and `17:78`). **Log in here** opens the student version. Both use the original Figma logo, field backgrounds, and button icons, with responsive phone layouts, soft hover/fade effects, keyboard focus trapping, Escape/close controls, and focus returned to the opening button. Closing does not replay the welcome intro.

The Google icon uses the existing optional Google sign-in integration. Without configuration, it explains that setup is pending. Username/password sign-in and password reset are **design-preview controls, not an implemented password account system**; they explain this when used. Passwords are never submitted or persisted and form values clear after closing. The small demo link preserves account-free access. Panel selection never grants teacher permissions or changes verified classroom access.

Implementation: `app/components/mashroom/login-overlay.tsx` and `login-overlay.module.css`. Desktop and mobile checks covered both panel headings, blank forms on reopening, Google/reset/password fallbacks, focus trapping and restoration, and navigation into the existing demo login. Type checking, 14 existing tests, and the production build pass; live Google authentication was not exercised without credentials.

Implementation: `app/app/page.tsx`, `app/app/welcome.module.css`, and `app/components/mashroom/sparkle-trail.tsx`. Exact Figma images and locally served heading fonts are in `app/public/landing/`; asset provenance is in `app/ARTWORK.md`.

Use Node.js 24 or newer for the included SQLite-backed tests. Node 22.13+ can run the app itself.

## What works

- Splash and login screens, responsive navigation, optional sound and reduced motion.
- Pet naming, feeding, showering, playing, sleeping, animations, and saved care meters.
- A 2D plaza with click/tap, keyboard, and directional-button movement.
- Three simulated classmates, emotes, temporary speech bubbles, and scripted replies.
- One class conversation shared by the plaza panel and chat page.
- Quick phrases and typed messages; Settings → Teacher preview adds phrase-only mode, reports, and message removal.
- Muting and unmuting classmates, and resetting the current demo.
- Google sign-in/account linking and Classroom class, roster, and published-assignment imports, once configured.

### Figma pet room and phone

The `/pet` screen now implements the main room, six need-ring components, room switcher, and phone from the nine supplied Figma nodes. The whole screen fades in after its artwork loads; room changes fade out and back in. Reduced-motion preferences disable these effects and the character animations. The welcome greeting has a brighter, faster 3.6-second light sweep. Your supplied `logo1.png` is now the site's PNG favicon, unchanged.

- Hover, tap, or keyboard-activate a ring to see only its name and percentage in a read-only frosted-glass pop-up. Descriptions and buttons are omitted; care actions remain in Activities. The pop-up uses 32px backdrop blur with Safari and standard browser declarations retained in the build. Rings use 10-unit strokes (half their original thickness) and glass highlights, without a filled or blurred disc behind them. The original icon masks threshold/invert the backdrop into black on light scenery and white on dark scenery in browsers supporting backdrop filters. Smiley = happiness, Zzz = sleep, apple = hunger satisfaction, shower = hygiene, toilet = bladder comfort, heart = health. Higher is better for all six.
- Rings are green at 50–100%, yellow at 25–49%, and red with a faint glow at 0–24%. Care is saved with the pet. Older pets receive bladder and health defaults without losing progress.
- The door button opens the room switcher over the needs section and blurs that section. Outside taps, Escape, and selecting a room close it. Living room, bedroom, kitchen, bathroom and outdoors are available. The indoor destinations intentionally reuse the supplied empty-room artwork with different lighting; outdoors reuses the existing park. Individual furnished interiors are not yet provided.
- Click/tap the scene or focus the room and use arrows/WASD to move the character. Movement stays within floor bounds, with breathing/sway idle motion and a walking bounce. This is animation of the supplied 2D character, not a rigged 3D model.
- The phone grows from its live bottom-right miniature into a right-aligned overlay and shrinks back on dismissal. Click outside, click its bezel, or press Escape to close; screen interactions keep it open. Both sizes share the same contents, clock, device frame and theme. Reduced-motion mode makes the transition near-instant. Study, Map, Wardrobe, Maker, Shop, Classmates and Chat open existing pages. Food and Activities offer working care actions; Notes is a temporary scratchpad. Shop supports browsing, try-ons, saved finds, confirmed demo-point purchases and receipts. Bank/Wallet display that same local points/token balance; History remains an earned-ledger placeholder. Storeroom shows starter furniture, purchased collectibles and the current saved outfit. No real money or earned classroom credit is fabricated.
- **Phone → Settings** switches between iPhone 6s-inspired and iPhone 18 Pro-style concept frames, both without camera cutouts. Meadow, Lavender, Sunset and Midnight themes apply immediately to both phone sizes. Choices persist locally per profile/class; they do not sync to accounts or other devices. Account & class settings remains a separate link in the phone. Add future models/themes in `app/lib/phone.ts` and their skin tokens in `room-phone.module.css`; the shared screen contents do not need rebuilding.

Open **three dots → Decorate room** for six free starter furniture/decorations. Drag with mouse or touch, or select an item and use arrow keys (Shift for larger steps). Adjust size/rotation, place behind/in front of the character, duplicate, or remove. Save room persists the arrangement; Cancel discards the current editing session. There is a 40-item limit per room. Layouts are device-local, isolated by profile, class and room, including for Google profiles; they do not sync to Google or other devices. Reset demo also clears that profile's decor. These items are original SVG illustrations, not purchases or uploads.

Future room interactions belong in `app/lib/pet-room.ts`: add objects to a room's `objects` array with a unique ID, label, floor position and optional care action. `PetRoom` renders accessible targets and exposes `onObjectInteraction({roomId, object})` for future environment integrations. Placed furniture is decorative; collision and object-use behavior are not implemented. Movement and room choice are transient; pet care and saved decor remain persistent.

Implementation: `app/components/mashroom/pet-room.tsx`, `need-ring.tsx`, `room-phone.tsx`, `pet-room.module.css`, and `app/lib/pet-room.ts`. The pet route uses this full-screen design; other app pages keep their existing sidebar layout.

The demo is saved **only on the current device/browser**. Classmates are simulated, not other people. Points and badges are sample displays. The game is fully 2D. Hatching, the full economy, and live cross-device multiplayer are later roadmap work.

## Optional Google setup

1. Create a project in Google Cloud and enable the **Google Classroom API**.
2. Configure the OAuth consent screen and test users. School-managed accounts may require their administrator to allow the app.
3. Create an OAuth client of type **Web application**.
4. Add the redirect URI **http://127.0.0.1:3000/api/auth/google/callback**. Use the same host everywhere: `localhost` and `127.0.0.1` are different origins.
5. Copy `app/.env.example` to `app/.dev.vars`, then enter your client ID, client secret, origin, and a random encryption key. `.dev.vars` is ignored by Git. Do not put secrets in client-side files or chat messages.
6. Generate the encryption key locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and paste it into `TOKEN_ENCRYPTION_KEY`.
7. In `app/`, run `npm run db:migrate:local` to initialize the project-local D1 database. This has already been run in this checkout.
8. Restart the development server, then use **Continue with Google**. In Settings, connect Classroom separately and import a class you teach.

Google identity uses `openid profile email`. The separate teacher Classroom connection requests:

```text
https://www.googleapis.com/auth/classroom.courses.readonly
https://www.googleapis.com/auth/classroom.rosters.readonly
https://www.googleapis.com/auth/classroom.coursework.students.readonly
```

Google consent/verification requirements depend on your audience and Cloud project. This project does not create Cloud credentials or register an OAuth app for you. Google setup has been tested with mocked responses; a real school account connection still needs your credentials and consent.

### Linking and import behavior

- Google identities have server-side profiles and seven-day HTTP-only sessions. OAuth uses state bound to a cookie, one-use expiring flow records, and PKCE. Tokens are encrypted server-side with AES-GCM.
- A new account can explicitly import the current demo pet's name, appearance, and needs, or start fresh. Sample points and badges never transfer. Existing Google profiles are preserved.
- A teacher must pass Google's course teacher check before each import. Partial/failed imports leave the previous snapshot intact.
- Imports handle Google pagination. Reimport replaces that course's roster and published assignments; records use Google's stable IDs. Removed members lose local access on the next successful import.
- Students see imported content only if their authenticated Google ID is in that roster. They never receive the teacher's roster list. Demo names and teacher-preview switches cannot authorize real access.
- Classroom permissions and imports are manual. Grades, submissions, automatic point awards, and continuous roster synchronization are not implemented.
- Disconnect revokes stored Google authorization and removes the local token record. Imported class data remains. Sign-out removes the current local server session.

## Structure

| Location | Purpose |
| --- | --- |
| `app/app/` | Routes: splash, login, pet, plaza, chat, Classroom, settings, and API |
| `app/components/mashroom/` | Shared app state, navigation, chat and account controls |
| `app/lib/types.ts` | Student, pet, room, message and connection contracts |
| `app/lib/room.ts` | Replaceable room interface and local simulation |
| `app/lib/demo.ts` | Demo persistence, starter data, and pet care rules |
| `app/lib/server/` | Google OAuth, encrypted token storage, permissions, import endpoints |
| `app/db/` and `app/drizzle/` | Typed schema and generated SQL migration |
| `app/public/` | Original pet and plaza artwork, favicon |
| `app/tests/` | Behavioral and security tests using temporary in-memory SQLite |

The app uses the Sites React/TypeScript starter (Vinext, Vite, Cloudflare Workers, Tailwind and existing shadcn components). Google-backed structured data uses D1. No external hosting has been provisioned or published.

## API reference

| Endpoint | Behavior |
| --- | --- |
| `GET /api/auth/session` | Public setup status; authenticated profile and connection status when signed in |
| `GET /api/auth/google/start` | Start Google sign-in; add `?purpose=classroom` for the separate teacher consent flow |
| `GET /api/auth/google/callback` | Exchange code, verify identity, and create session or Classroom connection |
| `POST /api/auth/logout` | Invalidate the current session |
| `PATCH /api/profile` | Save validated pet state; `{pet, adopt:true}` only succeeds on an untouched account |
| `GET /api/classroom/courses` | List active classes taught by the connected Google account |
| `POST /api/classroom/import` | Verify teacher access and import `{courseId}` |
| `GET /api/classroom/content` | Return only the signed-in user's permitted courses, assignments, and teacher-only rosters |
| `POST /api/classroom/disconnect` | Revoke Google access and delete stored connection tokens |

All API responses containing account data are non-cacheable. Mutating requests require the configured same origin. Credentials and authorization roles are never taken from browser demo storage.

## Adding live multiplayer later

Implement `RoomTransport` with a server connection. Keep `join`, `leave`, `subscribe`, `move`, `emote`, `send`, `remove`, and `configure` behavior compatible with the simulator. The production server must authenticate room membership, validate movement and message limits, enforce chat modes and moderation permissions, persist message history, and broadcast join/leave/movement/message events. Client-side teacher preview must never control a production role.

Presence, positions, and speech bubbles are deliberately transient. Demo conversation history is namespaced by profile and class and keeps the newest 100 messages. The prototype does not synchronize browser tabs or devices.

## Checks

Run from `app/`:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Tests exercise care limits, room isolation and moderation, OAuth state/cancellation, CSRF/session enforcement, token encryption, duplicate-safe adoption, teacher checks, import pagination, permission filtering, failed import preservation, token expiry, and logout. They use mocked Google responses and in-memory SQLite; they never call a real Google account.

Browser checks cover demo entry, pet persistence, plaza controls, chat consistency, moderation, and responsive layouts. Supported browsers also receive optional `read_pet_status` and `care_for_demo_pet` tools; ordinary browsers work without them.

## Artwork

Original assets were generated using the built-in image-generation tool and copied into the app. Prompts and file details are recorded in `app/ARTWORK.md`.

## Troubleshooting

- **Google setup pending:** all four values in `.dev.vars` must be present; the encryption key must be 64 hexadecimal characters. Restart the server.
- **Database unavailable:** run `npm run db:migrate:local`. Do not point this local configuration at a production database.
- **Redirect mismatch:** Google Cloud's redirect must exactly match `APP_ORIGIN` plus `/api/auth/google/callback`.
- **No teacher classes:** use the account that is actually a teacher of an active Google Classroom course.
- **No student assignments:** a teacher must first import the roster containing the student's Google account.
- **Expired Classroom access:** reconnect in Settings. The demo remains usable.
- **Build reports no disk space:** this checkout initially encountered low free space on the Mac. Free space using your normal storage-management workflow, then retry the build.
