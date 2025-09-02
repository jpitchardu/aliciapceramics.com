import { BurstStar } from "@/ui/icons/BurstStar";
import { JaggedStar } from "@/ui/icons/JaggedStar";
import { SparkleStar } from "@/ui/icons/SparkleStar";
import { SimpleCross } from "@/ui/icons/SimpleCross";
import { getRandomPaletteColor } from "@/ui/utils";
import clsx from "clsx";
import React from "react";
import { FourPointStar } from "@/ui/icons/FourPointStar";

const STARS = [
  BurstStar,
  SparkleStar,
  JaggedStar,
  SimpleCross,
  FourPointStar,
] as const;

const ANIMATIONS = [
  "star-fall-1",
  "star-fall-2",
  "star-fall-3",
  "star-fall-4",
  "star-fall-5",
];

type StarRainProps = {
  stars: number;
};

export function StarRain({ stars }: StarRainProps) {
  return (
    <>
      {Array.from({ length: stars }).map((_, index) => {
        const Star = getRandomStar();
        const left = `${(Math.random() * 100).toFixed(2)}%`;
        const delay = `${Math.round(Math.random() * 1200)}ms`;
        return (
          <Star
            key={index}
            size={getRandomStarSize()}
            color={getRandomPaletteColor()}
            style={
              {
                left: left,
                animationDelay: delay,
              } as React.CSSProperties
            }
            className={clsx(
              "absolute",
              ANIMATIONS[index % ANIMATIONS.length]
            )}
          />
        );
      })}
    </>
  );
}

function getRandomStar() {
  return STARS[Math.floor(Math.random() * STARS.length)];
}

function getRandomStarSize() {
  return Math.floor(Math.random() * 20) + 40;
}
