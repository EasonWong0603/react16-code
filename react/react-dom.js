// input
const inputElement = {
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

export function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  Object.keys(element.props)
    .filter((key) => key !== 'children')
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  // call stack 同步的不可被中断的
  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

// output
// const outputElement = (
//   <h1 title="foo">
//     Hello
//     <a>world</a>
//   </h1>
// );
