import React from '../react';

const container = document.getElementById('root');

function Counter() {
  const [state, setState] = React.useState(1);
  const [state2, setState2] = React.useState(2);

  function onClickHandle(params) {
    setState((state) => state + 1);
    setState((state) => state + 2);
  }

  return (
    <div>
      <h1>Count: {state}</h1>
      <button onClick={onClickHandle}>+Add</button>
      <hr />
      <h1>Count2: {state2}</h1>
      <button onClick={() => setState2((state) => state + 1)}>+1</button>
      <button onClick={() => setState2((state) => state + 2)}>+2</button>
    </div>
  );
}
const element = <Counter />;

React.render(element, container);