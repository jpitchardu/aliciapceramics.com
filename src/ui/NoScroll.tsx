"use client";

import { useEffect } from "react";

export function NoScroll() {
  useEffect(() => {
    const el = document.documentElement;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = "";
    };
  }, []);
  return null;
}
