"use client";

/** Scanline and power-on layers; visibility is driven by CSS on <html> attributes. */
export function CrtOverlay() {
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
    </>
  );
}
