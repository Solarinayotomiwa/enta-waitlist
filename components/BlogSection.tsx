"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { figmaAssets } from "@/lib/figma-assets";

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

const featuredPost = {
  tag: "blog",
  readTime: "10 min read",
  title: "AI is transforming the crypto space: Read about the African crypto space",
  excerpt:
    "AI is reshaping cryptocurrency in Africa, highlighting innovations and challenges in the market.",
  href: "/blog",
};

const posts = [
  {
    tag: "blog",
    readTime: "10 min read",
    title: "AI is transforming the crypto space: A short read about the African crypto space",
    excerpt:
      "AI is reshaping cryptocurrency in Africa, highlighting innovations and challenges in the market.",
    href: "/blog",
  },
  {
    tag: "blog",
    readTime: "10 min read",
    title: "AI is transforming the crypto space: A short read about the African crypto space",
    excerpt:
      "AI is reshaping cryptocurrency in Africa, highlighting innovations and challenges in the market.",
    href: "/blog",
  },
  {
    tag: "blog",
    readTime: "10 min read",
    title: "AI is transforming the crypto space: A short read about the African crypto space",
    excerpt:
      "AI is reshaping cryptocurrency in Africa, highlighting innovations and challenges in the market.",
    href: "/blog",
  },
] as const;

function PostMeta({ readTime, tag }: { readTime: string; tag: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-[#eff8ff] px-3 py-1 text-center text-sm font-medium leading-5 text-[#1849a9]">
        {tag}
      </span>
      <span className="text-sm font-medium leading-5 text-[#d0d5dd]">{readTime}</span>
    </div>
  );
}

function GradientThumb({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-[#344054] ${className ?? ""}`}>
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full rounded-lg object-cover"
        src={figmaAssets.blogGradient}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-lg bg-[#359ddc] mix-blend-color"
      />
    </div>
  );
}

export function BlogSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "220px", once: true });
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
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          Read what we&rsquo;ve been up to
        </motion.h2>

        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="flex flex-col gap-14"
          initial="hidden"
          transition={{ delay: 0.06, duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <article className="flex flex-col gap-10 border-b border-[#344054] pb-12 lg:flex-row lg:gap-14">
            <div className="relative h-[240px] overflow-hidden rounded-lg border border-[#344054] sm:h-[360px] lg:h-auto lg:min-h-[360px] lg:flex-1">
              <img
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full rounded-lg object-cover"
                src={figmaAssets.blogGradient}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-lg bg-[#359ddc] mix-blend-color"
              />
              <img
                alt="The Enta team working together in the office"
                className="absolute inset-0 size-full rounded-lg object-cover"
                src={figmaAssets.blogFeaturedPhoto}
              />
            </div>
            <div className="flex flex-col gap-2 lg:w-[576px] lg:shrink-0 lg:self-stretch">
              <div className="flex flex-1 flex-col gap-5 pb-6">
                <PostMeta readTime={featuredPost.readTime} tag={featuredPost.tag} />
                <div className="flex flex-col gap-3">
                  <h3 className="max-w-[555px] text-[26px] font-medium leading-[33px] text-white sm:text-[30px] sm:leading-[38px]">
                    {featuredPost.title}
                  </h3>
                  <p className="max-w-[380px] text-lg leading-[27px] text-[#d0d5dd] sm:text-xl sm:leading-[30px]">
                    {featuredPost.excerpt}
                  </p>
                </div>
              </div>
              <a
                className="flex w-fit items-center gap-3 rounded-full bg-[#182230] pl-6 transition duration-150 ease-out hover:bg-[#1f2a3d]"
                href={featuredPost.href}
              >
                <span className="text-xl font-medium leading-[30px] text-[#d0d5dd]">Read</span>
                <span className="flex size-12 items-center justify-center rounded-full bg-[#f9fafb]">
                  <img alt="" className="size-6 -scale-x-100" src={figmaAssets.blogArrow} />
                </span>
              </a>
            </div>
          </article>

          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8 lg:[&>*+*]:border-l lg:[&>*+*]:border-[#344054] lg:[&>*+*]:pl-8">
            {posts.map((post, index) => (
              <article className="flex flex-col gap-6" key={index}>
                <GradientThumb className="h-[208px] w-full" />
                <div className="flex flex-col gap-5 pb-6">
                  <PostMeta readTime={post.readTime} tag={post.tag} />
                  <div className="flex flex-col gap-3">
                    <h3 className="text-[22px] font-medium leading-[30px] text-white sm:text-2xl sm:leading-8">
                      {post.title}
                    </h3>
                    <p className="max-w-[380px] text-lg leading-[27px] text-[#d0d5dd] sm:text-xl sm:leading-[30px]">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
