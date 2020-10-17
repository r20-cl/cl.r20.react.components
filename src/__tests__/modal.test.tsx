// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from "react";
import { strictEqual } from "assert";
import { fireEvent, render, RenderResult } from "@testing-library/react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Modal, ModalProps } from "../modal";
import { fake } from "@miqro/core";

const renderModalComponent = (props: ModalProps): RenderResult => {

    return render(<Modal {...props} />);
};

describe("<Modal />", () => {
    test("should display hello world with color style and change content with button click and input change", async () => {
        /*
        const modal = renderModalComponent({ isOpen: false, closeModal: () => { } });
        const bla: ModalProps = {
            isOpen: false,
            closeModal: () => { }
        }
        const bli: JSX.Element = <Modal {...bla}>
                                    <h1>Title</h1>
                                    <p></p>
                                    <button></button>
                                </Modal>
        modal.rerender(<Modal {...bla} />);
        //console.log(modal);
        const ble: ModalProps = {
            isOpen: true,
            closeModal: () => { }
        }
        await modal.findByText("Title");
        */
    });
});