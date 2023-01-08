import { render, screen } from "../test/setup";
import userEvent from "@testing-library/user-event";

import NavBar from "./NavBar";
import UserList from "./UserList";
import SignupPage from "../pages/SignUpPage";
import LoginPage from "../pages/LoginPage";

describe("<Navbar /> component", () => {
  it("displays link and navigates to Home page on click", async () => {
    render(
      <>
        <NavBar />
        <UserList />
      </>
    );

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toBeInTheDocument();

    userEvent.click(homeLink);
    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();
  });

  it("displays link and navigates to Signup page on click", () => {
    render(
      <>
        <NavBar />
        <SignupPage />
      </>
    );

    const link = screen.getByRole("link", { name: "Sign Up" });
    expect(link).toBeInTheDocument();

    userEvent.click(link);

    expect(screen.getByRole("heading", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("displays link and navigates to Login page on click", () => {
    render(
      <>
        <NavBar />
        <LoginPage />
      </>
    );

    const link = screen.getByRole("link", { name: "Login" });
    expect(link).toBeInTheDocument();

    userEvent.click(link);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });
});
