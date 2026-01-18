import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const state = searchParams.get("state");
  const redirectUri = searchParams.get("redirect_uri");

  if (!token || !redirectUri) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const params = new URLSearchParams({
    token,
    state: state || "",
  });

  return NextResponse.redirect(`${redirectUri}?${params.toString()}`);
}
