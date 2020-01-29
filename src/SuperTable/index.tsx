import React, { ReactElement, Component } from 'react';
import { Table } from 'antd';
import {
  ISuperTableConfig, ColumnConfig, RowOperations, Pagination, Filter, Sorter, SearchItemConfig, ISearch, FormModalModes, RecordPart, DeleteRecord, OpenEditModal, IFieldConfig, FetchData, OpenCreateModal, OnResize } from "./type";
import { ColumnProps, TableRowSelection, TableComponents, SortOrder } from 'antd/lib/table';
import Button from 'antd/lib/button';
import { IFormItemConfig, FormValues, WidgetTypes } from '../SuperForm/type';
import { isFunction, isBoolean, sortArrByOrder } from '../common';
import TopArea from './TopArea';
import FormModal from './FormModal';
import memoizeOne from 'memoize-one';
import { ResizableTitle } from './ResizableTitle';

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
  const {
    widgetConfig,
    formItemProps,
    getRenderer,
    type,
    label,
  } = formItem || {};

  const {
    defaultValue,
    ...otherWidgetConfig
  } = widgetConfig || {};

  let searchConfig: SearchItemConfig | null = null;

  if (isBoolean(search)) {
    if (search && formItem && formItem.type !== WidgetTypes.ARRAY) {
      searchConfig = {
        key,
        dataIndex,
        formItemProps,
        getRenderer,
        type: type!,
        label,
        widgetConfig: otherWidgetConfig,
      };
    }
  } else if (search.config) {
    searchConfig = {
      key,
      dataIndex,
      ...search.config,
    };
  }

  return searchConfig;
}

const getFullDataKeyColumn = <RecordType extends {}>(
  column: ColumnConfig<RecordType>,
  parentDataIndex: string,
) => {
  const newColumn = { ...column };
  const {
    dataIndex,
    itemIndex,
    key,
  } = column;
  if (itemIndex !== undefined) {
    newColumn.dataIndex = `${parentDataIndex}[${itemIndex}].${dataIndex}`;
    newColumn.key = key ? key : newColumn.dataIndex;
  }
  return newColumn;
};

const parseTableConfig = memoizeOne(<RecordType extends {}>(
  fields: IFieldConfig<RecordType>[],
  rowOperations: RowOperations<RecordType> | undefined,
  openEditModal: OpenEditModal<RecordType>,
  deleteRecord: DeleteRecord<RecordType>,
  columnsOrder?: Array<string>,
) => {
  let columns: Array<ColumnProps<RecordType>> = [];
  let formItems: Array<IFormItemConfig> = [];
  let searchItems: Array<SearchItemConfig> = [];
  const defaultOutterFilters: Filter<RecordType> = {};
  const defaultInnerFilters: Filter<RecordType> = {};
  let defaultSorter: Sorter | undefined;

  fields.forEach((field) => {
    const {
      column,
      key,
      dataIndex,
      formItem,
      search,
      children = [],
    } = field;

    const  {
      columns: childrenColumns,
      formItems: childrenFormItems,
      searchItems: childrenSearchItems,
    } = parseTableConfig(children, rowOperations, openEditModal, deleteRecord);

    const parsedColumn = parseColumn({ ...column, key, dataIndex });
    if (parsedColumn) {
      columns.push(parsedColumn);
      const {
        defaultFilteredValue,
        filteredValue = defaultFilteredValue,
        defaultSortOrder,
        sortOrder = defaultSortOrder,
        sortDirections = ['ascend', 'descend'],
      } = parsedColumn;
      defaultInnerFilters[key as keyof Filter<RecordType>] = filteredValue;
      if (sortOrder) {
        defaultSorter = {
          field: dataIndex,
          columnKey: key,
          order: isBoolean(sortOrder) ? sortDirections[0] as SortOrder: sortOrder,
        };
      }
    }

    columns = addRowOperations(columns, openEditModal, deleteRecord, rowOperations);

    columns.push(...childrenColumns.map((childColumn) => {
      return getFullDataKeyColumn(childColumn, dataIndex);
    }));

    if (formItem) {
      Object.assign(formItem, {
        key,
        dataIndex,
        children: childrenFormItems,
      });
      formItems.push(formItem);
    }
    
    if (search) {
      const searchConfig = parseSearch(search, key, dataIndex, formItem);
      if (searchConfig) {       
        searchConfig.children = childrenSearchItems;
        searchItems.push(searchConfig);
        const defaultValue = searchConfig?.widgetConfig?.defaultValue;
        if (defaultValue !== undefined) {
          defaultOutterFilters[dataIndex as keyof Filter<RecordType>] = defaultValue;
        }
      }
    }
  });

  if (columnsOrder) {
    sortArrByOrder(columns, 'key', columnsOrder);
  }
  
  return {
    columns,
    formItems,
    searchItems,
    defaultOutterFilters,
    defaultInnerFilters,
    defaultSorter,
  };
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
};

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
};

type ColumnsWidth = { [key: string]: number };

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
  columnsWidth: ColumnsWidth;
};

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
      columnsOrder,
    } = props;

    const {
      defaultOutterFilters, defaultInnerFilters,
    } = parseTableConfig(fields, rowOperations, this.openEditModal, this.deleteRecord, columnsOrder);
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
      innerFilters: defaultInnerFilters,
      columnsWidth: {},
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
  };

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
  };


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
  };

  getWrappedRowSelection = () => {
    const { rowSelection, showSelection = true } = this.props;
    if (!showSelection) {
      return;
    }
    const { selectedRowKeys } = this.state;
    return {
      ...rowSelection,
      onChange: this.handleSelectedRowsChange,
      selectedRowKeys,
    }
  };

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
  };

  setOutterFilters = (outterFilters: Filter<RecordType>) => {
    this.setState({
      outterFilters,
    });
  };

  getOnResize = (key: string | number) => {
    const onReize: OnResize =  (e, { size }) => {
      if (key !== undefined) {
        const { columnsWidth } = this.state;
        columnsWidth[key] = size.width;
        this.setState({
          columnsWidth: { ...columnsWidth },
        });
      }
    };
    return onReize;
  }

  wrapComponents: () => TableComponents | undefined = () => {
    const {
      components = {},
      headerResizable,
    } = this.props;

    if (!headerResizable) {
      return;
    }

    const { header = {},  body, table } = components;
    return {
      header: {
        cell: ResizableTitle,
        ...header,
      },
      body,
      table,
    };
  }

  wrapColumns: (
    columns: Array<ColumnProps<RecordType>>,
    columnsWidth: ColumnsWidth,
  ) => Array<ColumnProps<RecordType>>
    = memoizeOne((columns, columnsWidth) => {
    
    const { headerResizable } = this.props;
    return columns.map((column) => {
      const { onHeaderCell, key } = column;

      if (!headerResizable) {
        return column;
      }
      const width = columnsWidth[key!] || column.width;
      return {
        ...column,
        onHeaderCell: (column) => {
          const cellProps = {
            onResize: this.getOnResize(key!),
            width,
          };
          if (isFunction(onHeaderCell)) {
            Object.assign(cellProps, onHeaderCell(column));
          }
          return cellProps;
        },
        width,
      }
    });
  });

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
      headerResizable,
      wrapTableArea,
      wrapTopArea,
      showColumnConfig,
      showSelection,
      columnsOrder,
      formFieldsOrder,
      searchFieldsOrder,
      ...other
    } = this.props;

    const {
      columns,
      formItems,
      searchItems,
    } = parseTableConfig(
      fields,
      rowOperations,
      this.openEditModal,
      this.deleteRecord,
      columnsOrder,
    );

    const {
      selectedRows,
      selectedRowKeys,
      modalVisible,
      formModalMode,
      internalPagination,
      columnsWidth,
    } = this.state;

    let topArea = (
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
          searchFieldsOrder={searchFieldsOrder}
          showSelection={showSelection}
        />
    );

    let tableArea = (
      <Table
        bordered={headerResizable}
        {...other}
        columns={this.wrapColumns(columns, columnsWidth)}
        components={this.wrapComponents()}
        pagination={
          pagination === false ? false : {
            ...pagination,
            ...internalPagination,
          }
        }
        onChange={this.wrappedOnChange}
        rowKey={rowKey}
        rowSelection={this.getWrappedRowSelection()}
      />
    );

    if (isFunction(wrapTopArea)) {
      topArea = wrapTopArea(topArea);
    }

    if (isFunction(wrapTableArea)) {
      tableArea = wrapTableArea(tableArea);
    }

    return (
      <>
       {
        topArea
       }
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
          formFieldsOrder={formFieldsOrder}
        />
        {
          tableArea
        }
      </>
    );
  }
};