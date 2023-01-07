import { render, screen, waitFor, waitForElementToBeRemoved } from "../test/setup";

import axios from "axios";

import userEvent from "@testing-library/user-event";

import { setupServer } from "msw/node";
import { rest } from "msw";

import SignUpPage from "./SignUpPage";

import en from "../locale/en.json";
import tr from "../locale/tr.json";

let requestBody;

let counter = 0;

let acceptLanguageHeader;

const server = setupServer(
  rest.post("/api/1.0/users", (req, res, ctx) => {
    requestBody = req.body;

    // api counter on every request
    counter += 1;

    // acceptLanguageHeader = req.headers.get("Accept-Language");
    return res(ctx.status(200));
  })
);

beforeEach(() => {
  counter = 0;
  // reset to the global initial handler above after each test
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

describe("Sign Up Page", () => {
  describe("Layout", () => {
    it("has header", () => {
      render(<SignUpPage />);
      const header = screen.queryByRole("heading", { name: "Sign Up" });
      expect(header).toBeInTheDocument();

      // screen.debug();
    });

    it("has username input", () => {
      const { container } = render(<SignUpPage />);

      // console.log(container.querySelector("input"));
      const input = screen.getByLabelText("Username");
      expect(input).toBeInTheDocument();
    });

    it("has email input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("E-mail");
      expect(input).toBeInTheDocument();
    });

    it("has password input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("Password");
      expect(input).toBeInTheDocument();
    });

    it("has password type for password input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("Password");
      expect(input.type).toBe("password");
    });

    it("has password repeat input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("Password Repeat");
      expect(input).toBeInTheDocument();
    });

    it("has password type for password repeat input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("Password Repeat");
      expect(input.type).toBe("password");
    });

    it("has Sign Up button", () => {
      render(<SignUpPage />);
      const button = screen.getByRole("button", { name: "Sign Up" });
      expect(button).toBeInTheDocument();
    });

    it("disables the button initially", () => {
      render(<SignUpPage />);
      const button = screen.getByRole("button", { name: "Sign Up" });
      expect(button).toBeDisabled();
    });
  });

  // testing the effects of the state updates
  describe("Interactions", () => {
    let button;

    const setup = () => {
      render(<SignUpPage />);

      const usernameInput = screen.getByRole("textbox", { name: /username/i });
      userEvent.type(usernameInput, "admin");

      const emailInput = screen.getByRole("textbox", { name: /e-mail/i });
      userEvent.type(emailInput, "test@test.com");

      const passwordInput = screen.getByLabelText("Password");
      userEvent.type(passwordInput, "myPassword");

      const passwordRepeatInput = screen.getByLabelText("Password Repeat");
      userEvent.type(passwordRepeatInput, "myPassword");

      button = screen.getByRole("button", { name: "Sign Up" });
    };

    it("enables the button when password and password repeat fields have same value", () => {
      setup();
      expect(button).toBeEnabled();
    });

    it("sends username, email and password to backend after clicking the button", async () => {
      setup();

      // mocking api post method
      // const mockFn = jest.fn();

      // axios.post = mockFn;
      // window.fetch = mockFn;

      userEvent.click(button);

      // using msw
      // waiting for promise to resolve using Promise syntax
      // await new Promise(resolve => setTimeout(() => resolve, 500));

      // accessing mock object's method
      // console.log(mockFn.mock); // - calls: [ '/api/1.0/users', {} ],

      // Spy on API function to see when it is called & with what arguments
      // note - first api call
      // const firstCallOfMockFunction = mockFn.mock.calls[0];
      // console.log(firstCallOfMockFunction);

      // this is first api call with its args
      // ["/api/1.0/users", { username: "admin", email: "test@test.com", password: "myPassword" }];
      // note - accessing request body object from the first api call
      // axios api
      //const body = firstCallOfMockFunction[1];

      // fetch api
      // const body = JSON.parse(firstCallOfMockFunction[1].body);

      // waitFor(async () => {
      //   await new Promise(resolve => resolve);

      //   expect(requestBody).toEqual({
      //     username: "admin",
      //     email: "test@test.com",
      //     password: "myPassword",
      //   });
      // });

      // UI Reference to validate test instead of using Promise which may fail of resolving issues
      // This text should appear on successful api call
      await screen.findByText("Please check your e-mail to activate your account");

      // final assertion
      expect(requestBody).toEqual({
        username: "admin",
        email: "test@test.com",
        password: "myPassword",
      });
    });

    it("disables button when there is an ongoing api call", async () => {
      setup();

      userEvent.click(button);

      // note - the button is disabled at this stage after first api call
      // the second click should not make an api call
      userEvent.click(button);

      // this resolves memory leak issue in this test as to mount component and return some value
      await screen.findByText("Please check your e-mail to activate your account");

      expect(counter).toBe(1);
    });

    it("displays spinner while the api request in progress", async () => {
      setup();

      userEvent.click(button);

      expect(await screen.findByRole("status")).toBeInTheDocument();

      // The component will mount on this stage to return some other value
      // this resolves memory leak issue in this test
      await screen.findByText("Please check your e-mail to activate your account");
    });

    it("does not display spinner when no api request", () => {
      setup();

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("displays an alert on successful sign up api request", async () => {
      setup();

      const message = "Please check your e-mail to activate your account";
      expect(screen.queryByText(message)).not.toBeInTheDocument();

      userEvent.click(button);

      expect(await screen.findByText(message)).toBeInTheDocument();
    });

    it("hides sign up form after successful sign up request", async () => {
      setup();

      const form = screen.getByTestId("form-sign-up");
      expect(form).toBeInTheDocument();

      userEvent.click(button);

      // note - waitFor waits for form to be disappear from the screen
      // await waitFor(() => {
      //   expect(form).not.toBeInTheDocument();
      // });

      // same as above
      await waitForElementToBeRemoved(form);
    });

    // NOTE - Use test.each if you keep duplicating the same test with different data.
    // test.each allows you to write the test once and pass data in - DYNAMIC TEST

    // DRY for repeating tests like with displaying error below
    // creating table with key/value for error messages to test in our test cases
    // mock backend error data
    it.each`
      field         | message
      ${"username"} | ${"Username cannot be null"}
      ${"email"}    | ${"E-mail is not valid"}
      ${"password"} | ${"Password must be at least 6 characters"}
    `("displays $message for $field", async testFields => {
      // note - testFields is a param object which contains rows above as args
      const field = testFields.field;
      const message = testFields.message;

      // overriding api to send error response
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(
            ctx.status(400),
            // mocking json response data
            ctx.json({
              validationErrors: {
                [field]: message,
              },
            })
          );
        })
      );

      setup();

      userEvent.click(button);

      const validationError = await screen.findByText(message);
      expect(validationError).toBeInTheDocument();
    });

    // it("displays validation error message for username", async () => {
    //   // overriding api to send error response
    //   server.use(
    //     rest.post("/api/1.0/users", (req, res, ctx) => {
    //       return res(
    //         ctx.status(400),
    //         // mocking json response data
    //         ctx.json({
    //           validationErrors: {
    //             username: "Username cannot be null",
    //           },
    //         })
    //       );
    //     })
    //   );

    //   setup();

    //   userEvent.click(button);

    //   expect(await screen.findByText("Username cannot be null")).toBeInTheDocument();
    // });

    // it("displays validation error message for email", async () => {
    //   // overriding api to send error response
    //   server.use(
    //     rest.post("/api/1.0/users", (req, res, ctx) => {
    //       return res(
    //         ctx.status(400),
    //         // mocking json response data
    //         ctx.json({
    //           validationErrors: {
    //             email: "E-mail is not valid",
    //           },
    //         })
    //       );
    //     })
    //   );

    //   setup();

    //   userEvent.click(button);

    //   expect(await screen.findByText("E-mail is not valid")).toBeInTheDocument();
    // });

    it("hides spinner and enables button after response received", async () => {
      // overriding api to send error response
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(
            ctx.status(400),
            // mocking json response data
            ctx.json({
              validationErrors: {
                username: "Username cannot be null",
              },
            })
          );
        })
      );

      setup();

      userEvent.click(button);

      // expect response to be in the dom
      await screen.findByText("Username cannot be null");

      // no spinner after getting api data
      expect(screen.queryByRole("status")).not.toBeInTheDocument();

      expect(button).toBeEnabled();
    });
  });
});
