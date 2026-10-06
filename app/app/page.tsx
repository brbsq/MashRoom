"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/components/mashroom/provider";
import { SparkleTrail } from "@/components/mashroom/sparkle-trail";
import {
  LoginOverlay,
  type LoginRole,
} from "@/components/mashroom/login-overlay";
import { chime } from "@/lib/sound";
import styles from "./welcome.module.css";

const panels = {
  features: {
    title: "A little world of your own",
    description:
      "Care for your pet, wander through the student plaza, and say hello to your class.",
    body: "The current demo includes pet care, shared class chat, quick phrases, and sample Classroom activities. Your demo progress stays on this device. The classmates you meet are simulated.",
  },
  help: {
    title: "Make yourself at home",
    description:
      "Choose Students to start exploring. No account or password is needed for the demo.",
    body: "Enter a display name and choose a sample class. Use the pet care buttons, then explore the plaza by clicking, tapping, or using arrow keys. Google sign-in is optional and requires configuration.",
  },
  credits: {
    title: "Made for little moments of growth",
    description: "MashRoom · alpha build 0.2",
    body: "Home screen design, room illustration, and glossy MashRoom logo supplied through your MashRoom Figma file. Heading type: Google Sans Flex. Built with React and the app’s existing shared components.",
  },
  submissions: {
    title: "Your learning stays connected",
    description: "Assignments and submissions belong in Google Classroom.",
    body: "After a teacher connects Google Classroom and imports a class, verified students can open their assignments from the Classroom page. This demo does not collect homework or grades.",
  },
} as const;
type Panel = keyof typeof panels;

export default function Welcome() {
  const { state } = useApp();
  const [phase, setPhase] = useState<"boot" | "intro" | "entering" | "ready">(
    "boot",
  );
  const [sound, setSound] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [loginRole, setLoginRole] = useState<LoginRole | null>(null);
  const loginTrigger = useRef<HTMLButtonElement | null>(null);
  const root = useRef<HTMLElement>(null);
  const skipped = useRef(false);

  useEffect(() => {
    let disposed = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const later = (fn: () => void, delay: number) => {
      timers.push(
        setTimeout(() => {
          if (!disposed && !skipped.current) fn();
        }, delay),
      );
    };
    const reduce = () => {
      if (motion.matches) {
        skipped.current = true;
        setPhase("ready");
      }
    };
    void Promise.resolve().then(() => {
      if (disposed) return;
      try {
        setSound(localStorage.getItem("mashroom:sound") === "true");
      } catch {
        /* Sound stays optional. */
      }
      reduce();
      if (!motion.matches) {
        // Wait for local artwork and the heading font, with a bounded fallback.
        const assets = [...(root.current?.querySelectorAll("img") ?? [])].map(
          (img) => img.decode().catch(() => {}),
        );
        assets.push(
          document.fonts.load('900 128px "MashRoom Display"').then(() => {}),
        );
        const deadline = new Promise<void>((resolve) => {
          timers.push(setTimeout(resolve, 4000));
        });
        void Promise.race([Promise.all(assets), deadline]).then(() => {
          if (disposed || skipped.current) return;
          setPhase("intro");
          later(() => setPhase("entering"), 1900);
          later(() => setPhase("ready"), 3250);
        });
      }
    });
    motion.addEventListener("change", reduce);
    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      motion.removeEventListener("change", reduce);
    };
  }, []);

  const ready = phase === "ready";
  const skip = () => {
    skipped.current = true;
    setPhase("ready");
  };
  return (
    <main
      ref={root}
      className={styles.welcome}
      data-phase={phase}
      data-login-open={loginRole !== null}
      aria-label="Welcome to MashRoom"
    >
      <div className={styles.roomFrame} aria-hidden="true">
        <Image
          src="/landing/room.png"
          alt=""
          width={1254}
          height={1254}
          priority
          unoptimized
          className={styles.room}
        />
      </div>
      <header className={styles.header} inert={!ready}>
        <div className={`${styles.glass} ${styles.navGlass}`}>
          <span className={styles.version}>version: alpha build 0.2</span>
          <nav aria-label="Welcome navigation">
            {(["features", "help", "credits", "submissions"] as Panel[]).map(
              (item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className={styles.navLink}
                  onClick={() => setPanel(item)}
                >
                  {item}
                </Button>
              ),
            )}
          </nav>
        </div>
        <Button
          className={`${styles.glass} ${styles.login}`}
          variant="ghost"
          onClick={(event) => {
            loginTrigger.current = event.currentTarget;
            setLoginRole("student");
          }}
        >
          Log in here
        </Button>
      </header>

      {/* Shared logo and name move from the intro into their final Figma slots. */}
      <Link
        href="/"
        className={styles.brand}
        aria-label="MashRoom home"
        tabIndex={ready ? 0 : -1}
        onClick={(e) => {
          e.preventDefault();
          if (!ready) skip();
        }}
      >
        <Image
          src="/landing/logo.png"
          alt=""
          width={1536}
          height={1024}
          priority
          unoptimized
          className={styles.logo}
        />
        <span className={styles.brandName}>
          Mash<strong>Room</strong>
        </span>
      </Link>

      <section className={styles.splash} inert={!ready} aria-label="Come on in">
        <h1 className={styles.greeting} aria-label="Hello, Roomie!">
          <span
            className={`${styles.word} ${styles.hello}`}
            tabIndex={ready ? 0 : -1}
          >
            Hello,
          </span>{" "}
          <span
            className={`${styles.word} ${styles.roomie}`}
            tabIndex={ready ? 0 : -1}
          >
            Roomie!
          </span>
        </h1>
        <p className={styles.tagline}>Let’s get started.</p>
        <div className={styles.roles}>
          <Button
            className={`${styles.glass} ${styles.role}`}
            variant="ghost"
            onClick={(event) => {
              loginTrigger.current = event.currentTarget;
              setLoginRole("teacher");
            }}
          >
            Teachers
          </Button>
          <Button
            className={`${styles.glass} ${styles.role}`}
            variant="ghost"
            onClick={(event) => {
              loginTrigger.current = event.currentTarget;
              setLoginRole("student");
            }}
          >
            Students
          </Button>
        </div>
        <Button
          variant="ghost"
          className={`${styles.glass} ${styles.sound}`}
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          onClick={() => {
            setSound(!sound);
            try {
              localStorage.setItem("mashroom:sound", String(!sound));
            } catch {
              /* Sound works for this visit. */
            }
            if (!sound) chime();
          }}
        >
          {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </Button>
      </section>

      {!ready && (
        <Button variant="ghost" className={styles.skip} onClick={skip}>
          Skip intro
        </Button>
      )}
      <span className="sr-only" role="status">
        {ready
          ? "Welcome to MashRoom. Choose Teachers or Students to get started."
          : "Opening MashRoom…"}
      </span>
      <SparkleTrail />
      <LoginOverlay
        role={loginRole}
        onClose={() => setLoginRole(null)}
        onReturnFocus={() => loginTrigger.current?.focus()}
      />

      <Dialog
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
      >
        <DialogContent className={styles.infoDialog}>
          {panel && (
            <>
              <DialogHeader>
                <DialogTitle>{panels[panel].title}</DialogTitle>
                <DialogDescription>
                  {panels[panel].description}
                </DialogDescription>
              </DialogHeader>
              <p>{panels[panel].body}</p>
              {panel === "submissions" && (
                <Button asChild className="primary-button">
                  <Link href={state ? "/classroom" : "/login"}>
                    {state ? "Open Classroom" : "Enter the demo"}
                  </Link>
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
