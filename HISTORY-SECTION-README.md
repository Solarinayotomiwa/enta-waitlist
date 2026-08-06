# Our History section — final version (branch archive)

This branch preserves the **second and final iteration** of the "Our History"
timeline section. It is not rendered anywhere — `main` and all deployments are
unaffected.

## Timeline of the section

| Date (2026) | Commit | What happened |
| --- | --- | --- |
| Jul 13 | `9944eb1` | First iteration lands (the version in older screenshots) |
| Jul 16–19 | `d484d2d` … `e446316` | Reworked in place: timeline states, scrub, transitions, year-specific imagery (+83/−29 lines) |
| Jul 21 | `f335ab5` | Section, assets, and links removed from the site entirely |

So the section was never committed in a commented-out state — it evolved in
place and was then deleted. GitHub's file history view stops following a file
after deletion unless you browse from an older commit, which is why only the
early version was easy to find.

## What this branch restores (from `f335ab5~1`, the last state that existed)

- `components/HistorySection.tsx` — the component (self-contained; one asset
  path inlined because its `figmaAssets` key was removed with the section)
- `public/assets/figma/history/` — sky background + photos
- `public/images/our history/2016.png … 2026.png` — the seven year images
- The 4 CSS rules it needs, below (they lived in `app/globals.css`)

## CSS required if re-enabling

```css
.history-tick {
  transform-origin: center;
  transition: transform 180ms ease-out;
  will-change: transform;
}

.history-expand {
  animation: history-expand 420ms cubic-bezier(0.22, 1, 0.36, 1) 80ms backwards;
}

@keyframes history-expand {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## To re-enable on the site

1. Merge (or cherry-pick) this branch.
2. Add the CSS above to `app/globals.css`.
3. In `app/page.tsx`: `import { HistorySection } from "@/components/HistorySection";`
   and render `<HistorySection />` where it should appear (it previously sat
   between the Security and Waitlist sections).
