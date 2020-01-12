import React, { useCallback } from 'react';
import {
  InputAdaptor, OutputAdaptor,
  ComponentType, WidgetProps, OnChange, OnFormChangeWrapper, FormValues,
} from './type';
import { WrappedFormUtils } from 'antd/lib/form/Form';

interface IWidgetWrapperProps {
  value?: any;
  onChange?: OnChange;
  inputAdaptor?: InputAdaptor;
  outAdaptor?: OutputAdaptor;
  WidgetClass: ComponentType;
  widgetProps: WidgetProps;
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
    WidgetClass,
    widgetProps,
    handleFormChange,
    dataIndex,
    form,
    currentValues,
    ...other
  } = props;

  const handleChange = useCallback((event: any) => {
    const value = (event && event.target && event.target.value) || event;
    if (widgetProps.onChange) {
      widgetProps.onChange(event);
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
  }, [dataIndex, form, handleFormChange, onChange, outAdaptor, widgetProps]);

  let val = value;
  if (typeof inputAdaptor === 'function') {
    val = inputAdaptor(value);
  }

  const newWidgetProps = {
    ...other,
    ...widgetProps,
    value: val,
    // value,
    onChange: handleChange,
    // ref,
  }

  return WidgetClass && (
    <WidgetClass
      {...newWidgetProps}
    />
  );
});