"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BookOpen, Download, RefreshCw, Link2, ArrowLeft } from "lucide-react";
import { useApp } from "@/components/mashroom/provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
type Course = { id: string; name: string; section?: string };
export default function ClassroomSettings() {
  const { google } = useApp();
  const [courses, setCourses] = useState<Course[]>([]),
    [roster, setRoster] = useState<
      { course_id: string; name: string; role: string }[]
    >([]),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [loaded, setLoaded] = useState(false);
  const load = useCallback(async () => {
    await Promise.resolve();
    setBusy("load");
    setError("");
    try {
      const r = await fetch("/api/classroom/courses");
      const d = (await r.json()) as {
        error?: string;
        courses: Course[];
        name: string;
        students: number;
        assignments: number;
      };
      if (!r.ok) throw Error(d.error);
      setCourses(d.courses);
      const content = await fetch("/api/classroom/content");
      if (content.ok)
        setRoster(((await content.json()) as { roster: typeof roster }).roster);
      setLoaded(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }, []);
  useEffect(() => {
    if (google?.classroom === "connected") void Promise.resolve().then(load);
  }, [google?.classroom, load]);
  const connect = () => {
    if (!google?.configured) {
      toast.info(
        "Set the Google credentials and callback URL described below to enable this connection.",
      );
      return;
    }
    location.href = google.user
      ? "/api/auth/google/start?purpose=classroom"
      : "/api/auth/google/start";
  };
  const importCourse = async (course: Course) => {
    setBusy(course.id);
    setError("");
    try {
      const r = await fetch("/api/classroom/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      const d = (await r.json()) as {
        error?: string;
        courses: Course[];
        name: string;
        students: number;
        assignments: number;
      };
      if (!r.ok) throw Error(d.error);
      toast.success(
        `${d.name}: ${d.students} students and ${d.assignments} assignments imported.`,
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <Link
        href="/settings"
        className="back-link"
        style={{ justifyContent: "flex-start", margin: "0 0 20px" }}
      >
        <ArrowLeft size={15} /> Back to Settings
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">TEACHER CONNECTION</span>
          <h1>Bring your classroom along</h1>
          <p>Import your classes, students, and assignments in one place.</p>
        </div>
      </div>
      <section className="glass settings-card">
        <h2>
          <BookOpen />
          Google Classroom
        </h2>
        <p>
          Connect the Google account you use to teach. MashRoom verifies your
          teacher role before each import.
        </p>
        <span className="status-label">
          {!google?.configured
            ? "Google setup pending"
            : !google.user
              ? "Sign in with Google first"
              : google.classroom === "expired"
                ? "Access expired"
                : google.classroom === "connected"
                  ? "Connected"
                  : "Classroom access not granted"}
        </span>
        <div className="config-actions">
          <Button onClick={connect}>
            <Link2 size={16} />
            {google?.classroom === "connected"
              ? "Reconnect Classroom"
              : google?.user
                ? "Connect Classroom"
                : "Connect Google"}
          </Button>
          {google?.classroom === "connected" && (
            <Button
              variant="outline"
              disabled={!!busy}
              onClick={() => void load()}
            >
              <RefreshCw size={15} />
              Refresh classes
            </Button>
          )}
        </div>
        {error && (
          <p className="inline-note" role="alert">
            {error} <button onClick={() => void load()}>Try again</button>
          </p>
        )}
        {busy === "load" && (
          <p className="inline-note" role="status">
            Finding the classes you teach…
          </p>
        )}
        {courses.map((c) => (
          <div key={c.id}>
            <div className="course-row">
              <div>
                <h3>{c.name}</h3>
                <p>{c.section || "Google Classroom"}</p>
              </div>
              <Button
                variant="outline"
                disabled={!!busy}
                onClick={() => void importCourse(c)}
              >
                <Download size={15} />
                {busy === c.id ? "Importing…" : "Import / update"}
              </Button>
            </div>
            {roster.filter((r) => r.course_id === c.id).length > 0 && (
              <details className="inline-note">
                <summary>
                  Imported roster (
                  {
                    roster.filter(
                      (r) => r.course_id === c.id && r.role === "student",
                    ).length
                  }{" "}
                  students)
                </summary>
                {roster
                  .filter((r) => r.course_id === c.id)
                  .map((r, i) => (
                    <div key={i}>
                      {r.name} · {r.role}
                    </div>
                  ))}
              </details>
            )}
          </div>
        ))}
        {loaded && !courses.length && (
          <p className="inline-note">
            No active classes found where this Google account is a teacher.
          </p>
        )}
      </section>
      {!google?.configured && (
        <section className="glass settings-card" style={{ marginTop: 24 }}>
          <h2>Connection setup</h2>
          <p>
            The demo needs no configuration. For live Google access, follow the
            project README to enable the Classroom API, create a web OAuth
            client, and add server secrets.
          </p>
          <pre className="config-code">
            APP_ORIGIN=http://127.0.0.1:3000{"\n"}GOOGLE_CLIENT_ID=…{"\n"}
            GOOGLE_CLIENT_SECRET=…{"\n"}TOKEN_ENCRYPTION_KEY=…
          </pre>
          <p className="inline-note">
            Callback: /api/auth/google/callback on your configured origin. Keep
            credentials in the server’s ignored .dev.vars file, never in this
            browser.
          </p>
        </section>
      )}
      <p className="inline-note">
        Imports refresh manually and replace each course’s imported roster and
        published assignments. Grades and submissions stay in Google Classroom.
      </p>
    </>
  );
}
