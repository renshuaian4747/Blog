# JS 作用域与闭包

## 一、闭包
* 闭包（closure）是一个函数以及其捆绑的周边环境状态（lexical environment，词法环境）的引用的组合。换而言之，闭包让开发者可以从内部函数访问外部函数的作用域。在 JavaScript 中，闭包会随着函数的创建而被同时创建。
```js
// 函数作为返回值
function create() {
  const a = 100;
  return () => {
    console.log(a);
  }
}
const fn = create();
const a = 200;
fn() // 100

// 函数作为参数
function print(fn) {
  const a = 200;
  fn()
}

const a = 100;
function fn() {
  console.log(a);
}
print(fn); // 100
```
**闭包：自由变量的查找，是在函数声明的地方向上级作用域进行查找，而不是在函数执行的地方！！！**

## 二、this
* this 的取值是在执行时决定，而不是在声明时
* this 取值五个场景：
  1. 作为普通函数调用，返回 window
  2. 使用 call、apply、bind，返回传入的对象
  3. 作为对象方法调用，返回该对象
  4. 在 class 方法中调用，返回实例化对象
  5. 箭头函数中调用，返回上级作用域 this 的值
```js
function fn1() {
  console.log(this);
}

fn1(); // window

fn1.call({x: 200}); // {x: 200}

// bind 会返回一个新的函数
const fn2 = fn1.bind({x: 200});
fn2(); // {x: 200}
```
```js
const zhangsan = {
  name: 'zs',
  sayHi() {
    // 作为对象方法，this 为当前对象 zhangsan
    console.log(this);
  },
  wait() {
    setTimeout(function() {
      // 作为普通函数，this === window
      console.log(this);
    })
  },
  wait2() {
    setTimeout(() => {
      // 箭头函数中，this 和上层作用域中 this 相同
      // zhangsan
      console.log(this)
    })
  }
}
```
```js
class People {
  constructor(name) {
    this.name = name;
  }

  sayHi() {
    console.log(this);
  }
}
const zhangsan = new People('zs');
zhangsan.sayHi(); // zhangsan 对象
```
## 三、手写 call、apply、bind
```js
// call
Function.prototype.myCall = function() {
  const args = Array.prototype.slice.call(arguments);
  const newThis = args.shift();
  Object.prototype.tmpFunc = this;
  newThis.tmpFunc(...args);
  delete Object.prototype.tmpFunc;
}
// apply
// 与 call 区别在于：第一个参数为 this 绑定的对象，第二个参数为数组
Function.prototype.myApply = function(newThis, args) {
  Object.prototype.tmpFunc = this;
  newThis.tmpFunc(...args);
  delete Object.prototype.tmpFunc;
}
// bind
// bind 会返回一个新的函数，传参与 call 相同
Function.prototype.myBind = function() {
  const args = Array.prototype.slice.bind(arguments);
  const newThis = args.shift();
  const tmpFunc = this;
  return function() {
    return tmpFunc.apply(newThis,args);
  }
}
```
## 四、闭包应用
* 隐藏数据
```js
function cache() {
  const data = {};
  return {
    set: (k, v) => {
      data[k] = v;
    },
    get: (k) => data[k]
  }
}
// data 无法直接被外界访问、修改
const c = cache();
c.set('name', 'zs');
c.get('name');
```