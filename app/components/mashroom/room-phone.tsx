"use client";
import Link from "next/link";
import { assetHref } from "@/lib/asset";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Dialog,
  DialogPortal,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  phoneModels,
  phoneThemes,
  defaultPhone,
  readPhonePreferences,
  phoneStorageKey,
  type PhonePreferences,
} from "@/lib/phone";
import type { StudentProfile } from "@/lib/types";
import roomStyles from "./pet-room.module.css";
import styles from "./room-phone.module.css";

export function RoomIcon({
  file,
  className = "",
}: {
  file: string;
  className?: string;
}) {
  const size =
    (
      { "8877d.svg": 59, "a5bf3.svg": 55, "17ebb.svg": 53 } as Record<
        string,
        number
      >
    )[file] || 50;
  return (
    <span
      aria-hidden="true"
      className={`${roomStyles.icon} ${className}`}
      style={
        {
          backgroundImage: `url(${assetHref(`/rooms/${file}`)})`,
          "--icon-size": `${size / 19.2}vw`,
        } as CSSProperties
      }
    />
  );
}
const apps = [
  { name: "Study", icon: "92859.svg", href: "/classroom" },
  { name: "Notes", icon: "6fb50.svg" },
  { name: "History", icon: "8027d.svg" },
  { name: "Food", icon: "dccd9.svg" },
  { name: "Map", icon: "c03f8.svg", href: "/plaza" },
  { name: "Store", icon: "c7e81.svg" },
  { name: "Bank", icon: "31c32.svg" },
  { name: "Wallet", icon: "42289.svg" },
  { name: "Wardrobe", icon: "54242.svg" },
];
const dock = [
  { name: "Classmates", icon: "e2657.svg", href: "/plaza" },
  { name: "Chat", icon: "263d1.svg", href: "/chat" },
  { name: "Settings", icon: "ef28f.svg" },
];

export function RoomPhone({
  onApp,
  profile,
}: {
  onApp: (name: string) => void;
  profile: StudentProfile;
}) {
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [view, setView] = useState<"home" | "settings">("home");
  const [preferences, setPreferences] =
    useState<PhonePreferences>(defaultPhone);
  const [notice, setNotice] = useState("");
  const [clock, setClock] = useState({ time: "", date: "" });
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const handingOff = useRef(false);
  const storageKey = phoneStorageKey(profile);
  useEffect(() => {
    try {
      setPreferences(readPhonePreferences(localStorage.getItem(storageKey)));
    } catch {
      setNotice("Appearance cannot be saved in this browser.");
    }
  }, [storageKey]);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock({
        time: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: now.toLocaleDateString([], { day: "numeric", month: "short" }),
      });
    };
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, []);
  // Measure untransformed dimensions, never the animated frame mid-flight.
  const measure = useCallback((node: HTMLDivElement) => {
    const peek = trigger.current?.getBoundingClientRect();
    if (!peek) return;
    const css = getComputedStyle(node);
    const x =
      document.documentElement.clientWidth -
      parseFloat(css.right) -
      node.offsetWidth;
    const y = window.innerHeight - parseFloat(css.bottom) - node.offsetHeight;
    node.style.setProperty("--from-x", `${peek.left - x}px`);
    node.style.setProperty("--from-y", `${peek.top - y}px`);
    node.style.setProperty("--from-scale", `${peek.width / node.offsetWidth}`);
  }, []);
  const attachContent = useCallback(
    (node: HTMLDivElement | null) => {
      content.current = node;
      if (node) measure(node);
    },
    [measure],
  );
  const changeOpen = (next: boolean) => {
    if (next) {
      handingOff.current = false;
      setPresent(true);
    } else if (content.current) measure(content.current);
    setOpen(next);
  };
  const choose = (next: PhonePreferences) => {
    setPreferences(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setNotice("Appearance saved on this device.");
    } catch {
      setNotice("Changed for this visit only; browser storage is unavailable.");
    }
  };
  const launch = (name: string) => {
    if (name === "Settings") {
      setView("settings");
      return;
    }
    handingOff.current = true;
    changeOpen(false);
    onApp(name);
  };
  function action(
    preview: boolean,
    label: string,
    className: string,
    children: ReactNode,
    run: () => void,
    href?: string,
  ) {
    if (preview) return <span className={className}>{children}</span>;
    if (href)
      return (
        <Link className={className} aria-label={label} href={href}>
          {children}
        </Link>
      );
    return (
      <button
        type="button"
        className={className}
        aria-label={label}
        onClick={run}
      >
        {children}
      </button>
    );
  }
  const screen = (preview: boolean) => (
    <div className={styles.screen}>
      <div className={styles.clock}>
        <span>{clock.time}</span>
        <span>{clock.date}</span>
      </div>
      {view === "home" ? (
        <>
          <div className={styles.apps}>
            {apps.map((app) => (
              <div key={app.name}>
                {action(
                  preview,
                  app.name,
                  styles.app,
                  <>
                    <RoomIcon file={app.icon} />
                    <span>{app.name}</span>
                  </>,
                  () => launch(app.name),
                  app.href,
                )}
              </div>
            ))}
          </div>
          <div className={styles.dots} aria-hidden="true">
            ● ○ ○
          </div>
          <div
            className={styles.dock}
            aria-label={preview ? undefined : "Phone shortcuts"}
          >
            {dock.map((app) => (
              <div key={app.name}>
                {action(
                  preview,
                  app.name,
                  styles.dockApp,
                  <>
                    <RoomIcon file={app.icon} />
                    <span>{app.name}</span>
                  </>,
                  () => launch(app.name),
                  app.href,
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.settings}>
          {action(preview, "Back to phone home", styles.back, <>‹ Home</>, () =>
            setView("home"),
          )}
          <h2>Make it yours</h2>
          <p>Your phone, your little world.</p>
          <fieldset>
            <legend>Device model</legend>
            {phoneModels.map((model) => (
              <div key={model.id}>
                {preview ? (
                  <span
                    className={styles.choice}
                    data-active={preferences.model === model.id}
                  >
                    <strong>{model.name}</strong>
                    <small>{model.description}</small>
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.choice}
                    aria-pressed={preferences.model === model.id}
                    data-active={preferences.model === model.id}
                    onClick={() => choose({ ...preferences, model: model.id })}
                  >
                    <strong>{model.name}</strong>
                    <small>{model.description}</small>
                  </button>
                )}
              </div>
            ))}
          </fieldset>
          <fieldset>
            <legend>Theme</legend>
            <div className={styles.themes}>
              {phoneThemes.map((theme) => (
                <div key={theme.id}>
                  {preview ? (
                    <span
                      className={styles.swatch}
                      data-theme={theme.id}
                      data-active={preferences.theme === theme.id}
                    >
                      {theme.name}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={styles.swatch}
                      data-theme={theme.id}
                      data-active={preferences.theme === theme.id}
                      aria-pressed={preferences.theme === theme.id}
                      onClick={() =>
                        choose({ ...preferences, theme: theme.id })
                      }
                    >
                      {theme.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
          <p className={styles.caption}>
            Both styles have no camera cutout. The 18 Pro style is a custom
            concept.
          </p>
          {action(
            preview,
            "Account and class settings",
            styles.account,
            <>Account & class settings ↗</>,
            () => {},
            "/settings",
          )}
          <p className={styles.notice} role={preview ? undefined : "status"}>
            {notice || "Saved only on this device."}
          </p>
        </div>
      )}
      <span className={styles.homeBar} aria-hidden="true" />
    </div>
  );
  const hardware = (
    <>
      <i className={styles.speaker} aria-hidden="true" />
      <i className={styles.homeButton} aria-hidden="true" />
    </>
  );
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <button
          ref={trigger}
          type="button"
          className={styles.peek}
          aria-label="Open phone"
          data-present={present}
          data-model={preferences.model}
        >
          <span
            className={styles.device}
            data-model={preferences.model}
            data-theme={preferences.theme}
            aria-hidden="true"
          >
            {hardware}
            {screen(true)}
          </span>
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content
          ref={attachContent}
          className={styles.shell}
          data-model={preferences.model}
          aria-label="MashRoom phone"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && !open)
              setPresent(false);
          }}
          onCloseAutoFocus={(event) => {
            if (handingOff.current) event.preventDefault();
          }}
        >
          <DialogTitle className="sr-only">MashRoom phone</DialogTitle>
          <DialogDescription className="sr-only">
            Phone apps and appearance settings. Click outside the phone or on
            its bezel to close it, or press Escape.
          </DialogDescription>
          <div
            className={styles.device}
            data-model={preferences.model}
            data-theme={preferences.theme}
          >
            <button
              type="button"
              className={styles.bezel}
              aria-label="Close phone using bezel"
              onClick={() => changeOpen(false)}
            />
            {hardware}
            {screen(false)}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
