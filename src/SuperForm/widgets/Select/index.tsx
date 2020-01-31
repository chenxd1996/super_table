import React, { ReactElement, useEffect, useState } from 'react';
import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import { fetchOptions } from '../../../common';

const { Option } = Select;

export type ISelectProps = {
  options: Array<{
    value: number | string,
    label: string | ReactElement,
  }>,
  fetchConfig: {
    url: string;
    dataPath?: string;
    labelKey?: string;
    valueKey?: string;
  }
} & SelectProps;

export default React.memo((props: ISelectProps) => {
  const {
    options: options_ = [],
    fetchConfig,
    ...other
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

  return (
    <Select {...other} >
      {
        options.map((option) => {
          const { value, label } = option || {};
          return <Option value={value} key={value}>{label}</Option>
        })
      }
    </Select>
  )
});