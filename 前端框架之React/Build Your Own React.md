# Build Your Own React

## STEP 0
我们可以用三行代码使用React app
```tsx
const element = <h1 title="foo">Hello</h1>
const container = document.getElementById("root")
ReactDOM.render(element, container)
```
由类似babel一样的构建工具转化成普通js的，这样的转化通常比较简单：将标签内的代码替换为对 createElement 的调用，将标签名称、props和子元素作为参数传递。

```tsx
const element = <h1 title="foo">Hello</h1>

// 将会被转化成
const element = React.createElement(
  "h1",
  { title: "foo" },
  "Hello"
)
```
最终element长这样：
```tsx
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
}
```
所以我们使用原生 js 来实现前面的三行：
```tsx
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
}

const container = document.getElementById("root")

const node = document.createElement(element.type)
node["title"] = element.props.title

const text = document.createTextNode("")
text["nodeValue"] = element.props.children

node.appendChild(text)
container.appendChild(node)
```

## STEP 1：实现 createElement 函数
```tsx
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  }
}

// 用来创建文字类型
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

const Didact = {
  createElement,
}


Didact.createElement("div", null, a, b)
```
* 总结：createElement 函数是把元素配置返回成 json，方便下一步调用。

## STEP 2：实现 render 函数

**render函数的作用是创建dom，append到container**
```tsx
function render(element, container) {
  // 创建dom
  // 兼容text
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type)

// 配置元素属性
const isProperty = key => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    })
 
 // 递归处理子元素
 element.props.children.forEach(child =>
    render(child, dom)
  )

  // append到节点    
  container.appendChild(dom)
}

const Didact = {
  createElement,
  render,
}
```

render 函数递归创建真实的 dom 元素，然后将各个元素 append 到其父元素中，最后整个 dom 树 append 到 root
container 中，渲染完成，**这个过程一旦开始，中间是无法打断的，直到整个应用渲染完成。** 这也是 React16 版本以前的渲染过程

注意，只有当整个dom树append到root container中时，页面才会显示

## STEP 3：实现 Concurrent Mode（并发模式）
React16以后， rendering 是可以被中断的。

render 函数是递归构建 dom 树，最后才 append 到 root container，最终页面才渲染出来。这里有个问题，如果 dom 节点数量庞大，递归层级过深，这个过程其实是很耗时的，导致 render 函数长时间占用主线程，浏览器无法响应用户输入等事件，造成卡顿的现象。

因此我们需要将 render 过程拆分成小的任务单元，每执行完一个单元，都允许浏览器打断 render 过程并执行高优先级的任务，等浏览器得空再继续执行 render 过程。

真实React代码中没有使用 requestIdleCallback 这个api，因为有兼容性问题。因此React使用 scheduler package 模拟这个调度过程

简单介绍 requestIdleCallback
1. 使用方法：requestIdleCallback(callback[, options])
2. callback 函数会接受一个 IdleDeadline 参数，该参数有一个 IdleDeadline.timeRemaining() 方法，当返回值是浮点数值。它用来表示当前闲置周期的预估剩余毫秒数。如果 idle period 已经结束，则它的值是0。

```tsx
let nextUnitOfWork = null

// 开始执行
requestIdleCallback(workLoop)

function workLoop(deadline) {
  let shouldYield = false
  
  // 有下一个任务并且还有空闲
  while (nextUnitOfWork && !shouldYield) {
    // performUnitOfWork 会在执行完之后返回下一个任务的引用
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    // 判断有无空闲，当还有空闲时间时，继续执行，没有的话跳出循环
    shouldYield = deadline.timeRemaining() < 1
  }
  
  // 跳出循环后，在下一个空闲继续执行任务，直到任务执行完毕
  requestIdleCallback(workLoop)
}


function performUnitOfWork(nextUnitOfWork) {
  // do something
}
```
performUnitOfWork 接受当前的工作单元。**工作单元可以理解为就是一个 fiber 节点**

workLoop 循环里会循环调用 performUnitOfWork，直到工作单元都已处理完毕，或者当前帧浏览器已经没有空闲时间，则循环终止。等下次浏览器空闲时间再接着继续执行

**因此我们需要一种数据结构，能够支持任务打断并且可以接着继续执行，很显然，链表就非常适合**

## STEP 4：Fibers

### 介绍

Fibers 就是一种数据结构，支持将渲染过程拆分成工作单元，本质上就是一个双向链表。这种数据结构的好处就是方便找到下一个工作单元

Fiber 包含三层含义：
* 作为架构来说，之前 React 15 的 Reconciler 采用递归的方式执行，数据保存在递归调用栈中，所以被称为 Stack Reconciler。React 16 的 Reconciler 基于 Fiber 节点实现，则被称为 Fiber Reconciler
* 作为静态的数据结构来说，每个 Fiber 节点对应一个 React Element，保存了该组件的类型（函数组件/类组件/html标签）、对应的 DOM 节点信息等
* 作为动态的工作单元来说，每个 Fiber 节点保存了本次更新中该组件改变的状态、要执行的工作等

Fiber的几点冷知识：
* 一个 Fiber 节点对应一个React Element节点，同时也是一个工作单元
* 每个 fiber 节点都有指向第一个子元素，下一个兄弟元素，父元素的指针

以下面代码为例：
```tsx
MyReact.render(
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>,
  container
)
```
对应的 fiber tree 如下：<br/>
![fiber树](../assets/fiber%E6%A0%91.png)<br/>
我们要实现一种用来实现虚拟 dom 的数据结构，能实现3件事情
* add the element to the DOM
* create the fibers for the element's children
* select the next unit of work

所以必须有三类节点
* 能找到下一个单元
* 能找到下一个兄弟节点
* 能找到父节点

首先把 render 的创建 dom 函数单独抽取出来
```tsx
function createDom(fiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)

  const isProperty = key => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })

  return dom
}
```
在 render 函数中设置 nextUnitOfWork
```tsx
function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
  // ....
}

let nextUnitOfWork = null

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}
​
requestIdleCallback(workLoop)
```
实现 performUnitOfWork。这个函数就是构建 fiber 的基本实现
```tsx
// performUnitOfWork函数主要逻辑：
//   将element元素添加到DOM
//   给element的子元素创建对应的fiber节点
//   返回下一个工作单元，即下一个fiber节点，查找过程：
//      1.如果有子元素，则返回子元素的fiber节点
//      2.如果没有子元素，则返回兄弟元素的fiber节点
//      3.如果既没有子元素又没有兄弟元素，则往上查找其父节点的兄弟元素的fiber节点
//      4.如果往上查找到root fiber节点，说明render过程已经结束
function performUnitOfWork(fiber) {
  // 第一步 根据fiber节点创建真实的dom节点，并保存在fiber.dom属性中
  if(!fiber.dom){
    fiber.dom = createDom(fiber)
  }
  // 第二步 将当前fiber节点的真实dom添加到父节点中，注意，这一步是会触发浏览器回流重绘的！！！
  if(fiber.parent){
    fiber.parent.dom.appendChild(fiber.dom)
  }
  // 第三步 给子元素创建对应的fiber节点
  const children = fiber.props.children
  let prevSibling
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      dom: null
    }
    if(index === 0){
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
  })
  // 第四步，查找下一个工作单元
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
 
}
```
这里有一点值得细品，React.createElement 返回的 **element tree** 和 performUnitOfWork 创建的 **fiber tree** 有什么联系？

* **React Element Tree** 是由 **React.createElement** 方法创建的树形结构对象
* **Fiber Tree** 是根据 **React Element Tree** 创建来的树。每个 Fiber 节点保存着真是的 DOM 节点，并且保存着对 **React Element Tree** 中对应的 Element 节点的应用。注意，Element 节点并不会保存对 Fiber 节点的应用<br/>
![reactElement-fibers-dom](../assets/reactDom-fiber-dom.webp)<br/>

## STEP 5：Render and Commit 阶段
上一步的 **performUnitOfWork** 有些问题，在第二步中我们直接将新创建的真实 dom 节点挂载到了容器上，这样会带来两个问题：
* 每次执行 **performUnitOfWork** 都会造成浏览器回流重绘，因为真实的 dom 已经被添加到浏览器上了，性能极差
* 浏览器是可以打断渲染过程的，因此可能造成用户看不到完整的UI界面

所以我们需要改造代码，在 performUnitOfWork 阶段不把真实的 dom 节点挂载到容器上。保存 fiber tree 根节点的引用。等到 fiber tree 构建完成，再一次性提交真实的 dom 节点并且添加到容器上。

所以我们需要创建一个变量去追踪 fiber root 叫 **wipRoot**

同时，我们需要在所有工作完成之后，有一个 commit 操作。**commitWork**

最后代码：
```tsx
// 根据fiber节点创建真实dom节点
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)
  const isProperty = key => key !== 'children'
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })
  return dom
}

let nextUnitOfWork = null

let wipRoot = null

function render(element, container){
  wipRoot = {
    dom: container,
    props: {
      children: [element], // 此时的element还只是React.createElement函数创建的virtual dom树
    },
  }
  nextUnitOfWork = wipRoot
}

function commitRoot(){
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber){
  if(!fiber){
    return
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function workLoop(deadline) {
  let shouldYield = false // 是否让步
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  // 第一步 根据fiber节点创建真实的dom节点，并保存在fiber.dom属性中
  if(!fiber.dom){
    fiber.dom = createDom(fiber)
  }
  // 第二步 将当前fiber节点的真实dom添加到父节点中，注意，这一步是会触发浏览器回流重绘的！！！
  // if(fiber.parent){
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // 第三步 给子元素创建对应的fiber节点
  const children = fiber.props.children
  let prevSibling
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      dom: null
    }
    if(index === 0){
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
  })
  // 第四步，查找下一个工作单元
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
 
}
const Didact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  },
  render
}
```

## STEP 6：实现 Reconcilation

目前为止，我们只考虑添加 dom 节点到容器上这一单一场景，更新伤处还没实现

我们需要对比最新的 **React Element Tree** 和最近一次的 **Fiber Tree** 的差异

我们需要在提交之后保存 **Fiber Tree** 的引用，我们称之为 **currentRoot**

**我们需要给每个 fiber 节点添加一个 alternate 属性来保存旧的 fiber 节点**

alternate保存的旧的fiber节点主要有以下几个用途:
* 复用旧 fiber  节点上的真实 dom 节点
* 旧 fiber 节点上的 props 和新的 element 节点的 props 对比
* 旧 fiber 节点上保存有更新的队列，在创建新的 fiber 节点时执行这些队列以获取最新的页面
```tsx
const children = fiber.props.children
reconcileChilren(fiber, children)
function reconcileChildren(wipFiber, elements) {
    let index = 0
    // oldFiber：fiber 节点中的第一个子节点的引用
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
    while (index < elements.length || oldFiber != null) {
      const element = elements[index]
      let newFiber = null
      const sameType = oldFiber && element && element.type == oldFiber.type
      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        }
      }
      if (element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        }
      }
      if (oldFiber && !sameType) {
        oldFiber.effectTag = "DELETION"
        deletions.push(oldFiber)
      }
      if (oldFiber) {
        oldFiber = oldFiber.sibling
      }
      if (index === 0) {
        wipFiber.child = newFiber
      } else if (element) {
        prevSibling.sibling = newFiber
      }
      prevSibling = newFiber
      index++
    }      
}
```
协调过程：
* 本质上依然是根据**新的 React Element Tree** 创建新的 **Fiber Tree**，不过为了节省内存开销，协调过程会判断新的 fiber 节点能否复用旧的 fiber 节点上的真实 dom 元素，如果能复用，就不需要再从头到尾全部重新创建一遍真实的 dom 元素。同时每个新 fiber 节点上还会保存着对旧 fiber 节点的引用，方便在 commit 阶段做新旧属性 props 的对比。
* 如果 **old fiber.type** 和 **new fiber.type** 相同，则保留旧的 dom 节点，只更新 props 属性。
* 如果 **type** 不相同并且有 new element，则创建一个新的真实 dom 节点。
* 如果 **type** 不相同并且有 old fiber 节点，则删除该节点对应的真实 dom 节点。
* 删除节点需要有个专门的数组收集需要删除的旧的 fiber 节点。由于新的 element tree 创建出来的新的 fiber tree 不存在对应的 dom，因此需要收集旧的 fiber 节点，并在 commit 阶段删除。

**注意，协调过程，还是以最新的React Element Tree为主去创建一个新的fiber tree，只不过是新的fiber节点复用旧的fiber节点的真实dom元素，毕竟频繁创建真实dom是很消耗内存的。新的fiber节点还是会保存着对旧的fiber节点的引用，方便在commit阶段进行新属性和旧属性的比较。这里会有个问题，如果新fiber节点保留旧fiber节点的引用，那么随着更新次数越来越多，旧的fiber tree是不是也会越来越多，如何销毁？**

最终代码：
```tsx
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)
  updateDom(dom, {}, fiber.props)
  return dom
}
let nextUnitOfWork = null
let wipRoot = null // 保存着对root fiber的引用
let currentRoot = null // 保存着当前页面对应的fiber tree
let deletions = null
function render(element, container){
  wipRoot = {
    dom: container,
    props: {
      children: [element], // 此时的element还只是React.createElement函数创建的virtual dom树
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}
function commitRoot(){
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}
const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })
  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })
  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}
function commitWork(fiber){
  if(!fiber){
    return
  }
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }
  requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber =
      wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null
  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null
    const sameType = oldFiber && element && element.type == oldFiber.type
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }
}
function performUnitOfWork(fiber) {
  // 第一步 根据fiber节点创建真实的dom节点，并保存在fiber.dom属性中
  if(!fiber.dom){
    fiber.dom = createDom(fiber)
  }
  // 第二步 将当前fiber节点的真实dom添加到父节点中，注意，这一步是会触发浏览器回流重绘的！！！
  // if(fiber.parent){
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // 第三步 给子元素创建对应的fiber节点
  const children = fiber.props.children
  // let prevSibling
  // children.forEach((child, index) => {
  //   const newFiber = {
  //     type: child.type,
  //     props: child.props,
  //     parent: fiber,
  //     dom: null
  //   }
  //   if(index === 0){
  //     fiber.child = newFiber
  //   } else {
  //     prevSibling.sibling = newFiber
  //   }
  //   prevSibling = newFiber
  // })
  reconcileChildren(fiber, children)
  // 第四步，查找下一个工作单元
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
 
}
const Dideact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  },
  render
}
/** @jsx Dideact.createElement */
const container = document.getElementById("root")
const updateValue = e => {
  rerender(e.target.value)
}
const rerender = value => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  )
 Dideact.render(element, container)
}
rerender("World")
```

## STEP 7：实现函数组件
我们需要支持函数组件
```js
function App(props) {
  return <h1>Hi {props.name}</h1>
}
const element = <App name="foo" />
const container = document.getElementById("root")
Didact.render(element, container)
```
经过babel之后，我们得到
```js
function App(props) {
  return Didact.createElement("h1", null, "Hi ", props.name);
}

const element = Didact.createElement(App, {
  name: "foo"
});
const container = document.getElementById("root");
Didact.render(element, container);
```
与之前Dom组件的对比，我们得到两点不同的地方:
  * 函数组件对应的 fiber 节点没有对应的真实 dom 元素
  * 需要执行函数才能获取对应的 children 节点，而不是直接从 props.children 获取

由于函数组件没有对应的fiber节点，因此在commit阶段在找父fiber节点对应的dom时，需要判断是否存在该dom元素