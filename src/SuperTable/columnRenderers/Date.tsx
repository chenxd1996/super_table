import React from 'react';
import moment from 'moment';

export interface DateRendererConfig {
  format?: string;
  timestampType?: 'millionsecond' | 'second';
}

type DateRendererProps = {
  value: any;
} & DateRendererConfig;

export default React.memo((props: DateRendererProps) => {
  const {
    value,
    format = 'YYYY-MM-DD HH:mm:ss',
    timestampType = 'millionsecond',
  } = props;

  if (!value) {
    return null;
  }

  let dateStr = '';

  if (timestampType === 'millionsecond') {
    dateStr = moment(new Date(value)).format(format);
  }
  dateStr = moment(new Date(value * 1000)).format(format);

  return <span>{dateStr}</span>
});