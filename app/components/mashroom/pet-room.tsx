"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useApp } from "./provider";
import { AdoptPet } from "./google-controls";
import { NeedRing } from "./need-ring";
import { RoomDecorator } from "./room-decorator";
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
  Store:
    "The cosmetics store is coming later. No points will be spent from this preview.",
  Wardrobe:
    "Your character’s wardrobe will live here. Clothing purchases and outfit changes are coming later.",
  Help: "Click or tap the floor to move your character, or focus the room and use the arrow keys or WASD. Tap a need ring for its status; care actions are in Activities. The room button opens your room switcher. Open More options → Decorate room to arrange furniture.",
};

export function PetRoom({
  onObjectInteraction,
}: {
  onObjectInteraction?: (event: RoomInteraction) => void;
}) {
  const { state, care, update } = useApp();
  const [roomId, setRoomId] = useState<RoomId>("living");
  const [switcher, setSwitcher] = useState(false);
  const [scenePhase, setScenePhase] = useState<"visible" | "out" | "in">(
    "visible",
  );
  const [position, setPosition] = useState(startingPosition);
  const [walking, setWalking] = useState(false);
  const [action, setAction] = useState<CareAction | null>(null);
  const [message, setMessage] = useState("Happy to see you");
  const [panel, setPanel] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const alive = useRef(true);
  const moreButton = useRef<HTMLButtonElement>(null);
  const movingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const careTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const switching = useRef(false);
  const room = rooms.find((r) => r.id === roomId)!;

  useEffect(() => {
    alive.current = true;
    const compact = matchMedia("(max-width: 600px)");
    const fitCharacter = () =>
      setPosition((current) =>
        boundRoomPosition(current, compact.matches ? 29 : 11.224),
      );
    compact.addEventListener("change", fitCharacter);
    const images = ["/rooms/3551a.png", "/rooms/cd2bd.png", "/plaza.png"].map(
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
    setPosition(
      boundRoomPosition(
        target,
        matchMedia("(max-width: 600px)").matches ? 29 : 11.224,
      ),
    );
    setWalking(true);
    if (movingTimer.current) clearTimeout(movingTimer.current);
    movingTimer.current = setTimeout(() => setWalking(false), 800);
  };
  const switchRoom = (next: RoomId) => {
    setSwitcher(false);
    if (next === roomId || switching.current) return;
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 320;
    switching.current = true;
    setScenePhase("out");
    setWalking(false);
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
    if (name === "Rename") setDraftName(pet.name);
    setPanel(name);
  };
  const mood =
    Math.min(...needs.map((n) => pet[n.key])) < 25
      ? "in need of care"
      : pet.happiness >= 50
        ? "happy"
        : "a little bored";

  return (
    <main
      className={styles.world}
      data-loaded={loaded}
      data-editing={editing}
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
              onFinish={() => {
                setEditing(false);
                moreButton.current?.focus({ preventScroll: true });
              }}
            />
            <div
              className={styles.characterPosition}
              style={{ left: `${position.x}%`, bottom: `${100 - position.y}%` }}
              data-walking={walking}
            >
              <div
                className={styles.characterMotion}
                data-action={action || "idle"}
              >
                <Image
                  unoptimized
                  src="/rooms/cd2bd.png"
                  width={941}
                  height={1671}
                  alt={`${pet.name}, your room character`}
                  className={styles.character}
                  priority
                />
                {action && (
                  <span className={styles.careBubble} role="status">
                    {careMessages[action]}
                  </span>
                )}
              </div>
            </div>
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
          <nav className={styles.topActions} aria-label="Room navigation">
            <Button
              asChild
              variant="ghost"
              aria-label="Classroom"
              title="Classroom"
            >
              <Link href="/classroom">
                <RoomIcon file="49f16.svg" />
              </Link>
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
          </nav>
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
          <div className={styles.roomCaption} aria-live="polite">
            {room.name}
            <span>
              {state.profile.mode === "demo"
                ? "device-local demo"
                : "connected profile"}
            </span>
          </div>
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
      <Dialog
        open={panel !== null}
        onOpenChange={(open) => !open && setPanel(null)}
      >
        <DialogContent className={styles.utilityDialog}>
          <DialogTitle>
            {panel === "Rename" ? "A name of their own" : panel}
          </DialogTitle>
          <DialogDescription>
            {panel === "Rename"
              ? "Give your roomie a name."
              : panel === "Notes"
                ? "A scratchpad for this visit. Notes are not saved or shared."
                : panel === "Food" || panel === "Activities"
                  ? "A little care makes a big difference."
                  : previews[panel || ""] || "Your MashRoom shortcuts."}
          </DialogDescription>
          {panel === "Rename" && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!draftName.trim()) return;
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
            <p>
              {state.profile.mode === "demo"
                ? "250 sample points · A kind beginning (sample badge). These are demo displays, not earned rewards."
                : "0 earned points. Your real points and achievements will appear here when the economy is available."}
            </p>
          )}
          {panel === "More options" && (
            <div className={styles.careActions}>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
