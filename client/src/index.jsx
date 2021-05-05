import ReactDOM from 'react-dom';
import React from 'react';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      value: '',
    };
  }

  render() {
    return (
      <div>Hello Curtis World!</div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
