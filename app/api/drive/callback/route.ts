import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("drive_oauth_state")?.value;
  if (!code || !state || state !== savedState) return NextResponse.redirect(new URL("/dashboard?drive=error", request.url));

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.redirect(new URL("/dashboard?drive=missing-config", request.url));

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: `${request.nextUrl.origin}/api/drive/callback`, grant_type: "authorization_code" }) });
  if (!tokenResponse.ok) return NextResponse.redirect(new URL("/dashboard?drive=error", request.url));
  const tokens = (await tokenResponse.json()) as { refresh_token?: string };
  if (!tokens.refresh_token) return NextResponse.redirect(new URL("/dashboard?drive=missing-refresh", request.url));

  const response = NextResponse.redirect(new URL("/dashboard?drive=connected", request.url));
  response.cookies.set("drive_refresh_token", tokens.refresh_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  response.cookies.delete("drive_oauth_state");
  return response;
}
