import { describe, expect, it, vi } from "vitest";
import { generateRoomCode } from "@/lib/rooms/codes";

describe("generateRoomCode", () => {
  it("generates a 6-character code from the ambiguity-free alphabet", () => {
    const code = generateRoomCode(() => false);
    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it("retries when isTaken reports a collision", () => {
    const isTaken = vi
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const code = generateRoomCode(isTaken);

    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
    expect(isTaken).toHaveBeenCalledTimes(2);
  });
});
