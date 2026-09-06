import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "@/lib/format/relativeTime";

describe("formatRelativeTime", () => {
  describe("just now", () => {
    it("returns 'just now' when no time has elapsed", () => {
      expect(formatRelativeTime(1000, 1000)).toBe("just now");
    });

    it("returns 'just now' just under the 5s threshold", () => {
      expect(formatRelativeTime(1000, 1000 + 4_999)).toBe("just now");
    });
  });

  describe("Xs ago", () => {
    it("returns 'Xs ago' right at the 5s threshold", () => {
      expect(formatRelativeTime(1000, 1000 + 5_000)).toBe("5s ago");
    });

    it("returns 'Xs ago' for a value in the middle of the range", () => {
      expect(formatRelativeTime(1000, 1000 + 12_000)).toBe("12s ago");
    });

    it("floors partial seconds rather than rounding", () => {
      expect(formatRelativeTime(1000, 1000 + 12_900)).toBe("12s ago");
    });

    it("returns 'Xs ago' just under the 60s threshold", () => {
      expect(formatRelativeTime(1000, 1000 + 59_999)).toBe("59s ago");
    });
  });
});
