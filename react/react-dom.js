// 期望的心智模型，fiber链表
// while(下一个工作单元) {
//   下一个工作单元 = 执行工作单元(下一个工作单元)
// }

// 执行流程：外部调用render(初始化设置) -> requestIdleCallback -> workLoop -> nextUnitOfWork -> performUnitOfWork

// 下一个工作单元
let nextUnitOfWork = null;

/**
 * @description: 将虚拟 DOM 转换为真实 DOM 并添加到容器中
 * @param {*} element 虚拟 DOM
 * @param {*} container 真实 DOM
 * @return {void}
 */
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

/**
 * @description: 由虚拟DOM创建真实DOM
 * @param {*} fiber fiber节点
 * @return {*} 真实DOM节点
 */
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
 * @return {*} 下一个fiber单元事件
 */
function performUnitOfWork(fiber) {
  // debugger;
  if (!fiber.dom) {
    // 创建真实DOM
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    // 向父级DOM节点追加元素
    fiber.parent.dom.appendChild(fiber.dom);
  }
  // debugger;
  const elements = fiber.props.children;

  // 索引
  let index = 0;
  // 上一个兄弟节点
  let prevSibling = null;
  // 把每个子元素转换为fiber节点，首个子元素作为child，其他子元素链式存为sibling
  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
  // 深度优先，优先向下处理子元素
  if (fiber.child) {
    return fiber.child;
  }
  // 没有子元素，同级查找兄弟元素
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      // 处理兄弟元素
      return nextFiber.sibling;
    }
    // 没有兄弟元素，向上查找父元素
    nextFiber = nextFiber.parent;
  }
}

/**
 * @description: 工作循环，代替同步的forEach遍历children，异步链表可以中断
 * @param {*} deadline 帧剩余时间
 * @return {void}
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
  // 空闲时间执行任务，50ms调用一次，会一直执行下去，性能开销较大
  requestIdleCallback(workLoop);
}

// 空闲时间执行任务
requestIdleCallback(workLoop);
