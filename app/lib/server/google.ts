import { env } from "cloudflare:workers";
import {
  cookieValue,
  cookie,
  digest,
  randomToken,
  pkce,
  seal,
  unseal,
  sameOrigin,
  HttpError,
  validatePet,
} from "./security";
type Account = {
  id: string;
  google_id: string;
  name: string;
  pet: string | null;
  adopted: number;
};
type Connection = {
  user_id: string;
  access: string;
  refresh: string | null;
  expires: number;
  scope: string;
  status: string;
};
type Course = { id: string; name: string; section?: string };
const classroomScopes = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
];
function config() {
  const get = (key: keyof Cloudflare.Env) =>
    String(env[key] || process.env[key] || "");
  return {
    clientId: get("GOOGLE_CLIENT_ID"),
    clientSecret: get("GOOGLE_CLIENT_SECRET"),
    origin: get("APP_ORIGIN").replace(/\/$/, ""),
    key: get("TOKEN_ENCRYPTION_KEY"),
  };
}
function configured() {
  const c = config();
  return !!(
    c.clientId &&
    c.clientSecret &&
    /^https?:\/\//.test(c.origin) &&
    /^[a-f\d]{64}$/i.test(c.key) &&
    env.DB
  );
}
function db() {
  if (!env.DB)
    throw new HttpError(
      503,
      "Account storage is not configured. You can still use the demo.",
    );
  return env.DB;
}
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
function redirect(path: string, cookies: string[] = []) {
  const h = new Headers({
    Location: config().origin + path,
    "Cache-Control": "no-store",
  });
  cookies.forEach((c) => h.append("Set-Cookie", c));
  return new Response(null, { status: 303, headers: h });
}
async function account(
  request: Request,
  required = true,
): Promise<Account | null> {
  const token = cookieValue(request, "mashroom_session");
  if (!token) {
    if (required) throw new HttpError(401, "Sign in with Google first.");
    return null;
  }
  const u = await db()
    .prepare(
      "SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.id=? AND s.expires>?",
    )
    .bind(await digest(token), Date.now())
    .first<Account>();
  if (!u && required)
    throw new HttpError(401, "Your session expired. Sign in again.");
  return u;
}
async function connection(userId: string) {
  return db()
    .prepare("SELECT * FROM connections WHERE user_id=?")
    .bind(userId)
    .first<Connection>();
}
async function accessToken(userId: string) {
  const c = await connection(userId);
  if (!c || c.status !== "connected")
    throw new HttpError(409, "Connect Google Classroom first.");
  if (c.expires > Date.now() + 60000) return unseal(c.access, config().key);
  if (!c.refresh) {
    await db()
      .prepare("UPDATE connections SET status='expired' WHERE user_id=?")
      .bind(userId)
      .run();
    throw new HttpError(401, "Classroom access expired. Please reconnect.");
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: config().clientId,
      client_secret: config().clientSecret,
      grant_type: "refresh_token",
      refresh_token: await unseal(c.refresh, config().key),
    }),
  });
  if (!res.ok) {
    if (res.status === 400 || res.status === 401)
      await db()
        .prepare("UPDATE connections SET status='expired' WHERE user_id=?")
        .bind(userId)
        .run();
    throw new HttpError(
      res.status >= 500 ? 503 : 401,
      "Couldn't refresh Classroom access. Reconnect or try again.",
    );
  }
  const tokens = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  await db()
    .prepare("UPDATE connections SET access=?,expires=? WHERE user_id=?")
    .bind(
      await seal(tokens.access_token, config().key),
      Date.now() + tokens.expires_in * 1000,
      userId,
    )
    .run();
  return tokens.access_token;
}
async function googleGet<T>(token: string, path: string): Promise<T> {
  const r = await fetch("https://classroom.googleapis.com/v1/" + path, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!r.ok)
    throw new HttpError(
      r.status === 401 ? 401 : r.status === 403 || r.status === 404 ? 403 : 503,
      r.status === 401
        ? "Google access expired. Reconnect Classroom."
        : r.status === 403 || r.status === 404
          ? "Google Classroom did not allow access to this course."
          : "Google Classroom is unavailable. Please try again.",
    );
  return r.json() as Promise<T>;
}
export async function collectPages<T>(
  get: (path: string) => Promise<Record<string, unknown>>,
  path: string,
  key: string,
): Promise<T[]> {
  const result: T[] = [];
  let pageToken = "";
  const seen = new Set<string>();
  do {
    const query = new URLSearchParams({ pageSize: "100" });
    if (pageToken) query.set("pageToken", pageToken);
    const data = await get(path + (path.includes("?") ? "&" : "?") + query);
    result.push(...((data[key] || []) as T[]));
    pageToken = String(data.nextPageToken || "");
    if (pageToken && seen.has(pageToken))
      throw new HttpError(503, "Google returned repeated pages. Please retry.");
    seen.add(pageToken);
  } while (pageToken);
  return result;
}
export async function handle(
  request: Request,
  path: string,
): Promise<Response> {
  try {
    const c = config(),
      url = new URL(request.url),
      method = request.method;
    if (path === "auth/session" && method === "GET") {
      if (!configured())
        return json({
          configured: false,
          user: null,
          classroom: "disconnected",
          canAdopt: false,
        });
      const u = await account(request, false);
      const con = u ? await connection(u.id) : null;
      return json({
        configured: true,
        user: u
          ? { id: u.id, name: u.name, pet: u.pet ? JSON.parse(u.pet) : null }
          : null,
        classroom: con?.status || "disconnected",
        canAdopt: !!u && !u.adopted && !u.pet,
      });
    }
    if (!configured()) {
      if (path === "auth/google/start")
        return new Response(null, {
          status: 303,
          headers: { Location: "/login?connection=unconfigured" },
        });
      throw new HttpError(
        503,
        "Google connection needs setup. You can still explore the demo.",
      );
    }
    if (method !== "GET") sameOrigin(request, c.origin);
    if (path === "auth/google/start" && method === "GET") {
      const purpose =
        url.searchParams.get("purpose") === "classroom" ? "classroom" : "login";
      const u = purpose === "classroom" ? await account(request) : null;
      const state = randomToken(),
        verifier = randomToken();
      await db()
        .prepare("DELETE FROM oauth_flows WHERE expires<?")
        .bind(Date.now())
        .run();
      await db()
        .prepare(
          "INSERT INTO oauth_flows (id,verifier,purpose,user_id,expires) VALUES (?,?,?,?,?)",
        )
        .bind(
          await digest(state),
          verifier,
          purpose,
          u?.id || null,
          Date.now() + 600000,
        )
        .run();
      const params = new URLSearchParams({
        client_id: c.clientId,
        redirect_uri: c.origin + "/api/auth/google/callback",
        response_type: "code",
        scope: [
          "openid",
          "profile",
          "email",
          ...(purpose === "classroom" ? classroomScopes : []),
        ].join(" "),
        state,
        code_challenge: await pkce(verifier),
        code_challenge_method: "S256",
        include_granted_scopes: "true",
        ...(purpose === "classroom"
          ? { access_type: "offline", prompt: "consent" }
          : { prompt: "select_account" }),
      });
      return new Response(null, {
        status: 303,
        headers: {
          Location: "https://accounts.google.com/o/oauth2/v2/auth?" + params,
          "Set-Cookie": cookie("mashroom_oauth", state, 600, c.origin),
          "Cache-Control": "no-store",
        },
      });
    }
    if (path === "auth/google/callback" && method === "GET") {
      const state = url.searchParams.get("state") || "";
      if (!state || state !== cookieValue(request, "mashroom_oauth"))
        return redirect("/login?connection=failed");
      const flow = await db()
        .prepare("DELETE FROM oauth_flows WHERE id=? AND expires>? RETURNING *")
        .bind(await digest(state), Date.now())
        .first<{ verifier: string; purpose: string; user_id: string | null }>();
      const clear = cookie("mashroom_oauth", "", 0, c.origin);
      if (!flow) return redirect("/login?connection=failed", [clear]);
      if (url.searchParams.get("error"))
        return redirect(
          (flow.purpose === "classroom" ? "/settings" : "/login") +
            "?connection=cancelled",
          [clear],
        );
      const exchange = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: c.clientId,
          client_secret: c.clientSecret,
          code: url.searchParams.get("code") || "",
          grant_type: "authorization_code",
          redirect_uri: c.origin + "/api/auth/google/callback",
          code_verifier: flow.verifier,
        }),
      });
      if (!exchange.ok) return redirect("/login?connection=failed", [clear]);
      const token = (await exchange.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in: number;
        scope: string;
      };
      const who = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        { headers: { Authorization: "Bearer " + token.access_token } },
      );
      if (!who.ok) return redirect("/login?connection=failed", [clear]);
      const identity = (await who.json()) as {
        sub: string;
        name?: string;
        email_verified?: boolean;
      };
      if (!identity.sub || !identity.email_verified)
        return redirect("/login?connection=failed", [clear]);
      let u = await db()
        .prepare("SELECT * FROM users WHERE google_id=?")
        .bind(identity.sub)
        .first<Account>();
      if (flow.purpose === "classroom") {
        const current = await account(request);
        if (!u || current!.id !== flow.user_id || u.id !== flow.user_id)
          return redirect("/settings?connection=wrong-account", [clear]);
        if (!classroomScopes.every((s) => token.scope.split(" ").includes(s)))
          return redirect("/settings?connection=denied", [clear]);
        const previous = await connection(u.id);
        await db()
          .prepare(
            "INSERT INTO connections (user_id,access,refresh,expires,scope,status) VALUES (?,?,?,?,?,'connected') ON CONFLICT(user_id) DO UPDATE SET access=excluded.access,refresh=excluded.refresh,expires=excluded.expires,scope=excluded.scope,status='connected'",
          )
          .bind(
            u.id,
            await seal(token.access_token, c.key),
            token.refresh_token
              ? await seal(token.refresh_token, c.key)
              : previous?.refresh || null,
            Date.now() + token.expires_in * 1000,
            token.scope,
          )
          .run();
        return redirect("/settings/classroom?connection=connected", [clear]);
      }
      if (!u) {
        u = {
          id: crypto.randomUUID(),
          google_id: identity.sub,
          name: (identity.name || "Explorer").slice(0, 60),
          pet: null,
          adopted: 0,
        };
        await db()
          .prepare(
            "INSERT INTO users (id,google_id,name) VALUES (?,?,?) ON CONFLICT(google_id) DO NOTHING",
          )
          .bind(u.id, u.google_id, u.name)
          .run();
        u = await db()
          .prepare("SELECT * FROM users WHERE google_id=?")
          .bind(identity.sub)
          .first<Account>();
      }
      const session = randomToken();
      await db()
        .prepare("INSERT INTO sessions (id,user_id,expires) VALUES (?,?,?)")
        .bind(await digest(session), u!.id, Date.now() + 7 * 86400000)
        .run();
      return redirect("/pet?connection=connected", [
        clear,
        cookie("mashroom_session", session, 7 * 86400, c.origin),
      ]);
    }
    const u = (await account(request))!;
    if (path === "auth/logout" && method === "POST") {
      await db()
        .prepare("DELETE FROM sessions WHERE id=?")
        .bind(await digest(cookieValue(request, "mashroom_session")))
        .run();
      return new Response(null, {
        status: 204,
        headers: { "Set-Cookie": cookie("mashroom_session", "", 0, c.origin) },
      });
    }
    if (path === "profile" && method === "PATCH") {
      const body = (await request.json()) as { pet: unknown; adopt?: boolean };
      const pet = JSON.stringify(validatePet(body.pet));
      const result = await db()
        .prepare(
          body.adopt
            ? "UPDATE users SET pet=?,adopted=1 WHERE id=? AND pet IS NULL AND adopted=0"
            : "UPDATE users SET pet=?,adopted=1 WHERE id=?",
        )
        .bind(pet, u.id)
        .run();
      if (!result.meta.changes)
        throw new HttpError(
          409,
          "An existing pet was kept. Your account was not overwritten.",
        );
      return json({ saved: true });
    }
    if (path === "classroom/disconnect" && method === "POST") {
      const con = await connection(u.id);
      if (con) {
        const raw = await unseal(con.refresh || con.access, c.key);
        const revoke = await fetch("https://oauth2.googleapis.com/revoke", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ token: raw }),
        });
        if (!revoke.ok && revoke.status !== 400)
          throw new HttpError(503, "Couldn't revoke Google access. Try again.");
      }
      await db()
        .prepare("DELETE FROM connections WHERE user_id=?")
        .bind(u.id)
        .run();
      return json({ disconnected: true });
    }
    if (path === "classroom/courses" && method === "GET") {
      const token = await accessToken(u.id);
      const list = await collectPages<Course>(
        (p) => googleGet(token, p),
        "courses?teacherId=me&courseStates=ACTIVE",
        "courses",
      );
      return json({
        courses: list.map((x) => ({
          id: x.id,
          name: x.name,
          section: x.section,
        })),
      });
    }
    if (path === "classroom/import" && method === "POST") {
      const body = (await request.json()) as { courseId: string };
      if (!/^[\w-]{1,150}$/.test(body.courseId || ""))
        throw new HttpError(400, "Choose a valid course.");
      const id = encodeURIComponent(body.courseId),
        token = await accessToken(u.id);
      await googleGet(token, `courses/${id}/teachers/me`);
      const course = await googleGet<Course>(token, `courses/${id}`);
      type Person = {
        userId: string;
        profile: { name?: { fullName?: string } };
      };
      type Work = {
        id: string;
        title: string;
        description?: string;
        alternateLink?: string;
        state: string;
        dueDate?: { year: number; month: number; day: number };
        dueTime?: { hours?: number; minutes?: number };
      };
      const [students, teachers, work] = await Promise.all([
        collectPages<Person>(
          (p) => googleGet(token, p),
          `courses/${id}/students`,
          "students",
        ),
        collectPages<Person>(
          (p) => googleGet(token, p),
          `courses/${id}/teachers`,
          "teachers",
        ),
        collectPages<Work>(
          (p) => googleGet(token, p),
          `courses/${id}/courseWork`,
          "courseWork",
        ),
      ]);
      const statements = [
        db()
          .prepare(
            "INSERT INTO courses (id,name,section,imported_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,section=excluded.section,imported_at=excluded.imported_at",
          )
          .bind(course.id, course.name, course.section || null, Date.now()),
        db().prepare("DELETE FROM members WHERE course_id=?").bind(course.id),
        db()
          .prepare("DELETE FROM assignments WHERE course_id=?")
          .bind(course.id),
      ];
      const people = new Map<string, { person: Person; role: string }>();
      students.forEach((person) =>
        people.set(person.userId, { person, role: "student" }),
      );
      teachers.forEach((person) =>
        people.set(person.userId, { person, role: "teacher" }),
      );
      for (const { person, role } of people.values())
        statements.push(
          db()
            .prepare(
              "INSERT INTO members (course_id,google_id,name,role) VALUES (?,?,?,?)",
            )
            .bind(
              course.id,
              person.userId,
              person.profile.name?.fullName || "Class member",
              role,
            ),
        );
      for (const w of work.filter((w) => w.state === "PUBLISHED")) {
        const d = w.dueDate;
        const due = d
          ? new Date(
              Date.UTC(
                d.year,
                d.month - 1,
                d.day,
                w.dueTime?.hours || 0,
                w.dueTime?.minutes || 0,
              ),
            ).toISOString()
          : null;
        const link = w.alternateLink?.startsWith(
          "https://classroom.google.com/",
        )
          ? w.alternateLink
          : "https://classroom.google.com/";
        statements.push(
          db()
            .prepare(
              "INSERT INTO assignments (course_id,id,title,description,due,url) VALUES (?,?,?,?,?,?)",
            )
            .bind(course.id, w.id, w.title, w.description || "", due, link),
        );
      }
      await db().batch(statements);
      return json({
        name: course.name,
        students: students.length,
        assignments: work.filter((w) => w.state === "PUBLISHED").length,
      });
    }
    if (path === "classroom/content" && method === "GET") {
      const courses = await db()
        .prepare(
          "SELECT c.*,m.role FROM courses c JOIN members m ON m.course_id=c.id WHERE m.google_id=?",
        )
        .bind(u.google_id)
        .all();
      const assignments = await db()
        .prepare(
          "SELECT a.*,c.name as courseName FROM assignments a JOIN courses c ON a.course_id=c.id JOIN members m ON m.course_id=c.id WHERE m.google_id=? ORDER BY a.due IS NULL,a.due",
        )
        .bind(u.google_id)
        .all();
      const roster = await db()
        .prepare(
          "SELECT other.course_id,other.name,other.role FROM members other WHERE EXISTS (SELECT 1 FROM members me WHERE me.course_id=other.course_id AND me.google_id=? AND me.role='teacher')",
        )
        .bind(u.google_id)
        .all();
      return json({
        courses: courses.results,
        assignments: assignments.results,
        roster: roster.results,
      });
    }
    throw new HttpError(404, "This page is unavailable.");
  } catch (e) {
    if (path === "auth/google/callback")
      return redirect("/login?connection=failed", [
        cookie("mashroom_oauth", "", 0, config().origin),
      ]);
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(
      "MashRoom request failed",
      path,
      e instanceof Error ? e.name : "unknown",
    );
    return json(
      {
        error: "This connection is temporarily unavailable. Please try again.",
      },
      503,
    );
  }
}
