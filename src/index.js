import React from '../react';

const container = document.getElementById('root');

function App(props) {
  return <h1>Hello {props.name}</h1>;
}

const element = <App name="Function"></App>;

React.render(element, container);
