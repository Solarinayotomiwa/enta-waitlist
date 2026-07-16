"use client";

import { CSSProperties, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";
import { getAttribution } from "@/lib/tracking";

const reveal = {
  hidden: { opacity: 0, y: 22, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const chipReveal = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const formFields = [
  { id: "name", label: "Name", type: "text", autoComplete: "name" },
  { id: "email", label: "Email address", type: "email", autoComplete: "email", required: true },
  {
    id: "contact",
    label: "WhatsApp or Telegram (optional)",
    type: "text",
    autoComplete: "tel",
  },
] as const;

type FieldConfig = {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  helper?: string;
  required?: boolean;
};

const businessFields = [
  { id: "contactName", label: "Contact name", type: "text", autoComplete: "name" },
  { id: "companyName", label: "Company name", type: "text", autoComplete: "organization" },
  { id: "role", label: "Your role or title", type: "text", autoComplete: "organization-title" },
  { id: "businessEmail", label: "Email address", type: "email", autoComplete: "email", required: true },
  { id: "whatsapp", label: "WhatsApp number", type: "text", autoComplete: "tel" },
] as const;

const volumeRanges = [
  "Under $10,000",
  "$10,000 to $50,000",
  "$50,000 to $250,000",
  "$250,000 and above",
] as const;

const countryCodes = [
  "AD",
  "AE",
  "AF",
  "AG",
  "AI",
  "AL",
  "AM",
  "AO",
  "AQ",
  "AR",
  "AS",
  "AT",
  "AU",
  "AW",
  "AX",
  "AZ",
  "BA",
  "BB",
  "BD",
  "BE",
  "BF",
  "BG",
  "BH",
  "BI",
  "BJ",
  "BL",
  "BM",
  "BN",
  "BO",
  "BQ",
  "BR",
  "BS",
  "BT",
  "BV",
  "BW",
  "BY",
  "BZ",
  "CA",
  "CC",
  "CD",
  "CF",
  "CG",
  "CH",
  "CI",
  "CK",
  "CL",
  "CM",
  "CN",
  "CO",
  "CR",
  "CU",
  "CV",
  "CW",
  "CX",
  "CY",
  "CZ",
  "DE",
  "DJ",
  "DK",
  "DM",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "EH",
  "ER",
  "ES",
  "ET",
  "FI",
  "FJ",
  "FK",
  "FM",
  "FO",
  "FR",
  "GA",
  "GB",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GL",
  "GM",
  "GN",
  "GP",
  "GQ",
  "GR",
  "GS",
  "GT",
  "GU",
  "GW",
  "GY",
  "HK",
  "HM",
  "HN",
  "HR",
  "HT",
  "HU",
  "ID",
  "IE",
  "IL",
  "IM",
  "IN",
  "IO",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JE",
  "JM",
  "JO",
  "JP",
  "KE",
  "KG",
  "KH",
  "KI",
  "KM",
  "KN",
  "KP",
  "KR",
  "KW",
  "KY",
  "KZ",
  "LA",
  "LB",
  "LC",
  "LI",
  "LK",
  "LR",
  "LS",
  "LT",
  "LU",
  "LV",
  "LY",
  "MA",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MK",
  "ML",
  "MM",
  "MN",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY",
  "MZ",
  "NA",
  "NC",
  "NE",
  "NF",
  "NG",
  "NI",
  "NL",
  "NO",
  "NP",
  "NR",
  "NU",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PF",
  "PG",
  "PH",
  "PK",
  "PL",
  "PM",
  "PN",
  "PR",
  "PS",
  "PT",
  "PW",
  "PY",
  "QA",
  "RE",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SL",
  "SM",
  "SN",
  "SO",
  "SR",
  "SS",
  "ST",
  "SV",
  "SX",
  "SY",
  "SZ",
  "TC",
  "TD",
  "TF",
  "TG",
  "TH",
  "TJ",
  "TK",
  "TL",
  "TM",
  "TN",
  "TO",
  "TR",
  "TT",
  "TV",
  "TW",
  "TZ",
  "UA",
  "UG",
  "UM",
  "US",
  "UY",
  "UZ",
  "VA",
  "VC",
  "VE",
  "VG",
  "VI",
  "VN",
  "VU",
  "WF",
  "WS",
  "YE",
  "YT",
  "ZA",
  "ZM",
  "ZW",
] as const;

type CountryOption = {
  code: (typeof countryCodes)[number];
  flag: string;
  name: string;
};

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const countries = countryCodes
  .map((code) => ({
    code,
    flag: countryCodeToFlag(code),
    name: regionNames?.of(code) ?? code,
  }))
  .sort((first, second) => first.name.localeCompare(second.name));

function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

const assetChipItems = [
  {
    name: "Bitcoin",
    token: figmaAssets.tokenBtcExport,
  },
  {
    name: "XAU₮",
    token: figmaAssets.tokenXautExport,
  },
  {
    name: "USD₮",
    token: figmaAssets.tokenUsdtExport,
  },
] as const;

const fiatChipItems = [
  {
    name: "Naira",
    token: figmaAssets.tokenNairaExport,
  },
  {
    name: "Pound",
    token: figmaAssets.tokenPoundExport,
  },
  {
    name: "Euro",
    token: figmaAssets.tokenEuroExport,
  },
] as const;

const grassBlades = [
  [3, 8, 28, 0, "#7fab2e"],
  [6, 10, 34, 0.18, "#a4c64a"],
  [9, 11, 24, 0.36, "#6d972b"],
  [12, 12, 38, 0.08, "#b8ce5b"],
  [15, 9, 27, 0.42, "#7da32d"],
  [18, 14, 42, 0.28, "#9fbd3b"],
  [21, 11, 31, 0.52, "#6f982c"],
  [24, 10, 36, 0.14, "#b5ca55"],
  [27, 13, 29, 0.48, "#7da42c"],
  [30, 12, 44, 0.22, "#abc84e"],
  [33, 11, 30, 0.64, "#6b922c"],
  [36, 10, 35, 0.32, "#a7c044"],
  [39, 9, 26, 0.74, "#7c9f30"],
  [42, 8, 32, 0.44, "#c0d760"],
  [45, 7, 24, 0.58, "#789a2f"],
] as const;

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(heroRef, { margin: "240px" });
  const shouldAnimate = isInView && !reducedMotion;

  return (
    <section
      className={cn(
        "hero-root relative isolate overflow-hidden bg-sky-700 text-white lg:z-10",
        shouldAnimate && "motion-active",
      )}
      ref={heroRef}
    >
      <HeroScene />
      <MeadowLayer />
      <GlassLayer />
      <Header />
      <div className="hero-content-root relative z-30 mx-auto flex h-full w-full flex-col">
        <div className="hero-grid grid">
          <HeroHeadline />
          <HeroIntro />
        </div>
        <div className="hero-scroll-cue absolute inset-x-0 z-40 flex justify-center">
          <ScrollCue shouldAnimate={shouldAnimate} />
        </div>
      </div>
    </section>
  );
}

function ScrollCue({ shouldAnimate }: { shouldAnimate: boolean }) {
  return (
    <motion.a
      aria-label="Scroll to proof section"
      className="group inline-flex w-fit items-center gap-3 rounded-full border border-white/25 bg-white/18 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-out hover:bg-white/24"
      href="#proof"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.05, duration: 0.45, ease: "easeOut" }}
    >
      <span>See why Enta is trusted</span>
      <motion.span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-full bg-white text-[#175cd3]"
        animate={shouldAnimate ? { y: [0, 3, 0] } : { y: 0 }}
        transition={{ duration: 1.45, ease: "easeInOut", repeat: Infinity }}
      >
        ↓
      </motion.span>
    </motion.a>
  );
}

function HeroScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
      <img
        alt=""
        className="hero-sky absolute inset-0 size-full max-w-none object-cover"
        src={figmaAssets.heroSky}
      />
      <CloudDriftLayer />
    </div>
  );
}

function MeadowLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="hero-grass-wrap absolute inset-x-0 overflow-hidden">
        <div className="hero-meadow-entrance size-full">
          <img
            alt=""
            className="hero-grass-primary size-full max-w-none"
            src={figmaAssets.heroGrass}
          />
          <GrassBladeField />
        </div>
      </div>
    </div>
  );
}

function GlassLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <div className="hero-glass-overlay-inner relative mx-auto h-full w-full">
        <div className="hero-glass-position absolute max-w-none select-none">
          <div className="hero-glass-entrance">
            <div className="hero-logo-float">
              <img
                alt=""
                className="hero-logo-image size-full object-contain"
                loading="lazy"
                src={figmaAssets.heroEntaLogo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloudDriftLayer() {
  return (
    <div className="hero-cloud-layer pointer-events-none absolute inset-0 overflow-hidden">
      <img
        alt=""
        className="hero-cloud-sprite hero-cloud-main"
        src={figmaAssets.cloudMainRight}
      />
      <img
        alt=""
        className="hero-cloud-sprite hero-cloud-secondary"
        src={figmaAssets.cloudMainRight}
      />
    </div>
  );
}

function GrassBladeField() {
  return (
    <div className="grass-blade-field">
      {grassBlades.map(([left, bottom, height, delay, color]) => (
        <span
          className="grass-blade"
          key={`${left}-${height}`}
          style={
            {
              "--blade-left": `${left}%`,
              "--blade-bottom": `${bottom}%`,
              "--blade-height": `${height}px`,
              "--blade-delay": `${delay}s`,
              "--blade-color": color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function Header() {
  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-x-0 top-0 z-40 px-5 pt-[calc(env(safe-area-inset-top)+18px)] sm:px-6 lg:px-0 lg:pt-[env(safe-area-inset-top)]"
      initial={{ opacity: 0, y: -12 }}
      transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav className="hero-nav-inner relative mx-auto flex h-11 max-w-[1200px] items-center gap-3 sm:h-12 sm:gap-4 lg:h-[84px]">
        <a aria-label="Enta home" className="flex min-w-0 items-center gap-3" href="/">
          <img
            alt=""
            className="h-7 w-[104px] shrink-0 object-contain sm:h-8 sm:w-[120px]"
            src={figmaAssets.entaLogoWhite}
          />
          <span className="glass-pill hidden rounded-full px-3 py-1 text-xs font-medium uppercase leading-[18px] text-white [font-family:var(--font-plex-mono),'IBM_Plex_Mono',monospace] sm:inline-flex lg:absolute lg:left-[132px] lg:top-1/2 lg:-translate-y-1/2">
            Early access
          </span>
        </a>
        <div className="hidden flex-1 items-center justify-center gap-4 text-sm font-medium tracking-[-0.14px] text-white [font-family:var(--font-inter),Inter,sans-serif] md:flex lg:absolute lg:left-1/2 lg:top-1/2 lg:flex-none lg:-translate-x-1/2 lg:-translate-y-1/2">
          <a className="nav-glass-link" href="/#how-it-works">
            Learn More
          </a>
          <a className="nav-glass-link" href="/#how-it-works">
            How it works
          </a>
          <a className="nav-glass-link" href="/#about">
            About
          </a>
        </div>
        <a
          className="ml-auto shrink-0 whitespace-nowrap rounded-lg bg-[#eff8ff] px-3 py-1.5 text-xs font-semibold capitalize leading-5 text-[#0e2243] transition duration-150 ease-out hover:bg-white active:scale-[0.98] sm:text-sm"
          href="/#waitlist"
        >
          Join Waitlist
        </a>
      </nav>
    </motion.header>
  );
}

function HeroHeadline() {
  return (
    <motion.h1
      animate="visible"
      className="hero-title relative max-w-[682px] text-[56px] font-bold leading-[1.08] tracking-[-0.031em] text-white text-balance max-[380px]:text-[48px] md:text-[64px] md:leading-[70px] md:tracking-[-1.5px]"
      initial="hidden"
      transition={{ staggerChildren: 0.11, delayChildren: 0.16 }}
    >
      <motion.span className="block" variants={reveal}>
        Preserve it. Move it.
      </motion.span>
      <motion.span className="block" variants={reveal}>
        Own it. <span className="text-[#a9e0fb]">Money that</span>
      </motion.span>
      <motion.span className="block text-[#a9e0fb]" variants={reveal}>
        works everywhere
      </motion.span>
      <motion.span className="block text-[#a9e0fb]" variants={reveal}>
        you do.
      </motion.span>
    </motion.h1>
  );
}

type RotatingChipItem = {
  name: string;
  token: string;
};

function CurrencyChip({
  initialDelayMs,
  intervalMs,
  items,
  shouldAnimate,
}: {
  initialDelayMs: number;
  intervalMs: number;
  items: readonly RotatingChipItem[];
  shouldAnimate: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const activeItem = items[activeIndex];

  useEffect(() => {
    if (!shouldAnimate || reducedMotion) return;

    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % items.length);
      interval = window.setInterval(() => {
        setActiveIndex((current) => (current + 1) % items.length);
      }, intervalMs);
    }, initialDelayMs);

    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [initialDelayMs, intervalMs, items.length, reducedMotion, shouldAnimate]);

  return (
    <motion.span
      aria-label={items.map((item) => item.name).join(", ")}
      className="hero-word-chip mx-2 inline-flex translate-y-[-0.08em] items-center rounded-full bg-white/10 px-4 py-2 align-middle text-[0.62em] leading-none ring-1 ring-white/20 backdrop-blur-[1px]"
      transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
      variants={chipReveal}
    >
      <span className="rotating-chip-window">
        <span aria-hidden="true" className="rotating-chip-content rotating-chip-sizer">
          <CurrencyChipContent item={activeItem} />
        </span>
        <AnimatePresence initial={false}>
          <motion.span
            animate={{ opacity: 1, x: 0 }}
            className="rotating-chip-content rotating-chip-animated"
            exit={{ opacity: 0, x: -18 }}
            initial={{ opacity: 0, x: 18 }}
            key={activeItem.name}
            transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <CurrencyChipContent item={activeItem} />
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  );
}

function CurrencyChipContent({ item }: { item: RotatingChipItem }) {
  return (
    <>
      <span className="token-avatar" aria-hidden="true">
        <img alt="" className="size-full object-contain" src={item.token} />
      </span>
      <span className="chip-name">{item.name}</span>
    </>
  );
}

function HeroIntro() {
  return (
    <motion.div
      animate="visible"
      className="max-w-[476px] pt-2 lg:pt-3"
      initial="hidden"
      transition={{ staggerChildren: 0.12, delayChildren: 0.48 }}
    >
      <motion.p className="hero-body text-2xl leading-[33px] tracking-[-0.32px] text-white text-pretty" variants={reveal}>
        Receive to your local bank account. Send it across borders. Hold it in Bitcoin. Store it in
        gold. ENTA gives you the tools to preserve what you own and spend against it &mdash; without
        selling, and without giving up control.
      </motion.p>
      <motion.div className="hero-proof-row mt-8 flex items-center gap-2" variants={reveal}>
        <img
          alt=""
          className="h-8 w-[76px] object-contain"
          src={figmaAssets.waitlistProofAvatars}
        />
        <p className="text-base font-medium leading-[18.5px] text-white">
          Join 500+ others on the waitlist
        </p>
      </motion.div>
      <motion.div className="hero-cta-row mt-12 flex w-full max-w-[453px] gap-4" variants={reveal}>
        <a
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-white px-[18px] text-base font-semibold capitalize leading-6 text-[#0c111d] transition duration-150 ease-out hover:bg-white/90 active:scale-[0.99]"
          href="#waitlist"
        >
          Join our waitlist
        </a>
        <a
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-white/30 px-6 text-base font-semibold capitalize leading-6 text-white backdrop-blur-[2px] transition duration-150 ease-out hover:bg-white/40 active:scale-[0.99]"
          href="#how-it-works"
        >
          Learn more
        </a>
      </motion.div>
    </motion.div>
  );
}

type WaitlistInfo = {
  position?: number;
  referralLink?: string;
};

const referralShareText =
  "I just joined the Enta waitlist — one account for USDT, Bitcoin, and gold, straight from your local currency. Join me:";
const fallbackShareLink = "https://www.entashiga.io";
const telegramChannelUrl = "https://t.me/AfriSignal";

function WaitlistSuccessDialog({
  info,
  onClose,
  open,
}: {
  info: WaitlistInfo | null;
  onClose: () => void;
  open: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const shareLink = info?.referralLink ?? fallbackShareLink;

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard can be unavailable (permissions/older browsers); the link stays selectable.
    }
  }

  useEffect(() => {
    if (!open) return;

    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#0d101d]/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-labelledby="waitlist-success-title"
            aria-modal="true"
            className="relative w-full max-w-[420px] rounded-[17px] bg-white p-8 text-center text-[#344054] shadow-[0_0_0_12px_rgba(255,255,255,0.2)]"
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            role="dialog"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#eff8ff]">
              <svg
                aria-hidden="true"
                className="size-8"
                fill="none"
                stroke="#175cd3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <h3 className="mt-5 text-2xl font-semibold text-[#101828]" id="waitlist-success-title">
              {info?.position
                ? `You're #${info.position.toLocaleString("en-US")} on the waitlist!`
                : "You're on the waitlist!"}
            </h3>
            <p className="mt-3 text-base leading-6 text-[#475467]">
              Thanks for joining — we&rsquo;ll be in touch with your onboarding details.{" "}
              <span className="font-semibold text-[#101828]">
                Want to move up the waitlist? Copy your link below and share it — every friend who
                joins bumps you up.
              </span>
            </p>
            <div className="mt-6">
              <div className="flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-[#f9fafb] p-1.5 pl-3">
                <span className="min-w-0 flex-1 truncate text-left text-sm text-[#475467]">
                  {shareLink}
                </span>
                <button
                  className="shrink-0 rounded-md bg-[#175cd3] px-3.5 py-2 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-[#164caa] active:scale-[0.98]"
                  onClick={copyReferralLink}
                  type="button"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
              <div className="mt-3 flex justify-center gap-2">
                <a
                  className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#e7f6ec] text-sm font-semibold text-[#067647] transition duration-150 ease-out hover:bg-[#d3f0dd]"
                  href={`https://wa.me/?text=${encodeURIComponent(`${referralShareText} ${shareLink}`)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Share on WhatsApp
                </a>
                <a
                  className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#f2f4f7] text-sm font-semibold text-[#101828] transition duration-150 ease-out hover:bg-[#e4e7ec]"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(referralShareText)}&url=${encodeURIComponent(shareLink)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Share on X
                </a>
              </div>
              <div className="mt-5 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-[#e4e7ec]" />
                <span className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">or</span>
                <span className="h-px flex-1 bg-[#e4e7ec]" />
              </div>
              <a
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#229ed9] text-base font-semibold text-white transition duration-150 ease-out hover:bg-[#1d8bc0] active:scale-[0.99]"
                href={telegramChannelUrl}
                rel="noreferrer"
                target="_blank"
              >
                <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.9 4.4 18.7 19.5c-.24 1.06-.87 1.32-1.76.82l-4.87-3.59-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.95L18.1 6.4c.39-.35-.09-.54-.61-.2L6.35 13.23l-4.8-1.5c-1.04-.33-1.06-1.04.22-1.54L20.55 3.1c.87-.32 1.63.2 1.35 1.3Z" />
                </svg>
                Join our Telegram — AfriSignal
              </a>
            </div>
            <button
              autoFocus
              className="mt-8 flex h-12 w-full items-center justify-center rounded-lg bg-[#175cd3] text-base font-semibold text-white transition duration-150 ease-out hover:bg-[#164caa] active:scale-[0.99]"
              onClick={onClose}
              type="button"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function WaitlistForm() {
  const [audience, setAudience] = useState<"individual" | "business">("individual");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistInfo, setWaitlistInfo] = useState<WaitlistInfo | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...getAttribution(), audience }),
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const payload = (await response.json()) as { waitlist?: WaitlistInfo | null };

      setWaitlistInfo(payload.waitlist ?? null);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
    <WaitlistSuccessDialog
      info={waitlistInfo}
      onClose={() => setStatus("idle")}
      open={status === "success"}
    />
    <motion.form
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="hero-form z-30 w-full max-w-[480px] rounded-[17px] border border-[#f6f7fa] bg-white p-6 text-[#344054] shadow-[0_0_0_12px_rgba(255,255,255,0.5)] sm:p-8"
      id="waitlist"
      initial={{ opacity: 0, y: 34, scale: 0.985 }}
      onSubmit={onSubmit}
      transition={{ delay: 0.7, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        aria-label="Waitlist type"
        className="mx-auto mb-[21px] flex w-fit rounded-full bg-[#e4e7ec]"
        role="tablist"
      >
        <AudienceButton
          active={audience === "individual"}
          label="I'm an individual"
          onClick={() => setAudience("individual")}
        />
        <AudienceButton
          active={audience === "business"}
          label="I'm a business"
          onClick={() => setAudience("business")}
        />
      </div>

      <div className="space-y-[21px]">
        {audience === "individual" ? (
          <>
            <FloatingTextField field={formFields[0]} />
            <CountryCombobox />
            <FloatingTextField field={formFields[1]} />
            <FloatingTextField field={formFields[2]} />
            <FrustrationField />
          </>
        ) : (
          <>
            <div className="grid gap-[13px] sm:grid-cols-2 sm:gap-[21px]">
              <FloatingTextField field={businessFields[0]} />
              <FloatingTextField field={businessFields[1]} />
            </div>
            <FloatingTextField field={businessFields[2]} />
            <VolumeSelect />
            <div className="grid gap-[13px] sm:grid-cols-2 sm:gap-[21px]">
              <FloatingTextField field={businessFields[3]} />
              <FloatingTextField field={businessFields[4]} />
            </div>
            <CountryCombobox />
            <ProblemTextarea />
          </>
        )}
      </div>

      <input
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
        name="website"
        tabIndex={-1}
        type="text"
      />

      <button
        className="mt-[34px] flex h-[52px] w-full items-center justify-center rounded-lg bg-[#175cd3] px-5 text-[17px] font-semibold leading-[26px] text-white shadow-[0_1px_2px_rgba(16,24,40,0.05),inset_0_0_0_1px_rgba(16,24,40,0.18),inset_0_-2px_0_0_rgba(16,24,40,0.05)] transition duration-150 ease-out hover:bg-[#164caa] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading"
          ? "Joining..."
          : status === "success"
            ? "You're on the list ✓"
            : status === "error"
              ? "Something went wrong — try again"
              : "Join The Waitlist"}
      </button>
    </motion.form>
    </>
  );
}

function FloatingTextField({ field }: { field: FieldConfig }) {
  return (
    <label className="floating-field" htmlFor={field.id}>
      <input
        autoComplete={field.autoComplete}
        className="floating-input peer"
        id={field.id}
        name={field.id}
        placeholder=" "
        required={field.required}
        type={field.type}
      />
      <span className="floating-label">{field.label}</span>
      {field.helper ? <span className="field-helper">{field.helper}</span> : null}
    </label>
  );
}

function VolumeSelect() {
  return (
    <label className="floating-field" htmlFor="volume">
      <select className="floating-input appearance-none" defaultValue="" id="volume" name="volume">
        <option disabled value="">
          Select range
        </option>
        {volumeRanges.map((range) => (
          <option key={range} value={range}>
            {range}
          </option>
        ))}
      </select>
      <span className="floating-label">Monthly cross-border transaction volume</span>
      <span aria-hidden="true" className="country-chevron" />
    </label>
  );
}

function FrustrationField() {
  return (
    <label className="floating-field" htmlFor="frustration">
      <span className="floating-label !text-[14px] !leading-5">
        What is your biggest frustration with sending or holding money across borders?{" "}
        <span className="text-[#a9b4c8]">(optional)</span>
      </span>
      <textarea
        className="floating-input floating-textarea !min-h-[62px] !text-[14px] placeholder:text-[#667085]"
        id="frustration"
        name="problem"
        placeholder="Short text"
        rows={2}
      />
    </label>
  );
}

function ProblemTextarea() {
  return (
    <label className="floating-field" htmlFor="problem">
      <textarea
        className="floating-input floating-textarea"
        id="problem"
        name="problem"
        placeholder=" "
        rows={2}
      />
      <span className="floating-label">
        What payment problem costs your business the most right now? (optional)
      </span>
    </label>
  );
}

function CountryCombobox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = "country-listbox";

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCountries = useMemo(() => {
    if (!normalizedQuery) return countries;

    return countries.filter((country) => {
      const name = country.name.toLowerCase();
      const code = country.code.toLowerCase();
      return name.includes(normalizedQuery) || code.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const activeCountry = filteredCountries[highlightedIndex];
  const showSelectedFlag = selectedCountry != null && query === selectedCountry.name;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setHighlightedIndex(0);
  }, [normalizedQuery, open]);

  useEffect(() => {
    if (!open || !activeCountry) return;
    document
      .getElementById(countryOptionId(activeCountry.code))
      ?.scrollIntoView({ block: "nearest" });
  }, [activeCountry, open]);

  function selectCountry(country: CountryOption) {
    setSelectedCountry(country);
    setQuery(country.name);
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((current) =>
        filteredCountries.length === 0 ? 0 : (current + 1) % filteredCountries.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((current) =>
        filteredCountries.length === 0
          ? 0
          : (current - 1 + filteredCountries.length) % filteredCountries.length,
      );
      return;
    }

    if (event.key === "Enter" && open) {
      event.preventDefault();
      if (activeCountry) selectCountry(activeCountry);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="country-combobox relative" ref={rootRef}>
      <input name="country" type="hidden" value={selectedCountry?.name ?? ""} />
      <input name="countryCode" type="hidden" value={selectedCountry?.code ?? ""} />
      <div className="floating-field">
        {showSelectedFlag ? (
          <span aria-hidden="true" className="country-selected-flag">
            {selectedCountry.flag}
          </span>
        ) : null}
        <input
          aria-activedescendant={open && activeCountry ? countryOptionId(activeCountry.code) : undefined}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          autoComplete="off"
          className={cn("floating-input country-input", showSelectedFlag && "country-input-with-flag")}
          id="country"
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (selectedCountry?.name !== value) setSelectedCountry(null);
            setOpen(true);
          }}
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder=" "
          ref={inputRef}
          role="combobox"
          type="text"
          value={query}
        />
        <label
          className={cn(
            "floating-label",
            (open || query.length > 0) && "floating-label-active",
          )}
          htmlFor="country"
        >
          Country
        </label>
        <span aria-hidden="true" className={cn("country-chevron", open && "country-chevron-open")} />
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="country-menu absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[#d0d5dd] bg-white shadow-xl"
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div
              aria-label="Countries"
              className="max-h-[252px] overflow-y-auto p-1.5"
              id={listboxId}
              role="listbox"
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country, index) => {
                  const active = index === highlightedIndex;
                  const selected = selectedCountry?.code === country.code;

                  return (
                    <button
                      aria-selected={selected}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] leading-5 text-[#344054] transition duration-150 ease-out",
                        active && "bg-[#eff6ff] text-[#175cd3]",
                        selected && "font-semibold",
                      )}
                      id={countryOptionId(country.code)}
                      key={country.code}
                      onClick={() => selectCountry(country)}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      role="option"
                      type="button"
                    >
                      <span className="country-option-flag" aria-hidden="true">
                        {country.flag}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{country.name}</span>
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-4 text-sm text-[#667085]">No countries found</p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function countryOptionId(code: string) {
  return `country-option-${code}`;
}

function AudienceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-selected={active}
      className={cn(
        "flex items-center justify-center whitespace-nowrap rounded-full px-[13px] py-1 text-[15px] font-medium leading-[21.5px] transition duration-150 ease-out max-[380px]:px-2 max-[380px]:text-[13px]",
        active ? "bg-[#175cd3] text-white" : "text-[#344054] hover:text-[#175cd3]",
      )}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {label}
    </button>
  );
}
