"use client";

import { useState } from "react";
import { Photo } from "@/ui/Photo";

interface ImageGalleryProps {
  srcs: string[];
  ratio?: string;
}

export function ImageGallery({ srcs, ratio = "4 / 5" }: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  if (srcs.length <= 1) {
    return (
      <Photo
        ratio={ratio}
        src={srcs[0]}
        sizes="(max-width: 1023px) 100vw, 55vw"
      />
    );
  }

  return (
    <div>
      <Photo
        ratio={ratio}
        src={srcs[active]}
        sizes="(max-width: 1023px) 100vw, 55vw"
      />
      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {srcs.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              cursor: "pointer",
              flexShrink: 0,
              width: 64,
              opacity: i === active ? 1 : 0.45,
              transition: "opacity 0.15s",
              outline: i === active ? "1px solid var(--ink)" : "none",
              outlineOffset: 2,
            }}
          >
            <Photo ratio={ratio} src={src} sizes="64px" />
          </button>
        ))}
      </div>
    </div>
  );
}
