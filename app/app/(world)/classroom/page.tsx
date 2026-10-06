"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Leaf,
  Calculator,
  Palette,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/components/mashroom/provider";
import { Button } from "@/components/ui/button";
import type { Assignment } from "@/lib/types";
import { toast } from "sonner";
const samples: Assignment[] = [
  {
    id: "sample-1",
    title: "A world of little wonders",
    description:
      "Head outside and find three things that make you curious. Write or draw what you discover.",
    courseName: "Science · Explore",
    due: null,
    url: "",
  },
  {
    id: "sample-2",
    title: "Numbers in nature",
    description:
      "Can you spot patterns in leaves, petals, or clouds? Bring your favourite pattern to class.",
    courseName: "Maths · Discover",
    due: null,
    url: "",
  },
  {
    id: "sample-3",
    title: "Draw your dream habitat",
    description:
      "Imagine the perfect home for your pet. What would make it feel happy, cosy, and safe?",
    courseName: "Art · Create",
    due: null,
    url: "",
  },
];
export default function Classroom() {
  const { state } = useApp();
  const [data, setData] = useState<Assignment[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  async function load() {
    await Promise.resolve();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/classroom/content");
      const d = (await r.json()) as {
        error?: string;
        assignments: Assignment[];
      };
      if (!r.ok) throw Error(d.error);
      setData(d.assignments);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (state?.profile.mode === "google") void Promise.resolve().then(load);
  }, [state?.profile.mode]);
  if (!state) return null;
  const demo = state.profile.mode === "demo",
    items = demo ? samples : data;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">STAY CURIOUS</span>
          <h1>A little learning, every day</h1>
          <p>Big discoveries start with small questions.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/settings/classroom">Classroom connection</Link>
        </Button>
      </div>
      <div className="connection-banner">
        <BookOpen size={29} />
        <div>
          <h2>
            {demo
              ? "Your sample classroom"
              : "Your Google Classroom assignments"}
          </h2>
          <p>
            {demo
              ? "A peek at how your class activities will appear. Connect Google to see your real assignments."
              : "Only assignments from classes with verified membership appear here."}
          </p>
        </div>
        <span className="status-label">
          {demo ? "Sample content" : "Imported from Google"}
        </span>
      </div>
      <div className="classroom-toolbar">
        <h2>Something to explore</h2>
        <span className="small muted">{items.length} activities</span>
      </div>
      {loading ? (
        <p role="status">Finding your class activities…</p>
      ) : error ? (
        <div className="glass empty-panel">
          <p role="alert">{error}</p>
          <Button onClick={() => void load()}>Try again</Button>
        </div>
      ) : items.length ? (
        <div className="assignments">
          {items.map((a, i) => {
            const Icon = [Leaf, Calculator, Palette][i % 3];
            return (
              <article className="glass assignment-card" key={a.id}>
                <div className="subject-icon">
                  <Icon size={24} />
                </div>
                <span className="eyebrow">{a.courseName}</span>
                <h3>{a.title}</h3>
                <p>{a.description || "Open the assignment for the details."}</p>
                <small>
                  {a.due
                    ? `Due ${new Date(a.due).toLocaleString()}`
                    : demo
                      ? "Sample activity · no due date"
                      : "No due date"}
                </small>
                {demo ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info(
                        "This is a sample activity. Real assignments open in Google Classroom after connecting.",
                      )
                    }
                  >
                    Explore activity
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <a href={a.url} target="_blank" rel="noopener noreferrer">
                      Open in Google Classroom <ExternalLink size={13} />
                    </a>
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <section className="glass empty-panel">
          <BookOpen />
          <h2>A little room for learning</h2>
          <p>
            No imported assignments yet. Ask your teacher to connect and import
            your class. A demo class name cannot unlock real class content.
          </p>
        </section>
      )}
    </>
  );
}
