"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommisionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/commissions/closed");
  }, [router]);

  return null;
}
