import { pagesHref } from "./next-link";

export function usePathname() {
  const path = window.location.pathname.replace(/^\/MashRoom(?=\/|$)/, "");
  return path.replace(/\/$/, "") || "/";
}

export function useRouter() {
  return {
    push: (href: string) => window.location.assign(pagesHref(href)),
    replace: (href: string) => window.location.replace(pagesHref(href)),
    back: () => window.history.back(),
    refresh: () => window.location.reload(),
  };
}
