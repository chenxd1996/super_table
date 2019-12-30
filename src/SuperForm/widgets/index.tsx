import {
  Input,
  InputNumber,
  TreeSelect,
  Switch,
  Rate,
} from 'antd';

import DateTimePicker, { IDateProps } from './DateTimeRenderer';
import Select, { ISelectProps } from './SelectRenderer';
import { WidgetTypes } from '../type';


// todo: null都为未完成的组件
export const widgetsMap = {
  [WidgetTypes.INPUT]: Input,
  [WidgetTypes.INPUTNUMBER]: InputNumber,
  [WidgetTypes.TREESELECT]: TreeSelect,
  [WidgetTypes.SWITCH]: Switch,
  [WidgetTypes.RATE]: Rate,
  [WidgetTypes.SELECT]: Select,
  [WidgetTypes.DATETIMEPICKER]: DateTimePicker,
  [WidgetTypes.CHECKBOX]: Input,
  [WidgetTypes.ARRAY]: Input,
  [WidgetTypes.OBJECT]: Input,
  [WidgetTypes.UPLOAD]: Input,
  [WidgetTypes.RICHTEXT]: Input,
  [WidgetTypes.RADIO]: Input,
}

type WrappedComponentProps = ISelectProps | IDateProps | any;

export const getWidget = (type: WidgetTypes) : React.ComponentClass | React.FunctionComponent<WrappedComponentProps> => {
  return widgetsMap[type];
}
