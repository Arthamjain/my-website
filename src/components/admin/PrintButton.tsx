"use client";

import { Printer } from "lucide-react";
import { btnSecondary } from "./ui";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className={btnSecondary}>
      <Printer size={15} /> Print packing slip
    </button>
  );
}
