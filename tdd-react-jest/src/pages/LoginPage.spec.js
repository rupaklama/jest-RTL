import { render, screen, waitForElementToBeRemoved, waitFor, act } from "../test/setup";

import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";

import storage from "../state/storage";

import LoginPage from "./LoginPage";
import HomePage from "./HomePage";
import NavBar from "../components/NavBar";

let requestBody,
  acceptLanguageHeader,
  count = 0;

const server = setupServer(
  rest.post("/api/1.0/auth", (req, res, ctx) => {
    requestBody = req.body;
    count += 1;
    acceptLanguageHeader = req.headers.get("Accept-Language");
    return res(ctx.status(401), ctx.json({ message: "Incorrect credentials" }));
  })
);

beforeEach(() => {
  count = 0;
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

describe("Login Page", () => {
  describe("Layout", () => {
    it("has header", () => {
      render(<LoginPage />);
      const header = screen.queryByRole("heading", { name: "Login" });
      expect(header).toBeInTheDocument();
    });

    it("has email input", () => {
      render(<LoginPage />);
      const input = screen.getByLabelText("E-mail");
      expect(input).toBeInTheDocument();
    });

    it("has password input", () => {
      render(<LoginPage />);
      const input = screen.getByLabelText("Password");
      expect(input).toBeInTheDocument();
    });

    it("has password type for password input", () => {
      render(<LoginPage />);
      const input = screen.getByLabelText("Password");
      expect(input.type).toBe("password");
    });

    it("has Login button", () => {
      render(<LoginPage />);
      const button = screen.queryByRole("button", { name: "Login" });
      expect(button).toBeInTheDocument();
    });

    it("disables the button initially", () => {
      render(<LoginPage />);
      const button = screen.queryByRole("button", { name: "Login" });
      expect(button).toBeDisabled();
    });
  });

  describe("interactions", () => {
    let button;

    const setup = () => {
      render(<LoginPage />);

      const email = screen.getByLabelText("E-mail");
      userEvent.type(email, "user@test.com");

      const password = screen.getByLabelText("Password");
      userEvent.type(password, "Test123");

      button = screen.getByRole("button", { name: "Login" });
    };

    it("enables button when email and password inputs are filled", () => {
      setup();
      expect(button).toBeEnabled();
    });

    it("displays spinner during api call", async () => {
      setup();

      userEvent.click(button);

      waitFor(async () => {
        expect(await screen.findByRole("status")).toBeInThDocument();
      });
    });

    it("sends email and password to backend after clicking the button", async () => {
      setup();

      userEvent.click(button);

      await waitFor(() => {
        expect(requestBody).toEqual({
          email: "user@test.com",
          password: "Test123",
        });
      });
    });

    it("disable the button when there is an api call", async () => {
      setup();

      userEvent.click(button);

      await screen.findByRole("status");

      expect(button).toBeDisabled();
    });

    it("displays an alert when login fails", async () => {
      setup();

      userEvent.click(button);

      await screen.findByRole("status");

      expect(await screen.findByText("Incorrect credentials")).toBeInTheDocument();
    });

    it("clears an alert message when email input is changed", async () => {
      setup();

      userEvent.click(button);

      await screen.findByText("Incorrect credentials");

      const input = screen.getByLabelText("E-mail");
      userEvent.type(input, "test@");

      expect(screen.queryByText("Incorrect credentials")).not.toBeInTheDocument();
    });

    it("clears an alert message when password input is changed", async () => {
      setup();

      userEvent.click(button);

      await screen.findByText("Incorrect credentials");

      const input = screen.getByLabelText("Password");
      userEvent.type(input, "Pass");

      expect(screen.queryByText("Incorrect credentials")).not.toBeInTheDocument();
    });

    describe("login", () => {
      beforeEach(() => {
        server.use(
          rest.post("/api/1.0/auth", (req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({
                id: 5,
                username: "user5",
                image: null,
                token: "abcdefgh",
              })
            );
          })
        );
      });

      const loginSetup = () => {
        const email = screen.getByLabelText("E-mail");
        userEvent.type(email, "user@test.com");

        const password = screen.getByLabelText("Password");
        userEvent.type(password, "Test123");

        const button = screen.getByRole("button", { name: "Login" });
        userEvent.click(button);
      };

      it("redirects to homepage after successful login", async () => {
        const { unmount } = render(
          <>
            <LoginPage />
            <HomePage />
          </>
        );

        loginSetup();

        await screen.findByRole("status");

        waitFor(async () => {
          expect(await screen.findByTestId("home-page")).toBeInTheDocument();
        });

        // explicit unmount after network call returns which cancels another future network request
        // All this happens before Test function exits
        unmount();
      });
    });
  });
});

console.error = () => {};
