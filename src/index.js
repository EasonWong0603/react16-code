import React from '../react';

const element = (
  <section>
    <h1 title="foo">
      <span>Hello</span>
    </h1>
    <a href="">world</a>
  </section>
);

const container = document.getElementById('root');
React.render(element, container);

console.log('element', element);
console.log('container', container);
