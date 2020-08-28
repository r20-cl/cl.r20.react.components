import * as React from 'react';

export default class HelloWorld extends React.Component<any, any> {
  renders(): any {
    return (
      <div style={{color: this.props.color}}>
        Hello world!
      </div>
    );
  }
}
