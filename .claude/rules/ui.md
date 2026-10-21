---
paths:
  - "src/components/**"
  - "src/app/**"
---

# UI

The design rules below apply to every UI change. Re-read them before saying a change is done and remove anything that breaks them.

- Backgrounds are flat. No gradients, no radial glows, no noise textures.
- Glow is allowed on exactly two things: the "online" status dot and keyboard focus rings (`box-shadow: 0 0 0 2px var(--color-accent)`).
- Borders are 1px `--color-line`. Corner brackets (four 8px L-shapes in accent) appear on the player card only.
- No entrance animations on sections. No hover lift/shadow on cards. Hover on links = accent underline, 1px, offset 3px. That is all.
- No ALL-CAPS tracked-out labels. No "→" on buttons or links. No middle-dot meta strings. No numbered 01/02/03 markers except the campaign timeline, which is an actual sequence.
- Left-aligned everything. Container max-width 1040px, 24px side padding on mobile.
- Section titles are rendered as HUD tabs: text sits on a 1px top rule with a short accent tick on the left. Build one `<SectionHeader>` and reuse it.
- Reduced motion: every animation checks `prefers-reduced-motion` and degrades to an instant state.

Also:
- No new dependencies without a one-line justification in the commit message. There is no component, icon or animation library and none is wanted.
- Tokens come from `@theme` in `src/app/globals.css`; no hard-coded colours except the four trophy-tier dots in `platform-card.tsx`.
- Server components by default; `"use client"` only for state or browser APIs (today: boot, nav, konami, crt overlay).
- Content comes from `src/config/site.ts`; components render, they do not contain copy.
- Every section keeps a heading for `aria-labelledby`; images have `alt`; focus rings stay visible; animation respects `prefers-reduced-motion`.
- Check at 1280px and 375px: no horizontal scroll, nothing overflows its card. Grid and subgrid children need `min-w-0` when they hold non-wrapping text.
- Update `docs/design-system.md` in the same commit when a component's shape, props or behaviour changes.
