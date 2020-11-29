// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from "react";
import {strictEqual} from "assert";
import {fireEvent, render, RenderResult} from "@testing-library/react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Questionnaire, QuestionnaireProps} from "../questionnaire";
import {fake} from "@miqro/core";

const renderComponent = (props: QuestionnaireProps): RenderResult => {
  return render(<Questionnaire {...props} />);
};

describe("<Questionare />", () => {
  test("happy path", async () => {
    const fakeOnError = fake((e: Error) => {
      console.error(e);
    });
    const fakeGenerator = fake(async (state) => {
      switch (state.step) {
        case 0:
          return {
            text: "what is your favorite color ?",
            options: ["red", "green", "blue"]
          }
        case 1:
          return {
            text: "what is your favorite os ?",
            options: ["GNU/Linux", "MacOS", "windoze"]
          }
        case 2:
          return {
            text: "what is your name",
            textInput: true
          }
        case 3:
          return {
            text: "thanks"
          }
      }
    });
    const {findByText, findByTestId} = renderComponent({
      onError: fakeOnError,
      questionTextAreaSaveLabel: "save",
      questionnaireGenerator: fakeGenerator
    });
    strictEqual(!!(await findByText("what is your favorite color ?")), true);
    const colorOption = await findByTestId(`input-select-what is your favorite color ?`);
    try {
      await findByText("what is your favorite os ?");
      strictEqual(true, false, "bad state");
    } catch (e) {
      strictEqual(e.message.indexOf("Unable to find an element"), 0, "bad error");
    }
    fireEvent.change(colorOption, {
      target: {value: 'green'}
    });
    const myColorP = await findByTestId(`input-select-result-what is your favorite color ?`);
    expect(myColorP).toHaveTextContent("green");
    strictEqual(!!(await findByText("what is your favorite os ?")), true);
    const osOption = await findByTestId(`input-select-what is your favorite os ?`);
    fireEvent.change(osOption, {
      target: {value: "GNU/Linux"}
    });

    const nameInput = await findByTestId(`input-text-what is your name`);
    fireEvent.change(nameInput, {
      target: {value: "bla"}
    });

    const saveInput = await findByTestId(`input-text-save-what is your name`);
    fireEvent.click(saveInput);

    strictEqual(!!(await findByText("thanks")), true);
    strictEqual(fakeOnError.callCount, 0);
    strictEqual(fakeGenerator.callCount, 4);
  });
});
