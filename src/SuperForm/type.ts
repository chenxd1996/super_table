import { WrappedFormUtils, ValidationRule, GetFieldDecoratorOptions } from "antd/lib/form/Form";
import { FormItemProps } from "antd/lib/form";
import { InputProps } from "antd/lib/input";
import { InputNumberProps } from "antd/lib/input-number";
import { TreeSelectProps } from "antd/lib/tree-select";
import { SwitchProps } from "antd/lib/switch";
import { RateProps } from "antd/lib/rate";
import { IDateProps } from "./widgets/DateTimeRenderer";
import { ISelectProps } from "./widgets/SelectRenderer";
import { IArrayRendererProps } from './widgets/ArrayRenderer';
import { SliderProps } from "antd/lib/slider";
import { CascaderProps } from "antd/lib/cascader";
import { RadioGroupProps } from "antd/lib/radio";
import { CheckboxGroupProps } from "antd/lib/checkbox";
import { IUploadRenerProps } from "./widgets/UploadRenderer";
import { ReactElement, ReactNode } from "react";

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
  SLIDER = 'slider',
  CASCADER = 'cascader',
}

export enum FormModes {
  ADD = 'add',
  EDIT = 'edit',
  BOTH = 'BOTH',
}

export type GetArrayItem = (index: number) => React.ReactNode;
export interface DefaultWidgetProps {
  defaultValue?: any,
  childrenWidgets?: Array<React.ReactNode>;
  getArrayItem?: GetArrayItem;
  onChange?: OnChange;
}

export interface IWidgetProps {
  [WidgetTypes.INPUT]: InputProps & DefaultWidgetProps;
  [WidgetTypes.INPUTNUMBER]: InputNumberProps & DefaultWidgetProps;
  [WidgetTypes.TREESELECT]: TreeSelectProps<any> & DefaultWidgetProps;
  [WidgetTypes.SWITCH]: SwitchProps & DefaultWidgetProps;
  [WidgetTypes.RATE]: RateProps & DefaultWidgetProps;
  [WidgetTypes.SELECT]: ISelectProps & DefaultWidgetProps;
  [WidgetTypes.DATETIMEPICKER]: IDateProps &  DefaultWidgetProps;
  [WidgetTypes.CHECKBOX]: CheckboxGroupProps & DefaultWidgetProps;
  [WidgetTypes.ARRAY]: IArrayRendererProps & DefaultWidgetProps;
  [WidgetTypes.OBJECT]: DefaultWidgetProps & DefaultWidgetProps;
  [WidgetTypes.UPLOAD]: IUploadRenerProps & DefaultWidgetProps;
  [WidgetTypes.RICHTEXT]: DefaultWidgetProps & DefaultWidgetProps;
  [WidgetTypes.RADIO]: RadioGroupProps & DefaultWidgetProps;
  [WidgetTypes.SLIDER]: SliderProps & DefaultWidgetProps;
  [WidgetTypes.CASCADER]: CascaderProps & DefaultWidgetProps;
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

export type InputAdaptor = (value: any) => any;
export type OutputAdaptor = (value: any) => any;

export interface IFormItemConfig {
  key?: string,
  dataIndex?: string,
  type: WidgetTypes,
  label?: LabelType,
  widgetConfig?: IWidgetProps[WidgetTypes],
  inputAdaptor?: InputAdaptor;
  outputAdaptor?: OutputAdaptor;
  getRenderer?: (args: {
    value: any,
    values: FormValues,
    DefaultRenderer: ComponentType,
    widgetProps: {
      [field: string]: any,
    },
    FormItem: React.ComponentClass,
    getFieldDecorator: GetFieldDecoratorType,
  }) => ReactElement | null,
  mode?: FormModes,
  formItemProps?: FormItemProps,
  getFieldDecoratorOptions?: CustomGetFieldDecoratorOptions,
  children?: Array<IFormItemConfig>, // Object类型或者Array类型才有
}


interface AppendGetFieldDecoratorOptions {
  rules?: WrappedRule[],
}
export type CustomGetFieldDecoratorOptions = 
  AppendGetFieldDecoratorOptions & Pick<GetFieldDecoratorOptions, Exclude<keyof GetFieldDecoratorOptions, keyof AppendGetFieldDecoratorOptions>>;

export type GetFieldDecoratorWrapper =
  <T extends Object = {}>(id: keyof T, options?: CustomGetFieldDecoratorOptions | undefined) => (node: React.ReactNode) => React.ReactNode;

export type GetFieldDecoratorType = WrappedFormUtils['getFieldDecorator'];

export type WidgetProps = IWidgetProps[WidgetTypes];

export interface FormValues {
  [field: string]: any;
}

export type ComponentType<T = any> = React.ComponentClass<T> | React.FunctionComponent<T> | null;
export type OnChange = (value: any) => void;
export type OnFormChange = ( formVaules: FormValues, change: { [field: string]: any }) => void;
export type OnFormChangeWrapper = (update: { [field: string]: any }) => void;