import {
  Input,
  InputNumber,
  TreeSelect,
  Switch,
  Rate,
  Slider,
  Cascader,
  Radio,
  Checkbox,
} from 'antd';

import DateTimePicker from './DateTimeRenderer';
import Select from './SelectRenderer';
import ArrayRenderer from './ArrayRenderer';
import { WidgetTypes, ComponentType } from '../type';

const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

// todo: RICHTEXT
export const widgetsMap = {
  [WidgetTypes.INPUT]: Input,
  [WidgetTypes.INPUTNUMBER]: InputNumber,
  [WidgetTypes.TREESELECT]: TreeSelect,
  [WidgetTypes.SWITCH]: Switch,
  [WidgetTypes.RATE]: Rate,
  [WidgetTypes.SELECT]: Select,
  [WidgetTypes.DATETIMEPICKER]: DateTimePicker,
  [WidgetTypes.CHECKBOX]: CheckboxGroup,
  [WidgetTypes.ARRAY]: ArrayRenderer,
  [WidgetTypes.OBJECT]: null,
  [WidgetTypes.UPLOAD]: Input,
  [WidgetTypes.RICHTEXT]: Input,
  [WidgetTypes.RADIO]: RadioGroup,
  [WidgetTypes.SLIDER]: Slider,
  [WidgetTypes.CASCADER]: Cascader,
}


export const getWidget = (type: WidgetTypes) : ComponentType => {
  return widgetsMap[type] as ComponentType;
}
