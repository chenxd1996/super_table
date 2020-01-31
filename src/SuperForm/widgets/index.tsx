import {
  Input,
  InputNumber,
  TreeSelect,
  Switch,
  Rate,
  Slider,
  Cascader,
} from 'antd';

import DateTimePicker from './DateTime';
import SelectRenderer from './Select';
import ArrayRenderer from './Array';
import UploadRenderer from './Upload';
import RadioRenderer from './Radio';
import CheckbocRenderer from './Checkbox';
import { WidgetTypes, ComponentType } from '../type';

// todo: RICHTEXT
export const widgetsMap = {
  [WidgetTypes.INPUT]: Input,
  [WidgetTypes.INPUTNUMBER]: InputNumber,
  [WidgetTypes.TREESELECT]: TreeSelect,
  [WidgetTypes.SWITCH]: Switch,
  [WidgetTypes.RATE]: Rate,
  [WidgetTypes.SELECT]: SelectRenderer,
  [WidgetTypes.DATETIMEPICKER]: DateTimePicker,
  [WidgetTypes.CHECKBOX]: CheckbocRenderer,
  [WidgetTypes.ARRAY]: ArrayRenderer,
  [WidgetTypes.OBJECT]: null,
  [WidgetTypes.UPLOAD]: UploadRenderer,
  [WidgetTypes.RICHTEXT]: Input,
  [WidgetTypes.RADIO]: RadioRenderer,
  [WidgetTypes.SLIDER]: Slider,
  [WidgetTypes.CASCADER]: Cascader,
}


export const getWidget = (type: WidgetTypes) : ComponentType => {
  return widgetsMap[type] as ComponentType;
}
