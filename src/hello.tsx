import * as React from 'react';

export interface HelloWorldProps {
  color: string;
  onClick?: (event: { name: string; event: "bye" | "hello" }) => void;
}

export interface HelloWorldState {
  flag: boolean;
  name: string;
}

export class HelloWorld extends React.Component<HelloWorldProps, HelloWorldState> {
  constructor(props: HelloWorldProps) {
    super(props);
    this.state = {
      flag: false,
      name: ""
    };
    this.greet = this.greet.bind(this);
  }

  greet(): void {
    this.setState({flag: !this.state.flag}, () => {
      if (this.props.onClick) {
        try {
          this.props.onClick({
            name: this.state.name,
            event: this.state.flag ? "bye" : "hello"
          })
        } catch (e) {
          console.error(e);
        }
      }
    })
  }

  render(): any {
    return (
      <div>
        <p
          data-testid="hello-world"
          style={{"color": this.props.color}}>
          {this.state.flag ? `bye${this.state.name ? ` ${this.state.name}` : ""}` : `Hello world${this.state.name ? ` ${this.state.name}` : ""}!`}
        </p>
        <input
          data-testid="name-input"
          type="text" onChange={event => this.setState({name: event.target.value})}/>
        <button
          data-testid="bye-button"
          onClick={this.greet}>{this.state.flag ? "hello" : "bye"}</button>
      </div>
    );
  }
}
