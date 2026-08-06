import type { Metadata } from "next";
import { HistorySection } from "@/components/HistorySection";

/* Reference-branch-only route: renders the archived Our History section in
   isolation so it can be previewed without wiring it back into the homepage.
   This route exists only on the history-section-v2 branch. */
export const metadata: Metadata = {
  title: "Our History — archived section preview",
  robots: { index: false, follow: false },
};

export default function HistoryPreviewPage() {
  return (
    <main>
      <HistorySection />
    </main>
  );
}
