import React from "react";
import  type{ MediaType } from "@/types/landing";

interface DynamicMediaProps {
  type: MediaType;
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export const DynamicMedia: React.FC<DynamicMediaProps> = ({
  type,
  src,
  poster,
  alt = "Roadside assistance platform asset",
  className = "w-full h-full object-cover",
  containerClassName = "relative w-full h-full overflow-hidden",
  autoPlay = true,
  loop = true,
  muted = true,
}) => {
  return (
    <div className={containerClassName}>
      {type === "video" ? (
        <video
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          aria-label={alt}
          className={className}
        >
          {poster && <img src={poster} alt={alt} className={className} />}
        </video>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={className}
        />
      )}
    </div>
  );
};