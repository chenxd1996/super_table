import React, { useCallback } from 'react';
import { DatePicker } from 'antd';
import { MonthPickerProps, WeekPickerProps, DatePickerProps, RangePickerProps } from 'antd/lib/date-picker/interface';
import { TimePickerProps } from 'antd/lib/time-picker';
import moment from 'moment';

const { RangePicker, MonthPicker, WeekPicker } = DatePicker;

enum DateModes {
  Second = 'Second',
  MillionSecond = 'MillionSecond',
}

enum DateTypes {
  Date = 'Date',
  Month = 'Month',
  Week = 'Week',
  Range = 'Range',
  Time = 'Time',
}

export interface IPickersProps {
  [DateTypes.Date]: DatePickerProps,
  [DateTypes.Month]: MonthPickerProps,
  [DateTypes.Week]: WeekPickerProps,
  [DateTypes.Range]: RangePickerProps,
  [DateTypes.Time]: TimePickerProps,
}

type RangeValues = [number?, number?];

export type IDateProps = IPickersProps[DateTypes] & {
  dateType: DateTypes,
  mode: DateModes,
  value: number | RangeValues,
  onChange: (value: number | RangeValues) => {}
};

export default (props: IDateProps) => {
  const { dateType, mode, value, onChange, ...other } = props;
  
  // antd的日期组件输入输出都是momonet
  const getMomentValue = useCallback((rawValue?: number) => {
    if (rawValue === undefined) {
      return rawValue;
    }
    if (typeof rawValue === 'number' && mode === DateModes.Second) {
      rawValue = rawValue * 1000;
    }
    return moment(new Date(rawValue));
  }, [mode]);

  const getMomentValues = useCallback((rawValues: RangeValues) => {
    return rawValues.map((rawValue) => getMomentValue(rawValue)) as RangePickerProps['value'];
  }, [getMomentValue]);

  const formatValue = useCallback((momentValue: moment.Moment) => {
    const unixTimeStamp = momentValue.unix();
    if (mode === DateModes.Second) {
      return unixTimeStamp;
    }
    return unixTimeStamp *  1000;
  }, [mode]);

  const formatValues = useCallback((momentValues: [moment.Moment, moment.Moment]) => {
    return momentValues.map((momentValue) => formatValue(momentValue)) as RangeValues;
  }, [formatValue])

  const handleChange = useCallback((value) => {
    if (dateType === DateTypes.Range) {
      onChange(formatValues(value));
    } else {
      onChange(formatValue(value));
    }
  }, [dateType, onChange, formatValues, formatValue]);

  const renderFunc = useCallback(() => {
    switch (dateType) {
      case DateTypes.Date: {
        const momentValue = getMomentValue(value as number);
        return (
          <DatePicker
            value={momentValue}
            {...other as DatePickerProps}
            onChange={handleChange}
          />
        );
      }
      case DateTypes.Month: {
        const momentValue = getMomentValue(value as number);
        return (
          <MonthPicker
            value={momentValue}
            { ...other as IPickersProps }
            onChange={handleChange}
          />
        )
      }
      case DateTypes.Week: {
        const momentValue = getMomentValue(value as number);
        return (
          <WeekPicker
            value={momentValue}
            { ...other as WeekPickerProps }
            onChange={handleChange}
          />
        )
      }
      case DateTypes.Range: {
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
  }, [dateType, getMomentValue, getMomentValues, handleChange, other, value]);

  return renderFunc();
}

