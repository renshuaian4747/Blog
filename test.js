function debounce(fn, delay) {
  let timer;
  return function () {
    if (timer) {
      clearTimeout();
    }
    timer = setTimeout(() => {
      fn.bind(this, arguments);
      timer = null;
    }, delay);
    return;
  };
}

function throttle(fn, delay) {
  let timer;
  return function () {
    if (timer) return;
    timer = setTimeout(() => {
      fn.bind(this, arguments);
      timer = null;
    }, delay);
  };
}

Function.prototype.myCall = function () {
  const args = Array.prototype.slice.call(arguments);
  const newThis = args.shift();
  Object.prototype.tmpFunc = this;
  newThis.tmpFunc(...args);
  delete Object.prototype.tmpFunc;
};

Function.prototype.myApply = function (newThis, args) {
  const args = Array.prototype.slice.call(arguments);
  Object.prototype.tmpFunc = this;
  newThis.tmpFunc(...args);
  delete Object.prototype.tmpFunc;
};

Function.prototype.myBind = function () {
  const args = Array.prototype.slice.call(arguments);
  const newThis = args.shift();
  const tmpFunc = this;
  return function () {
    return tmpFunc.call(newThis, ...args);
  };
};
