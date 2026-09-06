import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "@/proxy";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("proxy", () => {
  it("sets a dd_player_id cookie when one is not already present", () => {
    const request = new NextRequest("http://localhost/games");
    const response = proxy(request);

    const cookie = response.cookies.get("dd_player_id");
    expect(cookie?.value).toMatch(UUID_PATTERN);
    expect(cookie?.path).toBe("/");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 30);
  });

  it("does not overwrite an existing dd_player_id cookie", () => {
    const request = new NextRequest("http://localhost/games", {
      headers: { cookie: "dd_player_id=existing-id" },
    });
    const response = proxy(request);

    expect(response.cookies.get("dd_player_id")).toBeUndefined();
  });

  it("generates a different id on each request that lacks the cookie", () => {
    const first = proxy(new NextRequest("http://localhost/games"));
    const second = proxy(new NextRequest("http://localhost/games"));

    expect(first.cookies.get("dd_player_id")?.value).not.toBe(
      second.cookies.get("dd_player_id")?.value,
    );
  });

  it("matches exactly the routes that need the identity cookie", () => {
    expect(config.matcher).toEqual([
      "/games",
      "/games/:path*",
      "/room/:path*",
      "/api/rooms/:path*",
    ]);
  });
});
