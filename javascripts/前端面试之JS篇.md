# 前端面试之 JS 篇
## var、let、const 区别
* var 是 ES5 语法，let、const 是 ES6 语法；var 有变量提升
* var、let 为变量，可修改；const 为常量，不可修改
* let、const 有块级作用域，var 没有
```js
// var 变量提升
var a = 100;
console.log(a); // 100

console.log(b); // undefined
var b = 100;
// 块级作用域
for(var i = 0; i < 10; i++) {
    var j = i + 1
}
console.log(i, j) // 10, 10

for(var let = 0; i < 10; i++) {
    var let = i + 1
}
console.log(i, j) // 报错，无法获取i，j
```
## typeof 有哪些类型
* undefined，string，number，boolean，symbol
* object（注意，typeof null === 'object'）
* function

## 强制类型转换和隐式类型转换
* 强制类型转换：parseInt，parseFloat，toString 等
* 隐式：if，逻辑运算，==，+ 拼接字符串

## 手写深度比较 isEqual
```js
function isObj(obj) {
  return typeof obj === 'object' && obj !== null;
}

function isEqual(obj1, obj2) {
  if (!isObj(obj1) || !isObj(obj2)) {
    // 有一个为值类型
    return obj1 === obj2;
  }
  if (obj1 === obj2) {
    return true;
  }
  // obj1,obj2都是引用类型，且不是同一个对象
  const keyList1 = Object.keys(obj1);
  const keyList2 = Object.keys(obj2);
  if (keyList1.length !== keyList2.length) {
    // 键数量不同，直接返回 false
    return false;
  }
  // 以 obj1 为准，依次递归对比
  let result = true;
  for(let key in obj1) {
    result = isEqual(obj1[key], obj2[key]);
    if (!result) break;
  }
  return result;
}
```

## slice 和 splice 的区别
* slice 纯函数，不改变原数组；splice 改变原数组
* slice(startIndex?, endIndex?)
* splice(startIndex?, length?, insertValue?)

## 闭包相关
* 自由变量的查找需要在函数定义的开始查找，而不是函数执行的地方！！！
* 闭包会导致变量常驻内存，得不到释放。闭包不要滥用

## 函数声明和函数表达式
* 函数声明：function fn () {}
* 函数表达式：const fn = function () {}
* 函数声明会预加载（类似变量提升），函数表达式不会
```js
// 函数声明预加载
sum(10, 20); // 30
function sum(a, b) {
  return a + b;
}
// 函数表达式不会预加载
sum2(10, 20); // 报错，sum2 未声明
const sum2 = function (a, b) {
  return a + b;
}
```
## Object 声明
* new Object() 等同于 {}，原型对象为 Object.prototype
* Object.create({...}) 指定原型对象为 {...}

## 手写数组扁平化
```js
function flat(arr) {
  if (!arr.some(item => item instanceof Array)) {
    return arr
  }
  const res = Array.prototype.concat.apply([], arr);
  return flat(res);
}
```
## 手写数组去重
```js
// 时间复杂度 n
function unique(arr) {
  const map = {};
  const result = [];
  arr.forEach(item => {
    if(map[item]) return;
    map[item] = 1;
    result.push(item);
  })
  return result;
}
// 时间复杂度 n*n
function unique(arr) {
  const result = [];
  arr.forEach(item => {
    if(!result.includes(item)) {
      result.push(item)
    }
  })
  return result;
}
// 使用 set 
function unique(arr) {
  const set = new Set(arr);
  return [...set]
}
```
## 有序无序
### 一、Map 与 Object
* object 为无序结构，操作速度快，无序
* 数组为有序结构，操作速度慢，有序
* Map 为有序结构，且操作速度快
```js
const m = new Map([
  ['key1', 1],
  ['key2', 2],
  ['key3', 3]
])
m.get('key1');
m.set('name','zs');
m.delete('key2');
m.forEach((v, k) => console.log(v, k));
m.has('key3');
m.size;
// Map 可以以任意结构为 key
const o = {name: 'zs'};
m.set(o, 'object key');
// object 有多快？
const obj = {};
for(let i = 0; i < 1000 * 10000; i++) {
  obj[i + 1] = i;
}
console.time('obj find');
obj['5000000'];
console.timeEnd('obj find');
// Map 有多快？
const m = new Map();
for(let i = 0; i < 1000 * 10000; i++) {
  m.set(i + 1, i);
}
console.time('map find');
m.has('5000000');
console.timeEnd('map find');
```
### 二、Set 与 Array
* Api 不同
* Set 元素不能重复
* Set 是无序结构，操作很快
```js
const set = new Set([10, 20, 30, 40]);
set.add(50);
set.delete(20);
set.has(30);
set.size;
set.forEach(val => console.log(val));
// Set 可做数组去重
// Set 无序（快） Array 有序（慢）
// Array 有多慢？
const arr = [];
for(let i = 0; i < 1000 * 10000; i++) {
  arr.push(i);
}
console.time('arr unshift');
arr.unshift('a');
console.timeEnd('arr unshift');
console.time('arr push');
arr.push('a');
console.timeEnd('arr push');
console.time('arr find');
arr.includes(5000000);
console.timeEnd('arr find');
// Set 有多快？
const set = new Set();
for(let i = 0; i < 1000 * 10000; i++) {
  set.add(i);
}
console.time('set add');
set.add('a');
console.timeEnd('set add');
console.time('set find');
set.has(5000000);
console.timeEnd('set find');
``` 
### 三、WeakMap、WeakSet
```js
  // WeakMap 弱引用
  // WeakMap 的 key 只能用引用类型
  // 没有 forEach、size，只能 get、set、has
  const wMap = new WeakMap();
  function fn() {
    const a = {name: 'zs'};
    wMap.set(a, 'name info');
  }
  fn(); // fn 执行完后，a 仍会被销毁
  
  // WeakMap 使用场景
  const userInfo = {name: 'zs'};
  const addrInfo = {city: 'cd'};
  // 建立联系，而且两者保持独立，互不影响
  const wMap = new WeakMap();
  wMap.set(userInfo, addrInfo);

  // WeakSet 弱引用
  // WeakSet 的 value 只能用引用类型
  // 没有 forEach、size，只能 add、delete、has
  const wSet = new WeakSet();
  function fn2() {
    const o = {name: 'ls'};
    wSet.add(o);
  }
  fn2(); // fn2 执行完后，o 仍被销毁
```
## Reduce 求和
```js
const arr = [1, 2, 3, 4, 5];g
const result = arr.reduce((sum, curV, index, arr) =>  sum + curV, 0)
```

## Ajax、Fetch、Axios
* Ajax 是一种技术的统称
* fetch 是一个具体的 Api
* Axios 是一个第三方库

## 手写防抖节流
```js
// 防抖 debounce
function debounce(fn, delay = 500) {
  let timer;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      timer = null;
    }, delay)
  }
}
// 节流 throttle
function throttle(fn, delay = 100) {
  let timer;
  return function () {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      timer = null;
    }, delay)
  }
}
```

## 箭头函数
* 没有 arguments
* 使用父作用域的 this，无法用 call、apply、bind 修改 this
* 动态上下文中的回调函数，如果要用 this，不能用箭头函数

## 描述 TCP 三次握手四次挥手
* 先建立连接（确保双方都有收发消息的能力）
* 再传输内容（发起请求）
* 网络连接是 TCP 协议，传输内容是 HTTP 协议

### 一、建立连接（三次握手）
* Client 发包，Server 接收。Server：有 Client 要找我
* Server 发包，Client 接收。Client：Server 已经收到信息了
* Client 发包，Server 接收。Server：Client 准备要发送了

### 二、断开连接（四次挥手）
* Client 发包，Server 接收。Server：Client 请求结束
* Server 发包，Client 接收。Client：Server 已收到，等待传输结束
* Server 发包，Client 接收。Client：Server 传输结束，可以关闭连接
* Client 发包，Server 接收。Server：可以关闭了

## for in 和 for of
### for in
* for in 得到 key（不能用于 Map、Set、generator）
* for in 用于可枚举的数据，如对象、数组、字符串
### for of
* for of 得到 value（不能用于 Object）
* for of 用于可迭代的数据，如数组、字符串、Map、Set
### for awiat of
* for awiat of 用于遍历多个 Promise（Promise.all 的代替品）
```js
function foo(n) {
  return new Promise((rev) => {
    setTimeout(() => {
      rev(n)
    }, 1000)
  })
}
(async function() {
  const p1 = foo(100);
  const p2 = foo(200);
  const p3 = foo(300);

  const list = [p1, p2, p3];
  Promise.all(list).then(res => console.log(res));
  // or
  for await (let res of list) {
    console.log(res);
  }
})()
```

## offsetHeight、scrollHeight、clientHeight
* offset：content + padding + border
* client：content + padding
* scroll：实际内容尺寸 + padding（含可滚动内容）

## HTMLCollection 和 NodeList
* HTMLCollection 是 element 的集合
* NodeList 是 Node 的集合
### 一、Node 和 Element
* DOM 是一棵树，所有的节点都是 Node
* Node 是 Element 的基类
* Element 是其他 HTML 元素的基类，如 HTMLDivElement

```html
<p>
  <b></b>
  <em></em>
  <!-- 注释 -->
</p>
<script>
  const p = document.getElementsByTagName('p');
  p.children instanceof HTMLCollection // true
  p.childNodes instanceof NodeList // true
</script>
```

## JS 严格模式
- 全局变量必须声明
- 禁止使用 with
- 创建 eval 作用域
- 禁止 this 指向全局作用域
- 函数参数不能重名

## JS 垃圾回收
* 回收函数执行完成后，已经引用不到的一些内存
* 算法：
  1. 引用计数（之前）
  2. 标记清除（现代）

## JS 检测内存泄露
* dev tools 中 Performance 中查看 HEAP 的曲线