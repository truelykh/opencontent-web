import Image from "next/image";
import type { ReactEventHandler } from "react";

interface ContentImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  decoding?: "async" | "sync" | "auto";
  onError?: ReactEventHandler<HTMLImageElement>;
}

/** Dynamic creator and catalogue images retain their existing CSS sizing safely. */
export function ContentImage({ src, alt, className, loading, onError }: ContentImageProps) {
  if (!src.trim()) {
    return null;
  }

  return <Image unoptimized src={src} alt={alt} width={1000} height={1000} className={className} loading={loading} onError={onError} />;
}
