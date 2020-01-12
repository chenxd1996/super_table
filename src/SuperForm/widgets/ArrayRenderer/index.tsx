/* eslint-disable react-hooks/exhaustive-deps */
import React, { ReactElement } from 'react';
import { FormItemProps } from 'antd/lib/form';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import ArrayItem from './ArrayItem';
import { GetFieldDecoratorType } from '../../type';

type DeleteArrayItem = (index: number) => void;

export interface IArrayRendererProps {
  // getArrayItem: GetArrayItem; // 新增子项
  label: string; // 标签名
  FormItem: React.ComponentClass<FormItemProps>, // antd的FormItem组件
  getFieldDecorator: GetFieldDecoratorType,
  formItemProps: FormItemProps, // 传给formItem的props
  nodeKey: string, // 节点的key值
  getArrayItemTitle?: (index: number) => string, // 新增子项的标题
  arrayItemContainerStyle?: React.CSSProperties; // 子项容器的样式
  addBtnText?: string; // 添加按钮的文案
  addBtnStyle?: React.CSSProperties; // 添加按钮的样式
  getAddBtn?: (addItem: () => void) => React.ReactElement; // 定制添加按钮
  addBtnProps?: ButtonProps; // 添加按钮的props
  deleteBtnText?: string; // 删除按钮的文案
  deleteBtnStyle?: React.CSSProperties; // 删除按钮样式
  getDeleteBtn?: (deleteArrayItem: DeleteArrayItem) => React.ReactElement; // 定制删除按钮
  addItem: () => void;
  deleteItem: (index: number) => void;
  items: Array<Array<ReactElement>>;
  maxLen: number;
  minLen: number;
  // initialValue?: Array<any>;
};

const DEFAULT_ADD_TEXT = '添加子项';
const DEFAULT_DELETE_TEXT = '删除';
const DEFAULT_ARRAY_ITEM_TITLE = '子项';

const getDefaultArrayItemTitle = (index: number) => {
  return `${DEFAULT_ARRAY_ITEM_TITLE}${index + 1}`;
}

interface ILabelProps {
  label: string;
  addBtnText: string;
  addItem: () => void;
  addBtnStyle?: React.CSSProperties;
  addBtnProps?:  ButtonProps;
  addBtn?: React.ReactElement;
  canAdd: boolean;
}
const Label = React.memo((props: ILabelProps) => {
  const {
    label,
    addItem,
    addBtnStyle,
    addBtnProps,
    addBtn,
    addBtnText,
    canAdd,
  } = props;
  return (
    <>
      {label}
      {
        canAdd ? addBtn || (
          <Button
            style={addBtnStyle}
            onClick={addItem}
            size="small"
            type="primary"
            {...addBtnProps}
          >{addBtnText}</Button>
        ) : null
      }
    </>
  );
});

export default React.memo((props: IArrayRendererProps) => {
  const {
    label,
    FormItem,
    nodeKey,
    formItemProps,
    getArrayItemTitle,
    arrayItemContainerStyle,
    addBtnText = DEFAULT_ADD_TEXT,
    addBtnStyle,
    getAddBtn,
    deleteBtnText = DEFAULT_DELETE_TEXT,
    deleteBtnStyle,
    getDeleteBtn,
    addItem,
    deleteItem,
    items,
    minLen = 0,
    maxLen = Number.MAX_SAFE_INTEGER,
    // getFieldDecorator,
    // defaultValue,
    // initialValue = [],
  } = props;

  const canAdd = items.length < maxLen;
  const canDelete = items.length > minLen;

  const labelElement = (
    <Label
      label={label}
      addBtnText={addBtnText}
      addItem={addItem}
      addBtnStyle={addBtnStyle}
      addBtn={getAddBtn && getAddBtn(addItem)}
      canAdd={canAdd}
    />
  );

  return (
    <FormItem
      label={labelElement}
      key={nodeKey}
      {...formItemProps}
    >
      {/* {
        getFieldDecorator(nodeKey, {
          initialValue: defaultValue,
        })(<div />)
      } */}
      {
        items.map((subFields, index) => {
          const arrayItemTitle = getArrayItemTitle ?
            getArrayItemTitle(index) : getDefaultArrayItemTitle(index);
          return (
            <ArrayItem
              items={subFields}
              key={index}
              arrayItemTitle={arrayItemTitle}
              arrayItemContainerStyle={arrayItemContainerStyle}
              deleteBtnText={deleteBtnText}
              deleteBtnStyle={deleteBtnStyle}
              deleteBtn={getDeleteBtn && getDeleteBtn(deleteItem)}
              deleteItem={() => deleteItem(index)}
              canDelete={canDelete}
            />
          );
        })
      }
    </FormItem>
  );
});