import * as React from 'react';

export interface HelloWorldProps {
  color: string;
}

export interface HelloWorldState {
  bye: boolean;
  name: string;
}

export class HelloWorld extends React.Component<HelloWorldProps, HelloWorldState> {
  constructor(props: HelloWorldProps) {
    super(props);
    this.state = {
      bye: false,
      name: ""
    };
  }

  render(): any {
    return (
      <div>
        <p
          data-testid="hello-world"
          style={{"color": this.props.color}}>
          {this.state.bye ? `bye${this.state.name ? ` ${this.state.name}` : ""}` : `Hello world${this.state.name ? ` ${this.state.name}` : ""}!`}
        </p>
        <input
          data-testid="name-input"
          type="text" onChange={event => this.setState({name: event.target.value})}/>
        <button
          data-testid="bye-button"
          onClick={() => this.setState({bye: !this.state.bye})}>{this.state.bye ? "hello" : "bye"}</button>
      </div>
    );
  }
}
