import React, { useState, useEffect } from 'react';
import Checkbox, { CheckboxGroupProps, CheckboxProps, CheckboxOptionType } from 'antd/lib/checkbox';
import { fetchOptions } from '../../../common';
import CheckboxGroup from 'antd/lib/checkbox/Group';

export type ICheckboxProps = {
  fetchConfig: {
    url: string;
    dataPath?: string;
    labelKey?: string;
    valueKey?: string;
  };
  options?: Array<CheckboxOptionType | string>;
  label?: string;
} & (CheckboxGroupProps | CheckboxProps);

export default React.memo((props: ICheckboxProps) => {
  const {
    options: options_,
    label,
    fetchConfig,
    ...otherProps
  } = props;

  const [options, setOptions] = useState(options_);

  useEffect(() => {
    if (fetchConfig) {
      const { url, dataPath, labelKey, valueKey } = fetchConfig;
      fetchOptions(url, dataPath, labelKey, valueKey).then((options) => {
        setOptions(options);
      });
    }
  }, [fetchConfig]);

  if (Array.isArray(options)) {
    return <CheckboxGroup options={options} {...otherProps as CheckboxGroupProps} />;
  }
  return <Checkbox {...otherProps as CheckboxProps}>{label}</Checkbox>;
});