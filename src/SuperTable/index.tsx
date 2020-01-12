import React, { useRef, useEffect, ReactElement, useCallback, useState } from 'react';
import { Table } from 'antd';
import { ISuperTableConfig, ColumnConfig, RowOperations, Pagination, Filter, Sorter, SearchItemConfig, ISearch, FormModalModes, RecordPart, DeleteRecord, OpenEditModal } from "./type";
import { ColumnProps, TableRowSelection } from 'antd/lib/table';
import Button from 'antd/lib/button';
import { IFormItemConfig, FormValues } from '../SuperForm/type';
import { isFunction, isBoolean } from '../common';
import TopArea from './TopArea';
import FormModal from './FormModal';

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
  if (isBoolean(search)) {
    const {
      inputAdaptor,
      outputAdaptor,
      widgetConfig,
      mode,
      getFieldDecoratorOptions,
      ...other
    } = formItem || {};

    const {
      defaultValue,
      ...otherWidgetConfig
    } = widgetConfig || {};

    if (formItem) {
      searchConfig = {
        widgetConfig: otherWidgetConfig,
        ...other,
      }
    }
  } else {
    searchConfig = { key, dataIndex, ...search.config };
  }

  return searchConfig as SearchItemConfig;
}

const parseTableConfig = <RecordType extends {}>(
  tableConfig: ISuperTableConfig<RecordType>,
  openEditModal: OpenEditModal<RecordType>,
  deleteRecord: DeleteRecord<RecordType>,
) => {
  const {
    fields,
    rowOperations,
  } = tableConfig;
  let columns: Array<ColumnProps<RecordType>> = [];
  const formItems: Array<IFormItemConfig> = [];
  const searchItems: Array<SearchItemConfig> = [];
  // const searchFields = [];

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
        key, dataIndex
      });
      formItems.push(formItem)
    }
    
    if (search) {
      const searchConfig = parseSearch(search, key, dataIndex, formItem);
      if (searchConfig) {
        searchItems.push(searchConfig);
      }
    }
  });

  columns = addRowOperations(columns, openEditModal, deleteRecord, rowOperations);
  
  return { columns, formItems, searchItems };
}

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

interface IStaticProperties<RecordType> {
  pagination?: Pagination;
  hasFetch: boolean;
  filters?: Filter<RecordType>;
  sorter?: Sorter;
};

export default function<RecordType extends {
  [field: string]: any;
} = any>(
  props: ISuperTableConfig<RecordType>,
  // openCreateModal: () => void,
) {
  // const { columns, formItems } = parseTableConfig<{
  //   key: string; name: string; age: number; address: string;
  // }>(config.superTable);

  const {
    dataSource,
    pagination,
    onChange,
    onDelete,
    onFetch,
    onOpenModal,
    onSaveData,
    fetchAtFirst = true,
    fetchAfterCreate = true,
    fetchAfterDelete = true,
    fetchAfterEdit = true,
    formModalTitle,
    formModalOkText,
    formModalOkBtnProps,
    formModalCancelText,
    formModalCancelBtnProps,
    rowSelection,
    rowKey,
    ...other
  } = props;

  const _this = useRef<IStaticProperties<RecordType>>({
    hasFetch: false,
  }).current;
  
  const [filters, setFilters] = useState<Array<Filter<RecordType>>>([]);
  const [sorter, setSorter] = useState<Sorter>();
  const [internalPagination, setInternalPagination] = useState<Pagination>(
    getDefaultPagination(pagination)
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [formModalMode, setFormModalMode] = useState<FormModalModes>(FormModalModes.ADD);
  const [formValues, setFormValues] = useState<RecordPart<RecordType>>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[] | number[]>(
    getDefaultSelectedRowKeys(rowSelection)
  );
  const [selectedRows, setSelectedRows] = useState<Array<RecordType>>(
    getDefaultSelectedRows(rowSelection)
  );

  const fetchData = useCallback(async (page?: number) => {
    if (page && Number.isInteger(page)) {
      setInternalPagination({
        ...internalPagination,
        current: page,
      });
    }
    if (isFunction(onFetch)) {
      const ret = await onFetch(internalPagination, filters, sorter);
      setInternalPagination({
        ...internalPagination,
        ...ret,
      });
    }
  }, [onFetch, internalPagination, filters, sorter]);

  const openModal = useCallback((mode: FormModalModes, values: RecordPart<RecordType> ) => {
    setFormModalMode(mode);
    setFormValues(values);
    setModalVisible(true);
  }, []);

  const deleteRecord = useCallback(async (records: Array<RecordPart<RecordType>>) => {
    if (isFunction(onDelete)) {
      await onDelete(records);
    }
    if (fetchAfterDelete) {
      await fetchData(0);
    }
  }, [fetchAfterDelete, fetchData, onDelete]);

  const openCreateModal = useCallback(async () => {
    const data = {};
    if (isFunction(onOpenModal)) {
      const ret = await onOpenModal({}, FormModalModes.ADD);
      Object.assign(ret, data);
    }
    openModal(FormModalModes.ADD, { ...data });
  }, [onOpenModal, openModal]);

  const openEditModal = useCallback(async (values: RecordPart<RecordType>) => {
    const data = values;
    if (isFunction(onOpenModal)) {
      const ret = await onOpenModal(values, FormModalModes.EDIT);
      Object.assign(ret, data);
    }
    openModal(FormModalModes.EDIT, { ...data });
  }, [onOpenModal, openModal]);

  
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const {
    columns,
    formItems,
    searchItems,
  } = parseTableConfig<RecordType>(other, openEditModal, deleteRecord);

  const { hasFetch } = _this;


  useEffect(() => {
    if (fetchAtFirst && !hasFetch) {
      fetchData();
    }
  }, [fetchAtFirst, fetchData, hasFetch]);

  const handlePageChange = useCallback(
    (
      newPagination: Pagination,
      newFilters: Filter<RecordType>,
      sorter: Sorter,
    ) => {
    setInternalPagination({
      ...internalPagination,
      ...newPagination,
    });
    setFilters({ ...filters, ...newFilters});
    setSorter(sorter);
    fetchData();
  }, [fetchData, filters, internalPagination]);

  const wrappedOnChange: ISuperTableConfig<RecordType>['onChange'] = useCallback((pagination, filters, sorter, extra) => {
    handlePageChange(pagination, filters, sorter);
    if (isFunction(onChange)) {
      onChange(pagination, filters, sorter, extra);
    }
  }, [handlePageChange, onChange]);

  const handleSelectedRowsChange = useCallback((selectedRowKeys: string[] | number[], selectedRows: RecordType[]) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
    if (rowSelection) {
      const { onChange } = rowSelection;
      if (isFunction(onChange)) {
        onChange(selectedRowKeys, selectedRows);
      }
    }
  }, [rowSelection]);

  const getWrappedRowSelection = useCallback(() => {
    if (!rowSelection) {
      return;
    }
    return {
      ...rowSelection,
      onChange: handleSelectedRowsChange,
      selectedRowKeys: selectedRowKeys,
    }
  }, [handleSelectedRowsChange, rowSelection, selectedRowKeys]);

  // const wrappedRowSelection = getWrapped

  const handleSaveData = useCallback(async (values: FormValues) => {
    if (isFunction(onSaveData)) {
      await onSaveData(values, formModalMode);
    }
    closeModal();
    if (
      (formModalMode === FormModalModes.ADD && fetchAfterCreate)
      || (formModalMode === FormModalModes.EDIT && fetchAfterEdit)  
    ) {
      await fetchData(0);
    }
  }, [closeModal, fetchAfterCreate, fetchAfterEdit, fetchData, formModalMode, onSaveData]);


  return (
    <>
      <TopArea
        searchItems={searchItems}
        selectedRowKeys={selectedRowKeys}
        selectedRows={selectedRows}
        fetchData={fetchData}
        openCreateModal={openCreateModal}
        openEditModal={openEditModal}
        deleteRecord={deleteRecord}
      />
      <FormModal
        visible={modalVisible}
        formItems={formItems}
        mode={formModalMode}
        onCancel={closeModal}
        onOk={handleSaveData}
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
        onChange={wrappedOnChange}
        rowKey={rowKey}
        rowSelection={getWrappedRowSelection()}
      />
    </>
  );
}