import React, { useCallback } from 'react';
import { DatePicker } from 'antd';
import { MonthPickerProps, WeekPickerProps, DatePickerProps, RangePickerProps } from 'antd/lib/date-picker/interface';
import { TimePickerProps } from 'antd/lib/time-picker';
import moment from 'moment';

const { RangePicker, MonthPicker, WeekPicker } = DatePicker;

const timestampTypes = {
  second: 'second',
  millionsecond: 'millionsecond',
};

type TimestampType = keyof typeof timestampTypes;

enum DateModes {
  Date = 'Date',
  Month = 'Month',
  Week = 'Week',
  Range = 'Range',
  Time = 'Time',
}

interface IPickersProps {
  [DateModes.Date]: DatePickerProps,
  [DateModes.Month]: MonthPickerProps,
  [DateModes.Week]: WeekPickerProps,
  [DateModes.Range]: RangePickerProps,
  [DateModes.Time]: TimePickerProps,
}

type RangeValues = [number?, number?];

export type IDateProps = IPickersProps[DateModes] & {
  mode?: DateModes,
  timestampType?: TimestampType,
  value: number | RangeValues,
  onChange: (value: number | RangeValues) => {}
};

export default React.memo((props: IDateProps) => {
  const {
    mode = DateModes.Date,
    timestampType = timestampTypes.millionsecond,
    value,
    onChange,
    ...other
  } = props;
  
  // antd的日期组件输入输出都是momonet
  const getMomentValue = useCallback((rawValue?: number) => {
    if (rawValue === undefined) {
      return rawValue;
    }
    if (typeof rawValue === 'number' && timestampType === timestampTypes.second) {
      rawValue = rawValue * 1000;
    }
    return moment(new Date(rawValue));
  }, [timestampType]);

  const getMomentValues = useCallback((rawValues: RangeValues) => {
    return rawValues.map((rawValue) => getMomentValue(rawValue)) as RangePickerProps['value'];
  }, [getMomentValue]);

  const formatValue = useCallback((momentValue: moment.Moment) => {
    const unixTimeStamp = momentValue.unix();
    if (timestampType === timestampTypes.second) {
      return unixTimeStamp;
    }
    return unixTimeStamp *  1000;
  }, [timestampType]);

  const formatValues = useCallback((momentValues: [moment.Moment, moment.Moment]) => {
    return momentValues.map((momentValue) => formatValue(momentValue)) as RangeValues;
  }, [formatValue])

  const handleChange = useCallback((value) => {
    if (mode === DateModes.Range) {
      onChange(formatValues(value));
    } else {
      onChange(formatValue(value));
    }
  }, [mode, onChange, formatValues, formatValue]);

  const renderFunc = useCallback(() => {
    switch (mode) {
      case DateModes.Date: {
        const momentValue = getMomentValue(value as number);
        return (
          <DatePicker
            value={momentValue}
            {...other as DatePickerProps}
            onChange={handleChange}
          />
        );
      }
      case DateModes.Month: {
        const momentValue = getMomentValue(value as number);
        return (
          <MonthPicker
            value={momentValue}
            { ...other as MonthPickerProps }
            onChange={handleChange}
          />
        )
      }
      case DateModes.Week: {
        const momentValue = getMomentValue(value as number);
        return (
          <WeekPicker
            value={momentValue}
            { ...other as WeekPickerProps }
            onChange={handleChange}
          />
        )
      }
      case DateModes.Range: {
        const monmentValues = getMomentValues(value as RangeValues);
        return (
          <RangePicker
            value={monmentValues}
            { ...other as RangePickerProps}
            onChange={handleChange}
          />
        )
      }
      default:
        return null;
    }
  }, [mode, getMomentValue, getMomentValues, handleChange, other, value]);

  return renderFunc();
});