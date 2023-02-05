# babel 总结
* 前端开发环境必备工具

## 环境搭建 & 基本配置
```js
// .babelrc
{
  "presets": [
    [
      // 常用的 babel plugin 集合
      "@babel/preset-env"
    ]
  ],
  "plugins": []
}
```
## balel-polyfill
* 考虑到浏览器兼容性，而存在的补丁
* 核心是 core.js 和 regenerator
  1. core.js 和 regenerator 是两个标准的补丁库，包含所有 ES6、ES7 的 polyfill
  2. balel-polyfill 就是 core.js 和 regenerator 的集合
* babel 7.4 后 balel-polyfill 被弃用，建议直接使用 core.js 和 regenerator
**babel-polyfill 会污染全局环境，所以出现了 babel-runtime**
```js
// babel-polyfill 按需引入配置
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ],
  "plugins": []
}
```
## babel-runtime
* 不会污染全局环境
```js
// .babelrc
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "absoluteRuntime": false,
        "corejs": 3,
        "helpers": true,
        "regenerator": true,
        "useESModules": false
      }
    ]
  ]
}
```