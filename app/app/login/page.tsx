"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/components/mashroom/provider";
import { classes } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { releaseLabel, buildDescription } from "@/lib/build-version";
import styles from "./login.module.css";
export default function Login() {
  const router = useRouter();
  const { state, start, google } = useApp();
  const [name, setName] = useState(""),
    [classId, setClassId] = useState("willow");
  useEffect(() => {
    const code = new URLSearchParams(location.search).get("connection");
    if (code)
      toast.info(
        code === "cancelled"
          ? "Google sign-in was cancelled. You can still try the demo."
          : code === "unconfigured"
            ? "Google connection needs setup. The demo is ready to play."
            : "We couldn't complete Google sign-in. Please try again.",
      );
  }, []);
  return (
    <main className={`login-page ${styles.page}`}>
      <div className={styles.background} aria-hidden="true"><Image src="/landing/room.png" width={1254} height={1254} alt="" priority unoptimized/></div>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="MashRoom home"><Image src="/landing/logo.png" width={1536} height={1024} alt="" unoptimized/><span>MashRoom</span></Link>
        <span className={styles.version} title={buildDescription}>{releaseLabel}</span>
      </header>
      <div className={`login-layout ${styles.layout}`}>
        <div className={`login-art ${styles.art}`}>
          <h1>Hello, Roomie.</h1>
          <Image
            unoptimized
            width={1536}
            height={1024}
            src="/landing/logo.png"
            alt="MashRoom logo"
            priority
            className={styles.heroLogo}
          />
        </div>
        <section className={`glass login-card ${styles.card}`} aria-labelledby="login-heading">
          <h2 id="login-heading">Welcome to MashRoom</h2>
          <p>Pick a name. Find your class. Make yourself at home.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim().length < 2) return;
              start(name.trim(), classId);
              router.push(state?.profile.name === name.trim() && state.profile.classId === classId ? "/pet" : "/roomie-maker?initial=1");
            }}
          >
            <label htmlFor="display-name">What should we call you?</label>
            <Input
              id="display-name"
              placeholder="Your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={30}
              required
              autoComplete="nickname"
            />
            <label htmlFor="class-select">Your demo class</label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger id="class-select" className="form-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="primary-button full">
              Try the demo
            </Button>
          </form>
          {state && (
            <Button asChild variant="outline" className="full">
              <Link href="/pet">Continue as {state.profile.name}</Link>
            </Button>
          )}
          <div className="or-divider">or bring your Google account</div>
          <Button
            variant="outline"
            className="google-button google-login-circle"
            aria-label="Continue with Google"
            title="Continue with Google"
            onClick={() => {
              if (!google?.configured)
                toast.info(
                  "Google sign-in is not configured yet. Try the demo to explore everything.",
                );
              else
                window.location.assign(
                  new URL("/api/auth/google/start", location.origin),
                );
            }}
          >
            <span className="google-login-mark" aria-hidden="true" />
          </Button>
          <small>
            No account needed for the demo. You can link Google later.
          </small>
          <Link className="back-link" href="/">
            <ArrowLeft size={14} /> Back to the welcome screen
          </Link>
        </section>
      </div>
    </main>
  );
}
