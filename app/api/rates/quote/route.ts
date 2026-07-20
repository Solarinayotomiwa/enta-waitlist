import { NextResponse } from "next/server";

// The upstream API rejects browser requests from production origins (CORS),
// so this route proxies the call server-side where CORS does not apply.
const UPSTREAM_PATH = "/api/v1/rates/quote";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amount = Number(searchParams.get("amount"));

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "A valid amount is required" },
      { status: 400 },
    );
  }

  // Strip BOM/whitespace that shell pipelines can smuggle into the env value.
  const baseUrl = process.env.BASE_URL?.replace(/^\uFEFF/, "")
    .trim()
    .replace(/\/+$/, "");

  if (!baseUrl) {
    console.error("BASE_URL is not set");
    return NextResponse.json(
      { error: "Rates service is not configured" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(
      `${baseUrl}${UPSTREAM_PATH}?amount=${amount}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Rates API responded ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Rates quote fetch failed", error);
    return NextResponse.json(
      { error: "Unable to fetch rates" },
      { status: 502 },
    );
  }
}
