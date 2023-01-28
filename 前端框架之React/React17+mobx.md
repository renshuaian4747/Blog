# React17+ts+Mobx分享
### 分享内容：
#### 1. React 基础知识讲解
* 元素渲染
* JSX 语法（JSX 模板和真实 Dom 的关系）
* 组件（class 组件 & 函数组件）
* Props & State（非常重要的一句话：组件任何 Props 或者 State 改变，组件将重新渲染，即 class 组件触发 render 方法，函数组件重新执行内部所有逻辑）
* 虚拟 Dom （并不高深，就是个 js 对象）
* 常用的 React Hooks（useState、useEffect、useMemo、useCallback、useRef）
#### 2. 基于React17 + ts + Hooks完成一个列表页面的demo，功能如下：
* 实现列表页面、搜索筛选功能的开发。
* 通过自定义 hooks 实现搜索框截流功能。
* 使用 Mobx 进行状态管理。
* 图谱组件使用
#### 3. Bixi-React
### 目标：
帮助对 React 不太熟悉或着没有了解过 React 的童鞋们入门，并且在今后的开发中能够快速上手。Angular => React 无缝衔接:skull: 

## React 基础

#### React 环境搭建
1. 引入 .js 文件来使用 React
2. [通过脚手架工具来编码](https://zh-hans.reactjs.org/docs/create-a-new-react-app.html) (官方脚手架：Create-react-app)
#### 元素渲染
在项目入口文件中，使用 ReactDOM 的 API 将元素渲染到根结点(注意区分组件渲染)。
``` jsx
const element = <h1>Hello, world</h1>;
// const element = React.createElement(
//   'h1',
//   {className: 'greeting'},
//   'Hello, world!'
// );
ReactDOM.render(element, document.getElementById('root')); 
```
[React 元素是不可变对象。一旦被创建，你就无法更改它的子元素或者属性。](https://zh-hans.reactjs.org/docs/rendering-elements.html)
#### JSX 语法
``` tsx
const text = 'hello world';
const element = <h1 className="xxx">{text}</h1>
// jsx => createElement => 虚拟 Dom (js 对象) => 真实Dom
```
1. 概念：JSX是一个 JavaScript 的语法扩展。他的形式非常类似于 html 语法。用‘{ }’可以包裹 js 表达式。
2. 注意事项：
* 属性名用小驼峰，组件名用大驼峰。
* jsx 中的注释：**{/*  */}**’。
* 假如一个标签里面没有内容，你可以使用 **/>** 来闭合标签。
* 标签类名使用 **className**，label 标签的 **for** 属性需要使用 **htmlFor**
3. babel 会将 jsx 转译成一个名为 React.createElement() 函数调用（上面元素渲染中注释的代码）。
#### 组件
1. 函数组件与 Class 组件
```jsx
// 函数组件（推荐）,代码相较 class 组件更为简洁。
// 后续我们会大量使用 React Hooks，React Hooks 只能在函数组件中使用
const Welcome = (props) => {
    return <h1>Hello, {props.name}</h1>
}
// class 组件
class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>
    }
}
```
2. 组件不能修改自身的 props。所以我们引入一种新的概念 state。 state 允许用户操作或者修改。我们以一个时钟组件为例。<br>
```jsx
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

ReactDOM.render(
  <Clock />,
  document.getElementById('root')
);
```
**注意事项：**
* 不要直接修改State，构造函数是唯一可以给 this.state 赋值的地方。
* State 的更新可能是异步的。settimeout、setinterval、dom 上直接绑定的原声事件中，setstate 都是同步更新。
* State 的更新会被合并。

3. 单项数据流

4. 虚拟 Dom (虚拟 Dom 就是一个 js 对象) <br>

步骤：
* state 数据
* JSX 模板
* 数据 + 模板生成虚拟 Dom（性能损耗远远小于生成真实 Dom）
* 用虚拟 Dom 结构生成真实 Dom
* state 改变
* 数据 + 模板生成新的虚拟 Dom
* 对比虚拟 Dom 差异（性能损耗远远小于对比真实 Dom 的差异）
* 根据差异更新视图

优点：
* 极大提升了性能。
* 它使得跨端应用得以实现。 React Native 

diff 算法：
* setState 的合并减少 diff算法执行次数
* 同层比对（思考循环一个 list 渲染列表，为什么每个元素需要加上 key 值，并且为什么 key 值不要使用 index）


5. [组件生命周期](https://zh-hans.reactjs.org/docs/react-component.html#static-getderivedstatefromprops)

#### Hooks
Hooks 让我们可以函数组件也可以使用 state 以及其他 React 特性。

1. useState
```tsx
function Example() {
  const [count, setCount] = useState(0);

   return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
2. useEffect（三个生命周期钩子函数的合体）
```jsx
// 清除函数会在组件卸载前执行。另外，如果组件多次渲染，则在执行下一个 effect 之前，上一个 effect 就已被清除
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    // 清除订阅
    subscription.unsubscribe();
  };
},[]);
```
理解纯函数：一个函数的返回结果只依赖于它的参数，并且在执行过程里面没有副作用。
```js
// foo 依赖于外部变量 a
const a = 1
const foo = (b) => a + b
foo(2) // => 3

// foo 执行过程中产生了副作用
const a = 1
const foo = (obj, b) => {
  obj.x = 2
  return obj.x + b
}
const counter = { x: 1 }
foo(counter, 2) // => 4
counter.x // => 2
```
3. useMemo & useCallback
useMemo和useCallback都会在组件第一次渲染的时候执行，之后会在其依赖的变量发生改变时再次执行；并且这两个hooks都返回缓存的值，useMemo返回缓存的变量，useCallback返回缓存的函数。
```jsx
// useMemo 使用场景
const WithoutMemo = () => {
    const [count, setCount] = useState(1);
    const [val, setValue] = useState('');
 
    const expensive = () => {
        let sum = 0;
        for (let i = 0; i < count * 1000; i++) {
            sum += i;
        }
        return sum;
    }
 
    return <div>
        <h4>{count}-{val}-{expensive()}</h4>
        <div>
            <button onClick={() => setCount(count + 1)}>+c1</button>
            <input value={val} onChange={event => setValue(event.target.value)}/>
        </div>
    </div>;
}

const WithMemo = () => {
    const [count, setCount] = useState(1);
    const [val, setValue] = useState('');
 
    const expensive = useMemo(() => {
        let sum = 0;
        for (let i = 0; i < count * 1000; i++) {
            sum += i;
        }
        return sum;
    }, [count])

    return <div>
        <h4>{count}-{val}-{expensive}</h4>
        <div>
            <button onClick={() => setCount(count + 1)}>+c1</button>
            <input value={val} onChange={event => setValue(event.target.value)}/>
        </div>
    </div>;
}
// useCallback 使用场景
function Parent() {
    const [count, setCount] = useState(1);
    const [val, setVal] = useState('');
 
    const callback = useCallback(() => {
        return count;
    }, [count]);
    return <div>
        <h4>{count}</h4>
        <Child callback={callback}/>
        <div>
            <button onClick={() => setCount(count + 1)}>+</button>
            <input value={val} onChange={event => setVal(event.target.value)}/>
        </div>
    </div>;
}
 
function Child({ callback }) {
    const [count, setCount] = useState(() => callback());
    useEffect(() => {
        setCount(callback());
    }, [callback]);
    return <div>
        {count}
    </div>
}

```
4. useRef
```jsx
// ref 在所有 render 都保持着唯一的引用，因此所有的对 ref 的赋值或者取值拿到的都是一个最终的状态，而不会存在隔离
// 修改 ref 的值是不会引发组件的重新 render
const WithoutRef = () => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  const handleClick = () => {
    setTimeout(() => {
      alert(`you clicked ${countRef.current} times`);
    }, 2000);
  };

  return (
    <div>
      <button
        onClick={() => {
          setCount(count + 1);
          countRef.current++;
        }}
      >
        点击收藏 {count}
      </button>
      <button onClick={() => handleClick()}>Alert</button>
    </div>
  );
};
```

## 完成 Demo
全局安装 json-server
```
$ npm i json-server -g
$ json-server --watch ./src/mock/db.json
```
构建启动
```
$ yarn
$ yarn dev
```