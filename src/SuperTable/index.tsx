import React, { useRef, useEffect, ReactElement, useCallback, useState, Component } from 'react';
import { Table } from 'antd';
import { ISuperTableConfig, ColumnConfig, RowOperations, Pagination, Filter, Sorter, SearchItemConfig, ISearch, FormModalModes, RecordPart, DeleteRecord, OpenEditModal, IFieldConfig, FetchData, OpenCreateModal } from "./type";
import { ColumnProps, TableRowSelection } from 'antd/lib/table';
import Button from 'antd/lib/button';
import { IFormItemConfig, FormValues } from '../SuperForm/type';
import { isFunction, isBoolean } from '../common';
import TopArea from './TopArea';
import FormModal from './FormModal';
import memoizeOne from 'memoize-one';

const getRenderFunc = () => {
  return (text: string, record: any, index: number) => {
    return (<span>我日----</span>);
  }
}

const parseColumn = <RecordType extends {}>(column?: ColumnConfig<RecordType>) => {
  if (!column) { return; }
  const { render, map, ...other } = column;
  let renderFunc = render;
  if (map && map.mapper) {
    // renderFunc = getRenderFunc();
  }
  return {
    render: renderFunc,
    ...other,
  }
}

const addRowOperations = <RecordType extends {}>(
  columns: Array<ColumnConfig<RecordType>>,
  openEditModal: OpenEditModal<RecordType>,
  deleteRecord: DeleteRecord<RecordType>,
  rowOperations?: RowOperations<RecordType>,
) => {
  const DEFAULT_EDIT_BUTTON_PROPS = {
    type: 'link',
    size: 'small',
    key: '$edit-button',
    onClick: openEditModal,
  };

  const DEFAULT_DELETE_BUTTON_PROPS = {
    type: 'link',
    size: 'small',
    key: '$delete-button',
    onClick: deleteRecord,
  };

  const DEFAULT_EDIT_BUTTON_TEXT = '编辑';

  const DEFAULT_DELETE_BUTTON_TEXT = '删除';

  const DEFAULT_ACTION_KEY = '$action';

  const DEFAULT_ACTION_TITLE = '操作';

  const { 
    editBtn = true,
    editBtnProps = DEFAULT_EDIT_BUTTON_PROPS,
    deleteBtn = true,
    deleteBtnProps = DEFAULT_DELETE_BUTTON_PROPS,
    render,
    key = DEFAULT_ACTION_KEY,
    title = DEFAULT_ACTION_TITLE,
    ...other
  } = rowOperations || {};

  const getDefaultButton = (
    showBtn: boolean | Function,
    buttonProps: Object,
    defaultText: string,
  ) => {
    return showBtn ? (<Button {...buttonProps}>{defaultText}</Button>) : null;
  }

  const getCustomButton = (
    customButton: boolean | Function,
    args: Array<any>,
  ) => {
    return typeof customButton === 'function' ? customButton(...args) : null;
  }

  const editBtnElement =
    getCustomButton(editBtn, [openEditModal]) ||
    getDefaultButton(editBtn, editBtnProps, DEFAULT_EDIT_BUTTON_TEXT);

  const deleteBtnElement =
    getCustomButton(deleteBtn, [deleteRecord]) ||
    getDefaultButton(deleteBtn, deleteBtnProps, DEFAULT_DELETE_BUTTON_TEXT);

  
  const operations: Array<ReactElement> = [editBtnElement, deleteBtnElement];
    
  const wrappedRender: ColumnProps<RecordType>['render'] = (text, record, index) => {
    if (typeof render === 'function') {
      return render(operations, record, text);
    }
    return operations;
  };

  const actionColumn =  {
    render: wrappedRender,
    title,
    key,
    ...other,
  };

  return [
    ...columns,
    actionColumn,
  ];
}

const parseSearch = (search: boolean | ISearch,  key: string, dataIndex: string, formItem?: IFormItemConfig) => {
  let searchConfig = null;
  const {
    inputAdaptor,
    outputAdaptor,
    widgetConfig,
    mode,
    getFieldDecoratorOptions,
    formItemProps,
    getRenderer,
    ...other
  } = formItem || {};

  const {
    defaultValue,
    ...otherWidgetConfig
  } = widgetConfig || {};

  if (isBoolean(search)) {
    if (formItem) {
      searchConfig = {
        widgetConfig: otherWidgetConfig,
        ...other,
      }
    }
  } else {
  
    searchConfig = {
      key,
      dataIndex,
      ...search.config,
      widgetConfig: { ...otherWidgetConfig, ...search.config?.widgetConfig },
    };
  }

  return searchConfig as SearchItemConfig;
}

const parseTableConfig = memoizeOne(<RecordType extends {}>(
  fields: IFieldConfig<RecordType>[],
  // tableConfig: ISuperTableConfig<RecordType>,
  rowOperations: RowOperations<RecordType> | undefined,
  openEditModal: OpenEditModal<RecordType>,
  deleteRecord: DeleteRecord<RecordType>,
) => {
  // const {
  //   fields,
  //   rowOperations,
  // } = tableConfig;
  let columns: Array<ColumnProps<RecordType>> = [];
  const formItems: Array<IFormItemConfig> = [];
  const searchItems: Array<SearchItemConfig> = [];
  const defaultOutterFilters: Filter<RecordType> = {};

  fields.forEach((field) => {
    const {
      column,
      key,
      dataIndex,
      formItem,
      search,
    } = field;
    // const isArray = children.s
    const parsedColumn = parseColumn({ ...column, key, dataIndex });
    if (parsedColumn) {
      columns.push(parsedColumn);
    }

    if (formItem) {
      Object.assign(formItem, {
        key,
        dataIndex,
      });
      formItems.push(formItem)
    }
    
    if (search) {
      const searchConfig = parseSearch(search, key, dataIndex, formItem);
      if (searchConfig) {
        const {
          widgetConfig,
        } = searchConfig;
        if (widgetConfig?.defaultValue !== undefined) {
          defaultOutterFilters[dataIndex as keyof Filter<RecordType>] = widgetConfig?.defaultValue;
        }
        searchItems.push(searchConfig);
      }
    }
  });

  columns = addRowOperations(columns, openEditModal, deleteRecord, rowOperations);
  
  return { columns, formItems, searchItems, defaultOutterFilters };
});

const getDefaultPagination = <RecordType extends {}>(
  pagination: ISuperTableConfig<RecordType>['pagination']
) => {
  if (!pagination) {
    return {};
  }
  const {
    defaultCurrent,
    current = defaultCurrent,
    pageSize,
    total,
  } = pagination;
  return {
    current,
    pageSize,
    total,
  };
};

const getDefaultSelectedRowKeys = <RecordType extends {}>(rowSelection?: TableRowSelection<RecordType>) => {
  if (!rowSelection) {
    return [];
  }
  const { selectedRowKeys = [] } = rowSelection;
  return selectedRowKeys;
}

const getDefaultSelectedRows = <RecordType extends {
  [field: string]: any;
}>(
  rowSelection?: TableRowSelection<RecordType>,
  dataSource?: Array<RecordType>,
  rowKey?: string | ((record: RecordType) => string),
) => {
  if (!rowSelection) {
    return [];
  }
  const { selectedRowKeys } = rowSelection;
  const selectedRows: Array<RecordType> = [];
  if (rowKey) {
    const keyValuesMap: {
      [field: string]: RecordType;
    } = {};
    dataSource?.forEach((record) => {
      const key = isFunction(rowKey) ? rowKey(record) : rowKey;
      keyValuesMap[key] = record;
      return record[key];
    });
    selectedRowKeys?.forEach((selectedKeyValue: string | number) => {
      const record: RecordType = keyValuesMap[selectedKeyValue];
      selectedRows.push(record);
    });
  }
  return selectedRows;
}

interface ISuperTableState<RecordType> {
  sorter?: Sorter;
  internalPagination: Pagination;
  modalVisible: boolean;
  formModalMode: FormModalModes;
  formValues: RecordPart<RecordType>;
  selectedRowKeys: string[] | number[];
  selectedRows: Array<RecordType>;
  outterFilters: Filter<RecordType> | undefined;
  innerFilters: Filter<RecordType> | undefined;
}

export default class SuperTable<RecordType extends {
  [field: string]: any;
}> extends Component<ISuperTableConfig<RecordType>, ISuperTableState<RecordType>> {
  hasFetch = false;

  constructor(props: ISuperTableConfig<RecordType>) {
    super(props);
    const {
      fields,
      rowOperations,
      pagination,
      rowSelection,
    } = props;

    const { defaultOutterFilters }
      = parseTableConfig(fields, rowOperations, this.openEditModal, this.deleteRecord);
    const defaultPagination = getDefaultPagination(pagination);
    const defaultSelectedRowKeys = getDefaultSelectedRowKeys(rowSelection);
    const defaultSelectedRows = getDefaultSelectedRows(rowSelection);

    this.state = {
      sorter: undefined,
      internalPagination: defaultPagination,
      modalVisible: false,
      formModalMode: FormModalModes.ADD,
      formValues: {},
      selectedRowKeys: defaultSelectedRowKeys,
      selectedRows: defaultSelectedRows,
      outterFilters: defaultOutterFilters,
      innerFilters: undefined,
    }
  }

  componentDidMount() {
    const { fetchAtFirst  } = this.props;

    if (fetchAtFirst && !this.hasFetch) {
      this.hasFetch = true;
      this.fetchData();
    }
  }
  
  openModal = (mode: FormModalModes, values: RecordPart<RecordType>) => {
    this.setState({
      formModalMode: mode,
      formValues: values,
      modalVisible: true,
    })
  }

  closeModal = () => {
    this.setState({
      modalVisible: false,
    });
  }

  openCreateModal: OpenCreateModal = async () => {
    const { onOpenModal } = this.props;
    const data = {};
    if (isFunction(onOpenModal)) {
      const ret = await onOpenModal({}, FormModalModes.ADD);
      Object.assign(data, ret);
    }
    this.openModal(FormModalModes.ADD, { ...data });
  }

  openEditModal: OpenEditModal<RecordType> = async (values) => {
    const { onOpenModal } = this.props;
    const data = values;
    if (isFunction(onOpenModal)) {
      const ret = await onOpenModal(values, FormModalModes.EDIT);
      Object.assign(data, ret);
    }
    this.openModal(FormModalModes.EDIT, { ...data });
  }

  fetchData: FetchData = async (page = 0) => {
    const { onFetch } = this.props;
    const {
      internalPagination,
      innerFilters = {},
      outterFilters = {},
      sorter,
    } = this.state;
    let newInternalPagination = internalPagination;
    if (page && Number.isInteger(page)) {
      newInternalPagination = {
        ...internalPagination,
        current: page,
      };
    }
    if (isFunction(onFetch)) {
      const ret = await onFetch(newInternalPagination, {
        ...innerFilters,
        ...outterFilters,
      }, sorter);
      newInternalPagination = {
        ...newInternalPagination,
        ...ret,
      };
    }
    this.setState({
      internalPagination: newInternalPagination,
    });
  };

  deleteRecord: DeleteRecord<RecordType> = async (records) => {
    const { onDelete, fetchAfterDelete } = this.props;
    if (isFunction(onDelete)) {
      await onDelete(records);
    }
    if (fetchAfterDelete) {
      await this.fetchData(0);
    }
  }

  handleChange = (
    newPagination: Pagination,
    innerFilters: Filter<RecordType>,
    sorter: Sorter,
  ) => {
    const {
      internalPagination,
    } = this.state;

    newPagination = {
      ...internalPagination,
      ...newPagination,
    };

    this.setState({
      internalPagination: newPagination,
      innerFilters,
      sorter,
    });

    this.fetchData();
  }


  wrappedOnChange: ISuperTableConfig<RecordType>['onChange'] = (pagination, filters, sorter, extra) => {
    const {
      onChange
    } = this.props;

    this.handleChange(pagination, filters, sorter);
    if (isFunction(onChange)) {
      onChange(pagination, filters, sorter, extra);
    }
  }

  handleSelectedRowsChange = (selectedRowKeys: string[] | number[], selectedRows: RecordType[]) => {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });

    const {
      rowSelection
    } = this.props;
  
    if (rowSelection) {
      const { onChange } = rowSelection;
      if (isFunction(onChange)) {
        onChange(selectedRowKeys, selectedRows);
      }
    }
  }

  getWrappedRowSelection = () => {
    const { rowSelection } = this.props;
    const { selectedRowKeys } = this.state;
    return {
      ...rowSelection,
      onChange: this.handleSelectedRowsChange,
      selectedRowKeys,
    }
  }

  handleSaveData = async (values: FormValues) => {
    const {
      onSaveData,
      fetchAfterCreate,
      fetchAfterEdit,
    } = this.props;

    const {
      formModalMode,
    } = this.state;

    if (isFunction(onSaveData)) {
      await onSaveData(values, formModalMode);
    }
    this.closeModal();
    if (
      (formModalMode === FormModalModes.ADD && fetchAfterCreate)
      || (formModalMode === FormModalModes.EDIT && fetchAfterEdit)  
    ) {
      await this.fetchData(0);
    }
  }

  setOutterFilters = (outterFilters: Filter<RecordType>) => {
    this.setState({
      outterFilters,
    });
  }

  render() {
    const {
      dataSource,
      pagination,
      onChange,
      onDelete,
      onFetch,
      onOpenModal,
      onSaveData,
      fetchAtFirst,
      fetchAfterCreate,
      fetchAfterDelete,
      fetchAfterEdit,
      formModalTitle,
      formModalOkText,
      formModalOkBtnProps,
      formModalCancelText,
      formModalCancelBtnProps,
      rowSelection,
      rowKey,
      addBtnText,
      addBtnProps,
      showAddBtn,
      editBtnText,
      editBtnProps,
      showEditBtn,
      deleteBtnText,
      deleteBtnProps,
      showDeleteBtn,
      searchBtnProps,
      searchBtnText,
      resetBtnText,
      resetBtnProps,
      rowOperations,
      fields,
      headerWidgets,
      ...other
    } = this.props;

    const {
      columns,
      formItems,
      searchItems,
    } = parseTableConfig(fields, rowOperations, this.openEditModal, this.deleteRecord);

    const {
      selectedRows,
      selectedRowKeys,
      modalVisible,
      formModalMode,
      internalPagination,
    } = this.state;

    return (
      <>
        <TopArea
          searchItems={searchItems}
          selectedRowKeys={selectedRowKeys}
          selectedRows={selectedRows}
          fetchData={this.fetchData}
          openCreateModal={this.openCreateModal}
          openEditModal={this.openEditModal}
          deleteRecord={this.deleteRecord}
          addBtnText={addBtnText}
          addBtnProps={addBtnProps}
          showAddBtn={showAddBtn}
          editBtnText={editBtnText}
          editBtnProps={editBtnProps}
          showEditBtn={showEditBtn}
          deleteBtnText={deleteBtnText}
          deleteBtnProps={deleteBtnProps}
          showDeleteBtn={showDeleteBtn}
          searchBtnText={searchBtnText}
          searchBtnProps={searchBtnProps}
          resetBtnText={resetBtnText}
          resetBtnProps={resetBtnProps}
          setFilters={this.setOutterFilters}
          headerWidgets={headerWidgets}
        />
        <FormModal
          visible={modalVisible}
          formItems={formItems}
          mode={formModalMode}
          onCancel={this.closeModal}
          onOk={this.handleSaveData}
          title={formModalTitle}
          okText={formModalOkText}
          okBtnProps={formModalOkBtnProps}
          cancelText={formModalCancelText}
          cancelBtnProps={formModalCancelBtnProps}
        />
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{
            ...pagination,
            ...internalPagination,
          }}
          onChange={this.wrappedOnChange}
          rowKey={rowKey}
          rowSelection={this.getWrappedRowSelection()}
        />
      </>
    );
  }
}