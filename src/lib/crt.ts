/** Browser-only helpers for the CRT scanline toggle. */

export const CRT_EVENT = "crtchange";
const STORAGE_KEY = "crt";

export function isCrtOn(): boolean {
  return document.documentElement.getAttribute("data-crt") === "on";
}

export function setCrt(on: boolean): void {
  const html = document.documentElement;
  if (on) html.setAttribute("data-crt", "on");
  else html.removeAttribute("data-crt");
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // storage unavailable: the toggle still works for this page load
  }
  window.dispatchEvent(new CustomEvent<boolean>(CRT_EVENT, { detail: on }));
}

export function toggleCrt(): void {
  setCrt(!isCrtOn());
}

/**
 * Runs inline in <head> before first paint so a persisted CRT choice and a
 * finished boot never flash. Kept as a string because it must not wait for
 * hydration.
 */
export const PRE_PAINT_SCRIPT = `(function(){try{var h=document.documentElement;if(localStorage.getItem("${STORAGE_KEY}")==="on")h.setAttribute("data-crt","on");if(sessionStorage.getItem("boot")==="1")h.setAttribute("data-boot","done")}catch(e){}})();`;
