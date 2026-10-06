"use client";
import { useEffect, useRef } from "react";
import { useApp } from "./provider";
import type { CareAction } from "@/lib/types";
type Context = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: object;
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function AgentTools() {
  const app = useApp();
  const current = useRef(app);
  useEffect(() => {
    current.current = app;
  }, [app]);
  const id = app.state?.profile.id;
  useEffect(() => {
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context?.registerTool || !id) return;
    const lifecycle = new AbortController();
    const register = (tool: Parameters<Context["registerTool"]>[0]) => {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {
        /* Optional browser capability. */
      }
    };
    register({
      name: "read_pet_status",
      description: "Read the current pet's name and care needs.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: () => current.current.state?.pet || null,
    });
    register({
      name: "care_for_demo_pet",
      description:
        "Feed, shower, play with, or rest the current demo pet. Changes the same care meters as the visible buttons. Demo only.",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["feed", "shower", "play", "sleep"] },
        },
        required: ["action"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input) => {
        const action = (input as { action?: CareAction })?.action;
        if (!action || !["feed", "shower", "play", "sleep"].includes(action))
          throw Error("Choose a valid care action.");
        if (current.current.state?.profile.mode !== "demo")
          throw Error("This action is available in the demo only.");
        current.current.care(action);
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        return current.current.state?.pet;
      },
    });
    return () => lifecycle.abort();
  }, [id]);
  return null;
}
