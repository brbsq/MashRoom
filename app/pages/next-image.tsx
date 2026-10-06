import { forwardRef, type ImgHTMLAttributes } from "react";
import { pagesHref } from "./next-link";

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  unoptimized?: boolean;
  priority?: boolean;
};

const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  { src, unoptimized: _unoptimized, priority, ...props },
  ref,
) {
  return (
    <img
      ref={ref}
      src={pagesHref(src)}
      loading={priority ? "eager" : props.loading}
      {...props}
    />
  );
});

export default Image;
