export function cookieValue(request: Request, key: string) {
  return (
    request.headers
      .get("cookie")
      ?.split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(key + "="))
      ?.slice(key.length + 1) || ""
  );
}
export function cookie(
  key: string,
  value: string,
  age: number,
  origin: string,
) {
  return `${key}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${origin.startsWith("https:") ? "; Secure" : ""}`;
}
export const randomToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
export async function digest(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export async function pkce(value: string) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
export function sameOrigin(request: Request, origin: string) {
  if (request.headers.get("origin") !== origin)
    throw new HttpError(403, "This action must start in MashRoom.");
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function seal(value: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(secret.match(/.{2}/g)!.map((x) => parseInt(x, 16))),
    "AES-GCM",
    false,
    ["encrypt"],
  );
  const result = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(value),
  );
  return (
    btoa(String.fromCharCode(...iv)) +
    "." +
    btoa(String.fromCharCode(...new Uint8Array(result)))
  );
}
export async function unseal(value: string, secret: string) {
  const [iv, data] = value.split(".");
  const key = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(secret.match(/.{2}/g)!.map((x) => parseInt(x, 16))),
    "AES-GCM",
    false,
    ["decrypt"],
  );
  const result = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Uint8Array.from(atob(iv), (c) => c.charCodeAt(0)) },
    key,
    Uint8Array.from(atob(data), (c) => c.charCodeAt(0)),
  );
  return new TextDecoder().decode(result);
}
export function validatePet(value: unknown) {
  const p = value as Record<string, unknown>;
  if (
    !p ||
    typeof p.name !== "string" ||
    p.name.trim().length < 1 ||
    p.name.length > 24 ||
    ![p.hunger, p.hygiene, p.happiness, p.energy].every(
      (n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100,
    ) ||
    ![p.bladder, p.health].every(
      (n) =>
        n === undefined ||
        (typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100),
    )
  )
    throw new HttpError(400, "Invalid pet details.");
  return {
    name: p.name.trim(),
    stage: "Baby",
    color: "mint",
    hunger: p.hunger,
    hygiene: p.hygiene,
    happiness: p.happiness,
    energy: p.energy,
    bladder: p.bladder ?? 75,
    health: p.health ?? 90,
  };
}
