import { ColumnProps } from "antd/lib/table";
import { IFormItemConfig } from "../SuperForm/type";
import { FormProps } from "antd/lib/form";

export interface IMapperConfig {
  mapper: string,
  // config: Object,
}

export type ColumnConfig<RecordType> = {
  map?: IMapperConfig;
  render?: (text: string, record: any, index: number) => {};
} & {
  [k in keyof ColumnProps<RecordType>]: ColumnProps<RecordType>[k];
};

export enum SearchPlaces {
  INNER = 'inner',
  OUTTER = 'outter',
}

export interface ISearch {
  config?: IFormItemConfig;
  place?: SearchPlaces;
}

export interface IChildFiled<RecordType> {
  [k: string]: IFieldConfig<RecordType>;
}

export interface IFieldConfig<RecordType> {
  key: string;
  dataIndex: string;
  column?: ColumnConfig<RecordType>;
  formItem?: IFormItemConfig;
  search?: ISearch;
}


export interface ISuperTableConfig<RecordType> {
  fields: Array<IFieldConfig<RecordType>>;
  addBtnText?: string;
  addBtnStyle?: CSSStyleDeclaration;
  addDataBtn?: boolean | Function;
  editBtnText?: string;
  editBtnStyle?: CSSStyleDeclaration;
  editDataBtn?: boolean | Function;
  deleleDataBtnText?: string;
  deleteDataBtnStyle?: CSSStyleDeclaration;
  deleteDataBtn?: boolean | Function;
  headerWidgets?: Function;
  searchSorter?: Array<string> | Function;
  columnSorter?: Array<string> | Function;
  formFieldsSorter?: Array<string> | Function; 
  formHeader?: string | boolean | Function;
  formFooter?: boolean | Object | Function;
  formProps?: FormProps;
}