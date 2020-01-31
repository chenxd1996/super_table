import React, { useState, useEffect } from 'react';
import Radio, { RadioGroupProps, RadioProps } from 'antd/lib/radio';
import RadioGroup from 'antd/lib/radio/group';
import { CheckboxOptionType } from 'antd/lib/checkbox/Group';

import { fetchOptions } from '../../../common';

export type IRadioProps = {
  fetchConfig: {
    url: string;
    dataPath?: string;
    labelKey?: string;
    valueKey?: string;
  };
  options?: Array<CheckboxOptionType | string>;
  label?: string;
} & (RadioGroupProps | RadioProps);

export default React.memo((props: IRadioProps) => {
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
    return <RadioGroup options={options} {...otherProps as RadioGroupProps} />;
  }
  return <Radio {...otherProps as RadioProps}>{label}</Radio>;
});