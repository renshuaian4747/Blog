# JS 变量类型与计算

## 常见基础类型（栈存储）
* undefined
* string
* number
* boolean
* symbol

## 常见引用类型（堆存储）
* {name: 'zs'}
* [1,2,3]
* null 特殊应用类型，指向空地址
* function foo() {}

## typeof 运算符
* 可识别所有基础类型
* 可判断函数类型
* 可识别引用类型（不可再细分）

## == === 使用
* 判断一个值是否是 null 或者 undefined 用 ==
* 其余均用 ===

## Deepclone
```js
const deepclone = (obj) => {
  // obj == null 表示 obj 为 undefined 或 null
  if (typeof obj !== 'object' || obj == null) {
    return obj
  }
  let result;
  if (obj instanceof Array) {
    result = [];
  } else {
    result = {}
  }
  for(let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 保证 key 不是原型对象上的属性
      result[key] = deepclone(obj[key]);
    }
  }
  return result;
}
```
