export const isBoolean = (arg: any): arg is boolean => {
  return typeof arg === 'boolean';
}

export const isFunction = (arg: any): arg is Function => {
  return typeof arg === 'function';
}

export const sortArrByOrder = <T extends any>(arr: Array<T>, sortKey: string = 'key', order: Array<string | number>) => {
  const orderMap: { [key: string]: number } = {};
  if (Array.isArray(order)) {
    order.forEach((key, index) => {
      orderMap[key] = index;
    });
  }
  const leftArr: Array<T> = [];
  const rightArr: Array<T> = [];
  arr.forEach((item) => {
    const key = item[sortKey];
    const index = orderMap[key];
    if (Number.isInteger(index)) {
      leftArr[index] = item;
    } else {
      rightArr.push(item);
    }
  });
  arr.length = 0;
  arr.push(...rightArr, ...leftArr);
  return arr;
}