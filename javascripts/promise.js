class MyPromise {
  state = 'pending'; // 'pending' | 'fulfilled' | 'rejected'
  value;
  reason;
  resolvedCbList = [];
  rejectedCbList = [];

  constructor(fn) {
    const resolvedHandler = (v) => {
      this.state = 'fulfilled';
      this.value = v;
      this.resolvedCbList.forEach((fn) => {
        fn(this.value);
      });
    };

    const rejectedHandler = (reason) => {
      this.state = 'rejected';
      this.reason = reason;
      this.rejectedCbList.forEach((fn) => {
        fn(this.reason);
      });
    };

    try {
      fn(resolvedHandler, rejectedHandler);
    } catch (err) {
      rejectedHandler(err);
    }
  }

  then(fn1, fn2) {
    fn1 = typeof fn1 === 'function' ? fn1 : (v) => v;
    fn2 = typeof fn2 === 'function' ? fn2 : (err) => err;
    if (this.state === 'pending') {
      return new MyPromise((resolve, reject) => {
        this.resolvedCbList.push(() => {
          try {
            const newValue = fn1(this.value);
            resolve(newValue);
          } catch (err) {
            reject(err);
          }
        });
        this.rejectedCbList.push(() => {
          try {
            const newErr = fn2(this.reason);
            resolve(newErr);
          } catch (err) {
            reject(err);
          }
        });
      });
    }
    if (this.state === 'fulfilled') {
      return new MyPromise((resolve, reject) => {
        try {
          const newValue = fn1(this.value);
          resolve(newValue);
        } catch (err) {
          reject(err);
        }
      });
    }
    if (this.state === 'rejected') {
      return new MyPromise((resolve, reject) => {
        try {
          const newErr = fn2(this.reason);
          resolve(newErr);
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  catch(fn) {
    this.then(null, fn);
  }
}

MyPromise.resolve = function (v) {
  return new MyPromise((resolve, reject) => {
    resolve(v);
  });
};

MyPromise.reject = function (v) {
  return new MyPromise((resolve, reject) => {
    reject(v);
  });
};

MyPromise.all = function (list) {
  return new MyPromise((resolve, reject) => {
    let count = 0;
    const res = [];
    list.forEach((p, index) => {
      p.then((value) => {
        res[index] = value;
        count++;
        if (count === list.length) {
          resolve(res);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  });
};

MyPromise.race = function (list) {
  return new MyPromise((resolve, reject) => {
    let flag = false;
    list.forEach((p) => {
      p.then((value) => {
        if (!flag) {
          flag = true;
          resolve(value);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  });
};
