"use client";

import Link from "next/link";
import { Fragment, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { blogArticles } from "@/lib/blog-articles";
import { figmaAssets } from "@/lib/figma-assets";

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

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
          <Link
            aria-label={`Read ${featuredPost.title}`}
            className="group block rounded-lg outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] focus-visible:-translate-y-[3px] focus-visible:ring-2 focus-visible:ring-[#53b1fd]"
            href={featuredPost.href}
          >
            <article className="flex flex-col gap-10 border-b border-[#344054] pb-12 lg:flex-row lg:gap-14">
              <div className="relative aspect-video overflow-hidden rounded-lg border border-[#344054] bg-[#1750cc] lg:aspect-auto lg:h-[360px] lg:flex-1">
                <img
                  alt=""
                  className={`absolute inset-0 size-full rounded-lg object-contain transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015] ${featuredPost.imagePosition}`}
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
                <span className="flex w-fit items-center gap-2 rounded-full bg-[#182230] pl-4 transition duration-150 ease-out group-hover:bg-[#1f2a3d]">
                  <span className="text-lg font-medium leading-7 text-[#d0d5dd]">Read</span>
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#f9fafb]">
                    <img alt="" className="size-5 -scale-x-100" src={figmaAssets.blogArrow} />
                  </span>
                </span>
              </div>
            </article>
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_1px_1fr_1px_1fr] lg:gap-8">
            {posts.map((post, index) => (
              <Fragment key={post.title}>
                {index > 0 ? (
                  <span aria-hidden="true" className="blog-card-separator hidden lg:block" />
                ) : null}
              <motion.div
                animate={contentVisible ? "visible" : "hidden"}
                initial="hidden"
                transition={{ delay: 0.1 + index * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                variants={reveal}
              >
                <Link
                  aria-label={`Read ${post.title}`}
                  className="group flex flex-col gap-6 rounded-lg outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] focus-visible:-translate-y-[3px] focus-visible:ring-2 focus-visible:ring-[#53b1fd]"
                  href={post.href}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[#344054] bg-[#1750cc] lg:aspect-auto lg:h-[208px]">
                    <img
                      alt=""
                      className={`absolute inset-0 size-full rounded-lg object-contain transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015] ${post.imagePosition}`}
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
                </Link>
              </motion.div>
              </Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
