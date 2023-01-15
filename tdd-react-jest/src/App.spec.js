import { render, screen, waitFor } from "./test/setup";

import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";

import storage from "./state/storage";

import App from "./App";

let requestBody,
  acceptLanguageHeader,
  count = 0;

const server = setupServer(
  rest.get("/api/1.0/users/:id", (req, res, ctx) => {
    const id = Number.parseInt(req.params.id);

    if (id) {
      return res(
        ctx.json({
          id: id,
          username: "user" + id,
          email: "user" + id + "@mail.com",
          image: null,
        })
      );
    } else {
      return res(ctx.status(404), ctx.json({ message: "User not found" }));
    }
  }),

  rest.post("/api/1.0/users", (req, res, ctx) => {
    // accessing request object
    requestBody = req.body;

    // to track api call
    count += 1;

    // NOTE: Backend requires Client to send the 'acceptLanguageHeader' with the user prefer language
    // and based on that, the backend will send response in that particular language
    acceptLanguageHeader = req.headers.get("Accept-Language");

    return res(ctx.status(200));
  }),

  rest.post("/api/1.0/auth", (req, res, ctx) => {
    requestBody = req.body;
    count += 1;
    acceptLanguageHeader = req.headers.get("Accept-Language");

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

beforeEach(() => {
  count = 0;
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

describe("<App /> component", () => {
  const setup = path => {
    window.history.pushState({}, "", path);

    // wrapper with redux store is already applied
    render(<App />);
  };

  xit("renders without an error", () => {
    const { container } = render(<App />);
    // console.log(container.innerHTML);
    expect(container.querySelector("nav")).toBeDefined();
    expect(container.querySelector(".container")).toBeDefined();
  });

  describe("Routing", () => {
    it("displays homepage at '/'", async () => {
      // window.history.pushState({}, "", "/");
      // render(<App />);

      setup("/");

      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    it("displays signup page at '/signup", () => {
      // test will render the given page
      window.history.pushState({}, "", "/signup");
      render(<App />);

      expect(screen.getByTestId("signup-page")).toBeInTheDocument();
    });

    it("does not display Homepage when at '/signup'", () => {
      window.history.pushState({}, "", "/signup");
      render(<App />);

      expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
    });
  });

  describe("Login State", () => {
    const setupLoggedIn = () => {
      setup("/login");
      userEvent.type(screen.getByLabelText("E-mail"), "user5@mail.com");
      userEvent.type(screen.getByLabelText("Password"), "P4ssword");
      userEvent.click(screen.getByRole("button", { name: "Login" }));
    };

    it("redirects to homepage after successful login", async () => {
      setupLoggedIn();
      const page = await screen.findByTestId("home-page");
      expect(page).toBeInTheDocument();
    });

    it("hides Login and Sign Up from navbar after successful login", async () => {
      setupLoggedIn();

      await screen.findByTestId("home-page");

      const loginLink = screen.queryByRole("link", { name: "Login" });
      const signUpLink = screen.queryByRole("link", { name: "Sign Up" });

      expect(loginLink).not.toBeInTheDocument();
      expect(signUpLink).not.toBeInTheDocument();
    });

    it("displays My Profile link on navbar after successful login", async () => {
      setupLoggedIn();

      await screen.findByTestId("home-page");

      expect(await screen.findByRole("link", { name: "My Profile" })).toBeInTheDocument();
    });

    it("displays Logout link on navbar after successful login", async () => {
      setupLoggedIn();

      await screen.findByTestId("home-page");

      expect(await screen.findByRole("link", { name: "Logout" })).toBeInTheDocument();
    });

    it("logs out user on clicking Logout link on navbar after successful login", async () => {
      setupLoggedIn();

      await screen.findByTestId("home-page");

      const link = await screen.findByRole("link", { name: "Logout" });
      userEvent.click(link);

      expect(screen.queryByTestId("user-page")).not.toBeInTheDocument();
    });

    it("displays user page with logged in user id in url after clicking My Profile link", async () => {
      setupLoggedIn();

      await screen.findByTestId("home-page");

      const link = await screen.findByRole("link", { name: "My Profile" });

      userEvent.click(link);

      expect(await screen.findByTestId("user-page")).toBeInTheDocument();
      expect(await screen.findByText("user5")).toBeInTheDocument();
    });

    it("stores logged in user state in local storage", async () => {
      // note - user already logged in from above test cases
      // console.log(localStorage.getItem("auth"));
      // cleared local storage after in each tests - setupTests.js

      setupLoggedIn();

      await screen.findByTestId("home-page");

      // checking state in the local storage
      // const userState = JSON.parse(localStorage.getItem("auth"));
      const userState = storage.getItem("auth");
      expect(userState.isLoggedIn).toBeTruthy();
    });

    it("stores stores id, username, image and token in local storage", async () => {
      setupLoggedIn();

      await screen.findByTestId("home-page");

      const userState = storage.getItem("auth");
      const objectFields = Object.keys(userState);
      expect(objectFields.includes("id")).toBeTruthy();
      expect(objectFields.includes("username")).toBeTruthy();
      expect(objectFields.includes("image")).toBeTruthy();
      expect(objectFields.includes("token")).toBeTruthy();
    });

    it("persists user logged in state on reload", async () => {
      // updating local storage first
      // localStorage.setItem("auth", JSON.stringify({ isLoggedIn: true }));
      storage.setItem("auth", { isLoggedIn: true });

      // rendering home page to mock page reload
      setup("/");

      expect(await screen.findByRole("link", { name: "My Profile" })).toBeInTheDocument();
    });
  });
});

// describe("Logout", () => {
//   let logoutLink;
//   const setupLoggedIn = () => {
//     storage.setItem("auth", {
//       id: 5,
//       username: "user5",
//       isLoggedIn: true,
//       header: "auth header value",
//     });
//     setup("/");
//     logoutLink = screen.queryByRole("link", {
//       name: "Logout",
//     });
//   };
//   it("displays Logout link on navbar after successful login", () => {
//     setupLoggedIn();
//     expect(logoutLink).toBeInTheDocument();
//   });
//   it("displays login and sign up on navbar after clicking logout", async () => {
//     setupLoggedIn();
//     userEvent.click(logoutLink);
//     const loginLink = await screen.findByRole("link", { name: "Login" });
//     expect(loginLink).toBeInTheDocument();
//   });
//   it("sends logout request to backend after clicking logout", async () => {
//     setupLoggedIn();
//     userEvent.click(logoutLink);
//     await screen.findByRole("link", { name: "Login" });
//     expect(logoutCount).toBe(1);
//   });
//   it("removes authorization header from requests after user logs out", async () => {
//     setupLoggedIn();
//     userEvent.click(logoutLink);
//     await screen.findByRole("link", { name: "Login" });
//     const user = screen.queryByText("user-in-list");
//     userEvent.click(user);
//     await screen.findByRole("heading", { name: "user-in-list" });
//     expect(header).toBeFalsy();
//   });
// });

// describe("Delete User", () => {
//   let deleteButton;
//   const setupLoggedInUserPage = async () => {
//     storage.setItem("auth", {
//       id: 5,
//       username: "user5",
//       isLoggedIn: true,
//       header: "auth header value",
//     });
//     setup("/user/5");
//     deleteButton = await screen.findByRole("button", {
//       name: "Delete My Account",
//     });
//   };
//   it("redirects to homepage after deleting user", async () => {
//     await setupLoggedInUserPage();
//     userEvent.click(deleteButton);
//     userEvent.click(screen.queryByRole("button", { name: "Yes" }));
//     await screen.findByTestId("home-page");
//   });
//   it("displays login and sign up on navbar after deleting user", async () => {
//     await setupLoggedInUserPage();
//     userEvent.click(deleteButton);
//     userEvent.click(screen.queryByRole("button", { name: "Yes" }));
//     await screen.findByRole("link", { name: "Login" });
//   });
// });

// console.error = () => {};
