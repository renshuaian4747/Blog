# 闭包
>了解闭包前先了解一下上级作用域和堆栈内存释放问题
## 上级作用域的概念
* 函数的上级作用域在哪里创建的，上级作用域就是哪儿
```js
var a = 10;
function foo () {
  console.log(a)
}

function sum() {
    var a = 20
    foo()
}

sum()
/* 输出
    10
/
```
**函数 `foo()` 是在全局下创建的，所以 `a` 的上级作用域就是 `window`，输出就是 `10`**
### 练习题
```js
var n = 10
function fn(){
    var n =20
    function f() {
       n++;
       console.log(n)
     }
    f()
    return f
}

var x = fn()
x()
x()
console.log(n)
/* 输出
  21
  22
  23
  10
/
```
## JS 堆栈内存释放
* 堆内存：存储引用类型值，对象类型就是键值对，函数就是代码字符串
* 堆内存释放：将引用类型的空间地址变量赋值成 null，或没有变量占用堆内存了浏览器就会释放掉这个地址
* 栈内存：提供代码执行的环境和存储基本类型值
* 栈内存释放：一般当函数执行完后函数的私有作用域就会被释放掉
> 但栈内存的释放也有特殊情况：① 函数执行完，但是函数的私有作用域内有内容被栈外的变量还在使用的，栈内存就不能释放里面的基本值也就不会被释放。② 全局下的栈内存只有页面被关闭的时候才会被释放
## 闭包是什么
**闭包是指有权访问另一个函数作用域中变量的函数**
## 形成闭包的原因
**内部的函数存在外部作用域的引用就会导致闭包**
```js
var a = 0;
function foo () {
  var b = 2023;
  function foo2 () {
    console.log(a, b);
  }
  foo2();
}
foo();
```
## 闭包变量存储的位置
**闭包中的变量存储的位置是堆内存**
* 假如闭包中的变量存储在栈内存中，那么栈的回收 会把处于栈顶的变量自动回收。所以闭包中的变量如果处于栈中那么变量被销毁后，闭包中的变量就没有了。所以闭包引用的变量是出于堆内存中的
## 闭包的作用
* 保护函数的私有变量不受外部的干扰，形成不销毁的栈内存
* 保存，把一些函数内的值保存下来，闭包可以实现方法和属性的私有化
## 使用场景
* return 一个函数
```js
var n = 10
function fn(){
    var n =20
    function f() {
       n++;
       console.log(n)
     }
    return f
}

var x = fn()
x() // 21
```
* 函数作为参数
```js
var a = 2023
function foo(){
    var a = 'foo'
    function fo () {
        console.log(a)
    }
    return fo
}

function f(p){
    var a = 'f'
    p()
}
f(foo())
/* 输出
*   foo
/ 
```
* 使用回调函数就是在使用闭包
```js
window.name = 'rsa'
setTimeout(function timeHandler(){
  console.log(window.name);
}, 100)
```

## 经典面试题
* for 循环和闭包
```js
var data = [];

for (var i = 0; i < 3; i++) {
  data[i] = function () {
    console.log(i);
  };
}

data[0](); // 3
data[1](); // 3
data[2](); // 3
```
```js
var result = [];
var a = 3;
var total = 0;

function foo(a) {
    for (var i = 0; i < 3; i++) {
        result[i] = function () {
            total += i * a;
            console.log(total);
        }
    }
}

foo(1);
result[0]();  // 3
result[1]();  // 6
result[2]();  // 9
```
* this 指向
```js
var name = 'zs';
var obj = {
    name: 'ls',
    prop: {
        getName: function(){
        return this.name
    }
  }
}
console.log(obj.prop.getName())
var a = obj.prop.getName
console.log(a())
/*
*   undefined
*   zs
/
```
* 闭包和 this 求下面输出结果
```js
var num = 10    // 60； 65
var obj = {
    num: 20    
}
obj.fn = (function (num){
    this.num = num * 3
    num++    // 21
    return function(n){
        this.num += n    // 60 + 5 = 65；20 + 10 =30
        num++   // 21 + 1 = 22；22 + 1 = 23
        console.log(num)
    }
})(obj.num)
var fn = obj.fn
fn(5)   // 22
obj.fn(10)   // 23
console.log(num, obj.num)    // 65, 30
```