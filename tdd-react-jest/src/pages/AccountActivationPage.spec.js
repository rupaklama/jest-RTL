import { render, screen } from "../test/setup";
import AccountActivationPage from "./AccountActivationPage";
import { setupServer } from "msw/node";
import { rest } from "msw";

let counter = 0;

const server = setupServer(
  rest.post("/api/1.0/users/token/:token", (req, res, ctx) => {
    counter += 1;

    if (req.params.token === "5678") {
      return res(ctx.status(400));
    }

    return res(ctx.status(200));
  })
);

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

describe("Account Activation Page", () => {
  const setup = token => {
    const match = {
      params: { token },
    };

    render(<AccountActivationPage match={match} />);
  };

  it("displays activation success message when token is valid", async () => {
    setup("token");

    expect(await screen.findByText("Account is activated")).toBeInTheDocument();
  });

  it("sends activation request to backend", async () => {
    setup("token");

    await screen.findByText("Account is activated");
    expect(counter).toBe(1);
  });

  it("displays activation fail message when token is invalid", async () => {
    setup("5678");

    expect(await screen.findByText("Activation failure")).toBeInTheDocument();
  });

  it("displays spinner during activation api call", async () => {
    setup("5678");
    const spinner = screen.queryByRole("status");
    expect(spinner).toBeInTheDocument();

    await screen.findByText("Activation failure");
    expect(spinner).not.toBeInTheDocument();
  });
});

// note - overriding default console error
// getting rid of the warning error on this test suite
// console.error = () => {};
