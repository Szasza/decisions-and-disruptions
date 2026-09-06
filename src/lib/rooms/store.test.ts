import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HEARTBEAT_INTERVAL_MS,
  STALE_AFTER_MS,
  SWEEP_TICK_MS,
} from "@/lib/rooms/constants";
import { createRoomStore } from "@/lib/rooms/store";

describe("createRoomStore", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a room with the host as its sole participant", () => {
    const store = createRoomStore();
    const { room, hostParticipant } = store.createRoom({
      gameId: "decisions-and-disruptions",
      hostDisplayName: "Alice",
      hostParticipantId: "host-1",
    });

    expect(room.participants).toEqual([hostParticipant]);
    expect(room.hostParticipantId).toBe("host-1");

    const fetched = store.getRoom(room.code);
    expect(fetched).toEqual(room);
  });

  it("returns undefined for an unknown code", () => {
    const store = createRoomStore();
    expect(store.getRoom("NOPE12")).toBeUndefined();
  });

  it("returns a copy from getRoom, not the live object", () => {
    const store = createRoomStore();
    const { room } = store.createRoom({
      gameId: "decisions-and-disruptions",
      hostDisplayName: "Alice",
      hostParticipantId: "host-1",
    });

    const first = store.getRoom(room.code);
    first?.participants.push({
      id: "intruder",
      displayName: "Intruder",
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
    });

    const second = store.getRoom(room.code);
    expect(second?.participants).toHaveLength(1);
  });

  it("returns room-not-found when joining an unknown code", () => {
    const store = createRoomStore();
    const result = store.joinRoom("NOPE12", {
      participantId: "p1",
      displayName: "Bob",
    });
    expect(result).toEqual({ ok: false, reason: "room-not-found" });
  });

  it("adds a second participant on join with a new participantId", () => {
    const store = createRoomStore();
    const { room } = store.createRoom({
      gameId: "decisions-and-disruptions",
      hostDisplayName: "Alice",
      hostParticipantId: "host-1",
    });

    const result = store.joinRoom(room.code, {
      participantId: "p2",
      displayName: "Bob",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.room.participants).toHaveLength(2);
    }
  });

  it("does not duplicate a participant rejoining with the same participantId", () => {
    const store = createRoomStore();
    const { room } = store.createRoom({
      gameId: "decisions-and-disruptions",
      hostDisplayName: "Alice",
      hostParticipantId: "host-1",
    });
    store.joinRoom(room.code, { participantId: "p2", displayName: "Bob" });

    const before = store.getRoom(room.code);
    const beforeLastSeen = before?.participants.find(
      (p) => p.id === "p2",
    )?.lastSeenAt;

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 1_000);
    const result = store.joinRoom(room.code, {
      participantId: "p2",
      displayName: "Bob renamed",
    });
    vi.useRealTimers();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.room.participants).toHaveLength(2);
      const rejoined = result.room.participants.find((p) => p.id === "p2");
      expect(rejoined?.displayName).toBe("Bob renamed");
      expect(rejoined?.lastSeenAt).toBeGreaterThan(beforeLastSeen ?? 0);
    }
  });

  it("trims and caps an overlong displayName on createRoom", () => {
    const store = createRoomStore();
    const { hostParticipant } = store.createRoom({
      gameId: "decisions-and-disruptions",
      hostDisplayName: `  ${"a".repeat(100)}  `,
      hostParticipantId: "host-1",
    });

    expect(hostParticipant.displayName).toBe("a".repeat(40));
  });

  it("rejects an empty or whitespace-only displayName on createRoom", () => {
    const store = createRoomStore();
    expect(() =>
      store.createRoom({
        gameId: "decisions-and-disruptions",
        hostDisplayName: "   ",
        hostParticipantId: "host-1",
      }),
    ).toThrow("Display name is required");
  });

  it("trims and rejects an invalid displayName on joinRoom", () => {
    const store = createRoomStore();
    const { room } = store.createRoom({
      gameId: "decisions-and-disruptions",
      hostDisplayName: "Alice",
      hostParticipantId: "host-1",
    });

    const result = store.joinRoom(room.code, {
      participantId: "p2",
      displayName: `  ${"b".repeat(100)}  `,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.participant.displayName).toBe("b".repeat(40));
    }

    expect(() =>
      store.joinRoom(room.code, { participantId: "p3", displayName: "" }),
    ).toThrow("Display name is required");
  });

  it("removes a participant on leave and reassigns host if needed", () => {
    const store = createRoomStore();
    const { room } = store.createRoom({
      gameId: "decisions-and-disruptions",
      hostDisplayName: "Alice",
      hostParticipantId: "host-1",
    });
    store.joinRoom(room.code, { participantId: "p2", displayName: "Bob" });

    store.leaveRoom(room.code, "host-1");

    const after = store.getRoom(room.code);
    expect(after?.participants).toHaveLength(1);
    expect(after?.participants[0].id).toBe("p2");
    expect(after?.hostParticipantId).toBe("p2");
  });

  describe("heartbeat / TTL sweep", () => {
    it("keeps a participant present just under STALE_AFTER_MS", () => {
      vi.useFakeTimers();
      const store = createRoomStore();
      const { room } = store.createRoom({
        gameId: "decisions-and-disruptions",
        hostDisplayName: "Alice",
        hostParticipantId: "host-1",
      });

      vi.advanceTimersByTime(STALE_AFTER_MS - 1_000);

      expect(store.getRoom(room.code)?.participants).toHaveLength(1);
    });

    it("removes a participant once STALE_AFTER_MS has elapsed and a sweep tick has run", () => {
      vi.useFakeTimers();
      const store = createRoomStore();
      const { room } = store.createRoom({
        gameId: "decisions-and-disruptions",
        hostDisplayName: "Alice",
        hostParticipantId: "host-1",
      });

      vi.advanceTimersByTime(STALE_AFTER_MS + SWEEP_TICK_MS);

      expect(store.getRoom(room.code)?.participants).toHaveLength(0);
    });

    it("never removes a participant who keeps heartbeating", () => {
      vi.useFakeTimers();
      const store = createRoomStore();
      const { room } = store.createRoom({
        gameId: "decisions-and-disruptions",
        hostDisplayName: "Alice",
        hostParticipantId: "host-1",
      });

      const totalSteps = Math.ceil(
        (STALE_AFTER_MS * 3) / HEARTBEAT_INTERVAL_MS,
      );
      for (let i = 0; i < totalSteps; i++) {
        vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
        store.touchParticipant(room.code, "host-1");
      }

      expect(store.getRoom(room.code)?.participants).toHaveLength(1);
    });
  });
});
