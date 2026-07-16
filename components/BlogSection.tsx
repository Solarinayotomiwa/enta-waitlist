"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { figmaAssets } from "@/lib/figma-assets";

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

type BlogArticle = {
  title: string;
  category: string;
  excerpt: string;
  image: string;
  imagePosition: string;
  href: string;
  publishedAt: string;
};

/* Real Shiga Digital articles. Dates are decoded from the LinkedIn activity
   IDs of the announcement posts; covers are the original article covers
   stored locally in /public/images/blog. */
const blogArticles: BlogArticle[] = [
  {
    title: "How to actually buy gold in Nigeria: five options, compared",
    category: "Gold",
    excerpt: "A comparison of five ways to own gold in Nigeria and the trade-offs behind each option.",
    image: "/images/blog/how-to-buy-gold-nigeria.png",
    imagePosition: "object-center",
    href: "https://www.linkedin.com/pulse/how-actually-buy-gold-nigeria-five-options-compared-shigadigital-lr5we",
    publishedAt: "June 13, 2026",
  },
  {
    title:
      "Gold without the vault: holding the ultimate hedge against currency fluctuation with just your wallet",
    category: "Wealth preservation",
    excerpt:
      "How digital ownership preserves gold’s value while removing the friction of physical storage.",
    image: "/images/blog/gold-without-the-vault.png",
    imagePosition: "object-center",
    href: "https://www.linkedin.com/pulse/gold-without-vault-holding-ultimate-hedge-against-currency-qaxke",
    publishedAt: "June 7, 2026",
  },
  {
    title: "The Best Way to Get Started with Bitcoin in 2026",
    category: "Bitcoin",
    excerpt:
      "A practical look at Bitcoin as a long-term asset and the infrastructure needed to hold it properly.",
    image: "/images/blog/get-started-with-bitcoin-2026.png",
    imagePosition: "object-center",
    href: "https://www.linkedin.com/pulse/best-way-get-started-bitcoin-2026-shigadigital-vkece",
    publishedAt: "June 1, 2026",
  },
  {
    title: "Tokenization in emerging markets: the opportunity hiding in plain sight",
    category: "Tokenized assets",
    excerpt:
      "How tokenized assets can expand access and improve financial infrastructure in emerging markets.",
    image: "/images/blog/tokenization-emerging-markets.png",
    imagePosition: "object-center",
    href: "https://www.linkedin.com/pulse/tokenization-emerging-markets-opportunity-hiding-plain-sight-acede",
    publishedAt: "May 23, 2026",
  },
];

const [featuredPost, ...posts] = blogArticles;

function PostMeta({ category, publishedAt }: { category: string; publishedAt: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-[#eff8ff] px-3 py-1 text-center text-sm font-medium leading-5 text-[#1849a9]">
        {category}
      </span>
      <span className="text-sm font-medium leading-5 text-[#d0d5dd]">{publishedAt}</span>
    </div>
  );
}

export function BlogSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);

  return (
    <section
      className="relative isolate overflow-x-clip bg-[#0d101d] px-6 py-24 text-white sm:py-[120px] lg:px-0"
      id="blog"
      ref={sectionRef}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-16">
        <motion.h2
          animate={contentVisible ? "visible" : "hidden"}
          className="mx-auto max-w-[844px] text-balance text-center text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-[48px] sm:leading-[52px] sm:tracking-[-0.864px]"
          initial="hidden"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={reveal}
        >
          Read what we&rsquo;ve been up to
        </motion.h2>

        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="flex flex-col gap-14"
          initial="hidden"
          transition={{ delay: 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={reveal}
        >
          <a
            aria-label={`Read ${featuredPost.title}`}
            className="group block rounded-lg outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] focus-visible:-translate-y-[3px] focus-visible:ring-2 focus-visible:ring-[#53b1fd]"
            href={featuredPost.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            <article className="flex flex-col gap-10 border-b border-[#344054] pb-12 lg:flex-row lg:gap-14">
              <div className="relative h-[240px] overflow-hidden rounded-lg border border-[#344054] sm:h-[360px] lg:h-auto lg:min-h-[360px] lg:flex-1">
                <img
                  alt=""
                  className={`absolute inset-0 size-full rounded-lg object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] ${featuredPost.imagePosition}`}
                  src={featuredPost.image}
                />
              </div>
              <div className="flex flex-col gap-2 lg:w-[576px] lg:shrink-0 lg:self-stretch">
                <div className="flex flex-1 flex-col gap-5 pb-6">
                  <PostMeta category={featuredPost.category} publishedAt={featuredPost.publishedAt} />
                  <div className="flex flex-col gap-3">
                    <h3 className="max-w-[555px] text-[26px] font-medium leading-[33px] text-white sm:text-[30px] sm:leading-[38px] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [display:-webkit-box] [overflow:hidden]">
                      {featuredPost.title}
                    </h3>
                    <p className="max-w-[380px] text-lg leading-[27px] text-[#d0d5dd] sm:text-xl sm:leading-[30px]">
                      {featuredPost.excerpt}
                    </p>
                  </div>
                </div>
                <span className="flex w-fit items-center gap-3 rounded-full bg-[#182230] pl-6 transition duration-150 ease-out group-hover:bg-[#1f2a3d]">
                  <span className="text-xl font-medium leading-[30px] text-[#d0d5dd]">Read</span>
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#f9fafb]">
                    <img alt="" className="size-6 -scale-x-100" src={figmaAssets.blogArrow} />
                  </span>
                </span>
              </div>
            </article>
          </a>

          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8 lg:[&>*+*]:border-l lg:[&>*+*]:border-[#344054] lg:[&>*+*]:pl-8">
            {posts.map((post, index) => (
              <motion.div
                animate={contentVisible ? "visible" : "hidden"}
                initial="hidden"
                key={post.title}
                transition={{ delay: 0.1 + index * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                variants={reveal}
              >
                <a
                  aria-label={`Read ${post.title}`}
                  className="group flex flex-col gap-6 rounded-lg outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] focus-visible:-translate-y-[3px] focus-visible:ring-2 focus-visible:ring-[#53b1fd]"
                  href={post.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <div className="relative h-[208px] w-full overflow-hidden rounded-lg border border-[#344054]">
                    <img
                      alt=""
                      className={`absolute inset-0 size-full rounded-lg object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] ${post.imagePosition}`}
                      src={post.image}
                    />
                  </div>
                  <div className="flex flex-col gap-5 pb-6">
                    <PostMeta category={post.category} publishedAt={post.publishedAt} />
                    <div className="flex flex-col gap-3">
                      <h3 className="text-[22px] font-medium leading-[30px] text-white sm:text-2xl sm:leading-8 [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [display:-webkit-box] [overflow:hidden]">
                        {post.title}
                      </h3>
                      <p className="max-w-[380px] text-lg leading-[27px] text-[#d0d5dd] sm:text-xl sm:leading-[30px]">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
