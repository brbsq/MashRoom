import type { DecorKind } from "@/lib/room-decor";

// Original code-native illustrations; no external images or upload permissions.
export function DecorArt({ kind }: { kind: DecorKind }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {kind === "sofa" && (
        <>
          <ellipse
            cx="100"
            cy="168"
            rx="85"
            ry="10"
            fill="#674631"
            opacity=".15"
          />
          <path
            d="M35 148v20m130-20v20"
            stroke="#986847"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <rect x="23" y="53" width="154" height="100" rx="32" fill="#9a9bc4" />
          <rect x="33" y="62" width="65" height="62" rx="22" fill="#c8c7e9" />
          <rect x="102" y="62" width="65" height="62" rx="22" fill="#b8b8dd" />
          <rect x="23" y="111" width="154" height="43" rx="18" fill="#b5b3d7" />
          <rect x="12" y="99" width="28" height="58" rx="14" fill="#d1cfea" />
          <rect x="160" y="99" width="28" height="58" rx="14" fill="#c4c2e2" />
          <rect
            x="47"
            y="83"
            width="35"
            height="35"
            rx="10"
            transform="rotate(-10 64 100)"
            fill="#f5dca9"
          />
        </>
      )}
      {kind === "table" && (
        <>
          <ellipse
            cx="100"
            cy="170"
            rx="65"
            ry="10"
            fill="#674631"
            opacity=".15"
          />
          <path
            d="M57 110l-8 56m94-56 8 56m-51-55v52"
            stroke="#a77955"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <ellipse cx="100" cy="106" rx="82" ry="36" fill="#c79c76" />
          <ellipse cx="100" cy="98" rx="82" ry="34" fill="#f3d6b4" />
          <ellipse cx="99" cy="91" rx="28" ry="11" fill="#e4bea0" />
          <path d="M82 83h31v15c0 12-31 12-31 0z" fill="#fbf6df" />
          <path
            d="M113 87c19-6 19 19 0 14"
            fill="none"
            stroke="#fbf6df"
            strokeWidth="6"
          />
        </>
      )}
      {kind === "shelf" && (
        <>
          <rect x="39" y="23" width="122" height="157" rx="12" fill="#b88f6a" />
          <rect x="48" y="33" width="104" height="136" rx="5" fill="#ddbc94" />
          <path d="M45 80h110M45 125h110" stroke="#a77955" strokeWidth="8" />
          <path
            d="M60 76V47m13 29V41m15 35V49m18 26-8-26M63 121V92m16 29V96m57 25V92"
            stroke="#7fa499"
            strokeWidth="10"
          />
          <path
            d="M120 76V43m13 33V48M93 121V91m14 30V96"
            stroke="#c58687"
            strokeWidth="10"
          />
          <rect x="64" y="141" width="69" height="27" rx="6" fill="#f0dfbb" />
          <path d="M93 149h12" stroke="#b88f6a" strokeWidth="3" />
        </>
      )}
      {kind === "plant" && (
        <>
          <ellipse
            cx="100"
            cy="181"
            rx="45"
            ry="8"
            fill="#674631"
            opacity=".15"
          />
          <path
            d="M100 144V40m0 66-29-26m29 2 25-24"
            stroke="#5b8761"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <ellipse
            cx="75"
            cy="77"
            rx="18"
            ry="32"
            transform="rotate(-40 75 77)"
            fill="#7da879"
          />
          <ellipse
            cx="123"
            cy="56"
            rx="20"
            ry="32"
            transform="rotate(38 123 56)"
            fill="#98bb86"
          />
          <ellipse cx="96" cy="34" rx="17" ry="25" fill="#6f9967" />
          <ellipse
            cx="126"
            cy="105"
            rx="27"
            ry="15"
            transform="rotate(-22 126 105)"
            fill="#87b277"
          />
          <path d="M62 130h76l-10 44q-28 14-56 0z" fill="#d99c80" />
          <rect x="58" y="126" width="84" height="14" rx="7" fill="#e8b89c" />
        </>
      )}
      {kind === "rug" && (
        <>
          <ellipse cx="100" cy="137" rx="95" ry="43" fill="#cfaa60" />
          <ellipse cx="100" cy="133" rx="91" ry="40" fill="#f2d895" />
          <ellipse
            cx="100"
            cy="133"
            rx="76"
            ry="30"
            fill="none"
            stroke="#fff2c9"
            strokeWidth="3"
          />
          <path
            d="M68 133h64m-32-18v36m-22-30 44 24m-44 0 44-24"
            stroke="#d9af61"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === "art" && (
        <>
          <rect x="31" y="19" width="138" height="163" rx="6" fill="#b58c65" />
          <rect x="39" y="27" width="122" height="147" rx="3" fill="#fff0d8" />
          <rect x="50" y="38" width="100" height="124" rx="50" fill="#94aab8" />
          <circle cx="101" cy="79" r="26" fill="#fff0c0" />
          <circle cx="113" cy="69" r="24" fill="#94aab8" />
          <path d="M51 147q30-61 56 0 21-45 43 0v15H51z" fill="#647f83" />
          <path
            d="m75 59 2 4 4 2-4 2-2 4-2-4-4-2 4-2zm53 49 2 4 4 2-4 2-2 4-2-4-4-2 4-2z"
            fill="#fff4d2"
          />
        </>
      )}
    </svg>
  );
}
