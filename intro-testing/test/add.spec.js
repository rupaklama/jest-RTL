const add = require("../add");

// node assert module to test expressions
const assert = require("assert");

// Manual testing without any test runner framework
const result = add(1, 3);
const expected = 4;

// basic manual assertion
// if (result === expected) {
//   console.log("test passed");
// } else {
//   throw new Error("Expected 1 + 3 to equal 4");
// }

// using node assert for automate assertion
// assert.equal(result, expected);

describe("The add function", () => {
  it("adds two number", () => {
    const actual = add(1, 3);
    const expected = 4;
    assert.equal(actual, expected);
  });
});
