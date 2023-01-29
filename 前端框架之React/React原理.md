# React 原理
* 函数式编程（不可变值、纯函数）
* vdom 和 diff
* JSX 本质
* 合成事件
* setState、batchUpdate
* 组件渲染过程
## 函数式编程
* 一种编程范式，概念比较多
* 重点强调**不可变值**和**纯函数**
## vdom 和 diff
* vdom 是实现 vue、react 的重要基石
* diff 是 vdom 中最关键、最核心的部分
* DOM 操作非常耗费性能，但项目有了一定复杂度，想要减少计算次数很难
* 理念：能不能把计算，更多地转移为 js 计算？因为 js 执行速度很快
* vdom - 用 js 模拟 DOM 结构，计算出最小的变更，再操作 DOM
### 一、vdom
* 用 js 模拟 DOM 结构
* 新旧 vnode 对比，得出最小的更新范围，最后更新 DOM
```html
<div id="div1" class="container">
  <p>vdom</p>
  <ul style="font-size: 20px">
    <li>a</li>
  </ul>
</div>
```
```js
vdom = {
  tag: 'div',
  props: {
    className: 'container',
    id: 'div'
  },
  children: [
    {
      tag: 'p',
      children: 'vdom'
    },
    {
      tag: 'ul',
      props: { style: 'font-size: 20px' },
      children: [
        {
          tag: 'li',
          children: 'a'
        }
      ]
    }
  ]
}
```
* 以 vue 2 使用的 snabbdom.js 为例
* 使用 h 方法构造 vnode
* patch 方法将 vnode 渲染到 container 上

### 二、diff 算法
* 两棵树 diff 算法时间复杂度为 O(n^3)
* 优化后 vdom diff 算法时间复杂度为 O(n)
* 优化：
  1. 同层比较，不跨级比较
  2. tag 不同，直接更新，不再深度比较
  3. tag 和 **key**，二者都相同，则认为是相同节点，不再深度比较

### 三、sanbbdom.js 源码解读
* h 函数返回 js 对象 - vnode，构建虚拟 DOM
* patch 函数
```ts
function patch(oldVnode: Vnode | Element, vnode: Vnode): Vnode {
  ...

  // 第一个元素不是 vnode，而是是一个 DOM 元素
  if (!isVnode(oldVnode)) {
    // 创建一个空的 vnode，关联该 DOM 元素
    oldVnode = emptyNodeAt(oldVnode);
  }

  // 两个相同节点，即 key 和 tag 都相同
  if (sameNode(oldVnode, vnode)) {
    patch(oldVnode, vnode, insertedVnodeQueue);
  } else {
    ...
    // 不同的 vnode，直接删掉重建
    createElm(vnode, insertedVnodeQueue)
    ...
  }

  ...
}
```
![使用 key vs 不使用 key](./assets/%E4%BD%BF%E7%94%A8keyVS%E4%B8%8D%E4%BD%BF%E7%94%A8key.jpg)

## JSX 本质
* JSX 等同于 Vue 的模板，Vue 的模板不是 html
* JSX 不是 js
* JSX 靠 Babel 编译，Vue 的模板是自己写的编译方法
* React.createElement 返回 vnode
* React 组件首字母大写，html 标签小写
[babel 中文官网](https://www.babeljs.cn)
```jsx
// jsx
const imgEle = (
  <div id="div">
    <p>some text</p>
    <img src={imgUrl}/>
  </div>
)
// babel 编译后
React.createElement(
  'div', { id: 'div' },
  React.createElement('p', null, 'some text'),
  React.createElement('img', { src: imgUrl })
)
```

## React 合成事件机制
* 所有事件挂在到 document 上（React 17后，是挂载到根组件上）
* event 不是原生的，是 SyntheticEvent 合成事件对象
![React合成事件图示](./assets/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E5%9B%BE%E7%A4%BA.png)
### 为什么要用合成事件机制？
* 更好的兼容性和跨平台
* 挂载到 document 上，减少内存消耗，避免频繁解绑（原理类似事件代理）
* 方便事件统一管理（事务机制）

## setState 和 batchUpdate
* setState 主流程
* batchUpdate 机制
* transaction 事务机制
### 一、setState 主流程
![setState主流程](./assets/setState%E4%B8%BB%E6%B5%81%E7%A8%8B.png)
### 二、batchUpdate 机制
* 每个方法执行前，React 会自动标记批处理：isBatchUpdate = true;
* 方法执行完后，isBatchUpdate = false
* 哪些能命中 batchUpdate 机制
  1. 生命周期（和它调用的函数）
  2. React 中注册的事件（和它调用的函数）
  3. React 可以管理的入口
* 哪些不能命中 batchUpdate 机制
  1. setTimeout、setInterval（和它调用的函数）
  2. 自定义 DOM 事件（和它调用的函数）
  3. React 无法管理的入口
```jsx
// React <= 17
this.state = { count: 0 };
...

foo() {
  // isBatchUpdate = true;
  this.setState({
    count: this.state.count + 1
  });
  // isBatchUpdate = false;
}

foo2() {
  // isBatchUpdate = true;
  setTimeout(() => {
    // 此时 isBatchUpdate 为false
    this.setState({
      count: this.state.count + 1
    });
  })
  // isBatchUpdate = false;
}

...
```
### transaction 事务机制
* React 通过 perfrom Api 执行任意方法
* 初始化时，在执行前后定义一些 initialize 和 close
![React事务机制](./assets/React%E4%BA%8B%E5%8A%A1%E6%9C%BA%E5%88%B6.png)

## 组件渲染和更新过程
### 一、渲染过程
* JSX 即 createElement 方法生成 vnode
* 通过 patch(elem, vnode) 和 patch(vnode, newVnode) 实现渲染
### 二、更新过程
* setState(newState) --> dirtyComponent（可能有子组件）
* render() 生成 newVnode
* patch(vnode, newVnode)
### 三、React Fiber 提升性能
* 上述 patch 分为两个阶段：
  1. reconciliation 阶段 - 执行 diff 算法，纯 js 计算
  2. commit 阶段 - 将 diff 结果渲染到 DOM
#### 为什么要分两个阶段？
* JS 单线程，与渲染共用一个进程
* 当组件足够复杂时，组件更新计算和渲染压力都很大
* 同时再有 DOM 操作需求（拖拽、动画），会出现卡顿
#### Fiber 如何解决？
* 将 reconciliation 阶段进行任务拆分（commit 阶段是浏览器渲染页面，无法拆分）
* DOM 需要渲染时暂停计算，空闲时恢复
* 使用的 API：window.requestIdleCallback