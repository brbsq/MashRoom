"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  House,
  BookOpen,
  Users,
  MousePointer2,
} from "lucide-react";
import { useApp } from "@/components/mashroom/provider";
import { ChatPanel } from "@/components/mashroom/chat-panel";
import { Button } from "@/components/ui/button";
export default function Plaza() {
  const { state, room, snapshot } = useApp();
  if (!state) return null;
  const me = snapshot.participants.find((p) => !p.simulated);
  const step = (x: number, y: number) => {
    if (me) room.move(me.x + x, me.y + y);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">A PLACE TO BELONG</span>
          <h1>The student plaza</h1>
          <p>A little fresh air. A few familiar faces.</p>
        </div>
        <span className="small-pill">
          <Users size={15} />
          {snapshot.participants.length} in this demo world
        </span>
      </div>
      {state.profile.mode !== "demo" ? (
        <div className="glass empty-panel">
          <h2>Your live plaza is coming later</h2>
          <p>
            The multiplayer connection is not active. You can explore the
            simulated plaza in demo mode.
          </p>
        </div>
      ) : (
        <div className="plaza-layout">
          <section>
            <div
              className="plaza-scene"
              role="application"
              aria-label="Class plaza. Click the clearing or use arrow keys to move."
              tabIndex={0}
              onKeyDown={(e) => {
                const dirs: Record<string, [number, number]> = {
                  ArrowUp: [0, -3],
                  ArrowDown: [0, 3],
                  ArrowLeft: [-3, 0],
                  ArrowRight: [3, 0],
                  w: [0, -3],
                  s: [0, 3],
                  a: [-3, 0],
                  d: [3, 0],
                };
                if (e.target === e.currentTarget && dirs[e.key]) {
                  e.preventDefault();
                  step(...dirs[e.key]);
                }
              }}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                room.move(
                  ((e.clientX - r.left) / r.width) * 100,
                  ((e.clientY - r.top) / r.height) * 100,
                );
                e.currentTarget.focus();
              }}
            >
              <Image
                unoptimized
                width={1254}
                height={1254}
                className="plaza-backdrop"
                src="/plaza.png"
                alt="A leafy plaza with a mushroom cottage and blue school"
              />
              <Link
                href="/pet"
                className="building-link home-link"
                onClick={(e) => e.stopPropagation()}
              >
                <House size={14} /> Pet home
              </Link>
              <Link
                href="/classroom"
                className="building-link school-link"
                onClick={(e) => e.stopPropagation()}
              >
                <BookOpen size={14} /> Classroom
              </Link>
              <span className="plaza-demo-label">
                DEMO · SIMULATED CLASSMATES
              </span>
              {snapshot.participants.map((p) => (
                <div
                  key={p.id}
                  className={`plaza-avatar ${!p.simulated ? "you" : ""}`}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    zIndex: Math.round(p.y),
                  }}
                >
                  {p.bubble && !state.muted.includes(p.id) && (
                    <div className="speech-bubble">{p.bubble}</div>
                  )}
                  <Image
                    unoptimized
                    width={1254}
                    height={1254}
                    src="/pet.png"
                    alt={`${p.name}'s pet`}
                    style={{ filter: `hue-rotate(${p.hue}deg)` }}
                  />
                  <span>
                    {p.name}
                    {p.simulated ? "" : " · you"}
                  </span>
                </div>
              ))}
            </div>
            <div className="plaza-controls">
              <span>
                <MousePointer2 size={15} /> Click to wander. Arrow keys work,
                too.
              </span>
              <div className="direction-controls">
                {[
                  { i: ArrowLeft, d: [-4, 0], name: "Move left" },
                  { i: ArrowUp, d: [0, -4], name: "Move up" },
                  { i: ArrowDown, d: [0, 4], name: "Move down" },
                  { i: ArrowRight, d: [4, 0], name: "Move right" },
                ].map((a) => (
                  <Button
                    key={a.name}
                    variant="outline"
                    size="icon"
                    aria-label={a.name}
                    onClick={() => step(a.d[0], a.d[1])}
                  >
                    <a.i size={15} />
                  </Button>
                ))}
              </div>
            </div>
            <div className="plaza-friends">
              {snapshot.participants.map((p) => (
                <span key={p.id}>
                  <Image
                    unoptimized
                    width={1254}
                    height={1254}
                    src="/pet.png"
                    alt=""
                    style={{ filter: `hue-rotate(${p.hue}deg)` }}
                  />
                  {p.name}
                  <small>{p.simulated ? "demo" : "you"}</small>
                </span>
              ))}
            </div>
          </section>
          <ChatPanel compact />
        </div>
      )}
    </>
  );
}
