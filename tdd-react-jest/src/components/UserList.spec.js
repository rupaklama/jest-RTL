import { render, screen, waitFor } from "../test/setup";

import { setupServer } from "msw/node";
import { rest } from "msw";

import userEvent from "@testing-library/user-event";

import en from "../locale/en.json";
import tr from "../locale/tr.json";

import storage from "../state/storage";

import UserList from "./UserList";

const users = [
  {
    id: 1,
    username: "user1",
    email: "user1@mail.com",
    image: null,
  },
  {
    id: 2,
    username: "user2",
    email: "user2@mail.com",
    image: null,
  },
  {
    id: 3,
    username: "user3",
    email: "user3@mail.com",
    image: null,
  },
  {
    id: 4,
    username: "user4",
    email: "user4@mail.com",
    image: null,
  },
  {
    id: 5,
    username: "user5",
    email: "user5@mail.com",
    image: null,
  },
  {
    id: 6,
    username: "user6",
    email: "user6@mail.com",
    image: null,
  },
  {
    id: 7,
    username: "user7",
    email: "user7@mail.com",
    image: null,
  },
];

const getPage = (page, size) => {
  // array indexes for slice
  let start = page * size;
  let end = start + size;

  let totalPages = Math.ceil(users.length / size);

  return {
    content: users.slice(start, end),
    page,
    size,
    totalPages,
  };
};

// api
let header;

const server = setupServer(
  rest.get("/api/1.0/users", (req, res, ctx) => {
    header = req.headers.get("Authorization");

    let page = Number.parseInt(req.url.searchParams.get("page"));
    let size = Number.parseInt(req.url.searchParams.get("size"));

    // possibility that the values are not number
    // setting default values if so
    if (Number.isNaN(page)) {
      page = 0;
    }

    if (Number.isNaN(size)) {
      size = 5;
    }

    return res(ctx.status(200), ctx.json(getPage(page, size)));
  })
);

beforeEach(() => {
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

const setup = () => {
  render(<UserList />);
};

describe("User List", () => {
  describe("Interactions", () => {
    it("displays three users in list", async () => {
      setup();
      // '/user/' - regex for implicit match
      const users = await screen.findAllByText(/user/);
      expect(users.length).toBe(3);
    });

    it("navigates to user page when clicking the user list", async () => {
      server.use(
        rest.get("/api/1.0/user/:id", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ id: 1, username: "user1", email: "user1@mail.com", image: null }));
        })
      );

      setup();

      const user1 = await screen.findByText("user1");
      userEvent.click(user1);

      expect(screen.queryByTestId("user-detail")).not.toBeInTheDocument();

      waitFor(async () => {
        expect(await screen.findByTestId("user-page")).toBeInTheDocument();
      });
    });

    it("displays next page link", async () => {
      setup();
      await screen.findByText("user1");
      expect(await screen.findByRole("button", { name: "next >" })).toBeInTheDocument();
    });

    it("displays spinner during the api call is in progress", async () => {
      setup();

      // shorter test implementation here without searching by async way
      // getByRole query is to indicate that the spinner is present
      const spinner = screen.getByRole("status");

      await screen.findByText("user1");

      expect(spinner).not.toBeInTheDocument();
    });

    it("displays next page after clicking next link", async () => {
      setup();
      await screen.findByText("user1");

      const button = await screen.findByRole("button", { name: "next >" });
      userEvent.click(button);

      expect(await screen.findByText("user4")).toBeInTheDocument();
    });

    it("displays previous link after clicking next link", async () => {
      setup();
      await screen.findByText("user1");

      const button = await screen.findByRole("button", { name: "next >" });
      userEvent.click(button);

      expect(await screen.findByRole("button", { name: "< previous" })).toBeInTheDocument();
    });

    it("displays previous page after clicking previous link", async () => {
      setup();
      await screen.findByText("user1");

      const nextButton = await screen.findByRole("button", { name: "next >" });
      userEvent.click(nextButton);

      await screen.findByText("user4");

      const prevButton = await screen.findByRole("button", { name: "< previous" });
      userEvent.click(prevButton);

      expect(await screen.findByText("user1")).toBeInTheDocument();
    });

    it("hides next page link in the last page", async () => {
      setup();
      await screen.findByText("user1");

      userEvent.click(await screen.findByRole("button", { name: "next >" }));
      await screen.findByText("user4");

      userEvent.click(await screen.findByRole("button", { name: "next >" }));
      await screen.findByText("user7");

      const button = screen.queryByRole("button", { name: "next >" });

      expect(button).not.toBeInTheDocument();
    });

    it("hides previous page link in the first page", async () => {
      setup();

      await screen.findByText("user1");

      const nextButton = await screen.findByRole("button", { name: "next >" });
      userEvent.click(nextButton);

      await screen.findByText("user4");

      const prevButton = await screen.findByRole("button", { name: "< previous" });
      userEvent.click(prevButton);

      await screen.findByText("user1");

      expect(screen.queryByRole("button", { name: "< previous" })).not.toBeInTheDocument();
    });
  });

  describe("Internationalization", () => {
    beforeEach(() => {
      server.use(
        rest.get("/api/1.0/users", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(getPage(1, 3)));
        })
      );
    });

    it("initially displays header and navigation links in english", async () => {
      setup();

      await screen.findByText("user4");

      expect(screen.getByText(en.users)).toBeInTheDocument();
      expect(screen.getByText(en.nextPage)).toBeInTheDocument();
      expect(screen.getByText(en.previousPage)).toBeInTheDocument();
    });

    it("displays header and navigation links in turkish after selecting the language", async () => {
      setup();

      await screen.findByText("user4");

      const languageButton = screen.getByAltText("Turkish Flag");

      userEvent.click(languageButton);

      expect(screen.getByText(tr.users)).toBeInTheDocument();
      expect(screen.getByText(tr.nextPage)).toBeInTheDocument();
      expect(screen.getByText(tr.previousPage)).toBeInTheDocument();
    });
  });
});
