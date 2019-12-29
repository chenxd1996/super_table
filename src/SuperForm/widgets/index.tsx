import {
  Input,
  InputNumber,
  TreeSelect,
  Switch,
  Rate,
} from 'antd';

import DateTimePicker from './DateTimeRenderer';
import Select from './SelectRenderer';
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
  [WidgetTypes.CHECKBOX]: null,
  [WidgetTypes.ARRAY]: null,
  [WidgetTypes.OBJECT]: null,
  [WidgetTypes.UPLOAD]: null,
  [WidgetTypes.RICHTEXT]: null,
  [WidgetTypes.RADIO]: null,
}

export const getWidget = (type: WidgetTypes) => {
  return widgetsMap[type];
}
