// call
// const element = React.createElement(
//   'h1',
//   { title: 'foo' },
//   'Hello',
//   React.createElement('a', null, 'world')
// );
export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === 'object' ? child : createTextElement(child);
      }),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// output
const outputElement = {
  type: 'h1',
  props: {
    title: 'foo',
    children: [
      {
        type: 'TEXT_ELEMENT',
        props: {
          nodeValue: 'Hello',
          children: [],
        },
      },
      {
        type: 'a',
        props: {
          children: [
            {
              type: 'TEXT_ELEMENT',
              props: {
                nodeValue: 'world',
                children: [],
              },
            },
          ],
        },
      },
    ],
  },
};
