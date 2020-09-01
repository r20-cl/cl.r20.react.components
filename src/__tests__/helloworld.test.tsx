import React from "react";
import {render} from "@testing-library/react";

import {HelloWorld, HelloWorldProps} from "../hello";

function renderLoginForm(props: Partial<HelloWorldProps> = {}) {
  const defaultProps: HelloWorldProps = {
    color: "red"
  };
  return render(<HelloWorld {...defaultProps} {...props} />);
}

describe("<HelloWorld />", () => {
  test("should display hello world with color style", async () => {
    const {findByTestId} = renderLoginForm();

    // fireEvent.change(username, { target: { value: "test" } });
    // fireEvent.click(button);

    const hello = await findByTestId("hello-world");

    expect(hello).toHaveTextContent("Hello world!");
    expect(hello).toHaveStyle("color: red;");
  });
});
