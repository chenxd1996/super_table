import React, { ReactElement } from 'react';
import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';

const { Option } = Select;

export type ISelectProps = {
  options: Array<{
    value?: number | string,
    text?: string | ReactElement,
  }>,
} & SelectProps;

export default React.memo((props: ISelectProps) => {
  const { options, ...other } = props;

  return (
    <Select {...other} >
      {
        options.map((option = {}) => {
          const { value, text } = option;
          return <Option value={value} key={value}>{text}</Option>
        })
      }
    </Select>
  )
});