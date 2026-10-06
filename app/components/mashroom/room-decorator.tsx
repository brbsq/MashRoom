"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  decorCatalog,
  decorStorageKey,
  normalizeDecor,
  readLayouts,
  type DecorItem,
  type DecorKind,
  type RoomLayouts,
} from "@/lib/room-decor";
import type { RoomId } from "@/lib/pet-room";
import type { StudentProfile } from "@/lib/types";
import { DecorArt } from "./decor-art";
import styles from "./room-decorator.module.css";

export function RoomDecorator({
  profile,
  roomId,
  editing,
  onFinish,
}: {
  profile: StudentProfile;
  roomId: RoomId;
  editing: boolean;
  onFinish: () => void;
}) {
  const [layouts, setLayouts] = useState<RoomLayouts>({});
  const [draft, setDraft] = useState<DecorItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: string;
    pointer: number;
    x: number;
    y: number;
    item: DecorItem;
  } | null>(null);
  const key = decorStorageKey(profile);
  useEffect(() => {
    try {
      setLayouts(readLayouts(localStorage.getItem(key)));
    } catch {
      setNotice(
        "Browser storage is unavailable. You can arrange items for this visit.",
      );
    }
  }, [key]);
  useEffect(() => {
    if (editing) {
      setDraft(layouts[roomId] || []);
      setSelected(null);
      setNotice("");
      setCollapsed(false);
      const frame = requestAnimationFrame(() =>
        heading.current?.focus({ preventScroll: true }),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [editing, roomId, layouts]);
  const items = editing ? draft : layouts[roomId] || [];
  const current = draft.find((item) => item.id === selected);
  const patch = (id: string, change: Partial<DecorItem>) =>
    setDraft((old) =>
      normalizeDecor(
        old.map((item) => (item.id === id ? { ...item, ...change } : item)),
      ),
    );
  const add = (kind: DecorKind) => {
    if (draft.length >= 40) {
      setNotice("This room can hold up to 40 items. Remove one to make space.");
      return;
    }
    const item: DecorItem = {
      id: crypto.randomUUID(),
      kind,
      x: 48 + (draft.length % 4) * 4,
      y: matchMedia("(max-width: 600px)").matches
        ? 46
        : kind === "art"
          ? 36
          : kind === "rug"
            ? 84
            : 78,
      scale: 1,
      rotation: 0,
      foreground: false,
    };
    setDraft((old) => [...old, item]);
    setSelected(item.id);
    setNotice(`${decorCatalog.find((c) => c.id === kind)!.name} added.`);
  };
  const startDrag = (event: PointerEvent<HTMLDivElement>, item: DecorItem) => {
    if (!editing || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setSelected(item.id);
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: item.id,
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      item,
    };
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current,
      rect = canvas.current?.getBoundingClientRect();
    if (!d || !rect || d.pointer !== event.pointerId) return;
    patch(d.id, {
      x: d.item.x + ((event.clientX - d.x) / rect.width) * 100,
      y: d.item.y + ((event.clientY - d.y) / rect.height) * 100,
    });
  };
  const save = () => {
    const next = { ...layouts, [roomId]: normalizeDecor(draft) };
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setNotice(
        "Could not save on this device. Your arrangement is still here; free browser space and try Save again.",
      );
      return;
    }
    setLayouts(next);
    onFinish();
  };
  return (
    <>
      <div
        ref={canvas}
        className={styles.canvas}
        data-editing={editing}
        aria-label={editing ? "Furniture placement area" : undefined}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            role={editing ? "button" : undefined}
            tabIndex={editing ? 0 : undefined}
            aria-label={`${decorCatalog.find((c) => c.id === item.kind)!.name}${editing ? ", move with arrow keys" : ""}`}
            aria-pressed={editing ? selected === item.id : undefined}
            className={styles.item}
            data-selected={editing && selected === item.id}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${22 * item.scale}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              zIndex: (item.foreground ? 60 : 2) + index,
            }}
            onPointerDown={(e) => startDrag(e, item)}
            onPointerMove={moveDrag}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onLostPointerCapture={() => {
              drag.current = null;
            }}
            onFocus={() => editing && setSelected(item.id)}
            onKeyDown={(e) => {
              if (!editing) return;
              const step = e.shiftKey ? 5 : 1;
              const moves: Record<string, [number, number]> = {
                ArrowLeft: [-step, 0],
                ArrowRight: [step, 0],
                ArrowUp: [0, -step],
                ArrowDown: [0, step],
              };
              if (moves[e.key]) {
                e.preventDefault();
                patch(item.id, {
                  x: item.x + moves[e.key][0],
                  y: item.y + moves[e.key][1],
                });
              }
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(item.id);
              }
            }}
          >
            <DecorArt kind={item.kind} />
          </div>
        ))}
      </div>
      {editing && (
        <section
          className={styles.editor}
          aria-label="Decorate room"
          data-collapsed={collapsed}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              onFinish();
            }
          }}
        >
          <header>
            <div>
              <h2 ref={heading} tabIndex={-1}>
                Make room for you
              </h2>
              <p>Drag to place · arrow keys to nudge</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((v) => !v)}
              aria-expanded={!collapsed}
            >
              {collapsed ? "Show controls" : "Hide controls"}
            </Button>
          </header>
          <div hidden={collapsed}>
            <p className={styles.hint}>
              {draft.length}/40 items · saved on this device, per room. Hide
              controls to reach anything behind this panel.
            </p>
            <div
              className={styles.catalog}
              aria-label="Furniture and decorations"
            >
              {decorCatalog.map((entry) => (
                <Button
                  key={entry.id}
                  variant="ghost"
                  onClick={() => add(entry.id)}
                  aria-label={`Add ${entry.name}`}
                  disabled={draft.length >= 40}
                >
                  <DecorArt kind={entry.id} />
                  <span>{entry.name}</span>
                </Button>
              ))}
            </div>
            {current ? (
              <div
                className={styles.inspector}
                aria-label="Selected item controls"
              >
                <strong>
                  {decorCatalog.find((c) => c.id === current.kind)!.name}
                </strong>
                <label>
                  Size <output>{Math.round(current.scale * 100)}%</output>
                  <input
                    aria-label="Furniture size"
                    type="range"
                    min="50"
                    max="160"
                    value={current.scale * 100}
                    onChange={(e) =>
                      patch(current.id, { scale: Number(e.target.value) / 100 })
                    }
                  />
                </label>
                <label>
                  Rotation <output>{current.rotation}°</output>
                  <input
                    aria-label="Furniture rotation"
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={current.rotation}
                    onChange={(e) =>
                      patch(current.id, { rotation: Number(e.target.value) })
                    }
                  />
                </label>
                <div className={styles.actions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patch(current.id, { foreground: !current.foreground })
                    }
                  >
                    {current.foreground
                      ? "Behind character"
                      : "In front of character"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={draft.length >= 40}
                    onClick={() => {
                      const copy = normalizeDecor([
                        {
                          ...current,
                          id: crypto.randomUUID(),
                          x: current.x + 4,
                          y: current.y + 3,
                        },
                      ])[0];
                      setDraft((old) => [...old, copy]);
                      setSelected(copy.id);
                    }}
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDraft((old) =>
                        old.filter((item) => item.id !== selected),
                      );
                      setSelected(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <p className={styles.hint}>
                Add an item or select one in the room to adjust it.
              </p>
            )}
            <p className={styles.notice} role="status">
              {notice}
            </p>
          </div>
          <footer>
            <Button variant="ghost" onClick={onFinish}>
              Cancel
            </Button>
            <Button onClick={save}>Save room</Button>
          </footer>
        </section>
      )}
    </>
  );
}
