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

export const first = (array) => array[0];

export const last = (array) => array[array.length - 1];

export const sum = (array) => {
  let res = 0;
  array.forEach((_) => (res += _));
  return res;
};

export const avg = (array) => sum(array) / array.length;

export const maxBy = (array, lambda) => {
  let max = Number.NEGATIVE_INFINITY;
  let index = -1;
  array.forEach((elt, i) => {
    const value = lambda(elt);
    if (value > max) {
      max = value;
      index = i;
    }
  });
  if (index === -1) return null;
  return array[index];
};

export const minBy = (array, lambda) => maxBy(array, (_) => -lambda(_));
