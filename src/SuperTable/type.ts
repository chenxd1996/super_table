import React, { ReactElement, ReactNode } from 'react';
import { ColumnProps, TableProps, SorterResult, SortOrder } from "antd/lib/table";
import { FormProps } from "antd/lib/form";
import { IFormItemConfig } from "../SuperForm/type";
import { ButtonProps } from "antd/lib/button";

export interface IMapperConfig {
  mapper: string,
  // config: Object,
}

interface ColumnAppendProps<RecordType> {
  map?: IMapperConfig;
  render?: (
    defaultElements: ReactElement | Array<ReactElement>,
    record: RecordType,
    index: number,
    methods?: RowOperationMethods
  ) => ReactNode; 
}


export type ColumnConfig<RecordType> = ColumnAppendProps<RecordType> &
  Pick<ColumnProps<RecordType>, Exclude<keyof ColumnProps<RecordType>, keyof ColumnAppendProps<RecordType>>>;

export enum SearchPlaces {
  INNER = 'inner',
  OUTTER = 'outter',
}

export type SearchItemConfig = Pick<IFormItemConfig, Exclude<keyof IFormItemConfig,
  'inputAdaptor' | 'outputAdaptor' | 'mode' | 'getFieldDecoratorOptions'>>;

export interface ISearch {
  config?: SearchItemConfig;
  place?: SearchPlaces;
}

export interface IFieldConfig<RecordType> {
  key: string;
  dataIndex: string;
  column?: ColumnConfig<RecordType>;
  formItem?: IFormItemConfig;
  search?: ISearch;
}

interface RowOperationMethods {
  setEditStatus: (status: boolean) => void;
  saveEditValues: () => void;
  deleteData: () => void;
}

type RowOperationsAppend = {
  editBtn?: boolean | ((
    setEditStatus: RowOperationMethods['setEditStatus'],
    saveEditValues: RowOperationMethods['saveEditValues'],
    rowData: any) => ReactElement
  );
  editBtnProps?: ButtonProps;
  deleteBtn?: boolean | ((
    deleteData: RowOperationMethods['deleteData'],
    rowData: any) => ReactElement);
  deleteBtnProps?: ButtonProps;
}
export type RowOperations<RecordType> = RowOperationsAppend & ColumnConfig<RecordType>;

export type OnOpenModal = <RecordType>(
  values: RecordPart<RecordType>,
  mode: FormModalModes
) => Promise<RecordPart<RecordType> | void> | RecordPart<RecordType> | void;

export type OnSaveData = <RecordType>(values: RecordPart<RecordType>, mode: FormModalModes) => Promise<void> | void;

export type OnDelete = <RecordType>(records: Array<RecordPart<RecordType>>) => Promise<void> | void;

export type OpenCreateModal<RecordType> = (values: RecordPart<RecordType>) => Promise<void>;

export type OpenEditModal<RecordType> = (values: RecordPart<RecordType>) => Promise<void>;

export type DeleteRecord<RecordType> = (record: Array<RecordPart<RecordType>>) => Promise<void>;

export type FetchData = (page: number) => Promise<void>;

export type ISuperTableConfig<RecordType> = {
  fields: Array<IFieldConfig<RecordType>>;
  addBtnText?: string;
  addBtnProps?: ButtonProps;
  showAddBtn?: boolean;
  editBtnText?: string;
  editBtnProps?: ButtonProps;
  showEditBtn?: boolean;
  deleleBtnText?: string;
  deleteBtnProps?: ButtonProps;
  showDeleteBtn?: boolean;
  header?: Function;
  body?: Function;
  headerWidgets?: Function;
  columnsSorter?: Function;
  formFieldsSorter?: Function;
  formModalTitle?: string | ReactNode;
  // formModalFooter?: null | Function;
  formModalOkText?: string;
  formModalOkBtnProps?: ButtonProps;
  formModalCancelText?: string;
  formModalCancelBtnProps?: ButtonProps;
  // formProps?: FormProps;
  showSelection?: boolean;
  showColumnConfig?: boolean;
  fetchAtFirst?: boolean;
  fetchAfterEdit?: boolean;
  fetchAfterCreate?: boolean;
  fetchAfterDelete?: boolean;
  headerResizable?: boolean;
  // refreshAfterEdit?: boolean;
  // refreshAfterDelete?: boolean; 
  onFetch?: (
    pagination: Pagination,
    filters: Array<Filter<RecordType>>,
    sorter?: Sorter
  ) => Promise<{total: number} | void> | {total: number} | void;
  onOpenModal?: OnOpenModal;
  onSaveData?: OnSaveData;
  onDelete?: OnDelete;
  rowOperations?: RowOperations<RecordType>;
} & TableProps<RecordType>;

export interface Pagination {
  current?: number | undefined;
  pageSize?: number | undefined;
  total?: number | undefined;
}

export type Filter<RecordType> = Partial<RecordType>;
export type RecordPart<RecordType> = Partial<RecordType>;;

export type Sorter = {
  order: SortOrder;
  field: string;
  columnKey: string;
}

export enum FormModalModes {
  ADD = 'add',
  EDIT = 'edit',
};