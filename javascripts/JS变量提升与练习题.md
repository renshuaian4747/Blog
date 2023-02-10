# JS 变量提升与练习题
## 一、什么是变量提升
```js
console.log(a);
var a = 10;
```
**定义：变量提升是当栈内存作用域形成是，JS 代码执行前，浏览器会将带有 `var`,`function` 关键字的变量提前进行声明（默认值是 undefined）。在变量提升阶段，带 `var` 的只声明还没有被定义，带 `function` 的已经声明和定义**

```js
var a =12
var b = a
b = 1
function sum(x, y) {
    var total = x + y
    return total
}
sum(1, 2)
```
>变量提升阶段：a，b 会被提前声明并赋值为 undefined，sum 函数会被提前声明并将函数字符串存在堆内存中。函数 sum 执行时，会创建私有作用域。

## 二、带 var 和不带 var 的区别
* 全局作用域中不带 `var` 声明变量虽然也可以但是建议带上 `var` 声明变量，不带 `var` 的相当于给 window 对象设置了一个属性
* 私有作用域(函数作用域)，带 `var` 的是私有变量。不带 `var` 的是会向上级作用域查找，如果上级作用域也没有那么就一直找到 window 为止，这个查找过程叫`作用域链`
* 全局作用域中使用 `var` 申明的变量会映射到 window 下成为属性
```js
a = 12 // 等价于 window.a = 12

var a = b = 12;
// 等价于
var a = 12;
b = 2;
```

### 练习题
```js
console.log(a, b)
var a = 12, b ='string';
function foo(){
    console.log(a, b)
    var a = b = 13
    console.log(a, b)
}
foo()
console.log(a, b)
/*
  结果：
  undefined undefined
  undefined string
  13 13
  12 13
*/
```
```js
console.log(a, b)
var a = 12, b = 'string'
function foo(){
    console.log(a, b)
    console.log(a, b)
}
foo()
console.log(a, b)
/*
  结果：
  undefined undefined
  12 string
  12 string
  12 string
*/
```
```js
a = 2
function foo(){
    var a = 12;
    b = 'string';
    console.log('b' in window)
    console.log(a, b)
}
foo()
console.log(b)
console.log(a)
/*
  结果：
  true
  12 string
  string
  2
*/
```
**这道题中 b = 'string'，等价于 window.b = 'string'**
```js
function foo(){
    console.log(a) // 向上层作用域找 a，仍然无法找到
    a = 12;
    b = 'string'
    console.log('b' in window)
    console.log(a, b)
}
foo()
/* 输出
    Uncaught ReferenceError: a is not defined
/
```
```js
fn();
console.log(v1);
console.log(v2);
console.log(v3);
function fn(){
    var v1 = v2 = v3 = 2023;
    console.log(v1);
    console.log(v2);
    console.log(v3);
}
/* 输出
  2023
  2023
  2023
  Uncaught ReferenceError: v1 is not defined
/
```
## 三、等号左边下的变量提升
* 普通函数变量提升示例
```js
print();
function print() {
  console.log(2023);
}
print();
```
> 因带 function 的已经进行了变量提升
* 匿名函数下带 `=` 的变量提升
```js
print();
var print = function() {
  console.log(2023);
}
print();
/*输出
    Uncaught TypeError: print is not a function
/
```
> 带 var 会变量提升，print 初始化为 undefined

## 四、条件判断下的变量提升
* if else 条件判断下的变量提升

**在当前作用域中不管条件是否成立都会进行变量提升**
```js
console.log(a)
if(false){
    var a = 2023;
}
console.log(a)
/* 输出
    undefined
    undefined
/
```
* if `()` 内的表达式不会变量提升
```js
if(function f(){}){ 
    console.log(typeof f)  // undefined
}
```
* ES6 语法只有 JS 执行到条件语句，判断条件是成立的才会对条件内的函数赋值，不成立不被赋值只被定义undefined
```js
console.log(a)
console.log(p())
if(true){
    var a = 12
    function p() {
        console.log(2023)
    }
}
/*
* undefined
* Uncaught TypeError: p is not a function
*/
```
### 练习题
```js
if(!("value" in window)){
    var value = 2023; 
}
console.log(value); 
console.log('value' in window); 
/* 输出
  undefined
  true
*/
```

## 五、重名问题下的变量提升
* 带 var 和带 function 重名条件下的变量提升优先级，函数声明的变量会覆盖 var 声明的变量
```js
console.log(a);   
var a = 1;
function a () {
    console.log(1);
}
// or
console.log(a);   
function a () {
    console.log(1);
}
var a = 1;
// 输出都是： ƒ a(){ console.log(1);}
```
* 变量重名在变量提升阶段会重新定义
```js
console.log('1',fn())
function fn(){
    console.log(1)
}

console.log('2',fn())
function fn(){
    console.log(2)
}

console.log('3',fn())
var fn = '林一一'

console.log('4',fn())
function fn(){
    console.log(3)
}
/* 输出
  3
  1, undefined
  3
  2, undefined
  3
  3, undefined
  Uncaught TypeError: fn is not a function
*/
```

### 练习题
```js
var a = 2;
function a() {
    console.log(3);
}
console.log(typeof a);
/* 输出
  number
*/
```
```js
console.log(fn);
var fn = 2019;
console.log(fn);
function fn(){}
/* 输出
  fn(){}
  2019
*/
```
```js
let a = 0, b = 0;
function fn(a) {
  fn = function fn2(b) {
    console.log(a, b)
    console.log(++a+b)
  }
  console.log('a', a++)
}
fn(1); // 1
fn(2); // 2,2  5
```
## 六、函数形参的变量提升
* 函数的形参也会进行一次变量提升
```js
function foo(a) {
  console.log(a);
}
foo(20);

// 函数执行时等价于
// function foo(a) {
//   var a = undefined;
//   a = 20;
//   console.log(20)
// }
```
### 练习题
```js
var a = 1;
function foo(a) {
    console.log(a)
    var a
    console.log(a)
}
foo(a);
/* 输出
  1
  1
*/
```
>在函数的形参阶段 **var a = undefined; a=1;** 这里特别需要注意的是，函数内部虽然也使用 **var a** 声明了变量 **a** 但是这里不会再次声明赋值成 undefined。因为在形参阶段已经变量提升过一次了
```js
var foo = 2023;
(function(f){
    console.log(foo);
    var foo = f || 'hello';
    console.log(foo)
})(foo);
console.log(foo)
/* 输出
  undefined
  2023
  2023
*/
```
```js
var a = 10;
(function () {
    console.log(a)
    a = 5
    console.log(window.a)
    var a = 20;
    console.log(a)
})()

var b = {
    a,
    c: b
}
console.log(b.c);
/* 输出
  undefined
  10
  20
  undefined
*/
```
```js
var a = 1;
function foo(a, b) {
  console.log(a);
  a = 2;
  arguments[0] = 3;
  var a;
  console.log(a, this.a, b);
}
foo(a);
/* 输出
  1
  3,1,undefined
*/
```
## 七、非匿名自执行函数的变量提升
**非匿名自执行函数和匿名自执行函数之间的变量提升是有差别的**
* 匿名执行函数和非匿名自执行函数在全局环境下不具备变量提升的机制
```js
var a = 10;
(function c(){
})()
console.log(c)
// Uncaught ReferenceError: c is not defined
```
* 匿名自执行函数在自己的作用域内存在正常的变量提升
```js
var a = 10;
(function(){
    console.log(a)
    a = 20
    console.log(a)
})()
console.log(a)
// 10, 20, 20
```
* 非匿名自执行函数的函数名在自己的作用域内变量提升，且修改函数名的值无效，这是非匿名函数和普通函数的差别
```js
var a = 10;
(function a(){
    console.log(a)
    a = 20
    console.log(a)
})()
// ƒ a(){a = 20 console.log(a)}  ƒ a(){a = 20 console.log(a)}
```