"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Coffee, Dumbbell, House, Layers, List, Map as MapIcon, Maximize, Minus, Plus, LocateFixed, ShoppingBag, Trees, Users, X } from "lucide-react";
import { assetHref } from "@/lib/asset";
import { mapDestinations, mapDistricts, mapVariants, type MapMode } from "@/lib/town-map";
import styles from "./map-preview.module.css";

const icons = { home: House, plaza: Users, school: BookOpen, park: Trees, store: ShoppingBag, cafe: Coffee, gym: Dumbbell };
const clamp = (n: number, max: number) => Math.max(-max, Math.min(max, n));

export function MapPreview() {
  const [variantId, setVariantId] = useState<string>("H");
  const variant = mapVariants.find((item) => item.id === variantId) ?? mapVariants[0];
  const [mode, setMode] = useState<MapMode>("full");
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("plaza");
  const [filter, setFilter] = useState("All");
  const [listOpen, setListOpen] = useState(false);
  const [world, setWorld] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const viewport = useRef<HTMLDivElement>(null);
  const mapPanel = useRef<HTMLElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const destination = mapDestinations.find((item) => item.id === selected) ?? mapDestinations[1];
  const Icon = icons[destination.id as keyof typeof icons];
  const boardWidth = Math.max(size.width, size.height * 16 / 9);
  const boardHeight = boardWidth * 9 / 16;
  const boundPan = (x: number, y: number, z = zoom) => ({ x: clamp(x, Math.max(0, (boardWidth * z - size.width) / 2)), y: clamp(y, Math.max(0, (boardHeight * z - size.height) / 2)) });

  useEffect(() => {
    const element = viewport.current;
    if (!element || !open) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, [open, mode]);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [size.width, size.height]);

  useEffect(() => {
    if (!open) { opener.current?.focus(); return; }
    mapPanel.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && mode === "overlay") {
        const nodes = mapPanel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
        if (!nodes?.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === mapPanel.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, mode]);

  function chooseVariant(id: string) {
    const next = mapVariants.find((item) => item.id === id)!;
    setVariantId(id); setMode(next.mode); setOpen(true); setZoom(1); setPan({ x: 0, y: 0 }); setWorld(true); setFilter("All"); setListOpen(false); setSelected("plaza");
  }
  function changeZoom(next: number) {
    const bounded = Math.max(1, Math.min(2.5, next));
    setZoom(bounded); setPan(boundPan(pan.x, pan.y, bounded));
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom }; drag.current = null;
    } else drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      changeZoom(pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.distance);
    } else if (drag.current) setPan(boundPan(drag.current.panX + event.clientX - drag.current.x, drag.current.panY + event.clientY - drag.current.y));
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId); pinch.current = null; drag.current = null;
  }
  function selectPlace(id: string) { setSelected(id); setListOpen(false); }

  return (
    <main className={styles.preview} style={{ backgroundImage: `url(${assetHref("/landing/room.png")})` }}>
      <div className={styles.roomScene} aria-hidden="true"><img src={assetHref("/rooms/cd2bd.png")} alt="" /></div>
      <nav className={styles.comparison} aria-label="Compare map designs">
        <div className={styles.previewLabel}><span /> MAP STUDIO <small>Choose a direction</small></div>
        <div className={styles.variants}>{mapVariants.map((item) => <button key={item.id} aria-pressed={variantId === item.id} onClick={() => chooseVariant(item.id)}><b>{item.id}</b><span>{item.name}</span></button>)}</div>
        <div className={styles.modes} aria-label="Map opening style"><button aria-pressed={mode === "full"} onClick={() => { setMode("full"); setOpen(true); }}><Maximize size={15} /> Full screen</button><button aria-pressed={mode === "overlay"} onClick={() => { setMode("overlay"); setOpen(true); }}><Layers size={15} /> Overlay</button></div>
      </nav>
      {!open && <section className={styles.closed}><span>YOUR LITTLE WORLD</span><h1>Where shall we go?</h1><p>Choose a design above, or open the map again.</p><button ref={opener} onClick={() => setOpen(true)}><MapIcon size={20} /> Open map <ArrowRight size={20} /></button><Link href="/pet">Back to my pet</Link></section>}
      {open && <div className={`${styles.backdrop} ${mode === "overlay" ? styles.overlayBackdrop : ""}`} onClick={(event) => { if (event.target === event.currentTarget && mode === "overlay") setOpen(false); }}>
        <section ref={mapPanel} tabIndex={-1} role={mode === "overlay" ? "dialog" : "region"} aria-modal={mode === "overlay" ? true : undefined} aria-label={`${variant.name} map`} className={`${styles.mapPanel} ${mode === "overlay" ? styles.overlay : styles.full}`}>
          <header className={styles.mapHeader}><Link href="/" className={styles.brand}><img src={assetHref("/landing/logo.png")} alt="" />MashRoom</Link><span className={styles.title}>Town map <small>{variant.note}</small></span><button className={styles.iconButton} aria-label="Close map" onClick={() => setOpen(false)}><X /></button></header>
          <div className={styles.mapBody}>
            <div className={styles.mapRegion}>
              <div className={styles.filterRow}>{["All", "Learn", "Play", "Shop"].map((item) => <button aria-pressed={filter === item} onClick={() => setFilter(item)} key={item}>{item}</button>)}<button aria-label="Show destination list" aria-expanded={listOpen} onClick={() => setListOpen(!listOpen)}><List size={18} /></button></div>
              <div ref={viewport} className={styles.viewport} tabIndex={0} aria-label="Town map. Use arrow keys to pan, plus and minus to zoom, Home to recenter." onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                const moves: Record<string, [number, number]> = { ArrowLeft: [50, 0], ArrowRight: [-50, 0], ArrowUp: [0, 50], ArrowDown: [0, -50] };
                if (moves[event.key]) { event.preventDefault(); const [x, y] = moves[event.key]; setPan(boundPan(pan.x + x, pan.y + y)); }
                if (event.key === "+" || event.key === "=") { event.preventDefault(); changeZoom(zoom + .25); }
                if (event.key === "-") { event.preventDefault(); changeZoom(zoom - .25); }
                if (event.key === "Home") { event.preventDefault(); setZoom(1); setPan({ x: 0, y: 0 }); }
              }}>
                <div key={variant.style} className={styles.board} style={{ width: boardWidth, height: boardHeight, transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
                  <img className={styles.mapArt} src={assetHref(`/maps/${variant.style}.png`)} alt="Illustrated streets, parks and buildings of MashRoom" draggable={false} />
                  {variant.districts && world && <><div className={`${styles.district} ${styles.garden}`}><Trees size={20} /><strong>{mapDistricts[1].name}</strong><small>Coming soon</small></div><div className={`${styles.district} ${styles.riverside}`}><strong>{mapDistricts[2].name}</strong><small>Coming soon</small></div><span className={styles.quarter}>Roomie Quarter</span></>}
                  {mapDestinations.filter((item) => (!variant.districts || !!item.href) && (filter === "All" || item.category === filter)).map((item) => {
                    const PinIcon = icons[item.id as keyof typeof icons];
                    const [x, y] = item.positions[variant.style];
                    return <button key={item.id} className={`${styles.pin} ${selected === item.id ? styles.selected : ""} ${!item.href ? styles.future : ""}`} style={{ left: `${x}%`, top: `${y}%` }} aria-pressed={selected === item.id} aria-label={`${item.name}${!item.href ? ", coming soon" : ""}`} onClick={() => selectPlace(item.id)}><span className={styles.pinIcon}><PinIcon size={21} /></span><span className={styles.pinLabel}>{item.name}{item.id === "home" && <small>You are here</small>}{!item.href && <small>Coming soon</small>}</span></button>;
                  })}
                </div>
              </div>
              {listOpen && <div className={styles.placeList} aria-label="Destinations">{mapDestinations.filter((item) => filter === "All" || item.category === filter).map((item) => <button key={item.id} onClick={() => selectPlace(item.id)}>{item.name}<small>{item.href ? "Visit" : "Coming soon"}</small></button>)}</div>}
              <div className={styles.zoom}><button aria-label="Zoom in" disabled={zoom >= 2.5} onClick={() => changeZoom(zoom + .25)}><Plus size={20} /></button><span>{Math.round(zoom * 100)}%</span><button aria-label="Zoom out" disabled={zoom <= 1} onClick={() => changeZoom(zoom - .25)}><Minus size={20} /></button><button aria-label="Recenter map" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><LocateFixed size={20} /></button></div>
              {variant.districts && <div className={styles.worldSwitch}><button aria-pressed={world} onClick={() => { setWorld(true); setZoom(1); setPan({ x: 0, y: 0 }); }}>World</button><button aria-pressed={!world} onClick={() => { setWorld(false); setZoom(1.4); setPan({ x: 0, y: 0 }); }}>Roomie Quarter</button></div>}
              <span className={styles.mapHint}>Drag to explore · + / − to zoom</span>
            </div>
            <aside className={styles.destination} aria-live="polite" aria-atomic="true">
              <div className={styles.destinationPicture} style={{ backgroundImage: `url(${assetHref(`/maps/${variant.style}.png`)})`, backgroundPosition: `${destination.positions[variant.style][0]}% ${destination.positions[variant.style][1]}%` }}><span><Icon size={28} /></span></div>
              <div className={styles.destinationInfo} key={destination.id}><span className={styles.eyebrow}>{destination.href ? destination.category === "Home" ? "YOUR SPACE" : "CLASS SPACE" : "ON THE HORIZON"}</span><h1>{destination.name}</h1><p>{destination.description}</p>{destination.href ? <Link className={styles.visit} href={destination.href}>Visit {destination.id === "plaza" ? "plaza" : destination.name.toLowerCase()}<ArrowRight size={19} /></Link> : <div className={styles.coming}>Coming soon</div>}<small className={styles.demoNote}>Map design preview · demo world</small></div>
            </aside>
          </div>
        </section>
      </div>}
    </main>
  );
}
