import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PhotoGallery from "./PhotoGallery";
import { PhotoViewer } from "@/components/photos/PhotoViewer";
import * as images from "@/services/image";

vi.mock("@/services/image", () => ({
  listImages: vi.fn(), listImagesByMe: vi.fn(), listImagesForMe: vi.fn(),
  getImageMetadataById: vi.fn(), updateImageMetadata: vi.fn(), deleteImage: vi.fn(), createImageMetadata: vi.fn(),
}));
vi.mock("@/utils/cookies", () => ({ getUserType: () => "Joris" }));
vi.mock("@/components/loading/PageSkeletons", () => ({ PhotoGallerySkeleton: () => <p>Loading gallery</p> }));

const makePhotos = (count: number, prefix = "all", start = 0): images.ImageMetadata[] =>
  Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    return {
      id: `${prefix}-${index}`, imageKey: `${prefix}-${index}.jpg`,
      title: `${prefix} photo ${index}`, description: `Description ${index}`, imageTags: [`tag-${index}`],
      uploadedBy: index % 2 ? "Danfeng" : "Joris", uploadedAt: new Date(Date.UTC(2026, 10, 22 - index)).toISOString(),
      url: `https://photos.test/original/${prefix}-${index}.jpg`,
      thumbnailXlUrl: `https://photos.test/preview/${prefix}-${index}.jpg`,
    };
  });
const photos = makePhotos(12);
const sensitivePhotos = (count: number, prefix = "fun", start = 0) => makePhotos(count, prefix, start).map((photo, index) =>
  ({ ...photo, imageTags: [[" Sensitive ", "spicy", "NUDE"][index % 3]] }));
const observers: { callback: IntersectionObserverCallback; targets: Element[] }[] = [];

beforeEach(() => {
  vi.resetAllMocks();
  observers.length = 0;
  vi.stubGlobal("IntersectionObserver", class {
    record: typeof observers[number];
    constructor(callback: IntersectionObserverCallback) { this.record = { callback, targets: [] }; observers.push(this.record); }
    observe(target: Element) { this.record.targets.push(target); }
    unobserve() {}
    disconnect() { this.record.targets = []; }
  });
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  })));
  // Give the real Embla engine a deterministic horizontal layout in jsdom.
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(600);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(360);
  vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function () { return this.parentElement; });
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function () {
    return this.getAttribute("aria-roledescription") === "slide" ? Array.from(this.parentElement.children).indexOf(this) * 600 : 0;
  });
  vi.mocked(images.listImages).mockResolvedValue({ items: photos });
  vi.mocked(images.listImagesByMe).mockResolvedValue({ items: makePhotos(4, "mine") });
  vi.mocked(images.listImagesForMe).mockResolvedValue({ items: makePhotos(4, "partner") });
  vi.mocked(images.deleteImage).mockResolvedValue();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const open = async (index = 0, prefix = "all") => {
  const card = await screen.findByRole("button", { name: new RegExp(`${prefix} photo ${index} `) });
  await userEvent.click(card);
  return card;
};
const heading = (title: string) => screen.getByRole("heading", { name: title });
const originalSources = () => Array.from(document.querySelectorAll<HTMLImageElement>('img[src*="/original/"]')).map((image) => image.src);
const viewport = () => screen.getByLabelText("Photo carousel");
const swipe = async (direction: "left" | "right", vertical = false) => {
  const element = viewport();
  const startX = direction === "left" ? 500 : 100;
  const endX = direction === "left" ? 100 : 500;
  fireEvent.touchStart(element, { touches: [{ clientX: startX, clientY: 100 }], changedTouches: [{ clientX: startX, clientY: 100 }] });
  const move = new Event("touchmove", { bubbles: true, cancelable: true });
  const touches = [{ clientX: vertical ? startX + 2 : endX, clientY: vertical ? 400 : 102 }];
  Object.defineProperty(move, "touches", { value: touches });
  Object.defineProperty(move, "changedTouches", { value: touches });
  fireEvent(element, move);
  fireEvent.touchEnd(element, { touches: [] });
  await act(async () => { await new Promise((resolve) => requestAnimationFrame(resolve)); });
  return move;
};

describe("gallery viewer with the real carousel", () => {
  it.each([["All", "listImages"], ["By Me", "listImagesByMe"], ["From Danfeng", "listImagesForMe"]] as const)(
    "hides sensitive photos by default and shows blurred photos when enabled for %s", async (label, method) => {
      const mixed = [photos[0], ...sensitivePhotos(3)];
      vi.mocked(images[method]).mockResolvedValue({ items: mixed });
      render(<PhotoGallery />);
      await userEvent.click(await screen.findByRole("button", { name: label }));
      expect(await screen.findByRole("button", { name: /all photo 0 / })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /fun photo 0 / })).not.toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      await userEvent.click(screen.getByLabelText("Show sensitive photos"));
      const sensitive = await screen.findByRole("button", { name: /fun photo 0 / });
      expect(sensitive.querySelector("img")).toHaveClass("blur-xl");
      expect(images[method]).toHaveBeenLastCalledWith({ limit: 12, cursor: undefined, excludeSensitive: false });
      await userEvent.click(screen.getByLabelText("Show sensitive photos"));
      expect(await screen.findByRole("button", { name: /all photo 0 / })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /fun photo 0 / })).not.toBeInTheDocument();
    },
  );

  it("closes the viewer and hides a photo immediately when it is marked sensitive", async () => {
    vi.mocked(images.updateImageMetadata).mockResolvedValue({ ...photos[0], imageTags: ["sensitive"] });
    render(<PhotoGallery />);
    await open();
    await userEvent.click(screen.getByRole("button", { name: "Edit photo" }));
    await userEvent.click(screen.getByLabelText("Sensitive content (hidden by default and blurred when shown)"));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /all photo 0 / })).not.toBeInTheDocument();
  });

  it("shows an empty state when all returned photos are sensitive", async () => {
    vi.mocked(images.listImages).mockResolvedValue({ items: sensitivePhotos(3) });
    render(<PhotoGallery />);
    expect(await screen.findByText("No photos to show for this filter.")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Show sensitive photos"));
    expect(await screen.findByRole("button", { name: /fun photo 0 / })).toBeInTheDocument();
  });

  it("ignores a pending page from the previous visibility setting", async () => {
    let resolvePage!: (page: images.ImagePageResponse) => void;
    vi.mocked(images.listImages).mockResolvedValueOnce({ items: photos, nextCursor: "next" })
      .mockImplementationOnce(() => new Promise((resolve) => { resolvePage = resolve; }))
      .mockResolvedValueOnce({ items: [photos[0], ...sensitivePhotos(1)] });
    render(<PhotoGallery />);
    await screen.findByRole("button", { name: /all photo 0 / });
    const observer = observers.find((entry) => entry.targets.length > 0)!;
    act(() => observer.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    await waitFor(() => expect(images.listImages).toHaveBeenCalledTimes(2));
    await userEvent.click(screen.getByLabelText("Show sensitive photos"));
    await screen.findByRole("button", { name: /fun photo 0 / });
    await act(async () => resolvePage({ items: makePhotos(1, "stale") }));
    expect(screen.queryByRole("button", { name: /stale photo 0 / })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fun photo 0 / })).toBeInTheDocument();
  });

  it.each([["All", "listImages"], ["By Me", "listImagesByMe"], ["From Danfeng", "listImagesForMe"]] as const)(
    "opens Fun mode with sensitive photos for %s and preserves the normal gallery", async (label, method) => {
      const list = vi.mocked(images[method]);
      const normal = method === "listImages" ? photos : makePhotos(4, method === "listImagesByMe" ? "mine" : "partner");
      list.mockImplementation(async (params) => ({ items: params?.sensitiveOnly ? sensitivePhotos(3) : normal }));
      render(<PhotoGallery />);
      await screen.findByRole("button", { name: label });
      await userEvent.click(screen.getByRole("button", { name: label }));
      await screen.findByRole("button", { name: new RegExp(`${normal[0].title} `) });
      const trigger = screen.getByRole("button", { name: "Fun mode" });
      await userEvent.click(trigger);
      expect(await screen.findByRole("heading", { name: "fun photo 0" })).toBeInTheDocument();
      expect(list).toHaveBeenLastCalledWith({ limit: 12, cursor: null, sensitiveOnly: true });
      await userEvent.keyboard("{ArrowRight}");
      expect(heading("fun photo 1")).toBeInTheDocument();
      expect(originalSources().every((url) => url.includes("fun"))).toBe(true);
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
      expect(screen.getByRole("button", { name: new RegExp(`${normal[0].title} `) })).toBeInTheDocument();
      await userEvent.click(trigger);
      expect(await screen.findByRole("heading", { name: "fun photo 0" })).toBeInTheDocument();
    });

  it("paginates only sensitive results, preserves selection, and preloads only neighbours", async () => {
    vi.mocked(images.listImages).mockResolvedValueOnce({ items: photos })
      .mockResolvedValueOnce({ items: sensitivePhotos(12), nextCursor: "fun-next" })
      .mockResolvedValueOnce({ items: sensitivePhotos(2, "fun", 12) });
    render(<PhotoGallery />);
    await userEvent.click(await screen.findByRole("button", { name: "Fun mode" }));
    await screen.findByRole("heading", { name: "fun photo 0" });
    expect(originalSources()).toHaveLength(2);
    for (let index = 0; index < 9; index++) await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByText("10 / 14")).toBeInTheDocument());
    expect(heading("fun photo 9")).toBeInTheDocument();
    expect(images.listImages).toHaveBeenLastCalledWith({ limit: 12, cursor: "fun-next", sensitiveOnly: true });
    expect(originalSources()).toHaveLength(3);
    for (let index = 0; index < 4; index++) await userEvent.keyboard("{ArrowRight}");
    expect(heading("fun photo 13")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
  });

  it("offers retry after an initial failure and shows an empty state without opening normal photos", async () => {
    vi.mocked(images.listImages).mockResolvedValueOnce({ items: photos })
      .mockRejectedValueOnce(new Error("Unavailable"))
      .mockResolvedValueOnce({ items: [] });
    render(<PhotoGallery />);
    await userEvent.click(await screen.findByRole("button", { name: "Fun mode" }));
    await userEvent.click(await screen.findByRole("button", { name: "Retry loading photos" }));
    expect(await screen.findByText("No sensitive photos for this filter.")).toBeInTheDocument();
    expect(originalSources()).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Back to gallery" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("removes untagged and deleted photos from Fun mode and updates the underlying gallery", async () => {
    const fun = sensitivePhotos(2);
    vi.mocked(images.listImages).mockResolvedValueOnce({ items: fun }).mockResolvedValueOnce({ items: fun })
      .mockResolvedValueOnce({ items: [{ ...fun[0], imageTags: [] }] });
    vi.mocked(images.updateImageMetadata).mockResolvedValue({ ...fun[0], imageTags: [] });
    render(<PhotoGallery />);
    await userEvent.click(await screen.findByRole("button", { name: "Fun mode" }));
    await screen.findByRole("heading", { name: "fun photo 0" });
    await userEvent.click(screen.getByRole("button", { name: "Edit photo" }));
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Sensitive content (hidden by default and blurred when shown)"));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("heading", { name: "fun photo 1" })).toBeInTheDocument();
    expect(images.updateImageMetadata).toHaveBeenCalledWith("fun-0", expect.objectContaining({ imageTags: [] }));
    await userEvent.click(screen.getByRole("button", { name: "Delete photo" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("No sensitive photos for this filter.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back to gallery" }));
    expect(screen.queryByRole("button", { name: /fun photo 1 / })).not.toBeInTheDocument();
    const card = await screen.findByRole("button", { name: /fun photo 0 / });
    expect(card.querySelector("img")).not.toHaveClass("blur-xl");
  });

  it.each([1, 2])("stops swipes at both ends of a %i-photo gallery", async (count) => {
    vi.mocked(images.listImages).mockResolvedValue({ items: photos.slice(0, count) });
    render(<PhotoGallery />);
    await open();
    await swipe("right");
    expect(heading("all photo 0")).toBeInTheDocument();
    await swipe("left");
    expect(heading(`all photo ${count - 1}`)).toBeInTheDocument();
    await swipe("left");
    expect(heading(`all photo ${count - 1}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
    if (count === 1) expect(screen.getByRole("button", { name: "Previous photo" })).toBeDisabled();
  });

  it("starts at the clicked ID, changes metadata with buttons/keys, and stops at both ends", async () => {
    render(<PhotoGallery />);
    await open(10);
    expect(heading("all photo 10")).toBeInTheDocument();
    expect(screen.getByText("Description 10")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(heading("all photo 11")).toBeInTheDocument();
    expect(screen.getByText("tag-11")).toBeInTheDocument();
    expect(screen.getByText(/Uploaded by Danfeng/)).toHaveTextContent(new Date(photos[11].uploadedAt).toLocaleString());
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
    await userEvent.keyboard("{ArrowRight}");
    expect(heading("all photo 11")).toBeInTheDocument();
    for (let i = 0; i < 11; i++) await userEvent.keyboard("{ArrowLeft}");
    expect(heading("all photo 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous photo" })).toBeDisabled();
    await userEvent.keyboard("{ArrowLeft}");
    expect(heading("all photo 0")).toBeInTheDocument();
  });

  it("swipes left/right with Embla and allows vertical gestures without changing photos", async () => {
    render(<PhotoGallery />);
    await open(4);
    await swipe("left");
    await waitFor(() => expect(heading("all photo 5")).toBeInTheDocument());
    await swipe("right");
    await waitFor(() => expect(heading("all photo 4")).toBeInTheDocument());
    const dialog = screen.getByRole("dialog");
    dialog.style.overflowY = "auto";
    Object.defineProperty(dialog, "scrollHeight", { value: 1200 });
    Object.defineProperty(dialog, "clientHeight", { value: 600 });
    dialog.scrollTop = 100;
    const verticalMove = await swipe("left", true);
    expect(verticalMove.defaultPrevented).toBe(false);
    expect(heading("all photo 4")).toBeInTheDocument();
    expect(viewport()).toHaveStyle({ touchAction: "pan-y pinch-zoom" });
  });

  it("keeps navigation and selection when entering and leaving full screen", async () => {
    render(<PhotoGallery />);
    await open(4);
    await userEvent.click(screen.getByRole("button", { name: "View full screen" }));
    expect(screen.getByRole("button", { name: "Exit full screen" })).toBeInTheDocument();
    await swipe("left");
    await waitFor(() => expect(heading("all photo 5")).toBeInTheDocument());
    await userEvent.keyboard("{ArrowRight}");
    expect(heading("all photo 6")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "View full screen" })).toBeInTheDocument();
    expect(heading("all photo 6")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "View full screen" }));
    await userEvent.click(screen.getByRole("button", { name: "Exit full screen" }));
    expect(heading("all photo 6")).toBeInTheDocument();
  });

  it("mounts only the selected original and its neighbours, with a preview until load", async () => {
    render(<PhotoGallery />);
    await screen.findByRole("button", { name: /all photo 0 / });
    expect(originalSources()).toEqual([]);
    await open(4);
    expect(originalSources()).toEqual(photos.slice(3, 6).map((photo) => photo.url));
    const active = document.querySelector('[aria-roledescription="slide"][aria-hidden="false"]') as HTMLElement;
    const original = active.querySelector<HTMLImageElement>('img[src*="/original/"]');
    expect(active.querySelector('img[src*="/preview/"]')).toBeInTheDocument();
    fireEvent.load(original);
    expect(active.querySelector('img[src*="/preview/"]')).not.toBeInTheDocument();
    await userEvent.keyboard("{ArrowRight}");
    expect(originalSources()).toEqual(photos.slice(4, 7).map((photo) => photo.url));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(originalSources()).toEqual([]));
  });

  it.each([["By Me", "mine", "listImagesByMe"], ["From Danfeng", "partner", "listImagesForMe"]] as const)("browses only the %s filter", async (label, prefix, method) => {
    render(<PhotoGallery />);
    await screen.findByRole("button", { name: "All" });
    await userEvent.click(screen.getByRole("button", { name: label }));
    await open(1, prefix);
    await userEvent.keyboard("{ArrowRight}");
    expect(heading(`${prefix} photo 2`)).toBeInTheDocument();
    expect(images[method]).toHaveBeenCalledWith({ limit: 12, cursor: undefined, excludeSensitive: true });
    expect(originalSources().every((url) => url.includes(prefix))).toBe(true);
  });

  it("prefetches the next filtered page near the end, deduplicates it, and preserves selection", async () => {
    let resolvePage: (page: images.ImagePageResponse) => void;
    vi.mocked(images.listImagesByMe).mockResolvedValueOnce({ items: makePhotos(12, "mine"), nextCursor: "mine-page-2" })
      .mockImplementationOnce(() => new Promise((resolve) => { resolvePage = resolve; }));
    render(<PhotoGallery />);
    await screen.findByRole("button", { name: "By Me" });
    await userEvent.click(screen.getByRole("button", { name: "By Me" }));
    await open(9, "mine");
    await waitFor(() => expect(images.listImagesByMe).toHaveBeenCalledTimes(2));
    expect(images.listImagesByMe).toHaveBeenLastCalledWith({ limit: 12, cursor: "mine-page-2", excludeSensitive: true });
    expect(heading("mine photo 9")).toBeInTheDocument();
    await act(async () => resolvePage({ items: makePhotos(4, "mine", 11) }));
    expect(heading("mine photo 9")).toBeInTheDocument();
    expect(screen.getByText("10 / 15")).toBeInTheDocument();
    for (let i = 0; i < 5; i++) await userEvent.keyboard("{ArrowRight}");
    expect(heading("mine photo 14")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
    expect(images.listImagesByMe).toHaveBeenCalledTimes(2);
  });

  it("keeps loaded photos navigable after pagination failure and retries the same cursor", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(images.listImages).mockResolvedValueOnce({ items: photos, nextCursor: "page-2" })
      .mockRejectedValueOnce(new Error("Page unavailable"))
      .mockResolvedValueOnce({ items: makePhotos(2, "all", 12) });
    render(<PhotoGallery />);
    await open(10);
    await screen.findByRole("button", { name: "Retry loading photos" });
    await userEvent.keyboard("{ArrowRight}");
    expect(heading("all photo 11")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry loading photos" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Next photo" })).toBeEnabled());
    await userEvent.keyboard("{ArrowRight}");
    expect(heading("all photo 12")).toBeInTheDocument();
    expect(images.listImages).toHaveBeenLastCalledWith({ limit: 12, cursor: "page-2", excludeSensitive: true });
  });

  it("locks all navigation during editing, saves by ID and updates cached filters", async () => {
    vi.mocked(images.listImagesByMe).mockResolvedValue({ items: photos });
    const updated = { ...photos[4], title: "Updated title", description: "Updated description", imageTags: ["new-tag"] };
    vi.mocked(images.updateImageMetadata).mockResolvedValue(updated);
    render(<PhotoGallery />);
    await screen.findByRole("button", { name: "By Me" });
    await userEvent.click(screen.getByRole("button", { name: "By Me" }));
    await userEvent.click(screen.getByRole("button", { name: "All" }));
    await open(4);
    await userEvent.click(screen.getByRole("button", { name: "Edit photo" }));
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous photo" })).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Title", { exact: true }));
    await userEvent.keyboard("{ArrowRight}");
    await swipe("left");
    expect(screen.getByLabelText("Title", { exact: true })).toHaveValue("all photo 4");
    await userEvent.clear(screen.getByLabelText("Title", { exact: true }));
    await userEvent.type(screen.getByLabelText("Title", { exact: true }), "Updated title");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(images.updateImageMetadata).toHaveBeenCalledWith("all-4", expect.objectContaining({ title: "Updated title" }));
    expect(await screen.findByRole("heading", { name: "Updated title" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "By Me" }));
    await userEvent.click(screen.getByRole("button", { name: /Updated title / }));
    expect(heading("Updated title")).toBeInTheDocument();
  });

  it("locks during deletion confirmation, supports cancel, and removes the deleted photo", async () => {
    render(<PhotoGallery />);
    await open(4);
    await userEvent.click(screen.getByRole("button", { name: "Delete photo" }));
    const viewer = screen.getByRole("dialog", { name: "all photo 4", hidden: true });
    expect(viewer.querySelector('button[aria-label="Next photo"]')).toBeDisabled();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(heading("all photo 4")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete photo" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(images.deleteImage).toHaveBeenCalledWith("all-4");
    expect(screen.queryByRole("button", { name: /all photo 4 / })).not.toBeInTheDocument();
  });

  it("shows image failures, retries refreshed signed URLs, and still navigates", async () => {
    vi.mocked(images.getImageMetadataById).mockResolvedValue({ ...photos[4], url: photos[4].url + "?refreshed" });
    render(<PhotoGallery />);
    await open(4);
    const original = document.querySelector<HTMLImageElement>(`img[src="${photos[4].url}"]`);
    fireEvent.error(original);
    await userEvent.click(screen.getByRole("button", { name: "Retry photo" }));
    expect(images.getImageMetadataById).toHaveBeenCalledWith("all-4");
    await waitFor(() => expect(document.querySelector(`img[src="${photos[4].url}?refreshed"]`)).toBeInTheDocument());
    fireEvent.error(document.querySelector(`img[src="${photos[4].url}?refreshed"]`));
    await userEvent.keyboard("{ArrowRight}");
    expect(heading("all photo 5")).toBeInTheDocument();
  });

  it("restores the gallery position and original card focus when closed after navigation", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const y = vi.spyOn(window, "scrollY", "get").mockReturnValue(800);
    render(<PhotoGallery />);
    const card = await open(4);
    await userEvent.keyboard("{ArrowRight}");
    y.mockReturnValue(0);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(card).toHaveFocus());
    expect(scrollTo).toHaveBeenCalledWith(0, 800);
  });

  it("keeps selection on the same ID when new metadata inserts a photo before it", async () => {
    const props = { photos, selectedId: "all-4", existingTags: [], hasMore: false, isLoadingMore: false, loadError: null,
      onSelect: vi.fn(), onLoadMore: vi.fn(), onUpdated: vi.fn(), onDeleted: vi.fn(), onClose: vi.fn(), onRestoreFocus: vi.fn() };
    const { rerender } = render(<PhotoViewer {...props} />);
    rerender(<PhotoViewer {...props} photos={[...makePhotos(1, "new"), ...photos]} />);
    expect(heading("all photo 4")).toBeInTheDocument();
    expect(screen.getByText("6 / 13")).toBeInTheDocument();
    expect(props.onSelect).not.toHaveBeenCalled();
  });
});
