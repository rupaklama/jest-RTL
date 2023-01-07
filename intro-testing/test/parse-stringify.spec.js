const assert = require("assert");

const { parse, stringify, removeQueryChar } = require("../parse-stringify");

describe("The parse function", () => {
  it("should remove '?' from query string", () => {
    const actual = removeQueryChar("?by=kati-frantz");
    const expected = ["by=kati-frantz"];
    expect(actual).toEqual(expected);
  });

  it("should return string array from query string", () => {
    const actual = removeQueryChar("by=kati-frantz");
    const expected = ["by=kati-frantz"];
    expect(actual).toEqual(expected);
  });

  it("should parse a query string into an object", () => {
    const actual = parse("?by=kati-frantz");
    const expected = { by: "kati-frantz" };

    // expect(actual).toEqual(expected);

    // deepEqual is to compare Objects
    assert.deepEqual(actual, expected);
  });
});

describe("The stringify function", () => {
  it("should stringify an object into a valid query string", () => {
    const actual = stringify({ by: "kati-frantz" });
    const expected = "by=kati-frantz";

    // expect(actual).toBe(expected);
    assert.equal(actual, expected);
  });
});
