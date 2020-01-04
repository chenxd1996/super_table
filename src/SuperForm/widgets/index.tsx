import {
  Input,
  InputNumber,
  TreeSelect,
  Switch,
  Rate,
} from 'antd';

import DateTimePicker from './DateTimeRenderer';
import Select from './SelectRenderer';
import ArrayRenderer from './ArrayRenderer';
import { WidgetTypes, ComponentType } from '../type';


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
  [WidgetTypes.ARRAY]: ArrayRenderer,
  [WidgetTypes.OBJECT]: null,
  [WidgetTypes.UPLOAD]: Input,
  [WidgetTypes.RICHTEXT]: Input,
  [WidgetTypes.RADIO]: Input,
}


export const getWidget = (type: WidgetTypes) : ComponentType => {
  return widgetsMap[type];
}
