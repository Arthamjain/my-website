"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/store/cart";

export default function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    track("page_view");
  }, [pathname]);
  return null;
}
