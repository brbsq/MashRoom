import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { env } from "./mock-env.mjs";
import { handle, collectPages } from "../lib/server/google.ts";
import {
  digest,
  seal,
  unseal,
  validatePet,
  pkce,
} from "../lib/server/security.ts";
import { applyCare, defaultPet, seed, normalizePet } from "../lib/demo.ts";
import {
  needTone,
  needValue,
  boundRoomPosition,
  rooms,
} from "../lib/pet-room.ts";
import { LocalRoom } from "../lib/room.ts";
import {
  phoneModels,
  phoneThemes,
  readPhonePreferences,
  phoneStorageKey,
} from "../lib/phone.ts";
test("phone preferences validate device and theme independently", () => {
  assert.deepEqual(readPhonePreferences(null), {
    model: "modern",
    theme: "meadow",
  });
  assert.deepEqual(readPhonePreferences("not json"), {
    model: "modern",
    theme: "meadow",
  });
  assert.deepEqual(readPhonePreferences("null"), {
    model: "modern",
    theme: "meadow",
  });
  assert.deepEqual(
    readPhonePreferences('{"model":"classic","theme":"unknown"}'),
    { model: "classic", theme: "meadow" },
  );
  for (const model of phoneModels)
    for (const theme of phoneThemes) {
      const value = { model: model.id, theme: theme.id };
      assert.deepEqual(readPhonePreferences(JSON.stringify(value)), value);
    }
});
test("phone appearance storage is separate for each identity and class", () => {
  const p = { mode: "demo", id: "one", classId: "willow" };
  assert.notEqual(phoneStorageKey(p), phoneStorageKey({ ...p, id: "two" }));
  assert.notEqual(
    phoneStorageKey(p),
    phoneStorageKey({ ...p, classId: "oak" }),
  );
  assert.notEqual(
    phoneStorageKey(p),
    phoneStorageKey({ ...p, mode: "google" }),
  );
});
import {
  decorCatalog,
  decorStorageKey,
  normalizeDecor,
  readLayouts,
} from "../lib/room-decor.ts";
test("room decorations reject unknown items and bound all transforms", () => {
  const item = {
    id: "one",
    kind: "sofa",
    x: -10,
    y: 150,
    scale: 8,
    rotation: -999,
    foreground: true,
  };
  assert.deepEqual(
    normalizeDecor([item, item, { id: "two", kind: "unknown" }, null]),
    [{ ...item, x: 8, y: 92, scale: 1.6, rotation: -180 }],
  );
  assert.equal(
    normalizeDecor(
      Array.from({ length: 45 }, (_, i) => ({ ...item, id: `${i}` })),
    ).length,
    40,
  );
  assert.equal(new Set(decorCatalog.map((c) => c.id)).size, 6);
  assert.equal(normalizeDecor([{ ...item, x: NaN, scale: Infinity }])[0].x, 50);
});
test("room layouts round-trip independently and isolate profiles and classes", () => {
  const item = {
    id: "one",
    kind: "plant",
    x: 50,
    y: 50,
    scale: 1,
    rotation: 0,
    foreground: false,
  };
  const layouts = readLayouts(
    JSON.stringify({
      living: [item],
      bedroom: [{ ...item, id: "bed", x: 60 }],
      unknown: [item],
    }),
  );
  assert.deepEqual(layouts.living, [item]);
  assert.equal(layouts.bedroom[0].x, 60);
  assert.equal(layouts.unknown, undefined);
  assert.deepEqual(readLayouts("invalid"), {});
  assert.deepEqual(readLayouts("null"), {});
  const profile = { id: "one", classId: "class:a", mode: "demo" };
  assert.notEqual(
    decorStorageKey(profile),
    decorStorageKey({ ...profile, classId: "class:b" }),
  );
  assert.notEqual(
    decorStorageKey(profile),
    decorStorageKey({ ...profile, id: "two" }),
  );
  assert.notEqual(
    decorStorageKey(profile),
    decorStorageKey({ ...profile, mode: "google" }),
  );
});
let sqlite;
const originalFetch = globalThis.fetch;
class Statement {
  constructor(sql, args = []) {
    this.sql = sql;
    this.args = args;
  }
  bind(...args) {
    return new Statement(this.sql, args);
  }
  async first() {
    return sqlite.prepare(this.sql).get(...this.args) || null;
  }
  async all() {
    return { results: sqlite.prepare(this.sql).all(...this.args) };
  }
  async run() {
    return {
      meta: {
        changes: Number(sqlite.prepare(this.sql).run(...this.args).changes),
      },
    };
  }
}
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  for (const f of readdirSync("drizzle")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    sqlite.exec(readFileSync("drizzle/" + f, "utf8"));
  for (const k of Object.keys(env)) delete env[k];
  env.DB = {
    prepare: (sql) => new Statement(sql),
    batch: async (statements) => {
      sqlite.exec("BEGIN");
      try {
        const out = [];
        for (const s of statements) out.push(await s.run());
        sqlite.exec("COMMIT");
        return out;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  };
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  sqlite.close();
});
function configure() {
  Object.assign(env, {
    GOOGLE_CLIENT_ID: "test-id",
    GOOGLE_CLIENT_SECRET: "test-secret",
    APP_ORIGIN: "http://localhost:3000",
    TOKEN_ENCRYPTION_KEY: "ab".repeat(32),
  });
}
async function login(id = "u1", googleId = "teacher") {
  configure();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO users (id,google_id,name) VALUES (?,?,?)",
  )
    .bind(id, googleId, id)
    .run();
  await env.DB.prepare(
    "INSERT OR REPLACE INTO sessions (id,user_id,expires) VALUES (?,?,?)",
  )
    .bind(await digest(id), id, Date.now() + 100000)
    .run();
  return id;
}
function req(
  path,
  method = "GET",
  body,
  token = "u1",
  origin = "http://localhost:3000",
) {
  return new Request("http://localhost:3000/api/" + path, {
    method,
    headers: {
      cookie: "mashroom_session=" + token,
      origin,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
async function connected() {
  await login();
  await env.DB.prepare(
    "INSERT INTO connections (user_id,access,refresh,expires,scope,status) VALUES (?,?,?,?,?,'connected')",
  )
    .bind(
      "u1",
      await seal("access", env.TOKEN_ENCRYPTION_KEY),
      await seal("refresh", env.TOKEN_ENCRYPTION_KEY),
      Date.now() + 3600000,
      "classroom",
    )
    .run();
}
function apiMock({ deny = false, fail = false, empty = false } = {}) {
  globalThis.fetch = async (input) => {
    const u = new URL(String(input));
    if (u.pathname.endsWith("/teachers/me"))
      return Response.json(deny ? { error: "denied" } : { userId: "teacher" }, {
        status: deny ? 403 : 200,
      });
    if (u.pathname.endsWith("/courseWork")) {
      if (fail) return Response.json({}, { status: 503 });
      return Response.json({
        courseWork: empty
          ? []
          : [
              {
                id: "work1",
                title: "Leaves",
                description: "Find a leaf",
                state: "PUBLISHED",
                alternateLink: "https://classroom.google.com/c/1/a/1",
                dueDate: { year: 2026, month: 10, day: 10 },
              },
              { id: "draft", title: "Not ready", state: "DRAFT" },
            ],
      });
    }
    if (u.pathname.endsWith("/students"))
      return Response.json({
        students: empty
          ? []
          : [{ userId: "student", profile: { name: { fullName: "Student" } } }],
      });
    if (u.pathname.endsWith("/teachers"))
      return Response.json({
        teachers: [
          { userId: "teacher", profile: { name: { fullName: "Teacher" } } },
        ],
      });
    return Response.json({ id: "course1", name: "Willow" });
  };
}
test("pet care changes relevant needs and clamps to 0..100", () => {
  let p = defaultPet();
  for (let i = 0; i < 20; i++) p = applyCare(p, "feed");
  assert.equal(p.hunger, 100);
  for (let i = 0; i < 20; i++) p = applyCare(p, "play");
  assert.equal(p.energy, 0);
  assert.equal(p.happiness, 100);
  assert.equal(applyCare(p, "shower").hygiene, 97);
  assert.equal(applyCare(p, "sleep").energy, 25);
});
test("need ring colors change at the exact requested boundaries", () => {
  for (const value of [0, 1, 24]) assert.equal(needTone(value), "red");
  for (const value of [25, 26, 49]) assert.equal(needTone(value), "yellow");
  for (const value of [50, 75, 100]) assert.equal(needTone(value), "green");
  assert.equal(needValue(-20), 0);
  assert.equal(needValue(120), 100);
  assert.equal(needValue(NaN), 0);
});
test("legacy pets receive new needs without losing their existing progress", () => {
  const { bladder, health, ...old } = {
    ...defaultPet(),
    hunger: 12,
    name: "Roomie",
  };
  const migrated = normalizePet(old);
  assert.equal(migrated.bladder, 75);
  assert.equal(migrated.health, 90);
  assert.equal(migrated.hunger, 12);
  assert.equal(migrated.name, "Roomie");
  assert.equal(applyCare(migrated, "toilet").bladder, 100);
  assert.equal(applyCare(migrated, "rest").health, 100);
  assert.equal(validatePet(old).bladder, 75);
  assert.throws(() => validatePet({ ...old, bladder: -1 }));
  assert.throws(() => validatePet({ ...old, health: NaN }));
  assert.throws(() => validatePet({ ...old, health: "90" }));
  assert.equal(validatePet({ ...old, bladder: 24, health: 49 }).health, 49);
});
test("room movement remains on the walkable floor and all destinations have hooks", () => {
  assert.deepEqual(boundRoomPosition({ x: -999, y: 1000 }), { x: 27, y: 97 });
  assert.deepEqual(boundRoomPosition({ x: 999, y: -1000 }), { x: 86, y: 83 });
  assert.deepEqual(boundRoomPosition({ x: 50, y: 90 }), { x: 50, y: 90 });
  assert.deepEqual(boundRoomPosition({ x: 100, y: 90 }, 29), { x: 71, y: 90 });
  assert.ok(Number.isFinite(boundRoomPosition({ x: NaN, y: Infinity }).x));
  assert.equal(new Set(rooms.map((r) => r.id)).size, 5);
  assert.ok(rooms.every((r) => Array.isArray(r.objects)));
});
test("room isolation, movement bounds, modes, and teacher permissions", () => {
  const profile = { id: "a", name: "A", classId: "willow", mode: "demo" },
    initial = seed(profile);
  let state;
  const room = new LocalRoom(() => {});
  room.subscribe((s) => (state = s));
  room.join(profile, [
    ...initial.messages,
    { ...initial.messages[0], id: "other", classId: "maple" },
  ]);
  assert.equal(state.messages.length, 2);
  room.move(1000, -99);
  assert.equal(state.participants[0].x, 88);
  assert.equal(state.participants[0].y, 50);
  room.configure("phrases", false);
  assert.throws(() => room.send("typed", "text"));
  assert.throws(() => room.send("fake preset", "phrase"));
  assert.throws(() => room.remove("welcome-1"));
  room.configure("both", true);
  room.send("Hello", "text");
  assert.equal(state.participants[0].bubble, "Hello");
  room.remove(state.messages.at(-1).id);
  assert.equal(state.participants[0].bubble, undefined);
  assert.equal(state.messages.at(-1).removed, true);
  room.leave();
  assert.equal(state.status, "disconnected");
});
test("Google-unconfigured mode returns an honest usable status", async () => {
  const r = await handle(req("auth/session"), "auth/session");
  assert.deepEqual(await r.json(), {
    configured: false,
    user: null,
    classroom: "disconnected",
    canAdopt: false,
  });
  assert.equal(
    (await handle(req("auth/google/start"), "auth/google/start")).headers.get(
      "Location",
    ),
    "/login?connection=unconfigured",
  );
});
test("encrypted tokens round-trip and never equal plaintext", async () => {
  configure();
  const ciphertext = await seal("very-secret", env.TOKEN_ENCRYPTION_KEY);
  assert(!ciphertext.includes("very-secret"));
  assert.equal(
    await unseal(ciphertext, env.TOKEN_ENCRYPTION_KEY),
    "very-secret",
  );
  assert.equal((await pkce("example")).length, 43);
});
test("server rejects malformed pet details", () => {
  assert.throws(() => validatePet({ ...defaultPet(), energy: 101 }));
  assert.throws(() => validatePet({ ...defaultPet(), name: "" }));
  assert.throws(() => validatePet({ ...defaultPet(), energy: NaN }));
});
test("protected routes require real sessions and same-origin mutations", async () => {
  configure();
  assert.equal(
    (await handle(req("classroom/content"), "classroom/content")).status,
    401,
  );
  await login();
  assert.equal(
    (
      await handle(
        req(
          "profile",
          "PATCH",
          { pet: defaultPet() },
          "u1",
          "https://evil.example",
        ),
        "profile",
      )
    ).status,
    403,
  );
});
test("OAuth rejects wrong state and consumes cancellation once", async () => {
  await login();
  const bad = await handle(
    req("auth/google/callback?state=bad"),
    "auth/google/callback",
  );
  assert.match(bad.headers.get("Location"), /failed/);
  await env.DB.prepare("INSERT INTO oauth_flows VALUES (?,?,?,?,?)")
    .bind(await digest("good"), "verify", "login", null, Date.now() + 10000)
    .run();
  const request = new Request(
    "http://localhost:3000/api/auth/google/callback?state=good&error=access_denied",
    { headers: { cookie: "mashroom_oauth=good" } },
  );
  assert.match(
    (await handle(request, "auth/google/callback")).headers.get("Location"),
    /cancelled/,
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM oauth_flows").get().n, 0);
});
test("demo adoption is allowed once and cannot overwrite an existing pet", async () => {
  await login();
  const request = () =>
    req("profile", "PATCH", { pet: defaultPet(), adopt: true });
  assert.equal((await handle(request(), "profile")).status, 200);
  assert.equal((await handle(request(), "profile")).status, 409);
  const u = sqlite.prepare("SELECT * FROM users").get();
  assert.equal(u.adopted, 1);
  assert.equal(JSON.parse(u.pet).name, "Mochi");
  assert.equal(JSON.parse(u.pet).points, undefined);
});
test("Classroom teacher denial makes no database changes", async () => {
  await connected();
  apiMock({ deny: true });
  assert.equal(
    (
      await handle(
        req("classroom/import", "POST", { courseId: "course1" }),
        "classroom/import",
      )
    ).status,
    403,
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM courses").get().n, 0);
});
test("Classroom imports published work, updates without duplicates, restricts rosters", async () => {
  await connected();
  apiMock();
  const call = () =>
    handle(
      req("classroom/import", "POST", { courseId: "course1" }),
      "classroom/import",
    );
  assert.equal((await call()).status, 200);
  assert.equal((await call()).status, 200);
  assert.equal(sqlite.prepare("SELECT count(*) n FROM assignments").get().n, 1);
  assert.equal(sqlite.prepare("SELECT count(*) n FROM members").get().n, 2);
  await login("u2", "student");
  const student = await (
    await handle(
      req("classroom/content", "GET", null, "u2"),
      "classroom/content",
    )
  ).json();
  assert.equal(student.assignments.length, 1);
  assert.equal(student.roster.length, 0);
  await login("u3", "outsider");
  const outsider = await (
    await handle(
      req("classroom/content", "GET", null, "u3"),
      "classroom/content",
    )
  ).json();
  assert.equal(outsider.assignments.length, 0);
  apiMock({ empty: true });
  assert.equal((await call()).status, 200);
  assert.equal(sqlite.prepare("SELECT count(*) n FROM assignments").get().n, 0);
  assert.equal(
    (
      await (
        await handle(
          req("classroom/content", "GET", null, "u2"),
          "classroom/content",
        )
      ).json()
    ).courses.length,
    0,
  );
});
test("failed import keeps the last successful snapshot", async () => {
  await connected();
  apiMock();
  await handle(
    req("classroom/import", "POST", { courseId: "course1" }),
    "classroom/import",
  );
  apiMock({ fail: true });
  assert.equal(
    (
      await handle(
        req("classroom/import", "POST", { courseId: "course1" }),
        "classroom/import",
      )
    ).status,
    503,
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM assignments").get().n, 1);
});
test("pagination retrieves later students and detects repeated tokens", async () => {
  const rows = await collectPages(
    async (path) =>
      path.includes("pageToken=next")
        ? { students: [2] }
        : { students: [1], nextPageToken: "next" },
    "students",
    "students",
  );
  assert.deepEqual(rows, [1, 2]);
  await assert.rejects(() =>
    collectPages(
      async () => ({ students: [], nextPageToken: "repeat" }),
      "students",
      "students",
    ),
  );
});
test("expired Google refresh marks the connection expired", async () => {
  await connected();
  sqlite.prepare("UPDATE connections SET expires=0").run();
  globalThis.fetch = async () =>
    Response.json({ error: "invalid_grant" }, { status: 400 });
  assert.equal(
    (await handle(req("classroom/courses"), "classroom/courses")).status,
    401,
  );
  assert.equal(
    sqlite.prepare("SELECT status FROM connections").get().status,
    "expired",
  );
});
test("logout invalidates server-side session", async () => {
  await login();
  assert.equal(
    (await handle(req("auth/logout", "POST"), "auth/logout")).status,
    204,
  );
  assert.equal(
    (await handle(req("classroom/content"), "classroom/content")).status,
    401,
  );
});
