import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "dd_player_id";

export function proxy(request: NextRequest) {
  if (request.cookies.get(COOKIE_NAME)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, crypto.randomUUID(), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export const config = {
  matcher: ["/games", "/games/:path*", "/room/:path*", "/api/rooms/:path*"],
};
