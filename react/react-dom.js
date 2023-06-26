// 期望的心智模型，fiber链表
// while(下一个工作单元) {
//   下一个工作单元 = 执行工作单元(下一个工作单元)
// }

// 大执行流程：外部调用render(初始化设置) -> requestIdleCallback -> workLoop -> nextUnitOfWork -> performUnitOfWork

// 下一个工作单元
let nextUnitOfWork = null;
// 本次操作的fiber tree，内存中
let wipRoot = null;
// 真实页面中的（上次操作）的fiber tree，双缓存
let currentRoot = null;
// 需要删除的节点
let deletions = null;

/**
 * @description: 将虚拟 DOM 转换为真实 DOM 并添加到容器中
 * @param {*} element 虚拟 DOM
 * @param {*} container 真实 DOM
 * @return {void}
 */
export function render(element, container) {
  // memo 是否要停止，进行整个fiber tree的优化

  wipRoot = {
    dom: container, // 根节点容器
    props: {
      children: [element],
    },
    alternate: currentRoot, // 缓存上一次的fiber tree
  };
  // 需要删除的节点
  deletions = [];
  // 将根节点设置为第一个工作单元
  nextUnitOfWork = wipRoot;
}

// 判断事件
const isEvent = (key) => key.startsWith('on');
// 判断属性
const isProperty = (key) => key !== 'children' && !isEvent(key);
// 判断新属性或新属性值
const isNew = (prev, next) => (key) => prev[key] !== next[key];
// 判断不要的属性
const isGone = (next) => (key) => next[key] === undefined;

/**
 * @description: 更新DOM节点上的属性和属性值
 * @param {*} dom
 * @param {*} prevProps
 * @param {*} nextProps
 * @return {void}
 */
function updateDom(dom, prevProps, nextProps) {
  // 移除老的事件监听
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(isGone(nextProps) || isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  // 添加新的事件处理
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
  // 移除老的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(nextProps))
    .forEach((name) => {
      dom[name] = '';
    });
  // 设置新的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
}

/**
 * @description: 提交阶段的删除节点
 * @param {*} fiber
 * @param {*} domParent
 * @return {void}
 */
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

/**
 * @description: 处理提交的fiber tree，渲染为真实DOM
 * @param {*} fiber
 * @return {void}
 */
function commitWork(fiber) {
  // 函数组件没有真实DOM，需要找到父级真实DOM
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  // 处理新增节点标记
  if (fiber.effectTag === 'PLACEMENT' && (fiber.dom ?? false)) {
    domParent.appendChild(fiber.dom);
    // 处理删除节点标记
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
    // 处理更新属性
  } else if (fiber.effectTag === 'UPDATE' && (fiber.dom ?? false)) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }
}

/**
 * @description: 提交渲染任务
 * @return {void}
 */
function commitRoot() {
  // 提交阶段，先删除不要的老的真实节点
  deletions.forEach(commitWork);

  // 先序遍历fiber tree，更新和新增真实节点进入DOM
  const commitWorkStack = [wipRoot.child];
  while (commitWorkStack.length > 0) {
    const fiber = commitWorkStack.pop();
    commitWork(fiber);
    // 先推入兄弟元素，后处理
    if (fiber.sibling) {
      commitWorkStack.push(fiber.sibling);
    }
    // 后推入子元素，先处理
    if (fiber.child) {
      commitWorkStack.push(fiber.child);
    }
  }

  // 提交阶段，currentRoot存下页面中的真实DOM
  currentRoot = wipRoot;
  wipRoot = null;
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
  // 首次渲染，设置属性
  updateDom(dom, {}, fiber.props);

  return dom;
}

/**
 * @description: 协调，DOM Diff
 * @param {*} wipFiber
 * @param {*} elements
 * @return {*}
 */
function reconcileChildren(wipFiber, elements) {
  // 索引
  let index = 0;
  // 上一个兄弟节点
  let prevSibling = null;
  // 上一次渲染的fiber
  let oldFiber = wipFiber.alternate?.child;

  while (index < elements.length || (oldFiber ?? false)) {
    const element = elements[index];

    let newFiber = null;
    // 判断新老节点类型是否相同
    const sameType = oldFiber && element && element.type === oldFiber.type;
    // 类型相同，更新节点属性
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }
    // 有类型不同的新节点，新增节点
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }
    // 有类型不同的老节点，删除节点
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }
    // 指针指向老节点的兄弟节点，继续与新节点的兄弟节点比较
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    // 兄弟元素链式挂载在上一个兄弟元素上
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    // 指针指向新节点的兄弟节点
    index++;
  }
}

let wipFiber = null;
let hookIndex = null;
/**
 * @description: hooks: state
 * @param {*} initialValue
 * @return {*}
 */
export function useState(initialValue) {
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initialValue,
    actions: [], // 清空本次的更新操作
  };

  // 批处理重新渲染前的更新操作，再返回state
  const actions = oldHook ? oldHook.actions : [];
  actions.forEach((action) => {
    hook.state = action instanceof Function ? action(hook.state) : action;
  });

  // 单向链表存储hooks
  wipFiber.hooks.push(hook);

  hookIndex++;

  function setState(action) {
    // 更新操作加入操作队列中，下次重新渲染的时候统一处理
    hook.actions.push(action);
    // 只要修改wipRoot即可中断当前任务，重新渲染fiber tree
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
  }

  return [hook.state, setState];
}

/**
 * @description: 更新函数式组件
 * @param {*} fiber
 * @return {*}
 */
function updateFunctionComponent(fiber) {
  // 组件内状态 初始化
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];

  const children = [fiber.type(fiber.props)];
  // 执行单元事件
  reconcileChildren(fiber, children);
}

/**
 * @description: 更新普通组件
 * @param {*} fiber
 * @return {void}
 */
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    // 创建真实DOM
    fiber.dom = createDom(fiber);
  }
  // 执行单元事件
  reconcileChildren(fiber, fiber.props.children);
}

/**
 * @description: 执行单元事件，并返回下一个单元事件，构建虚拟DOM fiber tree
 * @param {*} fiber
 * @return {*} 下一个fiber单元事件
 */
function performUnitOfWork(fiber) {
  // 判断是否是函数组件
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
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
  // 单元任务全部处理完成，且有根节点，提交渲染任务
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  // 空闲时间执行任务，50ms调用一次，会一直执行下去，性能开销较大
  requestIdleCallback(workLoop);
}

// 空闲时间执行任务
requestIdleCallback(workLoop);
