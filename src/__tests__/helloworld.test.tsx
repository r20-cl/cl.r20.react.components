import React from "react";
import {fireEvent, render} from "@testing-library/react";

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

    // fireEvent.change(username, { target: { value: "test" } });


    const hello = await findByTestId("hello-world");
    const byeButton = await findByTestId("bye-button");
    expect(hello).toHaveTextContent("Hello world!");
    expect(byeButton).toHaveTextContent("bye");
    expect(hello).toHaveStyle("color: red;");

    fireEvent.click(byeButton);

    expect(hello).toHaveTextContent("bye");
    expect(byeButton).toHaveTextContent("hello");
    expect(hello).toHaveStyle("color: red;");
  });
});
