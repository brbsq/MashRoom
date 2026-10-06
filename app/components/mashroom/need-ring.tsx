"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { needTone, needValue, type Need } from "@/lib/pet-room";
import styles from "./pet-room.module.css";
import { assetHref } from "@/lib/asset";

export function NeedRing({ need, value }: { need: Need; value: number }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fromHover = useRef(false);
  const pinned = useRef(false);
  const changeOpen = (next: boolean) => {
    if (!next) {
      pinned.current = false;
      fromHover.current = false;
    }
    setOpen(next);
  };
  const cancelClose = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const closeSoon = () => {
    if (pinned.current) return;
    cancelClose();
    timer.current = setTimeout(() => changeOpen(false), 180);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const percent = needValue(value);
  const tone = needTone(percent);
  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={styles.needRing}
          data-tone={tone}
          aria-label={`${need.label}: ${percent}%`}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") {
              cancelClose();
              fromHover.current = true;
              setOpen(true);
            }
          }}
          onClick={(event) => {
            // A click pins an already-hovered popup instead of closing it.
            event.preventDefault();
            cancelClose();
            const next = fromHover.current || !open;
            pinned.current = next;
            fromHover.current = false;
            changeOpen(next);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") closeSoon();
          }}
        >
          {/* Live data replaces the fixed blue 75% sample, retaining its geometry. */}
          <svg
            viewBox="0 0 100 100"
            className={styles.ringArc}
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#ffffff50"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              pathLength="100"
              strokeDasharray={`${percent} 100`}
              strokeLinecap={percent === 0 ? "butt" : "round"}
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="#ffffffa0"
              strokeWidth="1.5"
            />
          </svg>
          <span
            className={styles.needIcon}
            aria-hidden="true"
            style={{
              maskImage: `url(${assetHref(`/rooms/${need.icon}`)})`,
              WebkitMaskImage: `url(${assetHref(`/rooms/${need.icon}`)})`,
            }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={12}
        collisionPadding={16}
        className={styles.needPopup}
        aria-label={`${need.label} status`}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onPointerEnter={cancelClose}
        onPointerLeave={closeSoon}
      >
        <strong>
          {need.label} <span>{percent}%</span>
        </strong>
        <p>
          {percent >= 50 ? need.good : need.low}
          {tone === "red" ? " — needs attention." : "."}
        </p>
      </PopoverContent>
    </Popover>
  );
}
