---
paths:
  - "src/config/**"
---

# Content config

- `site.ts` holds content only: strings, URLs, lists, snapshot numbers. No functions, fetches, formatting or conditionals beyond object literals. Logic belongs in `src/lib/`.
- Every new piece of text a component needs becomes a typed field on `SiteConfig`; never inline it in a component.
- Copy content exactly as given; do not embellish, reorder or "improve" wording.
- Never add a phone number.
- When `gaming.static` changes, update `SNAPSHOT_AT` and the `// Snapshot of the live run on …` comment with the date, and keep snapshots image-free.
- Keep `nav[].id` in step with the `<section id>` values in `src/app/page.tsx`.
- Document schema changes in `docs/content.md` in the same commit.
