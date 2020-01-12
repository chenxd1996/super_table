import { useState } from "react";

export const isBoolean = (arg: any): arg is boolean => {
  return typeof arg === 'boolean';
}

export const isFunction = (arg: any): arg is Function => {
  return typeof arg === 'function';
}