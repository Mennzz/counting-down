import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { imageContentType, uploadImageDirect } from "@/services/image-upload";

vi.mock("@/utils/cookies", () => ({ getSessionId: () => "synthetic-session" }));

const ticket = {
  upload_key: "upload-123",
  url: "https://bucket.example/",
  fields: [
    { name: "key", value: "images/upload-123" },
    { name: "x-amz-signature", value: "sig" },
    { name: "Content-Type", value: "image/jpeg" },
  ],
  expires_at: "2026-11-26T10:10:00Z",
  max_bytes: 26214400,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("uploadImageDirect", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("asks for a form, then posts the signed fields and the file to S3", async () => {
    fetchMock
      .mockResolvedValueOnce(json(ticket))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const file = new File(["photo-bytes"], "beach.jpg", { type: "image/jpeg" });

    await expect(uploadImageDirect(file, "advent")).resolves.toBe("upload-123");

    const [ticketUrl, ticketInit] = fetchMock.mock.calls[0];
    expect(ticketUrl).toMatch(/\/images\/uploads$/);
    expect(ticketInit.headers["X-Session-Id"]).toBe("synthetic-session");
    expect(JSON.parse(ticketInit.body)).toEqual({
      purpose: "advent",
      content_type: "image/jpeg",
      size_bytes: file.size,
    });

    const [s3Url, s3Init] = fetchMock.mock.calls[1];
    expect(s3Url).toBe("https://bucket.example/");
    expect(s3Init.headers).toBeUndefined(); // no session or API headers go to S3
    const entries = [...(s3Init.body as FormData).entries()];
    // Signed field names are sent exactly as issued, and the file comes last.
    expect(entries.map(([name]) => name)).toEqual([
      "key",
      "x-amz-signature",
      "Content-Type",
      "file",
    ]);
  });

  it("reports the API's reason when the upload is refused", async () => {
    fetchMock.mockResolvedValueOnce(json({ detail: "Images can be at most 25 MB" }, 400));
    const file = new File(["x"], "huge.jpg", { type: "image/jpeg" });

    await expect(uploadImageDirect(file, "gallery")).rejects.toThrow(
      "Images can be at most 25 MB",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails clearly when S3 rejects the file", async () => {
    fetchMock
      .mockResolvedValueOnce(json(ticket))
      .mockResolvedValueOnce(new Response("<Error/>", { status: 403 }));

    await expect(
      uploadImageDirect(new File(["x"], "a.jpg", { type: "image/jpeg" }), "gallery"),
    ).rejects.toThrow("The photo could not be uploaded");
  });
});

describe("imageContentType", () => {
  it("falls back to the file extension when the browser gives no type", () => {
    expect(imageContentType(new File(["x"], "IMG_1.HEIC", { type: "" }))).toBe("image/heic");
    expect(imageContentType(new File(["x"], "pic.png", { type: "image/png" }))).toBe("image/png");
    expect(imageContentType(new File(["x"], "mystery", { type: "" }))).toBe("image/jpeg");
  });
});
