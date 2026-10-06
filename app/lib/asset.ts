export function assetHref(path: string) {
  return `${process.env.NEXT_PUBLIC_MASHROOM_PAGES === "1" ? "/MashRoom" : ""}${path}`;
}
