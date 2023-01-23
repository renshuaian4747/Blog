# JS Web Api
* JS 基础知识，规定语法（ECMA 262 标准）
* JS Web Api，网页操作的 Api（W3C标准）
* 前者是后者的基础，二者结合才能实际应用
## DOM
### 一、DOM 节点操作
* property：修改对象属性，不会体现在 html 结构中
* attribute：修改 html 属性，会改变 html 结构
* 二者都可能引起 DOM 重新渲染
```js
const div = document.getElementById('div') // 元素
const div = document.getElementsByClassName('div') // 集合
const div = document.getElementsByTagName('div') // 集合
const p = document.querySelector('p'); // 集合
const p1 = p[0];
// property
p1.style.width = '100px';
p1.className = 'red';
// attribute
p1.setAttribute('cus-data', 'sccc');
p1.getAttribute('cus-data');
```
### 二、DOM 结构操作
```js
const div1 = document.getElementById('div1');
const div2 = document.getElementById('div2');
// 新建节点
const newP = document.createElement('p');
p.innerHTML = 'this is new P';
// 插入新节点
div1.appendChild(newP);
// 移动节点
// p1 为已存在节点
const p1 = document.getElementById('p1');
div2.appendChild(p1);
// 获取父元素
p1.parentNode
// 获取子元素集合
div2.childNodes
// 删除子元素
div2.removeChild(p1)
```
### 三、DOM 性能
* DOM 操作非常“昂贵”，避免频繁进行 DOM 操作
* 对 DOM 查询做缓存
* 将频繁操作改为一次性操作
```js
// 不缓存 DOM 查询结果
for(let i = 0; i < document.getElementsByClass('p').length; i++) {
    ...
}
// 缓存 DOM 查询结果
const pList = document.getElementsByClass('p');
for(let i = 0; i < p.length; i++) {
    ...
}
```
```js
// 动态渲染，一次性插入多个节点
const container = document.getElementById('container');
// 创建文档片段，该片段可以调用所有 DOM api，并且不触发 DOM 渲染
const fragment = document.createDocumentFragment();
for(let i = 0; i < 20; i++) {
  const item = document.createElement('li');
  item.innerHTML = `this is item${i + 1}`;
  fragment.appendChild(item);
}
container.appendChild(fragment);
```

## BOM
```js
// navigator
const ua = navigator.userAgent;
const isChrome =  ua.indexOf('Chrome');

// screen
screen.width
screen.height

// location
location.href // 完整 url
location.protocol // 协议
location.search // 查询参数
location.hash // 哈希
location.pathname // 路径
location.host // 域名、IP

// history
history.back()
history.forward()
```

## 事件
### 一、事件绑定
```js
// 通用事件绑定
const div = document.getElementById('div');
div.addEventListener('click' , (event) => {
  console.log(event.target);
});
``` 
### 二、事件模型（冒泡、捕获）
* 从目标元素逐层往上冒泡
* 组织冒泡：event.stopPropagation
### 三、事件代理
* 基于冒泡机制

## 网络请求 Ajax
### 一、手写 ajax
* xhr.readyState：
  1. 0 - UNSET，尚未调用 open 方法
  2. 1 - OPENED，open 方法已被调用
  3. 2 - HEADERS_RECEIVED，send 方法已被调用，header 已被接收
  4. 3 - LOADING，下载中，responseText 已有部分内容
  5. 4 - DOWN，下载完成
* http 状态码 xhr.status：
  1. 2xx，请求成功
  2. 3xx，重定向
  3. 4xx，客户端请求错误
  4. 5xx，服务端报错
```js
// get
const xhr = new XMLHttpRequest();
xhr.open('GET', '/data', true);
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      console.log(JSON.parse(xhr.reponseText));
    }
  }
}
xhr.send();
// post
const xhr = new XMLHttpRequest();
xhr.open('POST', '/data', true);
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      console.log(JSON.parse(xhr.reponseText));
    }
  }
}
const params = {
  name: 'zs',
  password: 'xxx'
}
xhr.send(JSON.stringify(params));
```
### 二、跨域
* 同源策略，网络请求时，浏览器要求当前网页和 server 必须同源
* 同源：协议、域名、端口，三者一致
* 图片、css、js 加载可以跨域
* Jsonp 实现跨域的原理是 script 标签可以跨域
```html
// 客户端
<script>
  window.callback = function (data) {
    console.log(data);
  }
</script>
<script src="/data.json"></script>
```
```js
// 服务端
callback({
  name: 'zs'
})
```
* CORS 解决跨域
* Nginx 代理

## 存储 cookie、sessionStorage、localStorage
* cookie 存储限制 4KB
* cookie 会随请求发送到服务端，服务端也可发送 cookie 到客户端
```js
document.cookie = 'a=100' // "a=100"
document.cookie = 'b=200' // "a=100;b=200"
document.cookie = 'a=300' // "b=200;a=300"
```
* sessionStorage、localStorage 每个域名可存储 5M，不会随请求发送到服务端
* localStorage 本地存储（本地磁盘），不会自动删除