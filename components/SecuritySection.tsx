"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type SecurityPoint = {
  title: string;
  body: string;
  icon: string;
};

const securityPoints: SecurityPoint[] = [
  {
    title: "Biometric security",
    body: "Your face. Your fingerprint. Your device. The only keys that unlock your account are ones only you carry.",
    icon: figmaAssets.securityFaceId,
  },
  {
    title: "On-chain ownership",
    body: "Every asset you hold is recorded on the blockchain — publicly verifiable, permanently yours.",
    icon: figmaAssets.securityGlobe,
  },
  {
    title: "True self-custody",
    body: "True self-custody means you control your assets completely. Enta offers the framework, but you remain in charge.",
    icon: figmaAssets.securityWallet,
  },
  {
    title: "No third-party access",
    body: "Your assets cannot be moved, frozen, or used without your permission.",
    icon: figmaAssets.securityProhibit,
  },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function SecurityPointCard({ point, visible, index }: { index: number; point: SecurityPoint; visible: boolean }) {
  return (
    <motion.article
      animate={visible ? "visible" : "hidden"}
      className="security-point max-w-[280px] text-white"
      initial="hidden"
      transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
      variants={reveal}
    >
      <img
        alt=""
        className="security-point-icon size-16"
        src={point.icon}
      />
      <h3 className="mt-3 text-base font-semibold leading-[1.44] tracking-[-0.02em]">{point.title}</h3>
      <p className="mt-3 text-pretty text-base leading-[1.44] tracking-[-0.02em] text-white/84">{point.body}</p>
    </motion.article>
  );
}

function BalanceCard({
  className,
  icon,
  scale = "side",
  asset,
}: {
  asset: "usdt" | "btc" | "xaut";
  className?: string;
  icon: string;
  scale?: "side" | "center";
}) {
  const isCenter = scale === "center";

  return (
    <div
      data-security-balance-card={asset}
      className={cn(
        "security-balance-card relative shrink-0 origin-center overflow-hidden border border-white/45 text-white backdrop-blur-[2px]",
        isCenter
          ? "h-[110px] w-[243px] rounded-[11.4px] bg-white/[0.1] sm:h-[177.408px] sm:w-[392.832px] sm:rounded-[18.432px]"
          : "h-[91px] w-[202px] rounded-[9.5px] bg-white/[0.15] sm:h-[147.84px] sm:w-[327.36px] sm:rounded-[15.36px]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute right-[7%] top-[15.6%] flex items-center justify-center rounded-full border border-white bg-white/10",
          isCenter ? "size-[38px] sm:size-[61.056px]" : "size-[31.5px] sm:size-[50.88px]",
        )}
      >
        <img alt="" className={cn(isCenter ? "size-[83%]" : "size-[78%]")} src={icon} />
      </div>
      <div
        className={cn(
          "absolute left-[7%] top-[22%] flex items-center",
          isCenter ? "gap-[7px] sm:gap-[11.52px]" : "gap-[6px] sm:gap-[9.6px]",
        )}
      >
        <span
          className={cn(
            "font-medium leading-none tracking-[-0.018em]",
            isCenter ? "text-[1.08rem] sm:text-[1.728rem]" : "text-[0.9rem] sm:text-[1.44rem]",
          )}
        >
          Total balance
        </span>
        <img
          alt=""
          className={cn(isCenter ? "size-[17px] sm:size-[27.648px]" : "size-[14px] sm:size-[23.04px]")}
          src={figmaAssets.securityEyeSlash}
        />
      </div>
      <p
        className={cn(
          "absolute bottom-[17%] left-[7%] font-medium leading-none tracking-[-0.018em]",
          isCenter ? "text-[2.08rem] sm:text-[3.456rem]" : "text-[1.78rem] sm:text-[2.88rem]",
        )}
      >
        *******
      </p>
    </div>
  );
}

function SecurityVisual({ active }: { active: boolean }) {
  return (
    <div className="relative mx-auto size-[330px] overflow-hidden rounded-3xl sm:size-[534px]">
      <img alt="" className="absolute inset-0 size-full object-cover" src={figmaAssets.securityPhoneBg} />

      <motion.img
        alt=""
        animate={active ? { y: [0, -8, 0], rotate: [0, -0.4, 0.4, 0] } : undefined}
        className="absolute left-1/2 top-[4.4%] z-20 h-[158px] w-[235px] -translate-x-1/2 object-cover sm:h-[256px] sm:w-[379px]"
        src={figmaAssets.securityPhoneDevice}
        transition={{ duration: 6.2, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="security-balance-stage absolute left-1/2 top-[47.6%] z-10 flex -translate-x-1/2 items-center gap-[9.5px] sm:gap-[15.36px]">
        <BalanceCard
          asset="usdt"
          icon={figmaAssets.securityCoin}
        />
        <BalanceCard
          asset="btc"
          icon={figmaAssets.securityCardIconOne}
          scale="center"
        />
        <BalanceCard
          asset="xaut"
          icon={figmaAssets.calculatorChartXaut}
        />
      </div>
    </div>
  );
}

export function SecuritySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "220px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);
  const motionActive = isInView && !reducedMotion;

  return (
    <section
      className={cn(
        "security-section relative isolate overflow-hidden bg-[#0d101d] px-6 py-24 text-white sm:py-[120px] lg:px-0",
        motionActive && "motion-active",
      )}
      id="security"
      ref={sectionRef}
    >
      <div aria-hidden="true" className="security-section-glow" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="max-w-[844px] text-center"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <h2 className="text-balance text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-5xl">
            Only you can touch it
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-pretty text-base leading-[1.44] tracking-[-0.02em] text-white/80">
            Protected by your biometrics. No platform, no government, no third party can freeze,
            block, or access your assets. Ever.
          </p>
        </motion.div>

        <div className="mt-16 grid w-full items-center gap-8 lg:grid-cols-[258px_534px_258px] lg:gap-[75px]">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:gap-[69px]">
            <SecurityPointCard index={0} point={securityPoints[0]} visible={contentVisible} />
            <SecurityPointCard index={2} point={securityPoints[2]} visible={contentVisible} />
          </div>

          <motion.div
            animate={contentVisible ? "visible" : "hidden"}
            initial="hidden"
            transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
            variants={reveal}
          >
            <SecurityVisual active={motionActive} />
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:gap-[69px]">
            <SecurityPointCard index={1} point={securityPoints[1]} visible={contentVisible} />
            <SecurityPointCard index={3} point={securityPoints[3]} visible={contentVisible} />
          </div>
        </div>
      </div>
    </section>
  );
}
