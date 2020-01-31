import React, { useCallback, ReactElement } from 'react';
import {
  InputAdaptor, OutputAdaptor,
  OnChange, OnFormChangeWrapper, FormValues,
} from './type';
import { WrappedFormUtils } from 'antd/lib/form/Form';

interface IWidgetWrapperProps {
  value?: any;
  onChange?: OnChange;
  inputAdaptor?: InputAdaptor;
  outAdaptor?: OutputAdaptor;
  // WidgetClass: ComponentType;
  // widgetProps: WidgetProps;
  elementToWrap: ReactElement;
  handleFormChange: OnFormChangeWrapper;
  dataIndex: string;
  form: WrappedFormUtils;
  currentValues: FormValues;
} 

export default React.forwardRef((props: IWidgetWrapperProps, ref) => {
  const {
    value,
    onChange,
    inputAdaptor,
    outAdaptor,
    // WidgetClass,
    // widgetProps,
    elementToWrap,
    handleFormChange,
    dataIndex,
    form,
    currentValues,
    ...other
  } = props;
  
  const originalProps = elementToWrap.props;

  const handleChange = useCallback((event: any) => {
    const { target = {} } = event;
    const value = (target && (target.value || target.checked)) || event;
    if (originalProps.onChange) {
      originalProps.onChange(event);
    }
    if (onChange) {
      onChange(event);
    }
    // handleFormChange({ [dataIndex]:  value });
    const error = form.getFieldError(dataIndex);
    let outputValue;
    if (!error || !error.length) {
      outputValue = typeof outAdaptor === 'function' ? outAdaptor(value) : value;
    }
    const change = { [dataIndex]: outputValue };
    handleFormChange(change);
  }, [dataIndex, form, handleFormChange, onChange, originalProps, outAdaptor]);

  let val = value;
  if (typeof inputAdaptor === 'function') {
    val = inputAdaptor(value);
  }

  const newProps = {
    ...other,
    ...originalProps,
    value: val,
    // value,
    onChange: handleChange,
    // ref,
  }

  return React.cloneElement(elementToWrap, newProps);
});