// import React from 'react';

import React from '../react';

const element = (
  <div>
    <h1 title="foo">
      Hello&nbsp;
      <a href="">world</a>
    </h1>
  </div>
);

console.log('element', element);

// const node  = document.createElement(element.type);
// node['title'] = element.props.title;

// const text = document.createTextNode('');
// text['nodeValue'] = element.props.children;

// node.appendChild(text);

const container = document.getElementById('root');
// container.appendChild(node);

React.render(element, container);
