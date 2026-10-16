"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { needTone, needValue, type Need } from "@/lib/pet-room";
import styles from "./pet-room.module.css";
import { assetHref } from "@/lib/asset";

export function NeedRing({ need, value }: { need: Need; value: number }) {
  const [open, setOpen] = useState(false);
  const [clickedAt,setClickedAt]=useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinned = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const popupId = useId();
  const changeOpen = (next: boolean) => {
    if (!next) {
      pinned.current = false;
    }
    setOpen(next);
  };
  const cancelClose = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const closeSoon = () => {
    if (pinned.current) return;
    cancelClose();
    timer.current = setTimeout(() => { if (!pinned.current) changeOpen(false); }, 180);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if(!open)return;
    const dismiss=setTimeout(()=>changeOpen(false),3000);
    return()=>clearTimeout(dismiss);
  },[open,clickedAt]);
  const percent = needValue(value);
  const tone = needTone(percent);
  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverAnchor asChild>
        <Button
          variant="ghost"
          className={styles.needRing}
          data-tone={tone}
          ref={trigger}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popupId : undefined}
          aria-label={`${need.label}: ${percent}%`}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") {
              cancelClose();
              setOpen(true);
            }
          }}
          onClick={(event) => {
            // A click keeps a hovered popup briefly; it always dismisses.
            event.preventDefault();
            cancelClose();
            setClickedAt(value=>value+1);
            const next = !pinned.current;
            pinned.current = next;
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
              ...(need.key === "bladder" ? { maskSize: "93.75%", WebkitMaskSize: "93.75%" } : {}),
            }}
          />
        </Button>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        sideOffset={12}
        collisionPadding={16}
        className={styles.needPopup}
        id={popupId}
        aria-label={`${need.label} status`}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => { if (trigger.current?.contains(event.target as Node)) event.preventDefault(); }}
        onPointerEnter={cancelClose}
        onPointerLeave={closeSoon}
      >
        <strong>
          {need.label} <span>{percent}%</span>
        </strong>
      </PopoverContent>
    </Popover>
  );
}
