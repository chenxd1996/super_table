import { FormItemProps } from "antd/lib/form";
import { InputProps } from "antd/lib/input";
import { InputNumberProps } from "antd/lib/input-number";
import { TreeSelectProps } from "antd/lib/tree-select";
import { SwitchProps } from "antd/lib/switch";
import { RateProps } from "antd/lib/rate";
import { IDateProps } from "./widgets/DateTimeRenderer";
import { ISelectProps } from "./widgets/SelectRenderer";
import { GetFieldDecoratorOptions } from "antd/lib/form/Form";

export enum WidgetTypes {
  INPUT = 'input',
  INPUTNUMBER = 'inputNumber',
  SELECT = 'select',
  DATETIMEPICKER = 'dateTimePicker',
  CHECKBOX = 'checkBox',
  UPLOAD = 'upload',
  RICHTEXT = 'richText',
  ARRAY = 'array',
  OBJECT = 'object',
  RATE = 'rate',
  SWITCH = 'switch',
  RADIO = 'radio',
  TREESELECT = 'treeSelect',
}

export enum FormModes {
  ADD = 'add',
  EDIT = 'edit',
  BOTH = 'BOTH',
}

interface DefaultProps {
  defaultValue?: any,
}

export interface IWidgetProps {
  [WidgetTypes.INPUT]: InputProps & DefaultProps;
  [WidgetTypes.INPUTNUMBER]: InputNumberProps & DefaultProps;
  [WidgetTypes.TREESELECT]: TreeSelectProps<any> & DefaultProps;
  [WidgetTypes.SWITCH]: SwitchProps & DefaultProps,
  [WidgetTypes.RATE]: RateProps & DefaultProps,
  [WidgetTypes.SELECT]: ISelectProps & DefaultProps,
  [WidgetTypes.DATETIMEPICKER]: IDateProps,
  [WidgetTypes.CHECKBOX]: DefaultProps,
  [WidgetTypes.ARRAY]: DefaultProps,
  [WidgetTypes.OBJECT]: DefaultProps,
  [WidgetTypes.UPLOAD]: DefaultProps,
  [WidgetTypes.RICHTEXT]: DefaultProps,
  [WidgetTypes.RADIO]: DefaultProps,
}

export interface IFormItemConfig {
  key?: string,
  dataIndex?: string,
  type: WidgetTypes,
  label?: string | Function,
  widgetConfig?: IWidgetProps[WidgetTypes],
  inputAdaptor?: Function;
  outputAdaptor?: Function;
  render?: (a: any, b: any, c: any) => React.ReactElement,
  mode?: FormModes,
  formItemProps?: FormItemProps,
  getFieldDecoratorOptions?: GetFieldDecoratorOptions,
  children?: Array<IFormItemConfig>, // Object类型或者Array类型才有
}