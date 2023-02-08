# CSS 篇

## margin 负值问题
* margin-top 和 margin-left 负值，元素向上、向左移动
* margin-right 负值，右侧元素左移，自身不受影响
* margin-bottom 负值，下侧元素上移，自身不受影响

## BFC 理解与应用
* Block format context，块级格式化上下文
* 一块独立渲染区域，内部元素的渲染不会影响边界以外的元素

## 形成 BFC 的常见条件
* float 不是 none
* position 是 absolute 或 fixed
* overflow 不是 visible
* display 是 flex、inline-block 等

## BFC 应用
* 清除浮动

## float 布局
### 1.圣杯布局、双飞翼布局
* 使用 float 布局
* 两侧使用 margin 负值，以便中间内容横向重叠
* 防止中间内容被两侧覆盖，一个用 padding 一个用 margin
```html
<style>
  .column {
    float: left;
  }

  #container {
    padding: 0 150px 0 100px;
  }

  #center {
    width: 100%
  }

  #left {
    width: 200px;
    margin-left: -100%;
    position: relative;
    right: 200px;
  }

  #right {
    width: 150px;
    margin-right: -150px;
  }

  #footer {
    clear: both;
  }
  /* 手写clearfix */
  .clearfix:after {
    content: '';
    display: table;
    clear: both;
  }
</style>
<body>
  <div id="header">header</div>
  <div id="container" class="clearfix">
    <div id="center" class="column">center</div>
    <div id="left" class="column">left</div>
    <div id="right" class="column">right</div>
  </div>
  <div id="footer">footer</div>
</body>
```

## 居中对齐
### 1. 水平剧中
* inline 元素：text-align: center
* block 元素：margin: auto
* absolute 元素：left: 50% + margin-left 负值
### 2. 垂直居中
* inline 元素：line-height 的值等于 height 值
* absolute 元素：top: 50% + margin-top 负值（需要知道该元素尺寸）
* absolute 元素：transform(-50%, -50%)
* absolute 元素：top,left,bottom,right=0 + margin:auto

## line-height 如何继承
* line-height: 30px，则继承该值
* line-height: 2，则继承该比例
* line-height: 200%，并不会继承该百分比，而是继承计算后的具体数值

## rem
* px，绝对长度单位
* em，相对长度单位，相对于父元素（用于 font-size 属性时，是相对父元素的 font-size，用于其他属性时，是相对于当前元素的 font-size）
* rem，相对长度单位，相对于根元素