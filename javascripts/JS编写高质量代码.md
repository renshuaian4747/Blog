# JS编写高质量代码
* 编码规范性
* 功能完整性
* 鲁棒性
## 数组扁平化（一级扁平），Array Flatten
```js
function flatten (arr) {
  const res = [];
  arr.forEach(item => {
      if (item instanceof Array) {
        item.forEach(sub => {
          res.push(sub)
        })
      } else {
        res.push(item)
      }
  })
  return res;
}

function flatten2 (arr) {
  let res = [];
  arr.forEach(item => {
    res = res.concat(item);
  })
  return res;
}
```

## 数组扁平化（深度扁平），Array Flatten
```js
function deepFlatten (arr) {
  const res = [];
  arr.forEach(item => {
      if (item instanceof Array) {
        res.push(...deepFlatten(item))
      } else {
        res.push(item)
      }
  })
  return res;
}

function deepFlatten2 (arr) {
  let res = [];
  arr.forEach(item => {
    if (item instanceof Array) {
      res = res.concat(deepFlatten2(item))
    } else {
      res = res.concat(item);
    }
  })
  return res;
}
```

## 手写一个 getType，获取数据类型
```js
function getType (data) {
  return Object.prototype.toString.call(data);
}
```

## 手写 new
* 创建空对象，继承构造函数原型
* 执行构造函数（将 obj 作为 this）
* 返回 obj
```js
function myNew (fn, ...args) {
  const obj = Object.create(fn.prototype);
  fn.apply(obj, args);
  return obj;
}
```

## 树的深度、广度优先遍历
```ts
interface TreeNode {
  val: number;
  children: TreeNode[];
}
// 递归实现 dfs
function dfs (tree) {
  console.log(tree);
  if (tree.children.length === 0) return;
  tree.children.forEach(dfs)
}
// 栈实现 dfs
function dfs2 (tree) {
  const stack = [tree];
  while (stack.length) {
    const top = stack.pop();
    console.log(top);
    if (!top) break;
    top.children.reverse().forEach(node => stack.push(node));
  }
}
// 队列实现 bfs
function bfs (tree) {
  const q = [tree];
  while (q.length) {
    const top = q.shift();
    console.log(top);
    if (!top) break;
    top.children.forEach(node => q.push(node))
  }
}
```

## 手写 LazyMan，实现 Sleep 机制
```js
class LazyMan {
  private name = '';
  private tasks = [];

  constructor(name) {
    this.name = name;
    setTimeout(() => {
      this.next();
    });
  }

  private next () {
    const task = this.tasks.shift();
    if(task) task();
  }

  eat(sth) {
    const task = () => {
      console.info(`${this.name} eat ${sth}`);
      this.next();
    };
    this.tasks.push(task);
    return this;
  }

  sleep(seconds) {
    const task = () => {
      console.info('start sleep');
      setTimeout(() => {
        console.info(`${this.name} has sleeped ${seconds}`);
        this.next();
      }, seconds * 1000)
    };
    this.tasks.push(task);
    return this;
  }
}

const me = new LazyMan('zhangsan');
me.eat('apple').eat('banana').sleep(2).eat('peach')
```

## 手写 Curry 函数
```js
function curry (fn) {
  const argsLength = fn.length;
  let args = [];
  function calc(...newArgs) {
    args = [...args, ...newArgs];
    if (args.length < argsLength) {
      return calc
    } else {
      return fn.apply(this, args.slice(0, argsLength))
    }
  }
  return calc;
}

function add(a,b,c) {return a+b+c};
const curryAdd = curry(add);
curryAdd(10)(20)(30);
```

## 手写 instanceof
```js
function myInstanceof(o1, o2) {
  if (o1 == null) return false; // null、undefined
  const type = typeof o1;
  if (type !== 'object' && type !== 'function') return false; // 值类型
  let p = o1;
  while (p) {
    if (p.__proto__ === o2.prototype) return true;
    p = p.__proto__;
  }
  return false
}
```

## 手写 bind
```js
Function.prototype.myBind = function (context, ...args) {
  return (...newArgs) => {
    this.apply(context, [...args, ...newArgs])
  }
}
// or
Function.prototype.myBind = function (context, ...args) {
  context.bindTest = this;
  return (...newArgs) => {
    context.bindTest(...args, ...newArgs)
  }
}
```

## 手写 apply、call
```js
// call
Function.prototype.myCall = function (context, ...args) {
  // null、undefined
  if (context == null) context = globalThis;
  // 值类型
  if (typeof context !== 'object') context = new Object(context);

  const fnKey = Symbol();
  context[fnKey] = this;
  context[fnKey](...args);
  delete context[fnKey]
}

// apply
Function.prototype.myApply = function (context, args = []) {
  // null、undefined
  if (context == null) context = globalThis;
  // 值类型
  if (typeof context !== 'object') context = new Object(context);

  const fnKey = Symbol();
  context[fnKey] = this;
  context[fnKey](...args);
  delete context[fnKey]
}
```

## 手写深拷贝
* 功能完整性：考虑多种数据结构
* 鲁棒性： 考虑循环引用
```js
function cloneDeep (obj, map = new WeakMap()) {
  if (typeof obj !== 'object' || obj == null) return obj // 基本类型、null、undefined、function

  // 考虑循环引用
  if (map.get(obj)) return map.get(obj);

  let target = {};
  map.set(obj, target);
  // Map
  if (obj instanceof Map) {
    target = new Map();
    obj.forEach((v, k) => {
      const newV = cloneDeep(v, map);
      const newK = cloneDeep(k, map);
      target.set(newK, newV);
    })
  }
  // Set
  if (obj instanceof Set) {
    target = new Set();
    obj.forEach((v) => {
      target.add(cloneDeep(v, map));
    })
  }
  // Array
  if (obj instanceof Array) {
    target = obj.map((v) => cloneDeep(v, map));
  }
  // Object
  if (obj.__proto__.constructor === Object) {
    for(let k in obj) {
      target[k] = cloneDeep(obj[k], map);
    }
  }

  return target;
}
```