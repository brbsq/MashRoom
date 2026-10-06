"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Leaf, ArrowLeft, Sparkles } from "lucide-react";
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
    <main className="login-page">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <Leaf />
        </span>
        MashRoom.
      </Link>
      <div className="login-layout">
        <div className="login-art">
          <span className="small-pill">
            <Sparkles size={15} /> YOUR NEW CHAPTER
          </span>
          <h1>
            A little hello.
            <br />
            <em>A lot to discover.</em>
          </h1>
          <Image
            unoptimized
            width={1254}
            height={1254}
            src="/pet.png"
            alt="Mochi waving hello"
            className="float"
          />
          <p>Your little buddy is ready when you are.</p>
        </div>
        <section className="glass login-card">
          <span className="eyebrow">COME ON IN</span>
          <h2>Welcome to MashRoom</h2>
          <p>Pick a name. Find your class. Make yourself at home.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim().length < 2) return;
              start(name.trim(), classId);
              router.push("/pet");
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
