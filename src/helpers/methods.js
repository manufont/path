//this method guarantees that func is called at most once per delay
export const bufferize = (func, delay) => {
  let timeout = null;
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, delay);
  };
};

export const sum = (array) => {
  let res = 0;
  array.forEach((_) => (res += _));
  return res;
};

export const avg = (array) => sum(array) / array.length;
