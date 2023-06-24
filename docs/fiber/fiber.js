// requestAnimationFrame回调的执行与task和microtask无关，
// 它是在浏览器渲染前，在微任务执行后执行。时机其实也并不是很准确

// requestAnimationFrame还有个特点，
// 就是当页面处理未激活的状态下，requestAnimationFrame会暂停执行，
// 页面激活后，会接着上次执行的地方恢复执行。

// 所以在react18被去除了

let tasks = []; // 任务队列
let isPerformingTask = false; // 标识变量，用于表示当前是否有任务正在执行

// 1000 / 60 = 16.67ms

const channel = new MessageChannel(); // 创建一个新的消息通道
const port2 = channel.port2; // 获取通道的第二个端口

function scheduleTask(task, expirationTime) {
  console.log('task = ', task, performance.now());
  tasks.push({ task, expirationTime }); // 将任务和过期时间添加到任务队列
  if (!isPerformingTask) {
    isPerformingTask = true; // 标识当前有任务正在执行
    port2.postMessage(null); // 向通道的第二个端口发送一个空消息
  }
}

function performTask(currentTime) {
  const frameTime = 1000 / 60; // 一帧的时间
  console.log(
    'currentTime = ',
    currentTime,
    'nowTime - callbackTime = ',
    performance.now() - currentTime,
    'leftTime = ',
    frameTime - (performance.now() - currentTime),
    'task length',
    tasks.length
  );
  while (tasks.length > 0 && performance.now() - currentTime < frameTime) {
    const { task, expirationTime } = tasks.shift(); // 从任务队列中取出任务和过期时间
    if (performance.now() >= expirationTime) {
      // 如果任务没有过期，则执行任务
      task();
    } else {
      // 如果任务过期，则将任务添加到任务队列的末尾
      tasks.push({ task, expirationTime });
    }
  }

  if (tasks.length > 0) {
    requestAnimationFrame(performTask); // 递归调用 performTask 函数
  } else {
    isPerformingTask = false; // 标识当前没有任务正在执行
  }
}

// 监听通道的第一个端口，当收到消息时，执行 performTask 函数
channel.port1.onmessage = () => {
  console.log('message', performance.now());
  requestAnimationFrame(performTask);
};

// ---------------------具体的调用------------------------

// 示例任务函数
function myTask1() {
  console.log('Performing task 1 1000');
}

function myTask2() {
  console.log('Performing task 2 now');
}

function myTask3() {
  console.log('Performing task 3 3000');
}

// 添加超时任务到任务队列，并设置过期时间
scheduleTask(myTask1, performance.now() + 1000); // 过期时间为当前时间 + 1000ms
console.log('t1--t2', performance.now())
scheduleTask(myTask2, performance.now()); // 过期时间为当前时间
console.log('t2--t3', performance.now())
scheduleTask(myTask3, performance.now() + 3000); // 过期时间为当前时间 + 3000ms

console.log('同步任务', performance.now());
