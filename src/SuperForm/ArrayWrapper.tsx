/**
 * ArrayWrapper对于Array类型的组件封装一层
 * 提供addItem、deleteItem和items，使得子组件使用更简单
 */
import React, { useState, useCallback } from 'react';
import { GetArrayItem, ComponentType } from './type';

interface IArrayWrapperProps {
  getArrayItem: GetArrayItem; // 新增子项
  initialValue?: Array<any>;
  WidgetClass?:  ComponentType;
}

export default React.memo((props: IArrayWrapperProps) => {
  const {
    initialValue = [],
    getArrayItem,
    WidgetClass,
    ...other
  } = props;
  const [items, setItems] = useState<Array<number>>(initialValue.map((item, index) => index));
  
  const addItem = useCallback(() => {
    items.push(items.length);
    setItems([...items]);
  }, [items]);

  const deleteItem = useCallback((index: number) => {
    items.splice(index, 1);
    setItems([...items]);
  }, [items]);
 
  if (WidgetClass) {
    return (
      <WidgetClass
        {...{
          ...other,
          addItem,
          deleteItem,
          items: items.map((index) => {
            return getArrayItem(index);
          }),
        }}
      />
    )
  }
  return null;
});