"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // PAKSA ke login dulu, TIDAK cek localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
