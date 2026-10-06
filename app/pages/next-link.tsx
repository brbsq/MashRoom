import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

export const pagesHref = (href: string) =>
  href.startsWith("/MashRoom/")
    ? href
    : href.startsWith("/")
      ? `/MashRoom${href}`
      : href;

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
};

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, ...props },
  ref,
) {
  return (
    <a ref={ref} href={pagesHref(href)} {...props}>
      {children}
    </a>
  );
});

export default Link;
