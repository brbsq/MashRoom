"use client";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  decorCatalog,
  isStarterDecor,
  decorStorageKey,
  normalizeDecor,
  readLayouts,
  boundDecor,
  sceneLayers,
  surfaceBounds,
  orderDecor,
  type DecorItem,
  type DecorKind,
  type RoomLayouts,
  type FurnitureInteraction,
} from "@/lib/room-decor";
import type { RoomId } from "@/lib/pet-room";
import type { StudentProfile } from "@/lib/types";
import { DecorArt } from "./decor-art";
import styles from "./room-decorator.module.css";
import { useWallet } from "./use-wallet";

export function RoomDecorator({
  profile,
  roomId,
  editing,
  onFinish,
  character,
  characterY = 95,
  onFurnitureInteraction,
}: {
  profile: StudentProfile;
  roomId: RoomId;
  editing: boolean;
  onFinish: () => void;
  character?: (layer: number) => ReactNode;
  characterY?: number;
  onFurnitureInteraction?: (event: FurnitureInteraction) => void;
}) {
  const {wallet}=useWallet(profile);
  const [layouts, setLayouts] = useState<RoomLayouts>({});
  const [draft, setDraft] = useState<DecorItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [metrics, setMetrics] = useState({aspect:16/9,characterHeight:70.8333});
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
  useEffect(()=>{const el=canvas.current;if(!el)return;const observer=new ResizeObserver(([entry])=>{const {width,height}=entry.contentRect,aspect=width/height;setMetrics({aspect,characterHeight:width<=600?Math.min(52,103*aspect):Math.min(70.8333,39.876*aspect)});});observer.observe(el);return()=>observer.disconnect();},[]);
  const bound = (item: DecorItem) => boundDecor(item,roomId,metrics.aspect,metrics.characterHeight);
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
  const items = (editing ? draft : layouts[roomId] || []).map(bound);
  const layers = sceneLayers(items, characterY);
  const current = items.find((item) => item.id === selected);
  const patch = (id: string, change: Partial<DecorItem>) =>
    setDraft((old) =>
      normalizeDecor(
        old.map((item) => (item.id === id ? { ...item, ...change } : item)),
      ).map(bound),
    );
  const add = (kind: DecorKind) => {
    if(!isStarterDecor(kind)&&!wallet?.owned.includes(kind)){setNotice("Find this collectible in the Shop first.");return;}
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
      layer: "auto",
      order: 0,
    };
    setDraft((old) => [...old, bound(item)]);
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
    const next = { ...layouts, [roomId]: normalizeDecor(draft).map(bound) };
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
        {editing && current && <div className={styles.surfaceGuide} data-surface={decorCatalog.find(c => c.id === current.kind)!.surface} style={{top:`${surfaceBounds(decorCatalog.find(c=>c.id===current.kind)!.surface,roomId==="outdoors")[0]}%`,bottom:`${100-surfaceBounds(decorCatalog.find(c=>c.id===current.kind)!.surface,roomId==="outdoors")[1]}%`}}><span>{decorCatalog.find(c => c.id === current.kind)!.surface} placement</span></div>}
        {character?.(layers.__character)}
        {items.map((item) => (
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
              height: `calc(var(--roomie-height) * ${decorCatalog.find(c => c.id === item.kind)!.heightRatio * item.scale})`,
              width: `calc(var(--roomie-height) * ${decorCatalog.find(c => c.id === item.kind)!.heightRatio * decorCatalog.find(c => c.id === item.kind)!.aspect * item.scale})`,
              transform: `translate(-50%, ${item.kind === "art" ? "-50%" : "-100%"}) rotate(${item.rotation}deg)`,
              transformOrigin: item.kind === "art" ? "50% 50%" : "50% 100%",
              zIndex: layers[item.id],
            }}
            onClick={() => { if (!editing && item.interaction) onFurnitureInteraction?.({ roomId, item, actionId: item.interaction.actionId }); }}
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
            <DecorArt kind={item.kind} fitted />
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
              {decorCatalog.filter(entry=>isStarterDecor(entry.id)||wallet?.owned.includes(entry.id)).map((entry) => (
                <Button
                  key={entry.id}
                  variant="ghost"
                  onClick={() => add(entry.id)}
                  aria-label={`Add ${entry.name}`}
                  disabled={draft.length >= 40 || (roomId === "outdoors" && entry.surface === "wall")}
                  data-surface={entry.surface}
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
                    min="25"
                    max="250"
                    value={current.scale * 100}
                    onChange={(e) =>
                      patch(current.id, { scale: Number(e.target.value) / 100 })
                    }
                  />
                </label>
                <Button variant="outline" size="sm" onClick={() => patch(current.id, { scale: 1 })}>Reset size</Button>
                <label>Layer<select aria-label="Furniture layer" value={current.layer} onChange={e => patch(current.id, { layer: e.target.value as DecorItem["layer"], foreground: e.target.value === "front" })}><option value="behind">Behind character</option><option value="auto">Automatic depth</option><option value="front">In front of character</option></select></label>
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
                      setDraft(old=>orderDecor(old,current.id,-1))
                    }
                  >
                    Send backward
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDraft(old=>orderDecor(old,current.id,1))}>Bring forward</Button>
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
