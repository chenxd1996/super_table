import { ColumnProps, TableProps } from "antd/lib/table";
import { FormProps } from "antd/lib/form";
import { IFormItemConfig } from "../SuperForm/type";

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

export type ISuperTableConfig<RecordType> = {
  fields: Array<IFieldConfig<RecordType>>;
  addBtnText?: string;
  addBtnStyle?: React.CSSProperties ;
  addDataBtn?: boolean | Function;
  editBtnText?: string;
  editBtnStyle?: React.CSSProperties ;
  editDataBtn?: boolean | Function;
  deleleBtnText?: string;
  deleteBtnStyle?: React.CSSProperties ;
  deleteBtn?: boolean | Function;
  header?: Function;
  body?: Function;
  headerWidgets?: Function;
  headerSearch?: Function;
  columnsSorter?: Function;
  formFieldsSorter?: Function;
  formModalHeader?: string | Function;
  formModalFooter?: boolean | Object | Function;
  formProps?: FormProps;
  showSelection?: boolean;
  showColumnConfig?: Object;
} & TableProps<RecordType>;