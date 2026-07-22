import type { Metadata } from "next";
import { Header } from "@/components/Hero";
import { FooterSection } from "@/components/FooterSection";
import { figmaAssets } from "@/lib/figma-assets";

export const metadata: Metadata = {
  title: "Blog — Enta",
  description:
    "AI is reshaping cryptocurrency in Africa, highlighting innovations and challenges in the market.",
};

const tocItems = [
  { label: "AI meets the African crypto space", href: "#ai-meets-crypto" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Set the pace for what's next", href: "#whats-next" },
];

const relatedPosts = [
  {
    category: "blog",
    title: "AI is transforming the crypto space: A short read about the African crypto space",
    photo: true,
  },
  {
    category: "blog",
    title: "AI is reshaping cryptocurrency in Africa, highlighting innovations and challenges",
    photo: false,
  },
  {
    category: "blog",
    title: "How individuals and businesses across Africa move value at the speed of a text",
    photo: false,
  },
] as const;

function ShareIcons() {
  return (
    <div className="flex items-center gap-8 text-[#98a2b3]">
      <a aria-label="Copy link" className="transition hover:text-white" href="#">
        <svg className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </a>
      <a aria-label="Share on X" className="transition hover:text-white" href="#">
        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a aria-label="Share on LinkedIn" className="transition hover:text-white" href="#">
        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0" />
        </svg>
      </a>
      <a aria-label="Share on Instagram" className="transition hover:text-white" href="#">
        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84m0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4m7.85-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44" />
        </svg>
      </a>
    </div>
  );
}

function ArticleImage({ alt, src, tall }: { alt: string; src: string; tall?: boolean }) {
  return (
    <img
      alt={alt}
      className={`w-full rounded-lg object-cover ${tall ? "lg:h-[423px]" : "lg:h-[230px]"}`}
      src={src}
    />
  );
}

function VideoPlaceholder() {
  return (
    <div className="relative overflow-hidden rounded-lg lg:h-[423px]">
      <img
        alt=""
        className="size-full object-cover"
        src={figmaAssets.blogFeaturedPhoto}
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[70px] bg-gradient-to-b from-black/60 to-transparent" />
      <p className="absolute left-[78px] top-[14px] text-[17px] font-medium leading-[38px] text-white">
        Enta, explained | Money that works everywhere you do
      </p>
      <span className="absolute left-1/2 top-1/2 flex h-[52px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[14px] bg-[#f00]">
        <svg className="ml-0.5 size-6" fill="white" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </div>
  );
}

function Blockquote({ attribution, children, role }: { attribution: string; children: string; role: string }) {
  return (
    <blockquote className="flex flex-col gap-0 pl-10 text-[22.5px] italic leading-7 text-[#98a2b3]">
      <p>{children}</p>
      <p className="not-italic">
        &mdash; <span className="font-bold">{attribution}</span>, {role}
      </p>
    </blockquote>
  );
}

function QuoteList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-6">
      {items.map((item) => (
        <li className="flex gap-3 text-[17px] leading-[25px] text-[#98a2b3]" key={item}>
          <span aria-hidden="true">&bull;</span>
          <span>&ldquo;{item}&rdquo;</span>
        </li>
      ))}
    </ul>
  );
}

export default function BlogPage() {
  return (
    <main className="bg-[#0d101d] text-white">
      <div className="relative bg-[#182230]">
        <Header />
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-16 pt-[126px] lg:px-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-6">
            <div className="min-w-0 flex-1 pt-4">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13.8px] leading-5 text-[#d0d5dd]">
                <a className="transition hover:text-white" href="/#blog">
                  Blog
                </a>
                <span aria-hidden="true">&rarr;</span>
                <span className="text-[13.3px]">Enta news</span>
              </nav>
              <p className="mt-[53px] text-[13.1px] leading-5 text-white/60">June 3, 2026</p>
              <h1 className="mt-3.5 max-w-[594px] text-[30px] leading-9 tracking-[-0.005px] text-white sm:text-[37.8px] sm:leading-[42px]">
                AI is transforming the crypto space: Read about the African crypto space
              </h1>
              <div className="mt-[15px] flex items-center gap-3">
                <img
                  alt=""
                  className="size-10 rounded-full object-cover"
                  src={figmaAssets.blogAuthor}
                />
                <div>
                  <p className="text-[15.1px] leading-[22px] text-white">Victor Pires</p>
                  <p className="text-[15.3px] leading-[22px] text-[#d0d5dd]">
                    Senior Product Marketing Manager, Enta
                  </p>
                </div>
              </div>
            </div>
            <div className="relative h-[240px] w-full overflow-hidden rounded-xl sm:h-[322px] lg:w-[644px] lg:shrink-0">
              <img
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full rounded-xl object-cover"
                src={figmaAssets.blogGradient}
              />
              <div aria-hidden="true" className="absolute inset-0 rounded-xl bg-[#359ddc] mix-blend-color" />
              <img
                alt="The Enta team working together in the office"
                className="absolute inset-0 size-full rounded-xl object-cover"
                src={figmaAssets.blogFeaturedPhoto}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-6 pt-20 lg:px-16">
        <div className="flex flex-col gap-14 lg:flex-row lg:justify-between">
          <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[417px] lg:self-start">
            <ShareIcons />
            <div className="mt-16">
              <p className="text-[13.3px] font-bold leading-5 text-white">In this article</p>
              <div aria-hidden="true" className="mt-4 border-t border-[#d2cecb]" />
              <ul className="mt-[17px] flex flex-col gap-2">
                {tocItems.map((item) => (
                  <li key={item.label}>
                    <a className="text-[13.3px] leading-5 text-white transition hover:text-[#d0d5dd]" href={item.href}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 rounded-md bg-[#344054] px-6 py-6 text-center">
              <p className="text-[18.9px] leading-[26px] text-white">Join our Afrisignal channel</p>
              <p className="mt-1 text-[14.9px] leading-[22px] text-white">Africa Tech News. Always On</p>
              <a
                className="mt-4 flex h-[51px] w-full items-center justify-center rounded-md bg-[#1570ef] text-[15.1px] text-white transition duration-150 ease-out hover:bg-[#175cd3]"
                href="https://t.me/AfriSignal"
                rel="noreferrer"
                target="_blank"
              >
                Get started
              </a>
            </div>
          </aside>

          <article className="flex w-full min-w-0 flex-col text-[17px] leading-[30px] text-[#98a2b3] lg:w-[753px]">
            <p>
              Africans are living through a fundamental shift in how money works. Local currencies
              keep losing ground while demand for dollars, Bitcoin, and gold keeps growing. Enta
              works with individuals and businesses across more than 15 markets, and every one of
              them is trying to do more with the money they already have.
            </p>
            <p className="mt-[34px]">
              AI is accelerating that shift, but most of what&rsquo;s available today doesn&rsquo;t
              work for African users. You end up stitching together exchange apps, a folder of
              screenshots, and rates traded over chat. It&rsquo;s not auditable, it&rsquo;s not
              connected to your bank, and in the end it doesn&rsquo;t make your money meaningfully
              safer.
            </p>
            <p className="mt-[34px]">
              What&rsquo;s missing isn&rsquo;t more apps. It&rsquo;s the platform underneath them.
              The place where your local currency, stablecoins, Bitcoin, and gold live together, and
              where real transactions actually get done.
            </p>

            <h2 className="mt-[62px] scroll-mt-28 text-[26.9px] leading-8 text-white" id="ai-meets-crypto">
              AI meets the African crypto space
            </h2>
            <p className="mt-[31px]">
              AI is reshaping cryptocurrency in Africa, highlighting innovations and challenges in
              the market. With one account, you can receive to your local bank account, send across
              borders, hold Bitcoin, and store value in gold — all in a transparent and fully
              auditable way.
            </p>
            <div className="mt-[29px]">
              <VideoPlaceholder />
            </div>
            <p className="mt-[29px]">
              You own the setup, so the account follows your rules and your local context. You
              decide what happens automatically and what waits for your approval: a recurring
              transfer that goes out on its own, a large conversion that pauses and asks for your
              confirmation first.
            </p>
            <p className="mt-[34px]">
              Enta is built on regulated infrastructure, but rails alone aren&rsquo;t enough to
              serve emerging markets with the reliability the moment requires. Enta brings what
              general-purpose platforms can&rsquo;t: connectivity to the local banks and mobile
              money systems people actually use, a full audit trail on every action, and settlement
              across African and GCC corridors that has already moved more than $350M.
            </p>
            <div className="mt-[29px]">
              <ArticleImage alt="Chart showing Enta transaction growth" src={figmaAssets.blogGradient} />
            </div>
            <p className="mt-[29px] text-white underline underline-offset-4">
              Read more about how Enta settles across corridors here.
            </p>

            <h2 className="mt-[62px] scroll-mt-28 text-[26.9px] leading-8 text-white" id="how-it-works">
              How it works
            </h2>
            <h3 className="mt-[57px] text-[20px] leading-[27px] text-white">
              Set up your account in minutes
            </h3>
            <p className="mt-[24px]">
              Open an account in a few clicks, whether you hold naira, cedis, shillings, or dollars.
              Pre-built connections link your bank account, mobile money, and wallets, so your money
              has somewhere to go from day one.
            </p>
            <div className="mt-[29px]">
              <ArticleImage alt="Enta account dashboard" src={figmaAssets.howDashboard} tall />
            </div>
            <h3 className="mt-[59px] text-[20px] leading-[27px] text-white">
              Tell Enta how your money works
            </h3>
            <p className="mt-[24px]">
              The account comes with the fundamentals built in: live rates, settlement windows,
              compliance checks. Your job isn&rsquo;t to learn crypto. It&rsquo;s to tell Enta how
              your money moves.
            </p>
            <p className="mt-[34px]">
              Describe what you need in plain English, the same way you would to a private banker:
            </p>
            <div className="mt-[29px]">
              <QuoteList
                items={[
                  "Convert half of every naira deposit into USD₮ the moment it lands",
                  "This business allocates revenue by region, not branch — split it across these six accounts",
                  "If the rate moves more than 2%, stop and pull me in before converting",
                ]}
              />
            </div>
            <p className="mt-[29px]">
              Enta confirms what it heard, asks questions when something is unclear, and shows its
              rationale for every decision. For flows you&rsquo;ll run again, save them as a rule —
              a repeatable playbook your account follows.
            </p>
            <div className="mt-[29px]">
              <ArticleImage alt="Enta dashboard showing balances and transactions" src={figmaAssets.featuresRateDashboard} tall />
            </div>
            <div className="mt-[64px]">
              <Blockquote attribution="Amara Okafor" role="Finance Lead, Lagos Retail Group">
                &ldquo;For me the big thing is consistency. Being able to hold our standard across
                markets, month after month. When the repeatable steps happen the same way every
                time, there&rsquo;s just less room for human error.&rdquo;
              </Blockquote>
            </div>

            <h3 className="mt-[60px] text-[20px] leading-[27px] text-white">Automate your flows</h3>
            <p className="mt-[24px]">
              Build or import payment schedules for every counterparty, then assign each transfer to
              a teammate or an automated rule. Collaborate with others at your business by tagging
              approvers or reviewers on any payment, so you&rsquo;re always moving fast and with
              confidence. As money moves, records build in real time so you can check amounts,
              rates, and fees directly in the platform at every step. When settlement is needed,
              Enta completes it and syncs it directly to your records.
            </p>
            <div className="mt-[29px]">
              <ArticleImage alt="Enta workflow view" src={figmaAssets.featuresMoveDashboard} tall />
            </div>
            <div className="mt-[64px]">
              <Blockquote attribution="Tyler Otto" role="President & Owner, Specialized Trading">
                &ldquo;It is eliminating or reducing the amount of time we spend on month-end
                settlement by 50% with some counterparties.&rdquo;
              </Blockquote>
            </div>

            <h3 className="mt-[60px] scroll-mt-28 text-[20px] leading-[27px] text-white" id="whats-next">
              Set the pace for what&rsquo;s next
            </h3>
            <p className="mt-[24px]">
              Your Enta dashboard, the command center for every balance you hold, shows everything
              at a glance: what&rsquo;s settled, what&rsquo;s moving, and what&rsquo;s waiting on
              your sign-off. Manage your rules from one place, apply them across your whole
              portfolio, and adjust them by market when the situation calls for something different.
              Rules get sharper, your automation grows, and your money&rsquo;s reach compounds.
            </p>
          </article>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1440px] px-6 pb-28 pt-[120px] lg:px-16">
        <h2 className="text-[30px] leading-9 tracking-[-0.005px] text-white sm:text-[37.5px] sm:leading-[42px]">
          Don&rsquo;t miss these
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-6">
          {relatedPosts.map((post) => (
            <a className="group flex flex-col" href="/#blog" key={post.title}>
              <div className="relative h-[237px] w-full overflow-hidden rounded-xl">
                <img
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 size-full rounded-xl object-cover"
                  src={figmaAssets.blogGradient}
                />
                <div aria-hidden="true" className="absolute inset-0 rounded-xl bg-[#359ddc] mix-blend-color" />
                {post.photo ? (
                  <img
                    alt=""
                    className="absolute inset-0 size-full rounded-xl object-cover"
                    src={figmaAssets.blogFeaturedPhoto}
                  />
                ) : null}
              </div>
              <p className="mt-[21px] text-[12.7px] uppercase leading-[19px] text-white">
                {post.category}
              </p>
              <p className="mt-2 max-w-[377px] text-[17px] leading-6 text-white transition group-hover:text-[#d0d5dd]">
                {post.title}
              </p>
            </a>
          ))}
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
