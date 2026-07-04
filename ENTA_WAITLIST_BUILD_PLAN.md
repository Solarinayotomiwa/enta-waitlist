# Enta Waitlist Build Plan

## Current Figma Access

Source: https://www.figma.com/design/xWQY2UepMBdAjjCW2KMzbN/Enta-Waitlist-website?node-id=40000008-13576

Root frame:

- File key: `xWQY2UepMBdAjjCW2KMzbN`
- Root node: `40000008:13576`
- Canvas size: `1440 x 9238`

Top-level sections:

| Section | Node ID | Role |
|---|---:|---|
| Hero | `40000008:13577` | Signature first impression, sky/grass/logo/form |
| Intro Section | `40000008:13645` | Trust proof, partner/logo row, stats |
| Calculator | `40000008:13828` | Primary interactive demo, input-driven graph |
| Three assets / Feature | `40000008:13899` | USDT, Bitcoin, Gold account story |
| How it works | `40000008:13956` | Scroll-driven process walkthrough |
| Security | `40000008:14222` | Trust, safety, regulated positioning |
| Footer | `40000008:14287` | Final CTA and closing brand world |
| Registration Form | `40000008:14507` | Waitlist card over hero |

Confirmed asset-level access:

- The Figma MCP does not only expose a flattened screenshot.
- The hero section returns separate image assets for `Hero BG 1`, `Enta Logo Hero 1`, `Grass cover`, currency icons, avatar/flag assets, and nav logo assets.
- These asset URLs are short-lived, so implementation should download and store them locally during build rather than referencing Figma URLs directly.

## Do We Need a .fig Upload?

Not at the start.

We only need a `.fig` export if one of these happens:

- Figma MCP cannot export a specific image fill or vector needed for fidelity.
- A layer is visually important but only appears correctly inside the Figma desktop/browser renderer.
- We need prototype-specific behavior that is not represented in the static design nodes.
- Permissions change and MCP can no longer read the file.

Current recommendation: use Figma MCP section-by-section first. Do not upload `.fig` yet.

## Do We Need Browser Control?

Not for inspecting the Figma file initially.

Use browser control later for:

- Visual QA of the built site.
- Checking real scroll performance and animation feel.
- Capturing desktop/mobile screenshots.
- Testing form states, graph behavior, sticky sections, and reduced motion.

Browser control is for validating the implementation, not for replacing Figma extraction.

## Build Standard

The page should feel happy, sunny, premium, and smooth.

Motion should be:

- soft
- wind-like
- tactile
- responsive to user input
- scroll-aware
- precise enough for fintech

Motion should not feel:

- bouncy
- gimmicky
- casino-like
- random
- heavy or laggy

Use this easing family:

```css
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
```

Respect `prefers-reduced-motion` from the beginning.

## Proposed Stack

Because the workspace is currently empty, scaffold from scratch.

Recommended:

- Next.js
- TypeScript
- CSS modules or global CSS tokens
- Framer Motion for component-level motion
- GSAP ScrollTrigger only for pinned or timeline-heavy scroll sections

Avoid installing animation libraries until the exact interaction requires them. The hero, form, count-ups, and calculator can likely be built with CSS + Framer Motion. The `How it works` section may justify GSAP if we want a true pinned Apple-style sequence.

## Asset Workflow

1. Extract one top-level Figma section at a time.
2. Save all Figma image URLs into an asset manifest.
3. Download assets into `public/assets/figma/`.
4. Rename files by semantic purpose, not raw Figma IDs.
5. Keep a mapping table from Figma node ID to local asset path.
6. Do not hotlink Figma MCP asset URLs in production.

Example manifest shape:

```ts
export const figmaAssets = {
  heroSky: '/assets/figma/hero-sky.png',
  heroEntaLogo: '/assets/figma/hero-enta-logo.png',
  heroGrass: '/assets/figma/hero-grass.png',
};
```

## Motion Map

### 1. Hero

Goal: the first viewport should feel like a living sunny scene.

Planned behavior:

- Sky slowly drifts with subtle cloud movement.
- Sky has small parallax movement on scroll.
- Enta glass logo floats behind the grass with very slow vertical movement.
- Logo movement should be small, roughly `translateY(-6px, 6px)` and under `1deg` rotation.
- Grass receives a wind layer: masked duplicate strips or subtle wave transform.
- Headline enters in two beats.
- Bitcoin/Naira pills slide into text positions and settle softly.
- Supporting copy appears after headline.
- Waitlist proof appears last.
- Registration form rises into place with tactile input states.

Implementation notes:

- Separate hero into layers: `SkyLayer`, `LogoLayer`, `GrassLayer`, `HeroCopy`, `WaitlistForm`.
- Use transform and opacity only for main motion.
- Grass wind can use pseudo-elements or duplicated image layers with masks.
- Avoid constant high-frequency animation.

### 2. Intro / Trust

Goal: establish credibility without slowing the page.

Planned behavior:

- Logo row becomes a slow marquee.
- Trust/stat cards reveal with stagger.
- Numeric values count up when visible.
- Hover state gives a small lift and border/brightness change.

### 3. Calculator

Goal: this must feel real, not decorative.

Planned behavior:

- Amount input drives calculation state.
- Savings number animates to the computed value.
- Graph bars scale up/down based on input.
- Bar labels count to their new values.
- Current/highest bar gets a happy accent glow.
- Empty/invalid input returns to a calm baseline.

Implementation notes:

- Store raw input as a string to preserve formatting.
- Parse to number for calculations.
- Normalize bar heights with clamped min/max.
- Animate bars with `transform: scaleY(...)`, not animated height.
- Keep labels outside the bar transform so text stays readable.

Example model:

```ts
const yearlySavings = amount * savingsRate;
const graphValue = clamp(yearlySavings / maxGraphValue, 0.08, 1);
```

### 4. Three Assets

Goal: make the account feel multi-asset and dimensional.

Planned behavior:

- Balance card enters first and floats subtly.
- Asset cards layer in from below with slight parallax.
- USDT, Bitcoin, and Gold cards each have a distinct hover response.
- Coin/icon shimmer should happen only on hover or section entry.

### 5. How It Works

Goal: an Apple-like scroll story.

Planned behavior:

- A persistent transaction widget stays visible while steps change.
- As each step becomes active, the widget updates its labels, currencies, and progress.
- Step transitions should feel like one object changing state.
- Text can advance vertically while the visual remains spatially anchored.

Potential technical path:

- Simple version: IntersectionObserver activates each step.
- Premium version: GSAP ScrollTrigger pins the visual and scrubs a timeline.

### 6. Security

Goal: calm trust.

Planned behavior:

- Lock/card visual reveals with a soft mask or focus pull.
- Security items fade in slowly.
- Hover states are restrained and precise.
- No playful motion here.

### 7. CTA / Footer

Goal: confident close.

Planned behavior:

- CTA band has subtle light movement.
- CTA button has press, loading, and submitted states.
- Footer pattern drifts very slowly or remains static on reduced motion.

## Implementation Phases

### Phase 0: Planning and extraction

- Confirm Figma node map.
- Create local asset manifest.
- Download hero assets first.
- Define motion tokens and section architecture.

### Phase 1: Hero vertical slice

- Scaffold app.
- Build static hero to match Figma.
- Add local hero assets.
- Add sky, logo, grass, headline, and form motion.
- Verify desktop and mobile hero screenshots.

### Phase 2: Static full page

- Implement all remaining sections statically.
- Match spacing, colors, type, imagery, and responsive layout.
- No advanced motion until static fidelity is acceptable.

### Phase 3: Core interactions

- Implement calculator input and animated graph.
- Implement form focus, validation, loading, and success states.
- Implement count-ups and marquee.

### Phase 4: Scroll choreography

- Add section reveals.
- Build `How it works` scroll story.
- Tune motion timing across the whole page.

### Phase 5: Polish and QA

- Browser visual QA.
- Mobile QA.
- Reduced-motion QA.
- Performance pass.
- Compare screenshots to Figma.

## Quality Gates

Do not move to the next phase unless:

- Static layout matches Figma closely.
- Assets are local, named, and mapped.
- Motion is smooth on desktop and mobile.
- Reduced motion has an acceptable fallback.
- The calculator responds correctly to real input.
- Text does not overlap at common mobile widths.
- No animation blocks interaction.

## Immediate Next Step

Start with the hero vertical slice.

Reason:

- It proves the Figma asset workflow.
- It proves the motion language.
- It is the hardest first impression.
- It lets us validate the sky/logo/grass concept before building the entire page.

Once the hero feels right, the rest of the page can inherit the same motion tokens and quality bar.
