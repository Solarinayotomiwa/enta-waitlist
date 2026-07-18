import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Hero";
import { FooterSection } from "@/components/FooterSection";
import { type BlogBlock, blogArticles, getBlogArticle } from "@/lib/blog-articles";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) return { title: "Article not found — Enta" };

  return {
    title: `${article.title} — Enta`,
    description: article.excerpt,
  };
}

function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="flex w-full min-w-0 flex-col text-[17px] leading-[30px] text-[#98a2b3]">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "h2") {
          return (
            <h2
              className={`text-[26.9px] leading-8 text-white ${index === 0 ? "" : "mt-[62px]"}`}
              key={key}
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "h3") {
          return (
            <h3
              className={`text-[20px] leading-[27px] text-white ${index === 0 ? "" : "mt-[44px]"}`}
              key={key}
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "ul") {
          return (
            <ul className={`flex flex-col gap-2 pl-6 ${index === 0 ? "" : "mt-[29px]"}`} key={key}>
              {block.items.map((item) => (
                <li className="flex gap-3" key={item}>
                  <span aria-hidden="true">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p className={index === 0 ? "" : "mt-[29px]"} key={key}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) notFound();

  const moreArticles = blogArticles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <main className="bg-[#0d101d] text-white">
      <div className="relative bg-[#182230]">
        <Header />
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-16 pt-[126px] lg:px-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-6">
            <div className="min-w-0 flex-1 pt-4">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-[13.8px] leading-5 text-[#d0d5dd]"
              >
                <Link className="transition hover:text-white" href="/#blog">
                  Blog
                </Link>
                <span aria-hidden="true">&rarr;</span>
                <span className="text-[13.3px]">{article.category}</span>
              </nav>
              <div className="mt-[53px] flex items-center gap-3 text-[13.1px] leading-5 text-white/60">
                <span>{article.publishedAt}</span>
                <span aria-hidden="true">&bull;</span>
                <span>{article.readingTime}</span>
              </div>
              <h1 className="mt-3.5 max-w-[594px] text-[30px] leading-9 tracking-[-0.005px] text-white sm:text-[37.8px] sm:leading-[42px]">
                {article.title}
              </h1>
            </div>
            <div className="relative h-[240px] w-full overflow-hidden rounded-xl border border-[#344054] bg-[#1750cc] sm:h-[322px] lg:w-[644px] lg:shrink-0">
              <img
                alt=""
                className={`absolute inset-0 size-full rounded-xl object-contain ${article.imagePosition}`}
                src={article.image}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[820px] px-6 pt-20 lg:px-0">
        <ArticleBody blocks={article.content} />

        <div className="mt-16 rounded-2xl border border-[#344054] bg-[#182230] px-6 py-8 sm:px-10">
          <p className="text-[22px] font-medium leading-8 text-white">
            One account for USD₮, Bitcoin and gold
          </p>
          <p className="mt-2 text-[17px] leading-[26px] text-[#98a2b3]">
            Preserve what you own and spend against it — straight from your local currency, without
            giving up control.
          </p>
          <Link
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-[#0c111d] transition duration-150 ease-out hover:bg-white/90"
            href="/#waitlist"
          >
            Join our waitlist
          </Link>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1440px] px-6 pb-28 pt-[120px] lg:px-16">
        <h2 className="text-[30px] leading-9 tracking-[-0.005px] text-white sm:text-[37.5px] sm:leading-[42px]">
          Don&rsquo;t miss these
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-6">
          {moreArticles.map((post) => (
            <Link className="group flex flex-col" href={post.href} key={post.slug}>
              <div className="relative h-[237px] w-full overflow-hidden rounded-xl border border-[#344054] bg-[#1750cc]">
                <img
                  alt=""
                  className={`absolute inset-0 size-full rounded-xl object-contain transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015] ${post.imagePosition}`}
                  src={post.image}
                />
              </div>
              <p className="mt-[21px] text-[12.7px] uppercase leading-[19px] text-white">
                {post.category}
              </p>
              <p className="mt-2 max-w-[377px] text-[17px] leading-6 text-white transition group-hover:text-[#d0d5dd]">
                {post.title}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
