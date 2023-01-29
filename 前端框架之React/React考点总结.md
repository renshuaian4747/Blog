# React 考点总结
## React 类组件绑定 this
```jsx
class MyComponent {
  constructor() {
    super();
    // state 只能在 constructor 中用“=”赋值
    this.state = {};
    this.foo = this.foo.bind(this); // 绑定 this
  }
  ...
  foo() {
    console.log(this); // 若不绑定 this，this 为 undefined
  }
  // 用静态声明不需要绑定 this（剪头函数）
  foo2 = () => {
    console.log(this);
  }
  ...
  render() {
    return <>
      <button onClick={this.foo}>按钮</button>
      <button onClick={this.foo2}>按钮2</button>
    </>
  }
}
```
## React 事件和 DOM 事件的区别
* event 是 SyntheticEvent，模拟出 DOM 事件所有能力
* event.nativeEvent 是原生事件对象
* 所有事件被挂载到 document 上（React 17 后不挂载到 document 上）
* React 17 后，所有事件绑定在 root（根组件）上。有利于多个 React 版本并存，如微前端
```jsx
class MyComponent {
  constructor() {
    super();
  }
  ...
  foo(event) {
    event.preventDefault(); // 阻止默认事件
    event.stopPropagation(); // 阻止冒泡

    // 注意，event 是 React 封装的，event.__proto__.constructor 是指向的 SyntheticEvent 组合事件
    console.log(event.target); // 指向当前元素，即当前元素触发
    console.log(event.currentTarget); // 指向当前元素，假象！！！

    // 原生 event 如下
    console.log(event.nativeEvent);
    console.log(event.nativeEvent.target);
    console.log(event.nativeEvent.currentTarget);

    // event 是 SyntheticEvent，模拟出 DOM 事件所有能力
    // event.nativeEvent 是原生事件对象
    // 所有事件被挂载到 document 上（React 17 后不挂载到 document 上）
    // React 17 后，所有事件绑定在 root（根组件）上
    // 有利于多个 React 版本并存，如微前端
  }
  ...
  render() {
    return <>
      <button onClick={this.foo}>按钮</button>
    </>
  }
}
```
## setState
* 不可变值

**React <= 17**
* React 组合事件：异步更新 + 合并 state
* DOM 事件，setTimeout：同步更新 + 不合并 state

**React 18**
* Automatic Batching 自动批处理
* React 组合事件：异步更新 + 合并 state
* DOM 事件，setTimeout：异步更新 + 合并 state
### 一、setState 更新（异步还是同步）
* 普通情况下 setState 为异步更新，在 setState 的回调中才能拿到最新的 state
* 在异步函数、绑定的原生 DOM 事件中，setState 是同步更新
```jsx
// React <= 17
this.state = { count: 0 };
...

// state 异步更新，可以在 setState 回调中拿到最新的值
this.setState({
  count: this.state.count + 1
}, () => {
  console.log(this.state); // 1
});
console.log(this.state); // 0

// 在异步函数中、绑定在原生 DOM 事件中，state 同步更新
// 异步函数
setTimeout(() => {
  this.setState({
    count: this.state.count + 1
  });
  console.log(this.state.count); // 1
})
// 原生 DOM 事件
document.body.addEventListener('click', () => {
  this.setState({
    count: this.state.count + 1
  });
  console.log(this.state.count); // 1
})

...
```
### 二、setState 会不会合并
* 传入对象会被合并，只执行一次
* 传入函数，不会合并
```jsx
// React <= 17
this.state = { count: 0 };
...

// 传入对象会被合并，只执行一次
this.setState({
  count: this.state.count + 1
});
this.setState({
  count: this.state.count + 1
});
this.setState({
  count: this.state.count + 1
});
// 最新的 state.count 为 1

// 传入函数，不会合并
this.setState((prev, props) => ({
  count: this.state.count + 1
}));
this.setState((prev, props) => ({
  count: this.state.count + 1
}));
this.setState((prev, props) => ({
  count: this.state.count + 1
}));
// 最新的 state.count 为 3

// setState 为同步更新是，不合并
setTimeout(() => {
  this.setState({
    count: this.state.count + 1
  });
  this.setState({
    count: this.state.count + 1
  });
  this.setState({
    count: this.state.count + 1
  });
  // 最新的 state.count 为 3
})

...
```

## React 生命周期
[React 生命周期](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram)

![React 生命周期](./assets/React%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.png)

## Context

## 异步组件
* React.Suspense
* React.lazy

# 性能优化
* 性能优化对 React 很重要
* SCU（ShouldComponentUpdate）
* PureComponent 和 React.memo
* 不可变值，immutable.js
### 一、SCU
* 默认情况，父组件更新，子组件无条件更新
* 严格遵守不可变值，否则 SCU 中检测不出变更
```jsx
shouldComponentUpdate(nextProps, nextState) {
  if (this.state.count !== nextState.count) {
    return true // 可以渲染
  }
  return false // 不重复渲染
}
```
### 二、PureCompnent、memo
* PureComponet 中 SCU 实现了浅比较

## 高阶组件 HOC
```jsx
// 高阶组件不是一种功能，而是一种模式
const HOCFactory = (Component) => {
  class HOC extends React.Component {
    // 此处可以定义公共逻辑
    render() {
      return <Component {...this.props}></Component> // 拼装返回后的逻辑
    }
  }
  return HOC
}

const EnhancedComponent = HOCFactory(WrappedComponent);
```