"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Cegah error di server (Next.js SSR)
    if (typeof window === "undefined") return;

    const isLoggedIn = window.localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [router]);

  return null;
}
