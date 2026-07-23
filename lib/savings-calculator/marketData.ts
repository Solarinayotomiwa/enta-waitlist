import { sampleMarketData } from "./sampleData";
import type { SavingsMarketData } from "./types";

/* Single data boundary for the savings calculator.

   TODO(Lekan): swap the implementation here for the production market-data
   API — return `mode: "live"` with real `sources` and `current.capturedAt`
   from the successful response (or `mode: "cached"` with the cached
   timestamp). Nothing in the calculator UI or lib/savings-calculator
   engine may need to change. */
export async function getSavingsMarketData(): Promise<SavingsMarketData> {
  return sampleMarketData;
}
