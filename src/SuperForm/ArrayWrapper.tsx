import React, { useState, useCallback } from 'react';
import { GetArrayItem, ComponentType } from './type';

interface IArrayWrapperProps {
  getArrayItem: GetArrayItem; // 新增子项
  initialValue?: Array<any>;
  Widget:  ComponentType;
}

export default React.memo((props: IArrayWrapperProps) => {
  const { initialValue = [], getArrayItem, Widget, ...other } = props;
  const [items, setItems] = useState<Array<number>>(initialValue.map((item, index) => index));
  
  const addItem = useCallback(() => {
    items.push(items.length);
    setItems([...items]);
  }, [items]);

  const deleteItem = useCallback((index: number) => {
    items.splice(index, 1);
    setItems([...items]);
  }, [items]);
  
  return Widget && (
    <Widget
      {...{
        ...other,
        addItem,
        deleteItem,
        items: items.map((index) => {
          return getArrayItem(index);
        }),
      }}
    />
  );
});