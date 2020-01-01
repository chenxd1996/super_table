import { FormItemProps } from "antd/lib/form";
import { InputProps } from "antd/lib/input";
import { InputNumberProps } from "antd/lib/input-number";
import { TreeSelectProps } from "antd/lib/tree-select";
import { SwitchProps } from "antd/lib/switch";
import { RateProps } from "antd/lib/rate";
import { IDateProps } from "./widgets/DateTimeRenderer";
import { ISelectProps } from "./widgets/SelectRenderer";
import { WrappedFormUtils, ValidationRule } from "antd/lib/form/Form";

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

export type GetArrayItem = (index: number) => Array<React.ReactElement>;
export interface DefaultWidgetProps {
  defaultValue?: any,
  childrenWidgets?: Array<React.ReactNode>;
  getArrayItem?: GetArrayItem;
}

export interface IWidgetProps {
  [WidgetTypes.INPUT]: InputProps & DefaultWidgetProps;
  [WidgetTypes.INPUTNUMBER]: InputNumberProps & DefaultWidgetProps;
  [WidgetTypes.TREESELECT]: TreeSelectProps<any> & DefaultWidgetProps;
  [WidgetTypes.SWITCH]: SwitchProps & DefaultWidgetProps,
  [WidgetTypes.RATE]: RateProps & DefaultWidgetProps,
  [WidgetTypes.SELECT]: ISelectProps & DefaultWidgetProps,
  [WidgetTypes.DATETIMEPICKER]: IDateProps,
  [WidgetTypes.CHECKBOX]: DefaultWidgetProps,
  [WidgetTypes.ARRAY]: DefaultWidgetProps,
  [WidgetTypes.OBJECT]: DefaultWidgetProps,
  [WidgetTypes.UPLOAD]: DefaultWidgetProps,
  [WidgetTypes.RICHTEXT]: DefaultWidgetProps,
  [WidgetTypes.RADIO]: DefaultWidgetProps,
}

interface AppendRule {
  // 这里因为antd自己的定义文件就是写的any，所以就只好也写any了
  validator?: (
    arg: {
      rule?: any, callback?: any, source?: any, options?: any, value?: any,
      formValues: {
        [field: string]: any,
      },
      form: WrappedFormUtils;
    }
  ) => any | undefined;
};

export type WrappedRule = AppendRule & Pick<ValidationRule, Exclude<keyof ValidationRule, keyof AppendRule>>;

export type LabelType = string | React.ReactNode | Function;

export interface IFormItemConfig {
  key?: string,
  dataIndex?: string,
  type: WidgetTypes,
  label?: LabelType,
  widgetConfig?: IWidgetProps[WidgetTypes],
  inputAdaptor?: Function;
  outputAdaptor?: Function;
  render?: (args: {
    widgetProps: {
      [field: string]: any,
    },
    FormItem: React.ComponentClass,
    getFieldDecorator: GetFieldDecoratorType,
    widgetElement: React.ReactElement | null,
    fieldInfo: IFormItemConfig,
  }) => React.ReactElement,
  mode?: FormModes,
  formItemProps?: FormItemProps,
  getFieldDecoratorOptions?: { rules?: WrappedRule[] },
  children?: Array<IFormItemConfig>, // Object类型或者Array类型才有
}

export type GetFieldDecoratorType = WrappedFormUtils['getFieldDecorator'];

export type WidgetProps = IWidgetProps[WidgetTypes];