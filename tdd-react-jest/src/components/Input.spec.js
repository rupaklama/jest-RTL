import ReactDOM from "react-dom";

import { render } from "../test/setup";
import Input from "./Input";

// Unit Tests
// note - if we have a test for checking the Class Name assignments,
// they will be relying on the implementation detail which is a bad thing for maintainable test.

describe("<Input /> component", () => {
  it("renders without error", () => {
    // const container = document.createElement("div");

    // ReactDOM.render(<Input />, container);

    // console.log(container.innerHTML);
    // expect(container.querySelector("label")).not.toBeNull();

    // NOTE - React Testing Library will create a 'div' and append that div to the document.body
    // and this is where this Input component will be rendered
    const { container } = render(<Input />);
    // console.log(container.innerHTML);
    expect(container.querySelector("label")).toBeDefined();
    expect(container.querySelector("input")).toBeDefined();
  });

  // it("snapshot", () => {
  //   const { asFragment } = render(Input);
  //   expect(asFragment).toMatchSnapshot();
  // });

  it("has is-invalid class for input when help is set", () => {
    const { container } = render(<Input help="Error Message" />);

    const input = container.querySelector("input");
    expect(input.classList).toContain("is-invalid");
    // expect(container.querySelector("input").className).toBe("form-control is-invalid");
  });
});
