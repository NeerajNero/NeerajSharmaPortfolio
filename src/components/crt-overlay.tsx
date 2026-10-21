"use client";

import { useEffect, useState } from "react";
import { CRT_EVENT } from "@/lib/crt";

const TOAST_MS = 2000;

export function CrtOverlay() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const onChange = (event: Event) => {
      const on = (event as CustomEvent<boolean>).detail;
      setToast(on ? "crt mode on" : "crt mode off");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setToast(null), TOAST_MS);
    };
    window.addEventListener(CRT_EVENT, onChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CRT_EVENT, onChange);
    };
  }, []);

  const clearAnimation = () => document.documentElement.removeAttribute("data-crt-anim");

  return (
    <>
      <div
        aria-hidden="true"
        className="crt-scanlines pointer-events-none fixed inset-0 z-[60] hidden"
      />
      <div
        aria-hidden="true"
        onAnimationEnd={clearAnimation}
        className="crt-field pointer-events-none fixed inset-0 z-[59] hidden bg-text"
      />
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-4 left-4 z-[70] border border-line bg-surface px-3 py-2 text-[13px] text-text ${
          toast ? "" : "hidden"
        }`}
      >
        {toast}
      </div>
    </>
  );
}
