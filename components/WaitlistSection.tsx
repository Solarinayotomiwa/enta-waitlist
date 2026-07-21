"use client";

import { WaitlistForm } from "./Hero";
import { figmaAssets } from "@/lib/figma-assets";

export function WaitlistSection() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#0d101d] px-6 py-24 text-white sm:py-[120px] lg:px-0"
      id="waitlist-form"
    >
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
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
