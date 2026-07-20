# Enta Waitlist

A polished animated landing page for the Enta waitlist experience. The site is built as a Next.js App Router project with React, Tailwind CSS, and Motion animations.

## Quick start

Use Node.js 20+ and npm.

```bash
npm ci
npm run dev
```

Then open:

```text
http://localhost:3000
```

If port `3000` is busy:

```bash
npm run dev -- -p 3002
```

Then open:

```text
http://127.0.0.1:3002
```

## Project scripts

```bash
npm run dev        # Start local development server with hot reload
npm run build      # Create production build
npm run start      # Start production server after build
npm run typecheck  # Run TypeScript without emitting files
```

## Tech stack

- Next.js 15 App Router
- React 19
- Tailwind CSS 4
- Motion for page/section/micro-interactions
- TypeScript
- Static assets exported from Figma and generated image assets

## Current implementation status

The landing page is implemented section-by-section with responsive desktop/mobile layouts:

1. Hero
   - Animated sky/clouds.
   - Floating Enta logo behind grass.
   - Wind-like grass blade motion.
   - Rotating crypto/fiat token chips.
   - Waitlist form with floating labels.
   - Searchable country dropdown with flags.

2. Proof/social proof
   - Logo marquee using provided partner/logo assets.
   - Metric cards for transaction volume, markets, processed transactions, and years in market.

3. Calculator
   - Interactive amount input.
   - Chart values update based on the entered Naira amount.
   - Correct chart icon mapping:
     - Naira → Naira icon
     - USD₮ → USD₮ icon
     - Bitcoin → Bitcoin icon
     - XAU₮/Gold → XAU₮ icon

4. Assets/features
   - Wallet balance visual.
   - USD₮, Bitcoin, and Gold cards with token imagery and hover motion.

5. How it works
   - Sticky left-side explanatory copy on desktop.
   - Scrollable right-side conversion cards.
   - Responsive stacked layout on mobile.

6. Security
   - Phone/security visual.
   - Balance card composition.
   - Security feature items with subtle icon hover animation.

7. Footer/CTA
   - Gradient CTA card.
   - Hover scale/breathing interaction.
   - Animated footer pattern treatment.

## Important files

```text
app/page.tsx                         # Page composition
app/layout.tsx                       # Metadata and root layout
app/globals.css                      # Global styles, animations, custom effects

components/Hero.tsx                  # Hero, nav, waitlist form, country selector
components/IntroSection.tsx          # Social proof/logos/metrics
components/CalculatorSection.tsx     # Savings calculator and graph
components/FeatureSection.tsx        # Wallet/assets section
components/HowItWorksSection.tsx     # Sticky explanation + steps
components/SecuritySection.tsx       # Security visuals and feature points
components/FooterSection.tsx         # Footer CTA and pattern

lib/figma-assets.ts                  # Central asset path map
lib/cn.ts                            # Classname utility

public/assets/figma/                 # Figma-exported assets
public/assets/generated/             # Generated visual assets, e.g. clouds
public/reference/                    # QA/reference screenshots
ENTA_WAITLIST_BUILD_PLAN.md          # Earlier implementation/planning notes
```

## Design source

Primary Figma design:

[Enta Waitlist website](https://www.figma.com/design/xWQY2UepMBdAjjCW2KMzbN/Enta-Waitlist-website)

The implementation has intentionally preserved exported Figma assets where possible. Some effects are rebuilt in CSS/Motion for smoother web behavior.

## Handoff notes for another agent/developer

- Start by running `npm ci`, then `npm run dev`.
- Validate every change on desktop and mobile. The current work has been heavily tuned visually, so small spacing/font changes can affect the polish.
- Prefer editing the existing section components instead of rebuilding from scratch.
- Keep assets centralized through `lib/figma-assets.ts` when adding new exported files.
- Use `public/reference/` screenshots as visual QA references.
- Do not commit or package `node_modules` or `.next`; they are reproducible from `package-lock.json`.
- The current waitlist form is front-end only. Add a backend/API integration before using it for real submissions.

## Verification checklist

Before handing off or deploying:

```bash
npm run typecheck
npm run build
```

Then manually check:

- Desktop width around 1440px.
- Mobile widths around 390px and 360px.
- Hero animations and form layout.
- Country dropdown search and flag rendering.
- Calculator input editing and graph response.
- Sticky behavior in the “How it works” section.
- Footer CTA hover treatment.
- No horizontal overflow on mobile.

## Packaging notes

A transfer zip should include source, assets, lockfile, and documentation.

Recommended exclusions:

```text
node_modules/
.next/
.git/
*.zip
.DS_Store
```

The recipient can regenerate dependencies and the production build with:

```bash
npm ci
npm run build
```
#
