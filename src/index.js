import React from '../react';

const container = document.getElementById('root');

const updateValue = (e) => {
  const element = (
    <div className="father">
      <input onInput={updateValue} value={e.target.value} />
      <h2
        className="new"
        onInput={(e) => console.log('new')}
        // onMessage={(e) => console.log('new')}
      >
        Hello {e.target.value}
      </h2>
      <p>add element</p>
    </div>
  );
  React.render(element, container);
};

const rerender = (value) => {
  const element = (
    <div className="father">
      <p>delete element</p>
      <input onInput={updateValue} value={value} />
      <h2
        style={{ fontSize: '20px' }}
        // onInput={(e) => console.log('old')}
        onMessage={(e) => console.log('old')}
      >
        Hello {value}
      </h2>
    </div>
  );
  React.render(element, container);
};

rerender('World');
