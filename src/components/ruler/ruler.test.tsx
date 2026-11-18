import { readFileSync } from "node:fs";
import { act, fireEvent, render } from "@testing-library/react";
import { Profiler } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Ruler } from "@/components/ruler/ruler";
import { RulerGate } from "@/components/ruler/ruler-gate";
import { navItems } from "@/data/navigation";
import { dictionaries } from "@/lib/i18n";
import { progressToScrollTop, RAIL_BOTTOM, RAIL_TOP } from "@/lib/ruler";
import { rulerGateScript } from "@/lib/ruler-gate";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

// The layout mounts the Ruler on every route; a test changes the route by changing what this returns.
const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

// `forceNull` pretends the client does not know the time yet (the cat's state is unknown).
const clock = vi.hoisted(() => ({ forceNull: false }));
vi.mock("@/hooks/use-now", async (importOriginal) => {
  const actual = await importOriginal<{ useNow: () => Date | null }>();
  return {
    ...actual,
    useNow: () => {
      const now = actual.useNow();
      return clock.forceNull ? null : now;
    },
  };
});

const html = document.documentElement;
const VIEWPORT = 800;
const IDS = ["top", ...navItems.map((item) => item.id)];

/** What the page looks like to the ruler; each test may change them before or after the render. */
const page = {
  docHeight: 4000,
  scrollY: 0,
  /** Document tops of the sections, by id (scrollY-independent). */
  tops: { top: 0, experience: 900, work: 1800, stack: 2700, contact: 3600 } as Record<string, number>,
};

const media = { wide: true, reduced: false, queries: [] as MediaQueryListStub[] };

interface MediaQueryListStub {
  matches: boolean;
  media: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  fire: () => void;
}

class ResizeObserverStub {
  static instances: ResizeObserverStub[] = [];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  constructor(private readonly callback: () => void) {
    ResizeObserverStub.instances.push(this);
  }
  fire() {
    this.callback();
  }
}

/** Frames waiting to run: the tests step rAF by hand. */
let frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;

function flushFrames() {
  act(() => {
    const due = [...frames.values()];
    frames = new Map();
    for (const callback of due) callback(0);
  });
}

/** MutationObserver records are delivered in a microtask. */
async function settleMutations() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  flushFrames();
}

const savedDescriptors = new Map<string, PropertyDescriptor | undefined>();

function defineOn(target: object, key: string, descriptor: PropertyDescriptor, label: string) {
  savedDescriptors.set(label, Object.getOwnPropertyDescriptor(target, key));
  Object.defineProperty(target, key, { configurable: true, ...descriptor });
}

function restoreOn(target: object, key: string, label: string) {
  const saved = savedDescriptors.get(label);
  if (saved) Object.defineProperty(target, key, saved);
  else Reflect.deleteProperty(target, key);
}

function installPage() {
  defineOn(html, "scrollHeight", { get: () => page.docHeight }, "scrollHeight");
  defineOn(window, "scrollY", { get: () => page.scrollY }, "scrollY");
  defineOn(window, "innerHeight", { get: () => VIEWPORT }, "innerHeight");
  defineOn(Element.prototype, "setPointerCapture", { value: vi.fn() }, "setPointerCapture");
  defineOn(Element.prototype, "releasePointerCapture", { value: vi.fn() }, "releasePointerCapture");
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const top = (page.tops[this.id] ?? page.scrollY) - page.scrollY;
    return { top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: top, toJSON: () => ({}) };
  });
}

function uninstallPage() {
  restoreOn(html, "scrollHeight", "scrollHeight");
  restoreOn(window, "scrollY", "scrollY");
  restoreOn(window, "innerHeight", "innerHeight");
  restoreOn(Element.prototype, "setPointerCapture", "setPointerCapture");
  restoreOn(Element.prototype, "releasePointerCapture", "releasePointerCapture");
}

function installMedia() {
  media.queries = [];
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
    const reducedQuery = query.includes("prefers-reduced-motion");
    const listeners = new Set<() => void>();
    const stub: MediaQueryListStub = {
      get matches() {
        return reducedQuery ? media.reduced : media.wide;
      },
      media: query,
      addEventListener: vi.fn((_type: string, listener: () => void) => listeners.add(listener)),
      removeEventListener: vi.fn((_type: string, listener: () => void) => listeners.delete(listener)),
      fire: () => {
        for (const listener of listeners) listener();
      },
    };
    media.queries.push(stub);
    return stub as unknown as MediaQueryList;
  });
}

function installFrames() {
  frames = new Map();
  nextFrame = 0;
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      nextFrame += 1;
      frames.set(nextFrame, callback);
      return nextFrame;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => {
      frames.delete(id);
    }),
  );
}

beforeEach(() => {
  page.docHeight = 4000;
  page.scrollY = 0;
  page.tops = { top: 0, experience: 900, work: 1800, stack: 2700, contact: 3600 };
  media.wide = true;
  media.reduced = false;
  ResizeObserverStub.instances = [];
  delete html.dataset.ruler;
  html.style.overflow = "";
  window.__rulerLive = undefined;
  window.history.replaceState(null, "", "/");
  route.pathname = "/";
  clock.forceNull = false;
  commits = 0;
  resetPortfolioStore();
  installPage();
  installMedia();
  installFrames();
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
  uninstallPage();
  delete html.dataset.ruler;
  html.style.overflow = "";
  window.__rulerLive = undefined;
});

/** How many times React committed the ruler: the cat must not cost a render per scroll frame. */
let commits = 0;

/** The sections the ruler measures, in a document of their own. */
function Page() {
  return (
    <>
      {IDS.map((id) => (
        <section key={id} id={id} />
      ))}
      <Profiler id="ruler" onRender={() => (commits += 1)}>
        <Ruler />
      </Profiler>
    </>
  );
}

/** Renders the page and runs the first frame, which is when the ruler decides to go live. */
function mount() {
  const view = render(<Page />);
  // The first frame decides to go live; going live schedules one more, which draws into the new DOM.
  flushFrames();
  flushFrames();
  return view;
}

const rail = () => document.querySelector<HTMLElement>(".ruler-rail");
const rulerRoot = () => document.querySelector<HTMLElement>(".ruler");
const needle = () => document.querySelector<HTMLElement>(".ruler-needle");
const readout = () => document.querySelector<HTMLElement>(".ruler-readout");
const marks = () => [...document.querySelectorAll<HTMLElement>(".ruler-mark")];
const markLabel = (mark: HTMLElement) => mark.querySelector<HTMLElement>(".ruler-mark-label")?.dataset.label;

/** A pointer event with a real clientY (jsdom's generic event init drops it). */
function press(type: "pointerDown" | "pointerMove" | "pointerUp", clientY: number, target?: Element) {
  const element = target ?? rail();
  if (!element) throw new Error("no rail to press");
  act(() => {
    fireEvent[type](element, { clientY, button: 0, pointerId: 1 });
  });
}

const railHeight = VIEWPORT - RAIL_TOP - RAIL_BOTTOM;
/** The clientY that sits `fraction` of the way down the rail. */
const railY = (fraction: number) => RAIL_TOP + fraction * railHeight;

function scrollTo() {
  return vi.mocked(window.scrollTo);
}

describe("Ruler: whether it shows", () => {
  it("renders nothing and leaves the native bar when the media query does not match", () => {
    media.wide = false;
    const { container } = mount();
    expect(container.querySelector(".ruler")).toBeNull();
    expect(html.dataset.ruler).toBeUndefined();
    expect(window.__rulerLive).toBe(false);
  });

  it("renders nothing away from the homepage (the layout mounts it on every route)", () => {
    window.history.replaceState(null, "", "/missing");
    const { container } = mount();
    expect(container.querySelector(".ruler")).toBeNull();
    expect(html.dataset.ruler).toBeUndefined();
    expect(window.__rulerLive).toBe(false);
  });

  it("renders nothing on the server", () => {
    expect(renderToString(<Ruler />)).toBe("");
  });

  it("renders nothing on the first client render, then the rail once it has measured", () => {
    const { container } = render(<Page />);
    expect(container.querySelector(".ruler")).toBeNull();
    flushFrames();
    expect(container.querySelector(".ruler")).not.toBeNull();
  });

  it("claims data-ruler and __rulerLive while live, and releases both on unmount", () => {
    const { unmount } = mount();
    expect(window.__rulerLive).toBe(true);
    expect(html.dataset.ruler).toBe("on");
    unmount();
    expect(window.__rulerLive).toBe(false);
    expect(html.dataset.ruler).toBeUndefined();
  });

  it("re-claims data-ruler after something removed it (a remount, a client navigation)", () => {
    mount();
    delete html.dataset.ruler;
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    flushFrames();
    expect(html.dataset.ruler).toBe("on");
  });

  it("releases data-ruler and the rail when the media query stops matching, and takes it back when it matches", () => {
    const { container } = mount();
    media.wide = false;
    act(() => media.queries[0]?.fire());
    flushFrames();
    expect(container.querySelector(".ruler")).toBeNull();
    expect(html.dataset.ruler).toBeUndefined();
    expect(window.__rulerLive).toBe(false);
    media.wide = true;
    act(() => media.queries[0]?.fire());
    flushFrames();
    expect(container.querySelector(".ruler")).not.toBeNull();
    expect(html.dataset.ruler).toBe("on");
  });

  it("does not go live on a document that is not taller than the viewport (within the 1 px hysteresis)", () => {
    for (const height of [VIEWPORT - 50, VIEWPORT, VIEWPORT + 1]) {
      page.docHeight = height;
      const { container, unmount } = mount();
      expect(container.querySelector(".ruler")).toBeNull();
      expect(html.dataset.ruler).toBeUndefined();
      expect(window.__rulerLive).toBe(false);
      unmount();
    }
  });

  it("stays live while the document is 1 px taller than the viewport, and leaves once it is not taller", () => {
    const { container } = mount();
    expect(container.querySelector(".ruler")).not.toBeNull();
    page.docHeight = VIEWPORT + 1;
    act(() => ResizeObserverStub.instances[0]?.fire());
    flushFrames();
    expect(container.querySelector(".ruler")).not.toBeNull();
    page.docHeight = VIEWPORT;
    act(() => ResizeObserverStub.instances[0]?.fire());
    flushFrames();
    expect(container.querySelector(".ruler")).toBeNull();
    expect(html.dataset.ruler).toBeUndefined();
    expect(window.__rulerLive).toBe(false);
  });

  it("is aria-hidden and gives only the rail pointer events (the root has none)", () => {
    mount();
    expect(rulerRoot()).toHaveAttribute("aria-hidden", "true");
    expect(rulerRoot()).toHaveAttribute("data-print", "hide");
    expect(rulerRoot()?.contains(rail())).toBe(true);
  });

  it("is hidden while <html> is scroll-locked and visible again when the lock goes (MutationObserver path)", async () => {
    mount();
    expect(rulerRoot()?.style.visibility).toBe("");
    html.style.overflow = "hidden";
    await settleMutations();
    expect(rulerRoot()?.style.visibility).toBe("hidden");
    html.style.overflow = "";
    await settleMutations();
    expect(rulerRoot()?.style.visibility).toBe("");
  });
});

describe("Ruler: what it draws", () => {
  it("draws 51 ticks, 11 of them major", () => {
    mount();
    expect(document.querySelectorAll(".ruler-tick")).toHaveLength(51);
    expect(document.querySelectorAll(".ruler-tick[data-major]")).toHaveLength(11);
  });

  it("has a marker for the top and for every nav section, labelled in the active language", () => {
    mount();
    expect(marks()).toHaveLength(IDS.length);
    expect(marks().map(markLabel)).toEqual(["Top", ...navItems.map((item) => item.label.en)]);
  });

  it("re-labels the markers on a language switch without remounting them, and re-measures them", () => {
    mount();
    const before = marks();
    const experienceBefore = parseFloat(before[1]?.style.top ?? "");
    expect(experienceBefore).toBeCloseTo((900 / (4000 - VIEWPORT)) * 100, 3);

    // The Mongolian copy is longer: the reflow moves a section, and the body's height does not change.
    page.tops.experience = 1200;
    act(() => usePortfolioStore.getState().setLanguage("mn"));
    flushFrames();

    const after = marks();
    expect(after).toEqual(before);
    expect(after.map(markLabel)).toEqual([dictionaries.mn.ruler.top, ...navItems.map((item) => item.label.mn)]);
    expect(parseFloat(after[1]?.style.top ?? "")).toBeCloseTo((1200 / (4000 - VIEWPORT)) * 100, 3);
  });

  it("re-measures the markers when the body resizes", () => {
    mount();
    page.docHeight = 8000;
    page.tops.contact = 7000;
    act(() => ResizeObserverStub.instances[0]?.fire());
    flushFrames();
    expect(parseFloat(marks()[4]?.style.top ?? "")).toBeCloseTo((7000 / (8000 - VIEWPORT)) * 100, 3);
  });

  it("leaves a marker out when its section is not in the page", () => {
    document.getElementById("stack")?.remove();
    render(<Ruler />);
    flushFrames();
    expect(marks()).toHaveLength(IDS.length);
  });

  it("keeps all text out of the DOM: labels and digits live in data attributes", () => {
    const { container } = mount();
    page.scrollY = 1600;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    flushFrames();
    expect(rulerRoot()?.textContent).toBe("");
    expect(container.textContent).toBe("");
    expect(marks().map(markLabel)).toContain("Experience");
    expect(readout()?.dataset.value).toBe("50");
    for (const el of rulerRoot()?.querySelectorAll("*") ?? []) {
      expect(el.childNodes.length === 0 || [...el.childNodes].every((n) => n.nodeType === 1)).toBe(true);
    }
  });

  it("hides the needle below 3 % and shows it, with the percent in a data attribute, once scrolled", () => {
    mount();
    expect(needle()).not.toHaveAttribute("data-show");
    page.scrollY = 0.5 * (4000 - VIEWPORT);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    flushFrames();
    expect(needle()).toHaveAttribute("data-show");
    expect(readout()?.dataset.value).toBe("50");
    expect(needle()?.style.transform).toBe(`translate3d(0,${railHeight / 2}px,0)`);
    expect(marks()[0]).toHaveAttribute("data-passed");
    expect(marks()[1]).toHaveAttribute("data-passed");
    expect(marks()[3]).not.toHaveAttribute("data-passed");
  });

  it("shows the hundreds digit only at 100 %", () => {
    mount();
    const hundreds = () => document.querySelector(".ruler-col[data-col='0']");
    expect(hundreds()).not.toHaveAttribute("data-on");
    page.scrollY = 4000 - VIEWPORT;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    flushFrames();
    expect(readout()?.dataset.value).toBe("100");
    expect(hundreds()).toHaveAttribute("data-on");
  });
});

describe("Ruler: pointer", () => {
  it("scrolls smoothly to the point of the rail that was clicked", () => {
    mount();
    press("pointerDown", railY(0.75));
    expect(scrollTo()).toHaveBeenLastCalledWith({
      top: progressToScrollTop(0.75, 4000, VIEWPORT),
      behavior: "smooth",
    });
    press("pointerUp", railY(0.75));
  });

  it("jumps instantly on a click when the visitor prefers reduced motion", () => {
    media.reduced = true;
    mount();
    press("pointerDown", railY(0.3));
    expect(scrollTo()).toHaveBeenLastCalledWith({
      top: progressToScrollTop(0.3, 4000, VIEWPORT),
      behavior: "instant",
    });
  });

  it("scrubs instantly once a press has moved past the 3 px slop", () => {
    mount();
    press("pointerDown", railY(0.2));
    scrollTo().mockClear();
    press("pointerMove", railY(0.2) + 2);
    expect(scrollTo()).not.toHaveBeenCalled();
    press("pointerMove", railY(0.4));
    expect(scrollTo()).toHaveBeenLastCalledWith({
      top: progressToScrollTop(0.4, 4000, VIEWPORT),
      behavior: "instant",
    });
    expect(rulerRoot()).toHaveAttribute("data-dragging");
    press("pointerMove", railY(0.6));
    expect(scrollTo()).toHaveBeenLastCalledWith({
      top: progressToScrollTop(0.6, 4000, VIEWPORT),
      behavior: "instant",
    });
    press("pointerUp", railY(0.6));
    expect(rulerRoot()).not.toHaveAttribute("data-dragging");
  });

  it("captures the pointer on press", () => {
    mount();
    press("pointerDown", railY(0.5));
    expect(Element.prototype.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it("scrolls to a section's top when its marker is clicked, and does not when the press became a drag", () => {
    mount();
    const work = marks()[2];
    if (!work) throw new Error("no marker");
    press("pointerDown", railY(0.45), work);
    press("pointerUp", railY(0.45), work);
    expect(scrollTo()).toHaveBeenLastCalledWith({ top: 1800, behavior: "smooth" });

    scrollTo().mockClear();
    press("pointerDown", railY(0.45), work);
    press("pointerMove", railY(0.45) + 20, work);
    press("pointerUp", railY(0.45) + 20, work);
    expect(scrollTo()).not.toHaveBeenCalledWith({ top: 1800, behavior: "smooth" });
  });

  it("ignores a press that is not the primary button", () => {
    mount();
    scrollTo().mockClear();
    act(() => {
      fireEvent.pointerDown(rail() as Element, { clientY: railY(0.5), button: 2, pointerId: 1 });
    });
    expect(scrollTo()).not.toHaveBeenCalled();
  });
});

describe("Ruler: the cat on the needle", () => {
  const DAY_URL = "/?time=13:00";
  const NIGHT_URL = "/?time=01:30";
  const RANGE = 4000 - VIEWPORT;

  beforeEach(() => {
    // Only the clocks: the tests step requestAnimationFrame by hand.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date", "performance"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const cat = () => document.querySelector<HTMLElement>(".ruler-cat");
  const catPose = () => cat()?.querySelector("svg")?.getAttribute("data-pose") ?? null;

  /** Scrolls to a progress (0..1) and runs the frame that notices. */
  function scrollToProgress(progress: number) {
    page.scrollY = progress * RANGE;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    flushFrames();
  }

  /** One more scroll event of `by` px, and the frame that notices. */
  function nudge(by: number) {
    page.scrollY += by;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    flushFrames();
  }

  /** Lets time pass, then runs the frame the timeout asked for. */
  function wait(ms: number) {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
    flushFrames();
  }

  /** The MutationObserver on <html> reports in a microtask. */
  async function settle() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    flushFrames();
  }

  it("has no cat at the top, where only the hero cat shows, nor while he would sit under the header", () => {
    window.history.replaceState(null, "", DAY_URL);
    mount();
    expect(cat()).toBeNull();
    // The needle is already up (>= 3 %), but the cat on it would reach above the header's bottom edge (68 px: the bar and its edge).
    scrollToProgress(0.04);
    expect(needle()).toHaveAttribute("data-show");
    expect(cat()).toBeNull();
    scrollToProgress(0.5);
    expect(cat()).not.toBeNull();
    scrollToProgress(0);
    expect(cat()).toBeNull();
  });

  it("never lets the cat's box, hop included, reach above the header's bottom edge", () => {
    window.history.replaceState(null, "", DAY_URL);
    mount();
    // 62 px: the cat's top edge above the needle line (26 plate + 32 art) and the arrival hop's apex (4).
    const reach = 62;
    const header = 68;
    let seen = 0;
    for (let step = 0; step <= 100; step += 1) {
      scrollToProgress(step / 100);
      if (cat() === null) continue;
      seen += 1;
      const needleY = Number.parseFloat(/translate3d\(0,(-?[\d.]+)px/.exec(needle()?.style.transform ?? "")?.[1] ?? "NaN");
      expect(RAIL_TOP + needleY - reach, `at ${step} %`).toBeGreaterThanOrEqual(header);
    }
    expect(seen).toBeGreaterThan(80);
  });

  it("is absent while the cat's state is unknown", () => {
    clock.forceNull = true;
    window.history.replaceState(null, "", DAY_URL);
    mount();
    scrollToProgress(0.5);
    expect(needle()).toHaveAttribute("data-show");
    expect(cat()).toBeNull();
  });

  it("sits on the needle, ahead of the readout plate, and ignores the pointer", () => {
    window.history.replaceState(null, "", DAY_URL);
    mount();
    scrollToProgress(0.5);
    expect(needle()?.contains(cat())).toBe(true);
    expect(cat()).toHaveClass("pointer-events-none");
    const children = [...(needle()?.children ?? [])];
    expect(children.indexOf(cat() as Element)).toBeLessThan(children.indexOf(readout() as Element));
  });

  it("types while scrolling, sits after 150 ms and grooms after 1200 ms, off one scroll listener and a bounded number of renders", () => {
    window.history.replaceState(null, "", DAY_URL);
    const add = vi.spyOn(window, "addEventListener");
    mount();
    const scrollListeners = () => add.mock.calls.filter(([type]) => type === "scroll").length;
    scrollToProgress(0.5);
    expect(catPose()).toBe("type");
    expect(scrollListeners()).toBe(1);
    const settled = commits;

    // A fast scroll: twenty frames, each moving the page. The pose stays `type` and React is not asked to render.
    for (let i = 1; i <= 20; i += 1) {
      nudge(7);
      wait(10);
    }
    expect(catPose()).toBe("type");
    expect(commits).toBe(settled);

    wait(150);
    expect(catPose()).toBe("sit");
    expect(commits).toBe(settled + 1);
    wait(1100);
    expect(catPose()).toBe("groom");
    expect(commits).toBe(settled + 2);
    wait(5000);
    expect(commits).toBe(settled + 2);
    expect(vi.getTimerCount()).toBe(0);
    expect(scrollListeners()).toBe(1);

    // The next scroll wakes him again, and he settles again 150 ms after it (not at the old, later mark).
    nudge(40);
    expect(catPose()).toBe("type");
    wait(160);
    expect(catPose()).toBe("sit");
    nudge(40);
    wait(60);
    nudge(40);
    wait(100);
    expect(catPose()).toBe("type");
    wait(60);
    expect(catPose()).toBe("sit");
  });

  it("naps at the bottom of the page and wakes when the page scrolls back up", () => {
    window.history.replaceState(null, "", DAY_URL);
    mount();
    scrollToProgress(0.99);
    expect(catPose()).toBe("nap");
    wait(3000);
    expect(catPose()).toBe("nap");
    scrollToProgress(0.5);
    expect(catPose()).toBe("type");
  });

  it("sleeps at night through scrolling, idling and the bottom, without a render for any of it", () => {
    window.history.replaceState(null, "", NIGHT_URL);
    mount();
    scrollToProgress(0.5);
    expect(catPose()).toBe("sleep");
    const settled = commits;
    for (let i = 1; i <= 10; i += 1) {
      nudge(9);
      wait(40);
    }
    wait(2000);
    scrollToProgress(0.99);
    expect(catPose()).toBe("sleep");
    expect(commits).toBe(settled);
  });

  it("clears its timeout when the ruler hides behind a scroll lock, and again on unmount", async () => {
    window.history.replaceState(null, "", DAY_URL);
    const { unmount } = mount();
    scrollToProgress(0.5);
    expect(vi.getTimerCount()).toBe(1);
    html.style.overflow = "hidden";
    await settle();
    expect(vi.getTimerCount()).toBe(0);
    html.style.overflow = "";
    await settle();
    scrollToProgress(0.6);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(frames.size).toBe(0);
  });

  it("works the pose out from the clock, so a timeout that fires late (a background tab) is harmless", () => {
    window.history.replaceState(null, "", DAY_URL);
    mount();
    scrollToProgress(0.5);
    expect(catPose()).toBe("type");
    wait(10_000);
    expect(catPose()).toBe("groom");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("drops the cat, and its timeout, when the ruler goes away", () => {
    window.history.replaceState(null, "", DAY_URL);
    mount();
    scrollToProgress(0.5);
    expect(cat()).not.toBeNull();
    media.wide = false;
    act(() => media.queries[0]?.fire());
    flushFrames();
    expect(cat()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("Ruler: client navigation", () => {
  it("claims data-ruler in the same commit when a navigation lands on the homepage, with no resize or frame", () => {
    const view = mount();
    expect(html.dataset.ruler).toBe("on");

    // Away: the native bar comes back at once.
    window.history.replaceState(null, "", "/missing");
    route.pathname = "/missing";
    view.rerender(<Page />);
    expect(html.dataset.ruler).toBeUndefined();
    expect(window.__rulerLive).toBe(false);

    // Back: the claim happens in the commit, before anything can paint a native bar.
    window.history.replaceState(null, "", "/");
    route.pathname = "/";
    view.rerender(<Page />);
    expect(html.dataset.ruler).toBe("on");
    expect(window.__rulerLive).toBe(true);
    flushFrames();
    flushFrames();
    expect(rulerRoot()).not.toBeNull();
    expect(html.dataset.ruler).toBe("on");
  });
});

describe("Ruler: pointer reads", () => {
  it("scrubs with the cached viewport and document height instead of measuring on every move", () => {
    mount();
    let reads = 0;
    defineOn(window, "innerHeight", { get: () => ((reads += 1), VIEWPORT) }, "innerHeight:counted");
    defineOn(html, "scrollHeight", { get: () => ((reads += 1), page.docHeight) }, "scrollHeight:counted");
    press("pointerDown", railY(0.2));
    for (let i = 1; i <= 10; i += 1) press("pointerMove", railY(0.2) + i * 10);
    press("pointerUp", railY(0.5));
    expect(reads).toBe(0);
    expect(scrollTo()).toHaveBeenLastCalledWith({
      top: progressToScrollTop((railY(0.2) + 100 - RAIL_TOP) / railHeight, 4000, VIEWPORT),
      behavior: "instant",
    });
  });
});

describe("Ruler: listeners", () => {
  const FORBIDDEN = ["wheel", "touchstart", "touchmove", "keydown", "keyup", "mousewheel"];

  function spyListeners() {
    const added: { target: EventTarget; type: string; options: unknown }[] = [];
    const removed: { target: EventTarget; type: string }[] = [];
    // The window keeps its own copies of the two methods; everything else (document, elements) shares the prototype's.
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const windowAdd = window.addEventListener.bind(window);
    const windowRemove = window.removeEventListener.bind(window);
    vi.spyOn(window, "addEventListener").mockImplementation((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      added.push({ target: window, type, options });
      return windowAdd(type, listener, options);
    });
    vi.spyOn(window, "removeEventListener").mockImplementation((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
      removed.push({ target: window, type });
      return windowRemove(type, listener, options);
    });
    vi.spyOn(EventTarget.prototype, "addEventListener").mockImplementation(function (
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ) {
      added.push({ target: this, type, options });
      return add.call(this, type, listener, options);
    });
    vi.spyOn(EventTarget.prototype, "removeEventListener").mockImplementation(function (
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | EventListenerOptions,
    ) {
      removed.push({ target: this, type });
      return remove.call(this, type, listener, options);
    });
    return { added, removed };
  }

  it("never listens for wheel, touch or key events (on window, document or the ruler)", () => {
    const { added } = spyListeners();
    mount();
    const mine = added.filter(
      ({ target }) => target === window || target === document || (target instanceof Node && !!rulerRoot()?.contains(target)),
    );
    expect(mine.length).toBeGreaterThan(0);
    for (const { type } of mine) expect(FORBIDDEN).not.toContain(type);
  });

  it("listens for scroll and resize on the window, both passive, and nothing else there", () => {
    const { added } = spyListeners();
    mount();
    const onWindow = added.filter(({ target }) => target === window);
    expect(onWindow.map(({ type }) => type).sort()).toEqual(["resize", "scroll"]);
    for (const { options } of onWindow) expect(options).toMatchObject({ passive: true });
  });

  it("observes the body's size, <html>'s style attribute and the media query", () => {
    mount();
    expect(ResizeObserverStub.instances).toHaveLength(1);
    expect(ResizeObserverStub.instances[0]?.observe).toHaveBeenCalledWith(document.body);
    expect(media.queries.some((q) => q.media.includes("min-width: 900px") && q.media.includes("pointer: fine"))).toBe(
      true,
    );
  });

  it("only schedules one coalesced frame for any number of events", () => {
    mount();
    vi.mocked(requestAnimationFrame).mockClear();
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
      ResizeObserverStub.instances[0]?.fire();
      media.queries[0]?.fire();
    });
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it("removes every listener and observer, and the pending frame, on unmount", async () => {
    const mutationObserve = vi.spyOn(MutationObserver.prototype, "observe");
    const mutationDisconnect = vi.spyOn(MutationObserver.prototype, "disconnect");
    const { added, removed } = spyListeners();
    const { unmount } = mount();
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    unmount();

    const own = (list: { target: EventTarget; type: string }[]) =>
      list.filter(({ target }) => target === window).map(({ type }) => type).sort();
    expect(own(removed)).toEqual(own(added));
    for (const query of media.queries) {
      expect(query.removeEventListener).toHaveBeenCalledTimes(query.addEventListener.mock.calls.length);
    }
    for (const instance of ResizeObserverStub.instances) expect(instance.disconnect).toHaveBeenCalled();
    expect(mutationObserve).toHaveBeenCalledWith(html, { attributes: true, attributeFilter: ["style"] });
    expect(mutationDisconnect.mock.calls.length).toBeGreaterThanOrEqual(mutationObserve.mock.calls.length);
    expect(frames.size).toBe(0);
  });
});

describe("RulerGate", () => {
  it("is a server component that inlines the gate script", () => {
    const markup = renderToString(<RulerGate />);
    expect(markup).toContain("<script");
    expect(markup).toContain("__rulerLive");
    expect(markup).toContain("min-width: 900px");
    expect(rulerGateScript()).toContain("__rulerLive");
  });
});

describe("ruler.css", () => {
  const css = readFileSync("src/components/ruler/ruler.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("hides the native scrollbar only while the ruler is on", () => {
    expect(css).toMatch(/html\[data-ruler="on"\]\s*\{[^}]*scrollbar-width:\s*none/);
    expect(css).toMatch(/html\[data-ruler="on"\]::-webkit-scrollbar\s*\{[^}]*width:\s*0[^}]*height:\s*0[^}]*display:\s*none/);
  });

  it("uses no smooth easing, gradient, rounding or blurred shadow", () => {
    expect(css).not.toMatch(/\bease(-in|-out|-in-out)?\b/);
    expect(css).not.toMatch(/\blinear\b/);
    expect(css).not.toMatch(/cubic-bezier/);
    expect(css).not.toMatch(/gradient\(/);
    expect(css).not.toMatch(/border-radius\s*:\s*(?!0\b)/);
    expect(css).not.toMatch(/\bblur\(/);
    for (const [, value] of css.matchAll(/box-shadow\s*:([^;]+);/g)) {
      for (const layer of (value ?? "").split(",")) {
        const parts = layer.trim().replace(/^inset\s+/, "").split(/\s+(?![^(]*\))/);
        expect(parts.length).toBeGreaterThanOrEqual(4);
        expect(parts[2]).toMatch(/^0(px)?$/);
      }
    }
  });

  it("moves only in steps: every transition is steps() or none", () => {
    for (const [, value] of css.matchAll(/(?<![\w-])transition\s*:([^;]+);/g)) {
      const v = (value ?? "").replace("!important", "").trim();
      if (v === "none") continue;
      for (const layer of v.split(/,(?![^(]*\))/)) expect(layer).toMatch(/steps\(/);
    }
  });

  it("stacks below the header (50), the loader (100) and above page content", () => {
    const z = css.match(/\.ruler\s*\{[^}]*z-index:\s*(\d+)/);
    expect(z).not.toBeNull();
    const value = Number(z?.[1]);
    expect(value).toBeGreaterThan(1);
    expect(value).toBeLessThan(50);
  });

  it("renders its text from data attributes", () => {
    expect(css).toMatch(/attr\(data-label\)/);
    expect(css).toMatch(/attr\(data-d\)/);
  });

  it("is imported by globals.css", () => {
    expect(readFileSync("src/app/globals.css", "utf8")).toContain('@import "../components/ruler/ruler.css";');
  });
});

describe("layout", () => {
  it("renders RulerGate beside LoaderGate and Ruler inside Providers", () => {
    const source = readFileSync("src/app/layout.tsx", "utf8");
    expect(source).toContain("<RulerGate />");
    expect(source).toContain("<Ruler />");
    expect(source.indexOf("<RulerGate />")).toBeLessThan(source.indexOf("<Providers>"));
    expect(source.indexOf("<Providers>")).toBeLessThan(source.indexOf("<Ruler />"));
    expect(source.indexOf("<Ruler />")).toBeLessThan(source.indexOf("</Providers>"));
  });
});
