import * as React from 'react';

export interface HelloWorldProps {
  color: string;
}

export interface HelloWorldState {
  color: string;
}

export default class HelloWorld extends React.Component<HelloWorldProps, HelloWorldState> {
  render(): any {
    return (
      <div style={{"color": this.props.color}}>
        Hello world!
      </div>
    );
  }
}
