import { ReactElement, ReactNode } from 'react';
import { ColumnProps, TableProps, SortOrder } from "antd/lib/table";
import { IFormItemConfig } from "../SuperForm/type";
import  { ButtonProps } from "antd/lib/button";
import { ResizeCallbackData } from 'react-resizable';
import { ColumnRendererConfig, ColumnRendererType } from './columnRenderers';

export interface IMapperConfig {
  type: ColumnRendererType,
  config: ColumnRendererConfig,
  // config: Object,
}

interface ColumnAppendProps<RecordType> {
  map?: IMapperConfig;
  render?: (
    text: string,
    record: RecordType,
    index: number,
    methods?: RowOperationMethods
  ) => ReactNode;
  itemIndex?: number; 
}


export type ColumnConfig<RecordType> = ColumnAppendProps<RecordType> &
  Pick<ColumnProps<RecordType>, Exclude<keyof ColumnProps<RecordType>, keyof ColumnAppendProps<RecordType>>>;

export enum SearchPlaces {
  INNER = 'inner',
  OUTTER = 'outter',
}

export type SearchItemConfig = Pick<IFormItemConfig, Exclude<keyof IFormItemConfig,
  'inputAdaptor' | 'outputAdaptor' | 'mode' | 'getFieldDecoratorOptions' | 'children'>> & {
    children?: Array<SearchItemConfig>;
  };

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
  children?: Array<IFieldConfig<RecordType>>;
}

interface RowOperationMethods {
  setEditStatus: (status: boolean) => void;
  saveEditValues: () => void;
  deleteData: () => void;
}

type RowActionsAppend<RecordType> = {
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
  getActions?: (
    data: { text: string, record: RecordType, index: number },
    actions: {
      openEditModal: OpenEditModal<RecordType>;
      deleteRecord: DeleteRecord<RecordType>;
    }
  ) => Array<ReactElement>;
}
export type RowActions<RecordType> = RowActionsAppend<RecordType> & ColumnConfig<RecordType>;

export type OnOpenModal = <RecordType>(
  values: RecordPart<RecordType>,
  mode: FormModalModes
) => Promise<RecordPart<RecordType> | void> | RecordPart<RecordType> | void;

export type OnSaveData = <RecordType>(values: RecordPart<RecordType>, mode: FormModalModes) => Promise<void> | void;

export type OnDelete = <RecordType>(records: Array<RecordPart<RecordType>>) => Promise<void> | void;

export type OpenCreateModal = () => Promise<void>;

export type OpenEditModal<RecordType> = (values: RecordPart<RecordType>) => Promise<void>;

export type DeleteRecord<RecordType> = (record: Array<RecordPart<RecordType>>) => Promise<void>;

export type FetchData = (page?: number) => Promise<void>;

export type HeaderWidgets = <RecordType>(selectedRows: Array<RecordType>, methods: {
  openCreateModal: OpenCreateModal;
  openEditModal: OpenEditModal<RecordType>;
  deleteRecord: DeleteRecord<RecordType>;
  fetchData: FetchData;
}) => Array<ReactElement>;

export type ISuperTableConfig<RecordType> = {
  fields: Array<IFieldConfig<RecordType>>;
  addBtnText?: string;
  addBtnProps?: ButtonProps;
  showAddBtn?: boolean;
  editBtnText?: string;
  editBtnProps?: ButtonProps;
  showEditBtn?: boolean;
  deleteBtnText?: string;
  deleteBtnProps?: ButtonProps;
  showDeleteBtn?: boolean;
  searchBtnText?: string;
  searchBtnProps?: ButtonProps;
  resetBtnText?: string;
  resetBtnProps?: ButtonProps;
  wrapTopArea?: (topArea: ReactElement) => ReactElement;
  wrapTableArea?: (table: ReactElement) => ReactElement;
  headerWidgets?: HeaderWidgets;
  columnsOrder?: Array<string>;
  formFieldsOrder?: Array<string>;
  searchFieldsOrder?: Array<string>;
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
    filters: Filter<RecordType>,
    sorter?: Sorter
  ) => Promise<{total: number} | void> | {total: number} | void;
  onOpenModal?: OnOpenModal;
  onSaveData?: OnSaveData;
  onDelete?: OnDelete;
  rowActions?: RowActions<RecordType>;
} & TableProps<RecordType>;

export interface Pagination {
  current?: number | undefined;
  pageSize?: number | undefined;
  total?: number | undefined;
}

export type Filter<RecordType> = { [P in keyof RecordType]?: any; };
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

// export type OnResize = (width: number) => void;
export type OnResize = ((e: React.SyntheticEvent<Element, Event>, data: ResizeCallbackData) => any);