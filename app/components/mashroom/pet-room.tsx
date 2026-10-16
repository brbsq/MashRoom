"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useSceneNavigation } from "./use-scene-navigation";
import { useApp } from "./provider";
import { AdoptPet } from "./google-controls";
import { NeedRing } from "./need-ring";
import { BgmControls } from "./background-music";
import { Storeroom } from "./storeroom";
import { useWallet } from "./use-wallet";
import { RoomDecorator } from "./room-decorator";
import { RoomieRenderer, roomieArtworkSources } from "./roomie-renderer";
import { movementFacing, type RoomieFacing } from "@/lib/roomie-motion";
import { useRoomie } from "./use-roomie";
import type { FurnitureInteraction } from "@/lib/room-decor";
import { RoomIcon, RoomPhone } from "./room-phone";
import {
  boundRoomPosition,
  needs,
  rooms,
  startingPosition,
  type RoomId,
  type RoomInteraction,
  type RoomPosition,
} from "@/lib/pet-room";
import type { CareAction } from "@/lib/types";
import styles from "./pet-room.module.css";
import { assetHref } from "@/lib/asset";

const careMessages: Record<CareAction, string> = {
  feed: "That was delicious!",
  shower: "Fresh and clean!",
  play: "That was fun!",
  sleep: "Time for a little nap.",
  toilet: "Much more comfortable!",
  rest: "A little rest feels good.",
};
const previews: Record<string, string> = {
  News: "Welcome to your new room! Open the phone to visit your class plaza or find your study activities. Class news publishing will be added later.",
  Notifications:
    "You’re all caught up. Classroom activity notifications will appear here when that feature is connected.",
  History:
    "Your points ledger is planned for a later update. No earned transactions have been recorded in this framework.",
  Storeroom: "Your demo furniture and current outfit, together in one place. Purchases and earned inventory will arrive with the full economy.",
  Help: "Click or tap the floor to move your character, or focus the room and use the arrow keys or WASD. Tap a need ring for its status; care actions are in Activities. The room button opens your room switcher. Open More options → Decorate room to arrange furniture.",
};

export function PetRoom({
  onObjectInteraction,
  onFurnitureInteraction,
}: {
  onObjectInteraction?: (event: RoomInteraction) => void;
  onFurnitureInteraction?: (event: FurnitureInteraction) => void;
}) {
  const { state, care, update } = useApp();
  const {wallet}=useWallet(state?.profile);
  const {leaving,navigate}=useSceneNavigation();
  const { appearance, save: saveRoomie } = useRoomie(state?.profile, state?.pet.name);
  const [roomId, setRoomId] = useState<RoomId>("living");
  const [switcher, setSwitcher] = useState(false);
  const [scenePhase, setScenePhase] = useState<"visible" | "out" | "in">(
    "visible",
  );
  const [position, setPosition] = useState(startingPosition);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<RoomieFacing>("right");
  const [returning, setReturning] = useState(false);
  const [viewReady, setViewReady] = useState(false);
  const animation = useRef<number | null>(null);
  const currentPosition = useRef(position);
  currentPosition.current = position;
  const [action, setAction] = useState<CareAction | null>(null);
  const [message, setMessage] = useState("Happy to see you");
  const [panel, setPanel] = useState<string | null>(null);
  useEffect(()=>{if(state&&new URLSearchParams(window.location.search).get("inventory")==="1")setPanel("Storeroom");},[state?.profile.id]);
  const [draftName, setDraftName] = useState("");
  const [note, setNote] = useState("");
  const [renameError,setRenameError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const alive = useRef(true);
  const moreButton = useRef<HTMLButtonElement>(null);
  const movingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const careTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const switching = useRef(false);
  const room = rooms.find((r) => r.id === roomId)!;
  const viewKey = state ? `mashroom:room-view:v1:${state.profile.mode}:${state.profile.id}:${state.profile.classId}` : "";
  useEffect(() => {
    if (!viewKey) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(viewKey) || "null");
      if (saved && rooms.some(r => r.id === saved.roomId)) { setRoomId(saved.roomId); setPosition(boundRoomPosition(saved.position, matchMedia("(max-width:600px)").matches ? 29 : 11.224)); if(saved.facing === "front" || saved.facing === "left" || saved.facing === "right") setFacing(saved.facing); }
      if(sessionStorage.getItem("mashroom:return-room")) { setReturning(true); setLoaded(true); sessionStorage.removeItem("mashroom:return-room"); }
    } catch {}
    setViewReady(true);
  }, [viewKey]);
  useEffect(() => { if(viewReady && viewKey)try{sessionStorage.setItem(viewKey,JSON.stringify({roomId,position,facing}));}catch{} },[viewReady,viewKey,roomId,position,facing]);

  useEffect(() => {
    alive.current = true;
    const compact = matchMedia("(max-width: 600px)");
    const fitCharacter = () =>
      setPosition((current) =>
        boundRoomPosition(current, compact.matches ? 29 : 11.224),
      );
    compact.addEventListener("change", fitCharacter);
    const images = ["/rooms/3551a.png", ...roomieArtworkSources, "/plaza.png"].map(
      (src) => {
        const img = new window.Image();
        img.src = assetHref(src);
        return img.decode().catch(() => {});
      },
    );
    const fallback = setTimeout(() => setLoaded(true), 3500);
    void Promise.all(images).then(() => {
      if (alive.current) setLoaded(true);
    });
    return () => {
      alive.current = false;
      compact.removeEventListener("change", fitCharacter);
      clearTimeout(fallback);
      if (movingTimer.current) clearTimeout(movingTimer.current);
      if (animation.current !== null) cancelAnimationFrame(animation.current);
      if (careTimer.current) clearTimeout(careTimer.current);
      switchTimers.current.forEach(clearTimeout);
    };
  }, []);

  if (!state) return null;
  const pet = state.pet;
  const doCare = (next: CareAction) => {
    care(next);
    setAction(next);
    setMessage(careMessages[next]);
    if (careTimer.current) clearTimeout(careTimer.current);
    careTimer.current = setTimeout(() => {
      setAction(null);
      setMessage("Enjoying the little things");
    }, 2000);
  };
  const move = (target: RoomPosition) => {
    if (editing || switcher || switching.current) return;
    const next = boundRoomPosition(
        target,
        matchMedia("(max-width: 600px)").matches ? 29 : 11.224,
      );
    const from = currentPosition.current;
    if (next.x === from.x && next.y === from.y) return;
    setFacing(previous => movementFacing(from, next, previous));
    if(animation.current !== null)cancelAnimationFrame(animation.current);
    if(matchMedia("(prefers-reduced-motion:reduce)").matches){setPosition(next);setWalking(false);return;}
    setWalking(true);
    const start=performance.now(),duration=Math.min(800,Math.max(200,Math.hypot(next.x-from.x,next.y-from.y)*25));
    const step=(now:number)=>{const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);setPosition({x:from.x+(next.x-from.x)*ease,y:from.y+(next.y-from.y)*ease});if(t<1)animation.current=requestAnimationFrame(step);else{animation.current=null;setWalking(false);}};
    animation.current=requestAnimationFrame(step);
  };
  const switchRoom = (next: RoomId) => {
    setSwitcher(false);
    if (next === roomId || switching.current) return;
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 800;
    switching.current = true;
    setScenePhase("out");
    setWalking(false);
    if(animation.current!==null)cancelAnimationFrame(animation.current);
    switchTimers.current.forEach(clearTimeout);
    switchTimers.current = [
      setTimeout(() => {
        setRoomId(next);
        setPosition(startingPosition);
        setScenePhase("in");
        setMessage(`Exploring the ${rooms.find((r) => r.id === next)!.name}`);
        switchTimers.current.push(
          setTimeout(() => {
            setScenePhase("visible");
            switching.current = false;
          }, duration + 50),
        );
      }, duration),
    ];
  };
  const moveKey = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-3, 0],
      a: [-3, 0],
      ArrowRight: [3, 0],
      d: [3, 0],
      ArrowUp: [0, -2],
      w: [0, -2],
      ArrowDown: [0, 2],
      s: [0, 2],
    };
    const direction = delta[event.key];
    if (!direction) return;
    event.preventDefault();
    move({ x: position.x + direction[0], y: position.y + direction[1] });
  };
  const openPanel = (name: string) => {
    if (name === "Rename") { setDraftName(pet.name);setRenameError(""); }
    setPanel(current=>current===name?null:name);
  };
  const mood =
    Math.min(...needs.map((n) => pet[n.key])) < 25
      ? "in need of care"
      : pet.happiness >= 50
        ? "happy"
        : "a little bored";

  return (
    <Popover open={panel!==null&&panel!=="Storeroom"} onOpenChange={open=>!open&&setPanel(null)}><main
      className={styles.world}
      data-loaded={loaded}
      data-returning={returning}
      data-editing={editing}
      data-leaving={leaving}
      data-room-phase={scenePhase}
      aria-label="Your pet room"
    >
      <div className={styles.fadePage}>
        <div className={styles.adoption}>
          <AdoptPet />
        </div>
        <section
          className={styles.scene}
          tabIndex={0}
          aria-label="Room floor: tap to move, or use arrow keys"
          onKeyDown={moveKey}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            const rect = event.currentTarget.getBoundingClientRect();
            move({
              x: ((event.clientX - rect.left) / rect.width) * 100,
              y: ((event.clientY - rect.top) / rect.height) * 100,
            });
          }}
        >
          <div
            className={styles.roomVisual}
            data-phase={scenePhase}
            data-room={roomId}
          >
            <div className={styles.backgroundFrame}>
              <Image
                unoptimized
                src={room.image}
                alt=""
                width={1448}
                height={1086}
                className={styles.background}
                priority
              />
              <div
                className={styles.lighting}
                style={{ background: room.lighting }}
              />
            </div>
            <RoomDecorator
              key={`${state.profile.mode}:${state.profile.id}:${state.profile.classId}`}
              profile={state.profile}
              roomId={roomId}
              editing={editing}
              characterY={position.y}
              onFurnitureInteraction={onFurnitureInteraction}
              onFinish={() => {
                setEditing(false);
                moreButton.current?.focus({ preventScroll: true });
              }}
              character={(layer) => <div
              className={styles.characterPosition}
              style={{ left: `${position.x}%`, bottom: `${100 - position.y}%`, zIndex: layer }}
              data-walking={walking}
            >
              <div
                className={styles.characterMotion}
                data-action={action || "idle"}
              >
                <RoomieRenderer appearance={appearance} facing={walking ? facing : "front"} walking={walking} label={`${pet.name}, your room character`} className={styles.character}/>
                {action && (
                  <span className={styles.careBubble} role="status">
                    {careMessages[action]}
                  </span>
                )}
              </div>
            </div>}
            />
            {/* Future furniture registers accessible hotspots and care actions
                in lib/pet-room.ts; integrations receive the same event contract. */}
            {room.objects.map((object) => (
              <Button
                key={object.id}
                className={styles.object}
                style={{
                  left: `${object.position.x}%`,
                  top: `${object.position.y}%`,
                }}
                onClick={() => {
                  if (object.action) doCare(object.action);
                  onObjectInteraction?.({ roomId, object });
                }}
              >
                {object.label}
              </Button>
            ))}
          </div>
        </section>
        <header className={styles.topbar}>
          <Link href="/" className={styles.home} aria-label="MashRoom home">
            <Image
              unoptimized
              src="/landing/logo.png"
              width={93}
              height={62}
              alt=""
            />
          </Link>
          <strong className={styles.fullName}>{state.profile.name}</strong>
          <span className={styles.liveStatus} role="status">
            {message}
          </span>
          <span className={styles.rollingNews}>
            A little care goes a long way
          </span>
          <PopoverAnchor asChild><nav className={styles.topActions} aria-label="Room navigation">
            <Button
              variant="ghost"
              aria-label="Classroom"
              title="Classroom"
              onClick={()=>openPanel("Classroom")}
            >
                <RoomIcon file="49f16.svg" />
            </Button>
            <Button
              variant="ghost"
              aria-label="Notes"
              title="Notes"
              onClick={() => openPanel("Notes")}
            >
              <RoomIcon file="7cd28.svg" />
            </Button>
            <Button
              variant="ghost"
              aria-label="News"
              title="News"
              onClick={() => openPanel("News")}
            >
              <RoomIcon file="8877d.svg" />
            </Button>
            <Button
              variant="ghost"
              aria-label="Activities"
              title="Activities"
              onClick={() => openPanel("Activities")}
            >
              <RoomIcon file="a5bf3.svg" />
            </Button>
            <Button
              variant="ghost"
              aria-label="Notifications"
              title="Notifications"
              onClick={() => openPanel("Notifications")}
            >
              <RoomIcon file="17ebb.svg" />
            </Button>
            <Button
              variant="ghost"
              aria-label="More options"
              ref={moreButton}
              title="More options"
              onClick={() => openPanel("More options")}
            >
              <RoomIcon file="9ff62.svg" className={styles.moreIcon} />
            </Button>
          </nav></PopoverAnchor>
        </header>
        <aside
          className={styles.needsArea}
          aria-label="Pet care"
          data-switcher-open={switcher}
        >
          <Popover open={switcher} onOpenChange={setSwitcher}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={styles.roomButton}
                aria-label="Switch room"
                title={`Current room: ${room.name}`}
              >
                <RoomIcon file="00432.svg" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={-16}
              avoidCollisions={false}
              collisionPadding={12}
              className={styles.roomMenu}
              aria-label="Room switcher"
            >
              <div className={styles.currentRoom}>
                <span>You are at the</span>
                <strong>{room.name}</strong>
              </div>
              {rooms
                .filter((r) => r.id !== roomId)
                .map((r) => (
                  <Button
                    key={r.id}
                    variant="ghost"
                    className={styles.roomChoice}
                    onClick={() => switchRoom(r.id)}
                  >
                    {r.name}
                  </Button>
                ))}
            </PopoverContent>
          </Popover>
          <div className={styles.needsUnderlay} inert={switcher}>
            <Button
              variant="ghost"
              className={styles.nameCard}
              onClick={() => openPanel("Rename")}
              aria-label={`Rename ${pet.name}`}
            >
              <strong>{pet.name}</strong>
              <span>
                is feeling <b>{mood}</b>
              </span>
            </Button>
            <div className={styles.rings} aria-label="Needs">
              {needs.map((need) => (
                <NeedRing key={need.key} need={need} value={pet[need.key]} />
              ))}
            </div>
          </div>
        </aside>
        <div className={styles.phoneSlot}>
          <RoomPhone
            key={`${state.profile.mode}:${state.profile.id}:${state.profile.classId}`}
            profile={state.profile}
            onApp={openPanel}
            onNavigate={navigate}
          />
        </div>
        <Button
          variant="ghost"
          className={styles.moveHelp}
          onClick={() => openPanel("Help")}
        >
          Move with a tap or arrow keys <span>?</span>
        </Button>
      </div>
        <PopoverContent side="bottom" align="end" sideOffset={14} collisionPadding={16} className={styles.utilityDialog} aria-labelledby="room-control-title" onCloseAutoFocus={event=>{event.preventDefault();moreButton.current?.focus({preventScroll:true});}}>
          <button type="button" className={styles.closePanel} aria-label="Close room panel" onClick={()=>setPanel(null)}>×</button>
          <h2 id="room-control-title">
            {panel === "Rename" ? "A name of their own" : panel}
          </h2>
          <p className={styles.panelDescription}>
            {panel === "Rename"
              ? "Give your roomie a name."
              : panel === "Notes"
                ? "A scratchpad for this visit. Notes are not saved or shared."
                : panel === "Food" || panel === "Activities"
                  ? "A little care makes a big difference."
                  : previews[panel || ""] || "Your MashRoom shortcuts."}
          </p>
          {panel==="Classroom"&&<><p>Open your class to see its activities and learning space.</p><Button asChild variant="outline"><Link href="/classroom">Open classroom</Link></Button></>}
          {panel === "Rename" && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!draftName.trim()) return;
                try { saveRoomie({...appearance,name:draftName.trim().slice(0,24)}); } catch { setRenameError("Could not save the name. Your draft is still here; free browser space and try again.");return; }
                update((s) => ({
                  ...s,
                  pet: { ...s.pet, name: draftName.trim().slice(0, 24) },
                }));
                setPanel(null);
              }}
            >
              <Input
                aria-label="Pet name"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                maxLength={24}
                required
              />
              <Button className="primary-button full" type="submit">
                Save name
              </Button>
              {renameError&&<p role="alert">{renameError}</p>}
            </form>
          )}
          {panel === "Notes" && (
            <textarea
              aria-label="Personal notes"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="A little idea to remember…"
            />
          )}
          {(panel === "Food" || panel === "Activities") && (
            <div className={styles.careActions}>
              {needs
                .filter((n) => panel !== "Food" || n.key === "hunger")
                .map((n) => (
                  <Button
                    variant="outline"
                    key={n.key}
                    onClick={() => {
                      doCare(n.action);
                      setPanel(null);
                    }}
                  >
                    {n.verb}
                  </Button>
                ))}
            </div>
          )}
          {(panel === "Bank" || panel === "Wallet") && (
            <><p>{wallet?.points??"—"} demo points · {wallet?.tokens??0} arcade tokens</p><p>Device-local wallet, separate from classroom-earned rewards. {wallet?.receipts.length??0} Shop purchases. Arcade game redemption is not connected yet.</p><Button asChild variant="outline"><Link href="/shop">Open Shop & receipts</Link></Button></>
          )}
          {panel === "More options" && (
            <><BgmControls /><div className={styles.careActions}>
              <Button
                variant="outline"
                onClick={() => {
                  setPanel(null);
                  setSwitcher(false);
                  setEditing(true);
                }}
              >
                Decorate room
              </Button>
              {[
                ["/plaza", "Student plaza"],
                ["/chat", "Class chat"],
                ["/settings", "Settings"],
                ["/", "Welcome screen"],
              ].map(([href, label]) => (
                <Button key={href} asChild variant="outline">
                  <Link href={href}>{label}</Link>
                </Button>
              ))}
            </div></>
          )}
        </PopoverContent>
      <Storeroom open={panel === "Storeroom"} onOpenChange={open => { if (!open) setPanel(null); }} appearance={appearance} onDecorate={() => { setPanel(null); setSwitcher(false); setEditing(true); }} />
    </main></Popover>
  );
}
