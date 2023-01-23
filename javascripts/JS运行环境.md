# JS 运行环境
## 网页加载、渲染
* css 加载放在 header 中
* script 标签放在最后，js 与渲染共用同一线程
* window.onload 与 DOMContentLoaded 的区别：
```js
window.addEventListener('load', function () {
  // 页面资源全部加在完执行，包括图片、视频等
})

window.addEventListener('DOMContentLoaded', function () {
  // DOM 渲染完即可执行，此时图片、视频可能还没加载完
})
```
## 从输入 url 到页面渲染
* 资源下载
* 渲染页面：结合 html、js、css 等
## 性能优化
### 一、原则
* 多使用内存、缓存
* 减少 CPU 计算量，减少网络请求耗时
* 适用所有编程的性能优化 - 空间换时间
### 二、方式
* 减少资源体积：压缩代码
* 减少访问次数：合并代码，SSR，缓存
* 使用 CDN
* 缓存 DOM 查询
* 减少 DOM 插入次数
* 节流、防抖
### 手写防抖节流
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
## 安全
### 一、XSS 跨站请求攻击
### 二、XSRF 跨站请求伪造