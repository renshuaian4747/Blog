# 异步和单线程
## 一、异步单线程概念
* js 是单线程语言，同一时间只做一件事
* 浏览器和 node.js 支持 js 启动进程，如 Web Worker
* JS 和 DOM 渲染共用一个线程，因为 JS 可能会修改 DOM 结构
* 异步不会阻塞代码执行

## 二、Event Loop
* Event Loop 过程：
  1. 同步代码一行一行推入 call stack 中执行
  2. 遇到异步代码，会先“记录”下来，等待时机（定时、网络请求）
  3. 时机到了，推入 Callback Queue 中
  4. 等待所有同步代码执行完毕，call stack 为空，Event Loop 开始工作（**call stack 为空后，还会查看 micro task queue，如果有微任务则推入 call stack 中执行，然后会尝试 DOM  渲染**）
  5. 轮训查找 Callback Queue，如有则推入 call stack 中执行
  6. 继续轮训查找 Callback Queue

## 三、Promise
* 三种状态：resolved、rejected、pending
* then 正常情况返回 resolved，里面报错则返回 rejected
* catch 正常情况返回 resolved，里面报错则返回 rejected
```js
Promise.resolve().then(() => {
  console.log(1); // 1
}).catch(() => {
  console.log(2);
}).then(() => {
  console.log(3); // 3
})

Promise.resolve().then(() => {
  console.log(1); // 1
  throw new Error('err');
}).catch(() => {
  console.log(2); // 2
}).then(() => {
  console.log(3); // 3
})

Promise.resolve().then(() => {
  console.log(1); // 1
  throw new Error('err');
}).catch(() => {
  console.log(2); // 2
}).catch(() => {
  console.log(3);
})
```
## 四、async/await 和 Promise
* async 同步写法执行异步代码
* 执行 async 函数，返回的是 Promise 对象
* await 相当于 Promise 的 then
* try/catch 捕获异常，代替 Promise 的 catch
```js
async function fn1() {
  console.log('async start');
  await fn2();
  console.log('async end');
}

async function fn2() {
  console.log('async function');
}

console.log('script start');
fn1();
console.log('script end');

// 结果：
// script start
// async start
// async function
// script end
// async end
```
## 五、宏任务与微任务
* 微任务：setTimeout、setInterval、ajax、DOM事件
* 宏任务：Promise async\await
* 微任务先执行，宏任务后执行
* 微任务：DOM 渲染前触发，如 Promise
* 宏任务：DOM 渲染后触发，如 setTimeout
* 微任务是 ES6 规定的，宏任务是浏览器规定的。任务存放队列不同，微任务存放在 micro task queue 中

## 六、手写 Promise
```js
class MyPromise {
  state = 'pending'; // 'pending' | 'fulfilled' | 'rejected' 
  value = undefined; // 成功后的值
  err = undefined; // 失败的原因
  resolvedCallbacks = []; // pending状态，存储成功后的回调
  rejectedCallbacks = []; // pending状态，存储失败后的回调

  constructor(fn) {
    const resolveHandler = (value) => {
      if(this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.resolvedCallbacks.forEach(fn => fn(this.value))
      }
    }

    const rejectHandler = (err) => {
      if(this.state === 'pending') {
        this.state = 'rejected';
        this.err = err;
        this.rejectedCallbacks.forEach(fn => fn(this.err))
      }
    }

    try {
      fn(resolveHandler, rejectHandler);
    } catch(err) {
      rejectHandler(err);
    }
  }

  then(fn1, fn2) {
    const cb1 = typeof fn1 === 'function' ? fn1 : (v) => v;
    const cb2 = typeof fn2 === 'function' ? fn2 : (e) => e;

    if (this.state === 'fulfilled') {
      return new MyPromise((resolve, reject) => {
        try {
          const newValue = cb1(this.value);
          resolve(newValue);
        } catch (err) {
          reject(err);
        }
      })
    }

    if (this.state === 'rejected') {
      return new MyPromise((resolve, reject) => {
        try {
          const newErr = cb2(this.err);
          reject(newErr);
        } catch (err) {
          reject(err);
        }
      })
    }

    if (this.state === 'pending') {
      return new MyPromise((resolve, reject) => {
        this.resolvedCallbacks.push(() => {
          try {
            const newValue = cb1(this.value);
            resolve(newValue);
          } catch (err) {
            reject(err);
          }
        })
        this.rejectedCallbacks.push(() => {
          try {
            const newErr = cb2(this.err);
            reject(newErr);
          } catch (err) {
            reject(err);
          }
        })
      })
    }
  }

  catch(fn) {
    return this.then(null, fn);
  }
}

MyPromise.resolve = function(value) {
  return new MyPromise((resolve, reject) => resolve(value))
}

MyPromise.reject = function(value) {
  return new MyPromise((resolve, reject) => reject(value))
}

MyPromise.all = function(promiseList = []) {
  return new MyPromise((resolve, reject) => {
    const result = [];
    const cnt = 0;
    promiseList.forEach((p, index) => {
      p.then((value) => {
        result[index] = value;
        cnt++;
        if (cnt === promiseList.length) {
          // 所有 promise 全部 resolved
          resolve(result);
        }
      }).catch((err) => {
        reject(err);
      })
    })
  })
}

MyPromise.race = function(promiseList = []) {
  return new MyPromise((resolve, reject) => {
    const finish = false;
    promiseList.forEach((p) => {
      p.then((value) => {
        if (!finish) {
          // 只要第一个 promise 为 resolved
          finish = true;
          resolve(result);
        }
      }).catch(err) => {
        reject(err);
      }
    })
  })
}
```