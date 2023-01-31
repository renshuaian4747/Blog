# React Hooks
* State Hooks
* Effect Hooks
* 其他 Hooks
* 自定义 Hooks
* 组件逻辑复用
* 规范和注意事项
* 函数组件的特点
  1. 没有组件实例
  2. 没有生命周期
  3. 没有 state，只能接收 props（React < 16.8）

## state hooks - useState
* 函数组件是纯函数，执行完即销毁，本来无法存储 state，直到引入 state hooks
* 初始化值只会读取一次
```jsx
const MyComponent = () => {
  const [v, setV] = useState(0);

  return (
    <>
      <p>点击次数：{v}</p>
      <button onClick={() => setV(v+1)}>点击</button>
    </>
  )
}
```

## effect hooks - useEffect
* 函数组件是纯函数，执行完即销毁，没有生命周期，直到引入 effect hooks
* **特别注意，useEffect 中返回函数的执行时机：在下一次 effect 执行，被执行（不完全与 WillUnmount 相同）**
* deps 数组为空数组时，useEffect 中返回函数的作用与 WillUnmount 完全相同
* deps 数组中不能放引用类型的变量（React 是用 Object.is 判断的）
```jsx
// useEffect 模拟生命周期
const MyComponent = () => {
  const [v, setV] = useState(0);

  useEffect(() => {
    // 模拟 DidMount 和 DidUpdate
    console.log('render');
  })

  useEffect(() => {
    // 模拟 DidMount
    console.log('mount');
  }, [])

  useEffect(() => {
    // 模拟 DidUpdate
    console.log('render');
  }, [v])

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(new Date());
    }, 1000);
    // 返回一个函数
    return () => {
      // 模拟 WillUnmount（但不完全相同）
      // 若 deps 有值
      // 在下一次 effect 执行前会执行
      window.clearInterval(timer);
    }
  }, [])

  return (
    <>
      <p>点击次数：{v}</p>
      <button onClick={() => setV(v+1)}>点击</button>
    </>
  )
}
```

## 其他hooks
### 一、useRef
```jsx
const MyComponent = () => {
  const btnRef = useRef(null);

  useEffect(() => {
    console.log(btnRef.current) // DOM 节点
  }, [])

  return (<button ref={btnRef}>按钮</button>)
}
```
### 二、useContext
### 三、useReducer
* useReducer 是 useState 的代替解决方案，用于 state 的复杂变化
* useReducer 是单组件的状态管理，组件间通讯还需要 props
* redux（或其他第三方依赖）是全局状态管理，多组件共享数据
### 四、useMemo
* React 默认会更新所有子组件
* class 使用 SCU 和 PureComponent 做优化
* Hooks 中使用 useMemo，原理相同
### 五、useCallback
* 与 useMemo 类似
* useMemo 缓存数据
* useCallback 缓存函数
### 六、自定义 Hooks
* 封装通用功能
* 开发和使用第三方 Hooks
* 自定义 Hooks 带来了无限的扩展性，解偶代码
* 必须以 use 开头
```js
// 封装 axios 的自定义 hook
const useAxios = (url) => {
  const [loading, setLoading] = useState(false);
  const [date, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    setLoading = true;
    axios.get(url)
      .then(setDate)
      .catch(setError)
      .finaly(() => setLoading(false))
  }, [url])

  return [loading, data, error];
}

// 封装获取鼠标位置的 hook
const useMousePos = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect() => {
    const mouseMoveHandler = (e) => {
      setX(e.clientX);
      setY(e.clientY);
    }
    // 绑定事件
    document.body.addEventListener('mousemove', mouseMoveHandler);
    // 解绑事件
    return () =>  document.body.removeEventListener('mousemove', mouseMoveHandler);
  }, []

  return [x, y];
}
```
## Hooks 使用规则
* 必须以 use 开头
* 只能在 React 函数组件中和自定义 Hooks 中使用
* 只能在顶层代码中使用，不能在判断、循环中使用