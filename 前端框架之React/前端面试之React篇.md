# 前端面试之 React 篇
![脑图](../assets/React%E9%9D%A2%E8%AF%95%E9%A2%98.png)

## 一、基础组件

### 1. React 事件机制
![React合成事件](../assets//react%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6.jpeg)

JSX 上写的事件并没有绑定在对应的真实 DOM 上，而是通过事件代理的方式，将所有的事件都统一绑定在了 **document** 上。这样的方式不仅减少了内存消耗，还能在组件挂载销毁时统一订阅和移除事件。

另外冒泡到 document 上的事件也不是原生浏览器事件，而是 React 自己实现的合成事件（SyntheticEvent）。因此我们如果不想要事件冒泡的话，调用 event.stopPropagation 是无效的，而应该调用 event.preventDefault。

实现合成事件的目的如下：
* 合成事件首先抹平了浏览器之间的兼容问题，另外这是一个跨浏览器原生事件包装器，赋予了跨浏览器开发的能力。
* 对于原生浏览器事件来说，浏览器会给监听器创建一个事件对象。如果你有很多的事件监听，那么就需要分配很多的事件对象，造成高额的内存分配问题。但是对于合成事件来说，有一个事件池专门来管理它们的创建和销毁，当事件需要被使用时，就会从池子中复用对象，事件回调结束后，就会销毁事件对象上的属性，从而便于下次复用事件对象。
* 若在 Dom 上绑定了原生事件和 React 事件，原生事件会先执行，React 事件会等冒泡到 document 时再执行。

### 2. React 的事件和普通的 HTML 事件有什么不同？
区别：
* 对于事件名称命名方式，原声事件为全小写，react 事件采用小驼峰；
* 对于事件函数处理语法，原生事件为字符串，react 事件为函数；
* react 事件不能采用 return false 的方式来阻止浏览器的默认行为，而必须要明确地调用 preventDefault() 来阻止。

合成事件是 react 模拟原生 DOM 事件所有能力的一个事件对象，其优点如下：
* 兼容所有浏览器，更好的跨平台；
* 将事件统一存放在一个数组，避免频繁的新增与删除（垃圾回收）。
* 方便 react 统一管理和事务机制。

事件的执行顺序为**原生事件先执行，合成事件后执行，合成事件会冒泡绑定到 document 上**，所以尽量避免原生事件与合成事件混用，如果原生事件阻止冒泡，可能会导致合成事件不执行，因为需要冒泡到 document 上合成事件才会执行。

### 3. React 组件中怎么做事件代理？原理？
React 基于 Visual DOM 实现了一个SyntheticEvent 层（合成事件层），定义的事件处理器会接收到一个合成事件对象的实例，与原生的浏览器事件拥有同样的接口，支持冒泡机制，所有的事件都自动绑定在嘴外层。

在 React 低层，主要对合成事件做了两件事：
* 事件委派：React 会把所有的事件绑定到结构的最外层，使用统一的事件监听器，这个事件监听器上维持了一个映射来保存所有组件内部事件监听和处理函数。
* 自动绑定：React 组件中，每个方法的上下文都会指向该组件的实例，即自动绑定this为当前组件。

### 4. React 高阶组件、Render props、hooks 有什么区别，为什么要不断迭代？
这三者是目前 React 解决代码复用的只要方式：
* 高阶组件（HOC）是参数为组件，返回值为新组件的函数。
* render props 是一个用于告知组件需要渲染什么内容的函数 prop。

(1) HOC
```tsx
// hoc 是纯函数，没有副作用
// hoc的定义
function withSubscription(WrappedComponent, selectData) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: selectData(DataSource, props)
      };
    }
    // 一些通用的逻辑处理
    render() {
      // ... 并使用新数据渲染被包装的组件!
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };

// 使用
const BlogPostWithSubscription = withSubscription(BlogPost,
  (DataSource, props) => DataSource.getBlogPost(props.id));
```
(2) Render Props
```tsx
// DataProvider组件内部的渲染逻辑如下
class DataProvider extends React.Components {
     state = {
    name: 'Tom'
  }

    render() {
    return (
        <div>
          <p>共享数据组件自己内部的渲染逻辑</p>
          { this.props.render(this.state) }
      </div>
    );
  }
}

// 调用方式
<DataProvider render={data => (
  <h1>Hello {data.name}</h1>
)}/>
```
**缺点：无法在 return 语句外访问数据、嵌套写法不够优雅**
(3) Hooks
```tsx
// 自定义一个获取订阅数据的hook
function useSubscription() {
  const data = DataSource.getComments();
  return [data];
}
// 
function CommentList(props) {
  const {data} = props;
  const [subData] = useSubscription();
    ...
}
// 使用
<CommentList data='hello' />
```

### 5. 对 React-Fiber 的理解，它解决了什么问题？
React 15 在渲染时，会递归比对 VisualDom 树，找出需要变动的节点，然后同步更新它们，一气呵成。这个过程期间，React 会占据浏览器资源，这会导致用户触发的事件得不到相应，并且会导致掉帧，**导致用户感觉到卡顿**。

为了给用户制造一种应用很快的“假象”，不能让一个任务长期霸占着资源。 可以将浏览器的渲染、布局、绘制、资源加载(例如 HTML 解析)、事件响应、脚本执行视作操作系统的“进程”，需要通过某些调度策略合理地分配 CPU 资源，从而提高浏览器的用户响应速率, 同时兼顾任务执行效率。

所以 React 通过Fiber 架构，让这个执行过程变成可被中断。“适时”地让出 CPU 执行权，除了可以让浏览器及时地响应用户的交互，还有其他好处:
* 分批延时对DOM进行操作，避免一次性操作大量 DOM 节点，可以得到更好的用户体验；
* 给浏览器一点喘息的机会，它会对代码进行编译优化（JIT）及进行热代码优化，或者对 reflow 进行修正。

**核心思想：** Fiber 也称协程或者纤程。它和线程并不一样，协程本身是没有并发或者并行能力的（需要配合线程），它只是一种控制流程的让出机制。让出 CPU 的执行权，让 CPU 能在这段时间执行其他的操作。渲染的过程可以被中断，可以将控制权交回浏览器，让位给高优先级的任务，浏览器空闲后再恢复渲染。

### 6. React.Component 和 React.PureComponent 的区别
PureComponent表示一个纯组件，可以用来优化React程序，减少render函数执行的次数，从而提高组件的性能。

在React中，当prop或者state发生变化时，可以通过在shouldComponentUpdate生命周期函数中执行return false来阻止页面的更新，从而减少不必要的render执行。React.PureComponent会自动执行 shouldComponentUpdate。

不过，pureComponent中的 shouldComponentUpdate() 进行的是浅比较，也就是说如果是引用数据类型的数据，只会比较不是同一个地址，而不会比较这个地址里面的数据是否一致。浅比较会忽略属性和或状态突变情况，其实也就是数据引用指针没有变化，而数据发生改变的时候render是不会执行的。如果需要重新渲染那么就需要重新开辟空间引用数据。PureComponent一般会用在一些纯展示组件上。

使用pureComponent的好处：当组件更新时，如果组件的props或者state都没有改变，render函数就不会触发。省去虚拟DOM的生成和对比过程，达到提升性能的目的。这是因为react自动做了一层浅比较。

### 7. Component, Element, Instance 之间有什么区别和联系？
* **元素：** 一个元素element是一个普通对象(plain object)，描述了对于一个DOM节点或者其他组件component，你想让它在屏幕上呈现成什么样子。元素element可以在它的属性props中包含其他元素(译注:用于形成元素树)。创建一个React元素element成本很低。元素element创建之后是不可变的。

* **组件：** 一个组件component可以通过多种方式声明。可以是带有一个render()方法的类，简单点也可以定义为一个函数。这两种情况下，它都把属性props作为输入，把返回的一棵元素树作为输出。

* **实例：** 一个实例instance是你在所写的组件类component class中使用关键字this所指向的东西(译注:组件实例)。它用来存储本地状态和响应生命周期事件很有用。

函数式组件(Functional component)根本没有实例instance。类组件(Class component)有实例instance，但是永远也不需要直接创建一个组件的实例，因为React帮我们做了这些。
