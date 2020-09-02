// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from "react";
import {strictEqual} from "assert";
import {fireEvent, render} from "@testing-library/react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {HelloWorld, HelloWorldProps} from "../hello";
import {fake} from "@miqro/core";

function renderHelloWorldComponent(props: Partial<HelloWorldProps> = {}) {
  const defaultProps: HelloWorldProps = {
    color: "red"
  };
  return render(<HelloWorld {...defaultProps} {...props} />);
}

describe("<HelloWorld />", () => {
  test("should display hello world with color style and change content with button click and input change", async () => {

    const fakeHelloCB = fake((event) => {
      switch (fakeHelloCB.callCount) {
        case 1:
          strictEqual(event.text, "bye");
          break;
        case 2:
          strictEqual(event.text, "Hello world bla!");
          break;
        default:
          strictEqual(false, true, "bad state");
      }
    });

    const {findByTestId} = renderHelloWorldComponent({
      onClick: fakeHelloCB
    });

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

    strictEqual(fakeHelloCB.callCount, 2);
  });
});
