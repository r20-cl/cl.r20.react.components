// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import {fireEvent, render} from "@testing-library/react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {HelloWorld, HelloWorldProps} from "../hello";

function renderLoginForm(props: Partial<HelloWorldProps> = {}) {
  const defaultProps: HelloWorldProps = {
    color: "red"
  };
  return render(<HelloWorld {...defaultProps} {...props} />);
}

describe("<HelloWorld />", () => {
  test("should display hello world with color style and change content with button click", async () => {
    const {findByTestId} = renderLoginForm();

    const hello = await findByTestId("hello-world");
    const nameInput = await findByTestId("name-input");
    const byeButton = await findByTestId("bye-button");
    expect(hello).toHaveTextContent("Hello world!");
    expect(byeButton).toHaveTextContent("bye");
    expect(hello).toHaveStyle("color: red;");

    fireEvent.click(byeButton);

    expect(hello).toHaveTextContent("bye");
    expect(byeButton).toHaveTextContent("hello");
    expect(hello).toHaveStyle("color: red;");

    fireEvent.change(nameInput, {target: {value: "bla"}});

    expect(hello).toHaveTextContent("bye bla");
    expect(byeButton).toHaveTextContent("hello");
    expect(hello).toHaveStyle("color: red;");

    fireEvent.click(byeButton);

    expect(hello).toHaveTextContent("Hello world bla!");
    expect(byeButton).toHaveTextContent("bye");
    expect(hello).toHaveStyle("color: red;");
  });
});
