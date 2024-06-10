//this method guarantees that func is called at most once per delay
export const bufferize = <T extends Function>(func: T, delay: number): T => {
  let timeout: NodeJS.Timeout;
  const callable = (...args: any) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
  return callable as unknown as T;
};

export const first = <T>(array: T[]) => array[0];

export const last = <T>(array: T[]) => array[array.length - 1];

export const sum = (array: number[]) => {
  let res = 0;
  array.forEach((_) => (res += _));
  return res;
};

export const avg = (array: number[]) => sum(array) / array.length;

export const maxBy = <T>(array: T[], lambda: (val: T) => number) => {
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

export const minBy = <T>(array: T[], lambda: (val: T) => number) => maxBy(array, (_) => -lambda(_));

export const rDeepSearch = (elt: object, lambda: (str: any) => any): object => {
  if (Array.isArray(elt)) {
    return elt.map((_) => rDeepSearch(_, lambda));
  } else if (elt === Object(elt)) {
    return Object.entries(elt).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: rDeepSearch(value, lambda),
      }),
      {},
    );
  }
  return lambda(elt);
};
