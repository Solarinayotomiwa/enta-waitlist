/* Single source of truth for the Enta blog. Both the home-page Blog section and
   the /blog/[slug] article pages read from here, so title, slug, excerpt, cover,
   category, date and body content never drift apart. The articles are written in
   Enta's own words (the LinkedIn posts were only the starting point) and render
   inside Enta's blog layout. */

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

export type BlogArticle = {
  slug: string;
  href: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  imagePosition: string;
  publishedAt: string;
  readingTime: string;
  author: { name: string; role: string };
  content: BlogBlock[];
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "how-to-actually-buy-gold-in-nigeria",
    href: "/blog/how-to-actually-buy-gold-in-nigeria",
    title: "How to actually buy gold in Nigeria: five options, compared",
    category: "Gold",
    excerpt:
      "A comparison of five ways to own gold in Nigeria and the trade-offs behind each option.",
    image: "/images/blog/how-to-buy-gold-nigeria.png",
    imagePosition: "object-center",
    publishedAt: "June 13, 2026",
    readingTime: "6 min read",
    author: { name: "Victor Pires", role: "Senior Product Marketing Manager, Enta" },
    content: [
      {
        type: "p",
        text: "Gold has always been the fallback when a currency loses its footing, and in Nigeria that instinct runs deep. The harder question is practical: once you decide to hold gold, how do you actually buy it, and what are you really signing up for with each route?",
      },
      {
        type: "p",
        text: "Below are five common ways to own gold as a Nigerian, and the trade-offs that separate them. The right answer depends less on the gold itself and more on how quickly you need to access it, how much you are storing, and how much friction you are willing to carry.",
      },
      { type: "h2", text: "The five options" },
      { type: "h3", text: "1. Physical jewellery" },
      {
        type: "p",
        text: "The most familiar route, and often the worst on price. You pay for craftsmanship and retail markup on top of the metal, and you sell back at a discount. Jewellery is wearable value, not an efficient store of it.",
      },
      { type: "h3", text: "2. Gold bars and coins" },
      {
        type: "p",
        text: "Closer to the spot price than jewellery, but you take on sourcing risk, authentication, and secure storage. A bar is only worth its purity, and proving that purity when you sell is your problem to solve.",
      },
      { type: "h3", text: "3. Dealers and bureaux" },
      {
        type: "p",
        text: "Convenient for larger amounts, but spreads vary widely and trust is doing a lot of work. Without a clear, auditable record of what you bought and at what rate, reconciliation later becomes guesswork.",
      },
      { type: "h3", text: "4. Gold-backed funds and ETFs" },
      {
        type: "p",
        text: "Easy to hold on paper, but access from Nigeria is uneven, and you are usually one more intermediary removed from the metal. Fees compound quietly, and moving in and out is rarely instant.",
      },
      { type: "h3", text: "5. Tokenised gold" },
      {
        type: "p",
        text: "Each token is backed by allocated physical gold, but it lives in your wallet. You get exposure to the metal without a vault, a courier, or a locked showroom, and you can move or convert it in minutes rather than days.",
      },
      { type: "h2", text: "How to choose" },
      {
        type: "ul",
        items: [
          "If you want to wear it, buy jewellery — but treat it as an ornament, not an investment.",
          "If you are storing serious value, prioritise a route with a clear audit trail and a tight spread.",
          "If access speed matters, tokenised gold removes the storage and settlement friction entirely.",
        ],
      },
      {
        type: "p",
        text: "Enta was built for that last case: hold gold (and USD₮ and Bitcoin) straight from your local currency, with a full record of every rate and transaction, and convert whenever you need to without giving up custody.",
      },
    ],
  },
  {
    slug: "gold-without-the-vault",
    href: "/blog/gold-without-the-vault",
    title:
      "Gold without the vault: holding the ultimate hedge against currency fluctuation with just your wallet",
    category: "Wealth preservation",
    excerpt:
      "How digital ownership preserves gold’s value while removing the friction of physical storage.",
    image: "/images/blog/gold-without-the-vault.png",
    imagePosition: "object-center",
    publishedAt: "June 7, 2026",
    readingTime: "5 min read",
    author: { name: "Victor Pires", role: "Senior Product Marketing Manager, Enta" },
    content: [
      {
        type: "p",
        text: "Gold is the oldest hedge there is. It holds its ground when currencies wobble, and it has done so for five thousand years. The problem was never the metal — it was everything around it: the vault, the courier, the insurance, and the quiet fear of holding something valuable you cannot easily verify or move.",
      },
      {
        type: "p",
        text: "Digital ownership changes the calculus. Instead of a bar in a safe, you hold tokenised gold backed one-to-one by allocated metal. The value is the same; the friction is gone.",
      },
      { type: "h2", text: "What you keep" },
      {
        type: "p",
        text: "You keep the hedge. When the naira slips, gold-denominated value does what it has always done. And because the position sits in your wallet, you keep control: no third party decides when you can access it.",
      },
      { type: "h2", text: "What you lose" },
      {
        type: "ul",
        items: [
          "The vault, and the cost of renting one.",
          "The authentication problem — provenance and purity are handled at the source.",
          "The settlement wait — converting to spend or to another asset takes minutes.",
        ],
      },
      {
        type: "p",
        text: "The result is gold that behaves like the store of value it always was, but moves at the speed of everything else you do with money. You can hold it, watch it, and convert against it without ever touching a physical bar.",
      },
      {
        type: "p",
        text: "That is the whole idea behind Enta: preserve what you own, spend against it, and keep custody — without selling and without giving up control.",
      },
    ],
  },
  {
    slug: "get-started-with-bitcoin-2026",
    href: "/blog/get-started-with-bitcoin-2026",
    title: "The best way to get started with Bitcoin in 2026",
    category: "Bitcoin",
    excerpt:
      "A practical look at Bitcoin as a long-term asset and the infrastructure needed to hold it properly.",
    image: "/images/blog/get-started-with-bitcoin-2026.png",
    imagePosition: "object-center",
    publishedAt: "June 1, 2026",
    readingTime: "6 min read",
    author: { name: "Victor Pires", role: "Senior Product Marketing Manager, Enta" },
    content: [
      {
        type: "p",
        text: "Getting started with Bitcoin in 2026 is less about timing the market and more about setting up properly. The people who do well with Bitcoin over time are rarely the ones chasing the chart — they are the ones who bought carefully, held securely, and did not get talked out of it.",
      },
      { type: "h2", text: "Treat it as a long-term asset" },
      {
        type: "p",
        text: "Bitcoin is volatile week to week and remarkably durable decade to decade. If you approach it as a long-term store of value rather than a trade, most of the day-to-day noise stops mattering. Decide how much you want to hold, then build the position steadily.",
      },
      { type: "h2", text: "Get the infrastructure right" },
      {
        type: "p",
        text: "Where and how you hold Bitcoin matters as much as the decision to hold it. The right setup gives you three things:",
      },
      {
        type: "ul",
        items: [
          "Fair access — buy from your local currency at real rates, without hidden markup.",
          "Real custody — you control the asset, not a platform that can freeze it.",
          "A clear record — every purchase, rate and fee auditable, so nothing is a mystery later.",
        ],
      },
      { type: "h3", text: "Buy in a way you can repeat" },
      {
        type: "p",
        text: "A repeatable process beats a lucky entry. Buying a fixed amount on a schedule smooths out your average price and takes emotion out of the decision. The goal is a habit you can keep for years, not a single well-timed click.",
      },
      {
        type: "p",
        text: "Enta brings that together: buy Bitcoin from your local currency or USD₮ with deep liquidity and no runaround, hold it with real custody, and keep a full record of every move — all in one account alongside your dollars and gold.",
      },
    ],
  },
  {
    slug: "tokenization-in-emerging-markets",
    href: "/blog/tokenization-in-emerging-markets",
    title: "Tokenization in emerging markets: the opportunity hiding in plain sight",
    category: "Tokenized assets",
    excerpt:
      "How tokenized assets can expand access and improve financial infrastructure in emerging markets.",
    image: "/images/blog/tokenization-emerging-markets.png",
    imagePosition: "object-center",
    publishedAt: "May 23, 2026",
    readingTime: "7 min read",
    author: { name: "Victor Pires", role: "Senior Product Marketing Manager, Enta" },
    content: [
      {
        type: "p",
        text: "Tokenization tends to get discussed as a developed-market story — treasuries on-chain, funds wrapped as tokens, institutions experimenting at the edges. But the sharpest use case is hiding in plain sight in emerging markets, where the gap between what people need and what the existing infrastructure offers is widest.",
      },
      { type: "h2", text: "The access problem" },
      {
        type: "p",
        text: "In much of Africa and the GCC, holding dollars, gold, or a diversified store of value is harder than it should be. Local rails are fragmented, cross-border settlement is slow, and the tools that do exist were rarely designed for the currencies and contexts people actually operate in.",
      },
      {
        type: "p",
        text: "Tokenised assets collapse that distance. A dollar-pegged stablecoin, tokenised gold, or Bitcoin can be held in the same place, moved instantly, and accessed directly from a local currency — no offshore account, no queue, no intermediary deciding whether you qualify.",
      },
      { type: "h2", text: "Why it matters more here" },
      {
        type: "ul",
        items: [
          "It widens access — value that was gated behind banks and brokers becomes reachable from a phone.",
          "It improves the rails — settlement moves from days to minutes, with a record attached to every step.",
          "It meets people where they are — starting from the local currency, not around it.",
        ],
      },
      {
        type: "p",
        text: "The opportunity is not tokenization for its own sake. It is the infrastructure it makes possible: a place where local currency, stablecoins, Bitcoin and gold live together, and where real transactions get done reliably.",
      },
      {
        type: "p",
        text: "That is exactly the platform Enta is building for more than fifteen markets — turning tokenised assets from a headline into everyday financial access.",
      },
    ],
  },
];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug);
}
