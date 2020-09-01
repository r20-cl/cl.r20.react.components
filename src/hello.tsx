import * as React from 'react';

export interface HelloWorldProps {
  color: string;
}

export interface HelloWorldState {
  bye: boolean;
}

export class HelloWorld extends React.Component<HelloWorldProps, HelloWorldState> {
  constructor(props) {
    super(props);
    this.state = {
      bye: false
    };
    this.bye = this.bye.bind(this);
  }

  bye(): void {
    this.setState({
      bye: !this.state.bye
    });
  }

  render(): any {
    return (
      <div>
        <p
          data-testid="hello-world"
          style={{"color": this.props.color}}>
          {this.state.bye ? "bye" : "Hello world!"}
        </p>
        <button
          data-testid="bye-button"
          onClick={this.bye}>{this.state.bye ? "hello" : "bye"}</button>
      </div>
    );
  }
}
