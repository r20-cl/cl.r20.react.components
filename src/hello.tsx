import * as React from 'react';

export interface HelloWorldProps {
  color: string;
}

export interface HelloWorldState {
  color: string;
}

export class HelloWorld extends React.Component<HelloWorldProps, HelloWorldState> {
  render(): any {
    return (
      <div
        data-testid="hello-world"
        style={{"color": this.props.color}}>
        Hello world!
      </div>
    );
  }
}
