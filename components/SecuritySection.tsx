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
    title: "Biometric, passwordless security",
    body: "No passwords, no email links. Your face, fingerprint, or device signs in and approves every transaction.",
    icon: figmaAssets.securityIconPassword,
  },
  {
    title: "True self-custody",
    body: "True self-custody means you control your assets completely. Enta offers the framework, but you remain in charge.",
    icon: figmaAssets.securityIconEntaWallet,
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
      className="security-point flex w-full flex-col gap-2.5 rounded-xl border border-[#414167] px-5 py-6 text-white transition duration-300 ease-out hover:-translate-y-1 hover:border-[#4b8bff]"
      initial="hidden"
      transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
      variants={reveal}
    >
      <img
        alt=""
        className="security-point-icon size-16"
        src={point.icon}
      />
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold leading-[30px]">{point.title}</h3>
        <p className="text-pretty text-xl leading-[30px] text-white">{point.body}</p>
      </div>
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
        "security-balance-card relative shrink-0 origin-center overflow-hidden text-white",
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
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-[#1f242f] sm:h-[534px]">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full rounded-xl object-cover"
        src={figmaAssets.securityPanelBgOne}
      />
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full rounded-xl object-cover"
        src={figmaAssets.securityPanelBgTwo}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#0e52c8] opacity-[0.69] mix-blend-hue"
      />

      <motion.div
        animate={active ? { y: [0, -8, 0], rotate: [0, -0.4, 0.4, 0] } : undefined}
        className="absolute left-1/2 top-[23px] z-20 h-[164px] w-[246px] -translate-x-[calc(50%+3.84px)] sm:h-[246px] sm:w-[369px]"
        transition={{ duration: 6.2, ease: "easeInOut", repeat: Infinity }}
      >
        <img
          alt=""
          className="absolute left-[40.4%] top-[11.6%] h-[24%] w-[19%]"
          src={figmaAssets.securityPadlockBack}
        />
        <img
          alt=""
          className="absolute inset-0 size-full object-cover [filter:drop-shadow(0_4px_4.8px_rgba(0,0,0,0.1))]"
          src={figmaAssets.securityPadlock}
        />
      </motion.div>

      <div className="security-balance-stage absolute left-1/2 top-[254px] z-10 flex -translate-x-1/2 items-center gap-[9.5px] max-sm:top-[210px] sm:gap-[15.36px]">
        <BalanceCard
          asset="usdt"
          icon={figmaAssets.securityTokenUsdt}
        />
        <BalanceCard
          asset="btc"
          icon={figmaAssets.securityTokenBtc}
          scale="center"
        />
        <BalanceCard
          asset="xaut"
          icon={figmaAssets.securityTokenXaut}
        />
      </div>
    </div>
  );
}

export function SecuritySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
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
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center gap-16">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="flex max-w-[844px] flex-col items-center gap-3 text-center"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <h2 className="text-balance text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-5xl sm:leading-[52px] sm:tracking-[-0.864px]">
            Only you can touch it
          </h2>
          <p className="mx-auto max-w-[530px] text-pretty text-xl leading-[23px] tracking-[-0.32px] text-white">
            Protected by your biometrics. No platform, no government, no third party can freeze,
            block, or access your assets. Ever.
          </p>
        </motion.div>

        <div className="flex w-full flex-col items-stretch gap-6 lg:flex-row">
          <motion.div
            animate={contentVisible ? "visible" : "hidden"}
            className="min-w-0 flex-1"
            initial="hidden"
            transition={{ delay: 0.06, duration: 0.55, ease: "easeOut" }}
            variants={reveal}
          >
            <SecurityVisual active={motionActive} />
          </motion.div>

          <div className="flex flex-col gap-5 lg:w-[397.33px] lg:shrink-0">
            {securityPoints.map((point, index) => (
              <SecurityPointCard index={index} key={point.title} point={point} visible={contentVisible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
