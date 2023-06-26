let stateIndex = 0;
let globalState = {};
// subscriber只是为了展示修改后的值采用的订阅，实际不需要
let globalSubscribers = {};

function useState(initialValue) {
  // 当前状态的索引，调用后索引+1
  const curIndex = stateIndex++;

  // 首次调用，设置初始值
  if (globalState[curIndex] === undefined) {
    globalState[curIndex] = initialValue;
    globalSubscribers[curIndex] = new Set();
  }

  // 修改状态
  function setState(newState) {
    if (newState instanceof Function) {
      newState = newState(globalState[curIndex]);
    }
    globalState[curIndex] = newState;

    // 触发所有的订阅者
    for (let subscriber of globalSubscribers[curIndex]) {
      subscriber(newState);
    }
  }

  // 订阅状态变化
  function subscribe(subscriber) {
    globalSubscribers[curIndex].add(subscriber);
    return () => {
      globalSubscribers[curIndex].delete(subscriber);
    };
  }

  return [globalState[curIndex], setState, subscribe];
}

// -------------------- demo1 --------------------
const [count1, setCount1, subscribeCount1] = useState(0);
// 订阅 count 变化
subscribeCount1((newValue) => {
  console.log('🚀 ~ subscribeCount1 ~ newValue:', newValue); // 1 1 1
});
console.log('🚀 ~ count1:', count1); // 0
setCount1(1); // 更新状态，触发订阅函数
setCount1(1); // 更新状态，触发订阅函数
setCount1(1); // 更新状态，触发订阅函数

// -------------------- demo2 --------------------
const [count2, setCount2, subscribeCount2] = useState(1);
// 订阅 count 变化
subscribeCount2((newValue) => {
  console.log('🚀 ~ subscribeCount2 ~ newValue:', newValue); // 3 5 7
});
console.log('🚀 ~ count2:', count2); // 1
setCount2((c) => c + 2); // 更新状态，触发订阅函数
setCount2((c) => c + 2); // 更新状态，触发订阅函数
setCount2((c) => c + 2); // 更新状态，触发订阅函数
