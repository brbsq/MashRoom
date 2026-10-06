"use client";
import Image from "next/image";
import { ChatPanel } from "@/components/mashroom/chat-panel";
import { useApp } from "@/components/mashroom/provider";
import { Users, Heart, ShieldCheck } from "lucide-react";
export default function Chat() {
  const { snapshot } = useApp();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">BETTER TOGETHER</span>
          <h1>A little conversation</h1>
          <p>Say hello, share a smile, and cheer each other on.</p>
        </div>
        <span className="small-pill">
          <Users size={15} /> Class-only demo
        </span>
      </div>
      <div className="chat-layout">
        <ChatPanel />
        <aside className="glass people-panel">
          <h2>In our little world</h2>
          {snapshot.participants.map((p) => (
            <div className="person-row" key={p.id}>
              <Image
                unoptimized
                width={1254}
                height={1254}
                src="/pet.png"
                alt=""
                style={{ filter: `hue-rotate(${p.hue}deg)` }}
              />
              <div>
                <strong>{p.name}</strong>
                <small>
                  {p.simulated ? "Simulated classmate" : "That's you!"}
                </small>
              </div>
            </div>
          ))}
          <div className="kindness-note">
            <Heart />
            <h3>Kind words grow here.</h3>
            <p>
              Celebrate each other, keep personal details private, and use
              Report when something doesn’t feel right.
            </p>
            <span>
              <ShieldCheck size={16} /> Demo moderation available in Settings
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
