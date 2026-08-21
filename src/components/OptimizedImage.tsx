import type { FC, ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Full src path or Vite-resolved import (may include extension). */
  src: string;
  alt: string;
  /** When true, emit <picture> with a .webp sibling if src has an extension. */
  webp?: boolean;
}

const stripExtension = (path: string) => path.replace(/\.(png|jpe?g|webp)$/i, "");

const OptimizedImage: FC<OptimizedImageProps> = ({
  src,
  alt,
  webp = true,
  loading = "lazy",
  decoding = "async",
  ...props
}) => {
  const hasRasterExt = /\.(png|jpe?g|webp)$/i.test(src);

  if (!webp || !hasRasterExt) {
    return (
      <img src={src} alt={alt} loading={loading} decoding={decoding} {...props} />
    );
  }

  const base = stripExtension(src);
  const isJpeg = /\.jpe?g$/i.test(src);
  const fallbackType = isJpeg ? "image/jpeg" : "image/png";
  const fallbackSrc = isJpeg ? `${base}.jpg` : `${base}.png`;

  return (
    <picture>
      <source srcSet={`${base}.webp`} type="image/webp" />
      <source srcSet={fallbackSrc} type={fallbackType} />
      <img
        src={src.endsWith(".webp") ? src : fallbackSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
