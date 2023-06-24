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

// 期望的心智模型，fiber链表
// while(下一个工作单元) {
//   下一个工作单元 = 执行工作单元(下一个工作单元)
// }

// 执行流程：外部调用render(初始化设置) -> requestIdleCallback -> workLoop -> nextUnitOfWork -> performUnitOfWork

// 下一个工作单元
let nextUnitOfWork = null;

export function render(element, container) {
  // memo 是否要停止，进行整个fiber tree的优化

  // 将根节点设置为第一个工作单元
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

function createDom(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  Object.keys(fiber.props)
    .filter((key) => key !== 'children')
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

/**
 * @description: 执行单元事件，并返回下一个单元事件
 * @return {*}
 */
function performUnitOfWork() {}

/**
 * @description: 工作循环，代替同步的forEach遍历children，异步链表可以中断
 * @param {*} deadline 帧剩余时间
 * @return {*}
 */
function workLoop(deadline) {
  // 停止任务标识
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    // 执行工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 帧剩余时间小于1ms，停止任务
    shouldYield = deadline.timeRemaining() < 1;
  }
}

// 空闲时间执行任务
requestIdleCallback(workLoop);

// output
// const outputElement = (
//   <h1 title="foo">
//     Hello
//     <a>world</a>
//   </h1>
// );
