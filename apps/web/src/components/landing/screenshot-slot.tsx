"use client";

import { useState } from "react";

interface ScreenshotSlotProps {
  name: string;
  alt?: string;
  height?: string;
}

export function ScreenshotSlot({ name, alt, height = "320px" }: ScreenshotSlotProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-b from-[#fbfbf8] to-[#f0f0ee] text-sm text-black/20"
        style={{ height }}
      >
        <div className="text-center">
          <p className="font-mono text-xs">{name}</p>
          <p className="mt-1">Place screenshot in public/screenshots/</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={`/screenshots/${name}`}
      alt={alt ?? name}
      className="w-full"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
