import { describe, expect, it } from "vitest";
import { isStalled, pickYarn, yarnPositions } from "./yarn";

/** A `random` that returns the given draws in order, then repeats the last one. */
const sequence = (...draws: number[]) => {
  let i = 0;
  return () => draws[Math.min(i++, draws.length - 1)] as number;
};

describe("pickYarn", () => {
  it("takes the first index for a draw of 0", () => {
    expect(pickYarn(() => 0)).toEqual({ colour: "amber", ending: "pounce" });
  });

  it("makes two draws, the colour first", () => {
    expect(pickYarn(sequence(0.5, 0.5))).toEqual({ colour: "rose", ending: "tumble" });
    expect(pickYarn(sequence(0.99, 0.99))).toEqual({ colour: "sky", ending: "sit" });
    expect(pickYarn(sequence(0, 0.99))).toEqual({ colour: "amber", ending: "sit" });
    expect(pickYarn(sequence(0.99, 0))).toEqual({ colour: "sky", ending: "pounce" });
  });

  it("keeps a draw of 1 inside the last index", () => {
    expect(pickYarn(() => 1)).toEqual({ colour: "sky", ending: "sit" });
  });

  it("counts a NaN draw as 0", () => {
    expect(pickYarn(() => Number.NaN)).toEqual({ colour: "amber", ending: "pounce" });
  });
});

describe("yarnPositions", () => {
  it("parks the ball at its start until the bar passes it, with the cat behind", () => {
    expect(yarnPositions(0, 20)).toEqual({ ball: 4, cat: 0 });
    expect(yarnPositions(2, 20)).toEqual({ ball: 4, cat: 0 });
  });

  it("follows the filled blocks, a gap behind", () => {
    expect(yarnPositions(10, 20)).toEqual({ ball: 10, cat: 6 });
    expect(yarnPositions(20, 20)).toEqual({ ball: 20, cat: 16 });
  });

  it("never runs past the end of the bar", () => {
    expect(yarnPositions(25, 20)).toEqual({ ball: 20, cat: 16 });
  });
});

describe("isStalled", () => {
  it("is true from the stall time on while the bar is not full", () => {
    expect(isStalled(799, 5, 20)).toBe(false);
    expect(isStalled(800, 5, 20)).toBe(true);
  });

  it("is never true once the bar is full", () => {
    expect(isStalled(5000, 20, 20)).toBe(false);
  });
});
