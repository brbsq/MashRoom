"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "./provider";
import styles from "./login-overlay.module.css";

export type LoginRole = "teacher" | "student";

export function LoginOverlay({
  role,
  onClose,
  onReturnFocus,
}: {
  role: LoginRole | null;
  onClose: () => void;
  onReturnFocus: () => void;
}) {
  const content = useRef<HTMLDivElement>(null);
  const [lastRole, setLastRole] = useState<LoginRole>("student");
  if (role && role !== lastRole) setLastRole(role);
  return (
    <Dialog open={role !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={content}
        className={styles.dialog}
        overlayClassName={styles.backdrop}
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          content.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onReturnFocus();
        }}
      >
        {/* Mount a fresh form on every opening; never retain a password. */}
        <LoginForm key={lastRole} role={lastRole} />
      </DialogContent>
    </Dialog>
  );
}

function LoginForm({ role }: { role: LoginRole }) {
  const { google } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className={styles.stage} data-login-role={role}>
      <div className={styles.glass} aria-hidden="true" />
      <div className={styles.brand} aria-label="MashRoom">
        <Image
          src="/landing/logo.png"
          alt=""
          width={1536}
          height={1024}
          unoptimized
          className={styles.logo}
        />
        <span className={styles.wordmark} aria-hidden="true">
          Mash<strong>Room</strong>
        </span>
      </div>
      <DialogTitle className={styles.title}>
        {role === "teacher" ? "Teachers’ Panel" : "Students’ Panel"}
      </DialogTitle>
      <DialogDescription className="sr-only">
        Sign in with Google, or try the account-free demo. Username and password
        sign-in is a design preview and is not connected yet. Choosing a panel
        does not grant classroom permissions.
      </DialogDescription>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          // No password backend exists: never send or persist these values.
          setPassword("");
          setMessage(
            "Password sign-in isn’t available in this demo. Continue with Google or try the demo below.",
          );
        }}
      >
        <label htmlFor={`${role}-username`} className="sr-only">
          Username or email
        </label>
        <Input
          id={`${role}-username`}
          className={`${styles.field} ${styles.username}`}
          placeholder="username / email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <label htmlFor={`${role}-password`} className="sr-only">
          Password
        </label>
        <Input
          id={`${role}-password`}
          className={`${styles.field} ${styles.password}`}
          type="password"
          placeholder="password"
          autoComplete="current-password"
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            className={`${styles.iconButton} ${styles.google}`}
            aria-label="Continue with Google"
            onClick={() => {
              setPassword("");
              if (!google?.configured) {
                setMessage(
                  "Google sign-in needs setup. You can still try the demo below—no account needed.",
                );
                return;
              }
              // Panel selection is presentation only, never an authority claim.
              window.location.assign(
                new URL("/api/auth/google/start", window.location.origin),
              );
            }}
          >
            <Image
              src="/login/google.png"
              alt=""
              width={60}
              height={60}
              unoptimized
            />
          </Button>
          <Button
            type="submit"
            variant="ghost"
            className={`${styles.iconButton} ${styles.submit}`}
            aria-label={`Sign in as ${role}`}
          >
            <Image
              src="/login/arrow.png"
              alt=""
              width={85}
              height={85}
              unoptimized
            />
          </Button>
        </div>
        <p className={styles.status} role="status" aria-live="polite">
          {message}
        </p>
      </form>
      <Link className={styles.demo} href="/login">
        No account? Try the demo
      </Link>
      <Button
        type="button"
        variant="ghost"
        className={styles.reset}
        onClick={() => {
          setPassword("");
          setMessage(
            "Password reset isn’t configured. Google users manage their password with Google; the demo needs no password.",
          );
        }}
      >
        reset password
      </Button>
      <DialogClose asChild>
        <Button
          type="button"
          variant="ghost"
          className={styles.close}
          aria-label="Close login"
        >
          <Image
            src="/login/close.png"
            alt=""
            width={70}
            height={70}
            unoptimized
          />
        </Button>
      </DialogClose>
    </div>
  );
}
