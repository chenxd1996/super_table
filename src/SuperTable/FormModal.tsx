import React, { ReactNode, useCallback, useRef } from 'react';
import SuperForm from '../SuperForm';
import { IFormItemConfig, FormValues, } from '../SuperForm/type';
import { Modal } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import { isFunction } from '../common';
import { FormModalModes } from './type';

export interface IFormModalProps {
  formItems: Array<IFormItemConfig>;
  visible: boolean;
  title?: string | ReactNode;
  okText?: string;
  okBtnProps?: ButtonProps;
  cancelText?: string;
  cancelBtnProps?: ButtonProps;
  onOk?: (values: FormValues) => void;
  onCancel?: () => void;
  mode: FormModalModes;
  formFieldsOrder?: Array<string>;
}

interface IStaticProperties {
  values: FormValues;
}

const DEFAULT_CREATE_TITLE = '创建数据';
const DEFAULT_EDIT_TITLE = '编辑数据';
const DEFAULT_OK_TEXT = '保存';
const DEFAULT_CANCAL_TEXT = '取消';

export default (props: IFormModalProps) => {
  
  const defaultTitle = props.mode === FormModalModes.ADD ? DEFAULT_CREATE_TITLE : DEFAULT_EDIT_TITLE;

  const {
    formItems,
    visible,
    title = defaultTitle,
    okText = DEFAULT_OK_TEXT,
    okBtnProps,
    cancelText = DEFAULT_CANCAL_TEXT,
    cancelBtnProps,
    onOk,
    onCancel,
    formFieldsOrder,
  } = props;


  const _this = useRef<IStaticProperties>({
    values: {},
  }).current;

  const handleOk = useCallback(() => {
    if (isFunction(onOk)) {
      onOk(_this.values);
    }
  }, [_this.values, onOk]);

  const handleChange = useCallback((values: FormValues) => {
    _this.values = values;
  }, [_this.values]);

  return (
    <Modal
      visible={visible}
      title={title}
      okText={okText}
      okButtonProps={okBtnProps}
      cancelText={cancelText}
      cancelButtonProps={cancelBtnProps}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <SuperForm
        fieldItems={formItems}
        onChange={handleChange}
        layout="inline"
        formFieldsOrder={formFieldsOrder}
      />
    </Modal>
  );
}