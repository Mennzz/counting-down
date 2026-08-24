import { afterEach, describe, expect, it, vi } from "vitest";

import type { XiaoBaoSseEvent } from "@/types/xiaobao";
import { consumeSse, xiaoBaoApi } from "./xiaobao";

const streamOf = (...chunks: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });

describe("Xiao Bao SSE parser", () => {
  it("parses events incrementally across chunks and normalizes completed payloads", async () => {
    const onEvent = vi.fn<(event: XiaoBaoSseEvent) => void>();
    const payload = JSON.stringify({
      message: {
        id: "64b64c8f2f3f6d1f7a8b9001",
        conversation_id: "64b64c8f2f3f6d1f7a8b9002",
        role: "ASSISTANT",
        status: "COMPLETE",
        content: "Hello",
        context_references: [],
        proposal_ids: [],
        completed_actions: [],
        created_at: "2026-08-18T10:00:00+00:00",
        updated_at: "2026-08-18T10:00:01+00:00",
      },
      proposals: [],
    });
    const raw = `event: assistant.delta\ndata: {"delta":"Hel"}\n\n: keep-alive\n\nevent: assistant.completed\ndata: ${payload}\n\n`;

    await consumeSse(streamOf(raw.slice(0, 23), raw.slice(23, 71), raw.slice(71)), onEvent);

    expect(onEvent).toHaveBeenNthCalledWith(1, { type: "assistant.delta", delta: "Hel" });
    const completed = onEvent.mock.calls[1][0];
    expect(completed.type).toBe("assistant.completed");
    if (completed.type === "assistant.completed") {
      expect(completed.message.conversationId).toBe("64b64c8f2f3f6d1f7a8b9002");
      expect(completed.message.updatedAt).toBe("2026-08-18T10:00:01.000Z");
    }
  });

  it("ignores heartbeat-only frames", async () => {
    const onEvent = vi.fn<(event: XiaoBaoSseEvent) => void>();
    await consumeSse(streamOf(": keep-alive\n\n"), onEvent);
    expect(onEvent).not.toHaveBeenCalled();
  });
});

describe("Xiao Bao routine API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends structured schedule fields in snake_case", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "routine-1",
      name: "Morning idea",
      instruction: "Give me one idea",
      schedule: {
        frequency: "DAILY",
        local_time: "09:00",
        timezone: "Europe/Amsterdam",
        weekdays: [],
      },
      context_profile: "RELATIONSHIP_CARE",
      delivery_channel: "IN_APP",
      enabled: true,
      next_run_at: "2026-08-25T07:00:00+00:00",
      pause_reason: null,
      created_at: "2026-08-24T10:00:00+00:00",
      updated_at: "2026-08-24T10:00:00+00:00",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const routine = await xiaoBaoApi.createRoutine({
      kind: "ROUTINE",
      name: "Morning idea",
      instruction: "Give me one idea",
      schedule: {
        frequency: "DAILY",
        localTime: "09:00",
        timezone: "Europe/Amsterdam",
        weekdays: [],
      },
      contextProfile: "RELATIONSHIP_CARE",
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toMatchObject({
      context_profile: "RELATIONSHIP_CARE",
      schedule: { local_time: "09:00", timezone: "Europe/Amsterdam", weekdays: [] },
    });
    expect(routine.schedule.localTime).toBe("09:00");
    expect(routine.nextRunAt).toBe("2026-08-25T07:00:00.000Z");
  });

  it("serializes a one-time reminder kind and local date without changing case boundaries", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "reminder-1",
      kind: "REMINDER",
      name: "Cozy date",
      instruction: null,
      message: "Plan our cozy mini-date.",
      schedule: {
        frequency: "ONCE",
        local_date: "2026-08-28",
        local_time: "12:00",
        timezone: "Europe/Stockholm",
        weekdays: [],
      },
      context_profile: "RELATIONSHIP_CARE",
      delivery_channel: "IN_APP",
      enabled: true,
      next_run_at: "2026-08-28T10:00:00+00:00",
      finished_at: null,
      finish_reason: null,
      pause_reason: null,
      created_at: "2026-08-24T10:00:00+00:00",
      updated_at: "2026-08-24T10:00:00+00:00",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const reminder = await xiaoBaoApi.createRoutine({
      kind: "REMINDER",
      name: "Cozy date",
      instruction: null,
      message: "Plan our cozy mini-date.",
      schedule: {
        frequency: "ONCE",
        localDate: "2026-08-28",
        localTime: "12:00",
        timezone: "Europe/Stockholm",
        weekdays: [],
      },
      contextProfile: "RELATIONSHIP_CARE",
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toMatchObject({
      kind: "REMINDER",
      message: "Plan our cozy mini-date.",
      instruction: null,
      schedule: {
        frequency: "ONCE",
        local_date: "2026-08-28",
        local_time: "12:00",
      },
    });
    expect(reminder.kind).toBe("REMINDER");
    expect(reminder.schedule.localDate).toBe("2026-08-28");
    expect(reminder.finishedAt).toBeNull();
  });

  it("normalizes the private inbox envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      messages: [],
      has_more_messages: true,
      unread_count: 2,
      next_cursor: "opaque-next-page",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const inbox = await xiaoBaoApi.getInbox({
      routineId: "64b64c8f2f3f6d1f7a8b9001",
      cursor: "opaque-current-page",
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/xiaobao/inbox?limit=50&routine_id=64b64c8f2f3f6d1f7a8b9001&cursor=opaque-current-page",
    );
    expect(inbox.hasMoreMessages).toBe(true);
    expect(inbox.unreadCount).toBe(2);
    expect(inbox.nextCursor).toBe("opaque-next-page");
  });

  it("normalizes the public unread-inactivity pause reason", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      id: "routine-1",
      name: "Morning idea",
      instruction: "Give me one idea",
      schedule: {
        frequency: "DAILY",
        local_time: "09:00",
        timezone: "Europe/Amsterdam",
        weekdays: [],
      },
      context_profile: "RELATIONSHIP_CARE",
      delivery_channel: "IN_APP",
      enabled: false,
      next_run_at: "2026-08-25T07:00:00+00:00",
      pause_reason: "UNREAD_INACTIVITY",
      paused_at: "2026-08-24T07:00:00+00:00",
      created_at: "2026-08-18T10:00:00+00:00",
      updated_at: "2026-08-24T07:00:00+00:00",
    }]), { status: 200, headers: { "Content-Type": "application/json" } })));

    const routines = await xiaoBaoApi.listRoutines();
    expect(routines[0].pauseReason).toBe("UNREAD_INACTIVITY");
    expect(routines[0].pausedAt).toBe("2026-08-24T07:00:00.000Z");
  });
});
