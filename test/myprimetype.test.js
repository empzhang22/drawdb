import { describe, it, expect } from "vitest";
import { defaultTypes } from "../src/data/datatypes";

const myPrimeType = defaultTypes.MYPRIMETYPE;

const checkDefault = (value) =>
  myPrimeType.checkDefault({
    default: value,
  });

describe("MYPRIMETYPE", () => {
  it("exposes expected metadata", () => {
    expect(myPrimeType.type).toBe("MYPRIMETYPE");
    expect(myPrimeType.hasCheck).toBe(true);
    expect(myPrimeType.isSized).toBe(false);
    expect(myPrimeType.hasPrecision).toBe(false);
    expect(myPrimeType.canIncrement).toBe(false);
  });

  it("accepts positive odd integers", () => {
    const validDefaults = ["1", "3", "101", "01", "999999"];
    for (const value of validDefaults) {
      expect(checkDefault(value), `expected ${value} to be valid`).toBe(true);
    }
  });

  it("rejects non-odd, non-positive, or non-integer defaults", () => {
    const invalidDefaults = [
      "",
      "0",
      "2",
      "10",
      "-1",
      "-3",
      "+1",
      "1.5",
      "1.0",
      "abc",
      " ",
    ];

    for (const value of invalidDefaults) {
      expect(checkDefault(value), `expected ${value} to be invalid`).toBe(false);
    }
  });
});
