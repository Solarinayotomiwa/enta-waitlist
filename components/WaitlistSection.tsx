"use client";

import { figmaAssets } from "@/lib/figma-assets";

/* The waitlist signup + referral flow now runs on GetLaunchList: the widget
   script is loaded globally in app/layout.tsx and renders its form (with
   built-in referral handling) into this container. The previous custom
   WaitlistForm remains available in components/Hero.tsx if it is needed
   again. */
function LaunchListCard() {
  return (
    <div
      className="hero-form z-30 w-full max-w-[480px] rounded-[17px] border border-[#f6f7fa] bg-white p-6 text-[#344054] shadow-[0_0_0_12px_rgba(255,255,255,0.5)] sm:p-8"
      id="waitlist"
    >
      <h3 className="text-2xl font-semibold text-[#101828]">Join the waitlist</h3>
      <p className="mt-2 text-base leading-6 text-[#475467]">
        Get early access and move up the list by referring friends.
      </p>
      <div className="launchlist-widget mt-6" data-height="180px" data-key-id="S8WkO8" />
    </div>
  );
}

export function WaitlistSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d101d] px-6 py-24 text-white sm:py-[120px] lg:px-0">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 lg:grid-cols-[419px_1fr] lg:gap-8">
        <div className="lg:pt-4">
          <h2 className="text-balance text-[2.35rem] font-medium leading-[1.08] tracking-[-0.018em] sm:text-5xl sm:leading-[52px]">
            Secure your spot on our waitlist
          </h2>
          <p className="mt-4 max-w-[411px] text-pretty text-xl leading-[26px] tracking-[-0.32px] text-white">
            Limited spots available. We will get in touch with all the onboarding information you
            need to get started.
          </p>
        </div>
        <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-[#1f242f] px-4 py-12 sm:px-8 lg:h-[892px]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <img
              alt=""
              className="absolute inset-0 size-full object-cover"
              src={figmaAssets.waitlistPanelSkyOne}
            />
            <img
              alt=""
              className="absolute inset-0 size-full object-cover"
              src={figmaAssets.waitlistPanelSkyTwo}
            />
            <img
              alt=""
              className="absolute inset-0 size-full object-cover object-bottom"
              src={figmaAssets.waitlistPanelClouds}
            />
            <div className="absolute inset-0 bg-black/15" />
          </div>
          <div className="relative z-10 flex w-full justify-center">
            <LaunchListCard />
          </div>
        </div>
      </div>
    </section>
  );
}
