const { findUserByEmail, findUserById } = require("../users");

describe("The findUserByEmail function", () => {
  // note - First way of working with Async Function using 'done' callback
  // (done) => {} -  testing framework needs to know when the asynchronous operation is finished
  // so it can check that the test passed. So it gives you a done() function that you call to let it know
  it("finds a user by email", done => {
    findUserByEmail("bahdcoder@gmail.com").then(response => {
      expect(response.message).toEqual("User found successfully.");

      // to let test runner know that we are done with our test
      done();
    });
  });

  // note - Second way of working with Async Function using 'return' keyword
  it("finds a user by email (Using the return promise method)", () => {
    return findUserByEmail("bahdcoder@gmail.com").then(response => {
      expect(response.message).toBe("User found successfully.");
    });
  });

  // note - Third way of working with Async Function using 'async await' keyword
  it("finds a user by email (Using async/await)", async () => {
    const response = await findUserByEmail("bahdcoder@gmail.com");

    expect(response.message).toBe("User found successfully.");
  });

  it("rejects with error if user with email was not found.", () => {
    const actual = findUserByEmail("x@y.com");

    expect(actual).rejects.toEqual(new Error("User with email: x@y.com was not found."));
  });
});

describe("The findUserById function", () => {
  it("should find a user by id", async () => {
    const response = await findUserById(1);

    expect(response.message).toBe("User found successfully.");
  });

  it("should reject if user is not found by id", async () => {
    await expect(findUserById(101)).rejects.toThrow("User with id: 101 was not found.");
  });
});
