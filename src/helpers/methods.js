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
