import { ReactElement } from "react";
import shortid from "shortid";
import _get from 'lodash.get';

export const isBoolean = (arg: any): arg is boolean => {
  return typeof arg === 'boolean';
};

export const isFunction = (arg: any): arg is Function => {
  return typeof arg === 'function';
};

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
};

export const addKeyToArrayElements = (elements: Array<ReactElement> = []) => {
  return elements.map((element) => {
    if (element.key === undefined) {
      element.key = shortid.generate();
    }
    return element;
  });
};

export const fetchData = async (url: string, dataPath?: string) => {
  const response = await fetch(url, {
    mode: 'cors',
  });
  const responseJson = response.json || {};
  if (dataPath) {
    return _get(responseJson, dataPath);
  }
  return responseJson;
}

export const fetchOptions = async (
  url: string,
  dataPath: string | undefined,
  labelKey: string | undefined = 'label',
  valueKey: string | undefined = 'value',
): Promise<Array<{
   value: number | string,
  label: string,
}>> => {
  try {
    const data = await fetchData(url, dataPath);
    if (Array.isArray(data)) {
      return data.map((item) => {
        const label = _get(item, labelKey);
        const value = _get(item, valueKey);
        return {
          label,
          value,
        }
      });
    }
    return [];
  } catch (e) {
    console.error('fetch options error:', e);
    throw e;
  }
}