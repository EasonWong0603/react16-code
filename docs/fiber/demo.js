// var count = 0;

// var startVal = +new Date();
// console.log('start time', 0, 0);
// function func() {
//   setTimeout(() => {
//     console.log('exec time', ++count, +new Date() - startVal);
//     if (count === 50) {
//       return;
//     }
//     func();
//   }, 0);
// }

// func();


// libuv调度周期
setTimeout(() => {
  console.log(1);
}, 0);

setImmediate(() => {
  console.log(2);
});
