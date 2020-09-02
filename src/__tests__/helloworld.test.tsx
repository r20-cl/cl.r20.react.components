// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from "react";
import {strictEqual} from "assert";
import {fireEvent, render, RenderResult} from "@testing-library/react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {HelloWorld, HelloWorldClickEvent, HelloWorldProps} from "../hello";
import {fake} from "@miqro/core";

const renderHelloWorldComponent = (props: Partial<HelloWorldProps> = {}): RenderResult => {
  const defaultProps: HelloWorldProps = {
    color: "red"
  };
  return render(<HelloWorld {...defaultProps} {...props} />);
};

describe("<HelloWorld />", () => {
  test("should display hello world with color style and change content with button click and input change", async () => {

    const fakeHelloCB = fake((event: HelloWorldClickEvent): void => {
      switch (fakeHelloCB.callCount) {
        case 1:
          strictEqual(event.name, "");
          strictEqual(event.event, "bye");
          break;
        case 2:
          strictEqual(event.name, "bla");
          strictEqual(event.event, "hello");
          break;
        default:
          strictEqual(false, true, "bad state");
      }
    });

    const {findByTestId} = renderHelloWorldComponent({
      onClick: fakeHelloCB
    });
    // get elements by data-testid attr
    const hello = await findByTestId("hello-world");
    const nameInput = await findByTestId("name-input");
    const byeButton = await findByTestId("bye-button");
    // starting render asserts
    expect(hello).toHaveTextContent("Hello world!");
    expect(byeButton).toHaveTextContent("bye");
    expect(hello).toHaveStyle("color: red;");
    // click button and assert CB call
    strictEqual(fakeHelloCB.callCount, 0);
    fireEvent.click(byeButton);
    strictEqual(fakeHelloCB.callCount, 1);
    // assert render change
    expect(hello).toHaveTextContent("bye");
    expect(byeButton).toHaveTextContent("hello");
    expect(hello).toHaveStyle("color: red;");
    fireEvent.change(nameInput, {target: {value: "bla"}});
    expect(hello).toHaveTextContent("bye bla");
    expect(byeButton).toHaveTextContent("hello");
    expect(hello).toHaveStyle("color: red;");
    // click button and assert CB call
    fireEvent.click(byeButton);
    strictEqual(fakeHelloCB.callCount, 2);
    // assert render change
    expect(hello).toHaveTextContent("Hello world bla!");
    expect(byeButton).toHaveTextContent("bye");
    expect(hello).toHaveStyle("color: red;");
  });
});
