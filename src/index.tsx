import * as React from 'react';

export interface HelloWorldProps {
  color: string;
}

export interface HelloWorldState {
  bla: string;
}

export default class HelloWorld extends React.Component<HelloWorldProps, HelloWorldState> {
  renders(): any {
    return (
      <div style={{color: this.props.color}}>
        Hello world!
      </div>
    );
  }
}
