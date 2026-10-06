"use client";
import { useState } from "react";
import { useApp } from "./provider";
import { loadDemo, defaultPet } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export function AdoptPet() {
  const { google, refreshGoogle } = useApp();
  const [busy, setBusy] = useState(false),
    [dismissed, setDismissed] = useState(false);
  if (!google?.canAdopt || dismissed) return null;
  const adopt = async (fresh = false) => {
    const demo = loadDemo();
    if (!demo && !fresh) {
      setDismissed(true);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet: fresh ? defaultPet() : demo!.pet, adopt: true }),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) throw Error(data.error);
      await refreshGoogle();
      toast.success("Your little buddy is now saved to your account.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="connection-banner">
      <div>
        <h2>Bring your demo pet along?</h2>
        <p>
          Save their name, appearance, and care to this new account. Sample
          points and badges stay in the demo.
        </p>
        <div className="config-actions">
          <Button onClick={() => void adopt()} disabled={busy}>
            {busy ? "Saving…" : "Bring my demo pet"}
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => void adopt(true)}>
            Start fresh instead
          </Button>
        </div>
      </div>
    </div>
  );
}
