```javascript
// object声明
// 字面量
var o1 = {name: 'o1'}
var o2 = new Object({name: 'o2'})
// 构造函数
var M = function(name) {this.name = name};
var o3 = new M('o3'); // M.prototype.constructor === M; o3.__proto__ === M.prototype
// Object.create // 指定原型对象
var p = {name:'p'}
var o4 = Object.create(p)

// new 运算符
// 1. 新对象被创建，继承自foo.prototype
// 2. 构造函数执行
// 3. 如果构造函数返回一个对象 ，那么这个对象会取代整个new出来的结果。如果构造函数没有返回对象，那么new出来的结构为步骤1创建的对象。
```

```javascript
// 面向对象
function Animal() {
  this.name = 'name'
}

// 继承
// 1. 借助构造函数继承。
function Parent1() {
  this.name = 'parent1'
}

function Child1() {
  Parent1.call(this);
  this.type = 'child1';
}
// 缺点：Parent1 原型对象上的属性无法继承。

// 2. 借助原型链继承
function Parent2() {
  this.name = 'parent2'
}

function Child2() {
  this.type = 'child2'
}
Child2.prototype = new Parent2();
// 缺点：所有子类的实例对象共用同一个原型对象。

// 3.组合继承
function Parent3() {
  this.name = 'parent3'
}

function Child3() {
  Parent3.call(this);
  this.type = 'child3';
}
Child3.prototype = new Parent3();

// 优化
function Parent4() {
  this.name = 'parent4'
}

function Child4() {
  Parent4.call(this);
  this.type = 'child4';
}
Child3.prototype = Parent4.prototype; 

// 优化2 
function Parent5() {
  this.name = 'parent5'
}

function Child5() {
  Parent5.call(this);
  this.type = 'child5';
}
Child5.prototype = Object.create(Parent5.prototype); 
Child5.prototype.constructor = Child5
```