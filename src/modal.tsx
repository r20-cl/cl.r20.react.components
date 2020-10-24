import React, { Component } from 'react';


export interface ModalChangeStateEvent<T = boolean> {
    isOpen: boolean,
    result: T
}

export interface ModalMessageOk {
    result: string
}

export interface ModalProps<T = boolean> {
    isOpen: boolean;
    title?: string;
    textButtonOk?: string;
    textButtonCancel?: string;
    textBody?: string;
    textBodyEnd?: string;
    onShowMessage: (e: ModalMessageOk) => void;
    closeModal?: () => void;
    handleActionModal?(): void;
    onStateChange: (state: ModalChangeStateEvent<T>) => void;
    onError?: (e: Error) => void;
    headerModal?: () => JSX.Element;
    bodyModal?: () => JSX.Element;
    footerModal?: () => JSX.Element;
}

export interface ModalState {

    isOpen: boolean;
    showMessage: string
    showButtonOk: boolean
}

export class Modal<T = boolean> extends Component<ModalProps<T>, ModalState> {



    constructor(props: ModalProps<T>, state: ModalState) {
        super(props);
        this.state = {
            isOpen: this.props.isOpen,
            showMessage: this.props.textBody ? this.props.textBody : "",
            showButtonOk: this.props.textButtonOk ? true : false
        }
        this.handleModalDialogClick = this.handleModalDialogClick.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleActionModal = this.handleActionModal.bind(this);

    }

    componentDidMount(): void {


    }

    componentDidUpdate(prevProps: Partial<ModalProps<T>>, prevState: Partial<ModalState>): void {
        if (this.state.isOpen !== this.props.isOpen) {
            this.setState({
                isOpen: this.props.isOpen,
                showMessage: this.props.textBody ? this.props.textBody : "",
                showButtonOk: this.props.textButtonOk ? true : false
            })
        }
    }

    protected closeModal(): void {
        this.setState({
            isOpen: false,
        }, () => {
            try {
                this.props.onStateChange({
                    isOpen: this.state.isOpen,
                    result: "To do" as unknown as T
                });
            }
            catch (e) {
                if (this.props.onError)
                    this.props.onError(e)
                else
                    console.log(e)
            }
        })

    }

    protected handleActionModal(): void {
        
        this.setState({
            showMessage: this.props.textBodyEnd ? this.props.textBodyEnd : "Gracias...",
            showButtonOk: false
        }, () => {
            try {
                this.props.onShowMessage({
                    result: this.state.showMessage
                })
            }
            catch (e) {
                this.props.onShowMessage({
                    result: e
                })
            }
        })
    }

    handleModalDialogClick(e: any): void {

        e.stopPropagation();
    }

    protected renderHeader(): JSX.Element {

        return (
            this.props.headerModal ? this.props.headerModal() : (
                <>

                    <div className="modal-header">
                        <h5 className="modal-title">{this.props.title}</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.closeModal}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                </>
            )
        );

    }

    protected renderBody(): JSX.Element {
        return (
            this.props.bodyModal ? this.props.bodyModal() : (
                <>
                    <div className="modal-body">

                        <p>{this.state.showMessage}</p>

                    </div>
                </>
            )
        );
    }

    protected renderFooter(): JSX.Element {
        return (
            this.props.footerModal ? this.props.footerModal() : (
                <>
                    <div className="modal-footer">
                        {
                            this.state.showButtonOk &&
                            <button
                                type="button"
                                className="btn btn-success"
                                data-dismiss="modal"
                                onClick={this.props.handleActionModal ? this.props.handleActionModal : this.handleActionModal}>{this.props.textButtonOk ? this.props.textButtonOk : "Ok"}
                            </button>
                        }
                        <button type="button"
                            className="btn btn-primary" onClick={this.closeModal}>{this.props.textButtonCancel ? this.props.textButtonCancel : "Cerrar"}
                        </button>
                    </div>
                </>
            )
        );
    }

    render(): JSX.Element {
       
        if (this.props.children) {
            return (<>
                {
                    this.state.isOpen &&
                    <div className="modal-r20 modal-r20-open" onClick={this.props.closeModal}>
                        <div className="modal-r20-dialog" onClick={this.handleModalDialogClick}>
                            {/*this.renderHeader()*/}
                            {this.props.children}
                            {/*this.renderFooter()*/}
                        </div>
                    </div>
                }

            </>);
        }
        else {
            return (
                <>

                    {

                        (this.state.isOpen) &&
                        <div className="modal-r20 modal-r20-open" onClick={this.props.closeModal}>
                            <div className="modal-r20-dialog" onClick={this.handleModalDialogClick}>
                                {this.renderHeader()}
                                {this.renderBody()}
                                {this.renderFooter()}

                            </div>
                        </div>

                    }

                </>
            )
        }
    }

}
