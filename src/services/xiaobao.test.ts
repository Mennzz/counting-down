import { describe, expect, it, vi } from "vitest";

import type { XiaoBaoSseEvent } from "@/types/xiaobao";
import { consumeSse } from "./xiaobao";

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
