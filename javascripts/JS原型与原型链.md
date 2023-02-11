# 原型与原型链
## 面向对象编程
### 一、面向过程
**就是分析出解决问题所需要的步骤，然后用函数把这些步骤一步一步实现，使用的时候一个一个依次调用就可以了**
* 优点：性能比面向对象高，因为类调用时需要实例化，开销比较大，比较消耗资源;比如单片机、嵌入式开发、 Linux/Unix等一般采用 面向过程开发，性能是最重要的因素。 缺点：没有面向对象易维护、易复用、易扩展

### 二、面向对象
**是把构成问题事务分解成各个对象，建立对象的目的不是为了完成一个步骤，而是为了描叙某个事物在整个解决问题的步骤中的行为**
* 优点：易维护、易复用、易扩展，由于面向对象有封装、继承、多态性的特性，可以设计出低耦合的系统，使系统 更加灵活、更加易于维护 缺点：性能比面向过程低

## 原型与原型链
**JS 中一切皆对象。基本类型，引用类型都是基于 Object 这个基类创建的。函数也是，prototype 的值也是对象类型**

### 一、prototype 和 \_\_proto__ 和 constructor 的关联
* 每一个函数类型都自带一个 `prototype` 的原型属性，原型是对象类型，浏览器会开辟一个堆内存空间
* 浏览器会给这个堆内存空间中添加一个 `constructor` 的属性，属性值是构造函数本身。构造函数中并没有 constructor 属性，但是会从构造函数的 prototype 中查找，`obj.constructor === Object.prototype.constructor === Object`
* 每一个对象都有一个 `__proto__` 的属性，这个属性指向所创建类的 `prototype，prototype` 也是对象同样也有 `__proto__` 这个属性
* Object 这个基类的本身也是一个函数，所以 `__proto__` 指向的是 `Function.prototype` 的原型，`__proto__` 最终指向值是 null
* 函数的 `__proto__` 指向的是 `Function.prototype` 和 对象的 `__proto__` 不一样。
```js
Object.__proto__ === Function.prototype // true
Object.prototype === Object.prototype.constructor // true
```
### 二、原型链的作用
* 每一个类都会把公共的属性和方法存储到原型上，给实例调用
* 给所创建类的原型 `prototype` 添加属性和方法就是给实例添加共有方法
### 三、原型链查找机制
* 原型链就是基于 `__proto__` 的向上查找机制。当实例操作某个属性或方法时会在当前自己的作用域中查找，找到了则查找结束。没有找到就基于所创建类的原型对象上的 `__proto__`  继续向上查找，直到找到基类的 `Object.prototype` 为止，如果还是没有找到则直接 undefined

### 练习题
```js
function Fn(){
    var a = 12
    this.getName = function(){
        console.log('private getName')
    }
}

Fn.prototype.getName = function (){
      console.log('public getName')
}

var fn = new Fn()
var fn1 = new Fn()
// 1，2
console.log(fn.a)
console.log(fn.getName())
// 3，4，5
console.log(fn.getName === fn1.getName)
console.log(fn.__proto__.getName === fn1.__proto__.getName)
console.log(fn.__proto__.getName === Fn.prototype.getName)
//6，7
console.log(fn.hasOwnProperty === Object.prototype.hasOwnProperty)
console.log(fn.constructor === Fn)

/*
  输出
  undefined
  private getName
  false
  true
  true
  true
  true
/
```
```js
var a = 0;
function Parent() {
  this.a = 1;
  return this;
}

Parent.a = 2;
Parent.prototype = {
  a: 3,
  setA: function (value) {
    this.a = value;  // 这里的 this 会将原实例的属性 a 值给修改了
    return this;
  }
}

console.log(new Parent().a);
console.log(Parent().a);
console.log(new Parent().setA(4).a); 
console.log(a); 
console.log(Parent().setA(5).a);
/*
  输出
  1
  1
  4
  1
  TypeError
/
```