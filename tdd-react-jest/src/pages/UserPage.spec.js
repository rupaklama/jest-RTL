import { render, screen, waitFor } from "../test/setup";
import UserPage from "./UserPage";

import { setupServer } from "msw/node";
import { rest } from "msw";

const server = setupServer();

beforeEach(() => {
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

it("none", () => {});

// note - All the Children Components of App should be tested in App.spec.module
// This is not needed and will ignored by Jest on coverage

// describe("User Page", () => {
//   beforeEach(() => {
//     server.use(
//       rest.get("/api/1.0/users/:id", (req, res, ctx) => {
//         if (req.params.id === "1") {
//           return res(
//             ctx.json({
//               id: 1,
//               username: "user1",
//               email: "user1@mail.com",
//               image: null,
//             })
//           );
//         } else {
//           return res(ctx.status(404), ctx.json({ message: "User not found" }));
//         }
//       })
//     );
//   });

//   it("displays user name on page when user is found", async () => {
//     const match = { params: { id: 1 } };
//     render(<UserPage match={match} />);

//     expect(await screen.findByText("user1")).toBeInTheDocument();
//   });

//   it("displays spinner while the api call is in progress", async () => {
//     const match = { params: { id: 1 } };
//     render(<UserPage match={match} />);

//     expect(await screen.findByRole("status")).toBeInTheDocument();

//     await screen.findByText("user1");
//   });
//   it("displays error message received from backend when the user is not found", async () => {
//     const match = { params: { id: 2 } };
//     render(<UserPage match={match} />);

//     expect(await screen.findByText("User not found")).toBeInTheDocument();
//   });
// });
