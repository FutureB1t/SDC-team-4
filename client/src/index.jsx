import ReactDOM from 'react-dom';
import React from 'react';
import axios from 'axios';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      productData: {},
    };
  }

  componentDidMount() {
    const { productData } = this.state;
    const url = 'http://localhost:8080/qa/questions/product_id=23156';
    axios.get(url)
      .then((res) => {
        console.log(res.data);
        this.setState({productData: res.data});
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    const { productData } = this.state;
    return (
      <div>{`${JSON.stringify(productData)}`}</div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
