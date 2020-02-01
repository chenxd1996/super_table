import React, { ReactElement, Component } from 'react';
import { Table } from 'antd';
import {
  ISuperTableConfig, ColumnConfig, RowActions, Pagination, Filter, Sorter, SearchItemConfig,
  ISearch, RecordPart, DeleteRecord, OpenEditModal, IFieldConfig, FetchData,
  OpenCreateModal, OnResize, WrapOpenEditModal, WrapDeleteRecord,
} from "./type";
import { ColumnProps, TableRowSelection, TableComponents, SortOrder } from 'antd/lib/table';
import Button from 'antd/lib/button';
import { IFormItemConfig, FormValues, WidgetTypes, FormModes } from '../SuperForm/type';
import { isFunction, isBoolean, sortArrByOrder, addKeyToArrayElements, showConfirm } from '../common';
import TopArea from './TopArea';
import FormModal from './FormModal';
import memoizeOne from 'memoize-one';
import { ResizableTitle } from './ResizableTitle';
import getRenderFunc from './columnRenderers';

const parseColumn = <RecordType extends {}>(
  column?: ColumnConfig<RecordType>,
  formWidgetConfig?: IFormItemConfig['widgetConfig'],
) => {
  if (!column) { return; }
  const { render, map, ...other } = column;
  let renderFunc = render;
  if (map && map.type) {
    renderFunc = getRenderFunc(map, formWidgetConfig);
  }
  return {
    render: renderFunc,
    ...other,
  }
}

const addRowActions = <RecordType extends {}>(
  columns: Array<ColumnConfig<RecordType>>,
  openEditModal: OpenEditModal<RecordType>,
  deleteRecord: DeleteRecord<RecordType>,
  rowActions?: RowActions<RecordType>,
) => {
  const DEFAULT_EDIT_BUTTON_TEXT = '编辑';
  
  const DEFAULT_DELETE_BUTTON_TEXT = '删除';

  const DEFAULT_ACTION_KEY = '$action';

  const DEFAULT_ACTION_TITLE = '操作';

  const DEFAULT_EDIT_BUTTON_PROPS = {
    type: 'link',
    size: 'small',
    key: '$edit-button',
  };

  const DEFAULT_DELETE_BUTTON_PROPS = {
    type: 'link',
    size: 'small',
    key: '$delete-button',
  };

  const { 
    editBtn = true,
    editBtnProps = DEFAULT_EDIT_BUTTON_PROPS,
    deleteBtn = true,
    deleteBtnProps = DEFAULT_DELETE_BUTTON_PROPS,
    key = DEFAULT_ACTION_KEY,
    title = DEFAULT_ACTION_TITLE,
    getActions,
    ...other
  } = rowActions || {};


  const getDefaultActions = (
    wrapOpenEditModal: WrapOpenEditModal,
    wrapDeleteRecord: WrapDeleteRecord,
  ) => {
    const actions: Array<ReactElement> = [];

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
  
  
    if (editBtn) {
      const editBtnElement =
        getCustomButton(editBtn, [openEditModal]) ||
        getDefaultButton(editBtn, { onClick: wrapOpenEditModal, ...editBtnProps }, DEFAULT_EDIT_BUTTON_TEXT);
      actions.push(editBtnElement);
    }
  
    if (editBtn) {
      const deleteBtnElement =
        getCustomButton(deleteBtn, [deleteRecord]) ||
        getDefaultButton(deleteBtn, { onClick: wrapDeleteRecord, ...deleteBtnProps }, DEFAULT_DELETE_BUTTON_TEXT);
      actions.push(deleteBtnElement);
    }

    return actions;
  }

  if (editBtn || deleteBtn || isFunction(getActions)) {
    const wrappedRender: ColumnProps<RecordType>['render'] = (text, record, index) => {
      const wrapOpenEditModal = () => openEditModal(record);
      const wrapDeleteRecord = () => deleteRecord([record]);
  
      const actions = getDefaultActions(wrapOpenEditModal, wrapDeleteRecord);
      if (isFunction(getActions)) {
        actions.push(...getActions(
          { text, record, index },
          { deleteRecord: wrapDeleteRecord, openEditModal: wrapOpenEditModal }
        ));
      }
      return addKeyToArrayElements(actions);
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
  return columns;
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
  rowActions: RowActions<RecordType> | undefined,
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
    } = parseTableConfig(children, rowActions, openEditModal, deleteRecord);

    const parsedColumn = parseColumn({ ...column, key, dataIndex }, formItem?.widgetConfig);
    if (parsedColumn) {
      columns.push(parsedColumn);
      const {
        defaultFilteredValue,
        filteredValue = defaultFilteredValue,
        defaultSortOrder,
        sortOrder = defaultSortOrder,
        sortDirections = ['ascend', 'descend'],
      } = parsedColumn;

      if (filteredValue !== undefined) {
        defaultInnerFilters[key as keyof Filter<RecordType>] = filteredValue;
      }

      if (sortOrder) {
        defaultSorter = {
          field: dataIndex,
          columnKey: key,
          order: isBoolean(sortOrder) ? sortDirections[0] as SortOrder: sortOrder,
        };
      }
    }

    columns = addRowActions(columns, openEditModal, deleteRecord, rowActions);

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
  rowSelection: TableRowSelection<RecordType> | undefined,
  dataSource: Array<RecordType> | undefined,
  rowKey: string | ((record: RecordType, index: number) => string) | undefined,
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
    dataSource?.forEach((record, index) => {
      const key = isFunction(rowKey) ? rowKey(record, index) : rowKey;
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
  formModalMode: FormModes;
  formValues: RecordPart<RecordType>;
  selectedRowKeys: string[] | number[];
  selectedRows: Array<RecordType>;
  outterFilters: Filter<RecordType> | undefined;
  innerFilters: Filter<RecordType> | undefined;
  columnsWidth: ColumnsWidth;
  loading: boolean;
};

export default class SuperTable<RecordType extends {
  [field: string]: any;
}> extends Component<ISuperTableConfig<RecordType>, ISuperTableState<RecordType>> {
  hasFetch = false;

  constructor(props: ISuperTableConfig<RecordType>) {
    super(props);
    const {
      fields,
      rowActions,
      pagination,
      rowSelection,
      columnsOrder,
      dataSource,
      rowKey,
    } = props;

    const {
      defaultOutterFilters, defaultInnerFilters,
    } = parseTableConfig(fields, rowActions, this.openEditModal, this.deleteRecord, columnsOrder);
    const defaultPagination = getDefaultPagination(pagination);
    const defaultSelectedRowKeys = getDefaultSelectedRowKeys(rowSelection);
    const defaultSelectedRows = getDefaultSelectedRows(rowSelection, dataSource, rowKey);

    this.state = {
      sorter: undefined,
      internalPagination: defaultPagination,
      modalVisible: false,
      formModalMode: FormModes.ADD,
      formValues: {},
      selectedRowKeys: defaultSelectedRowKeys,
      selectedRows: defaultSelectedRows,
      outterFilters: defaultOutterFilters,
      innerFilters: defaultInnerFilters,
      columnsWidth: {},
      loading: false,
    }
  }

  componentDidMount() {
    const { fetchAtFirst = true } = this.props;

    if (fetchAtFirst && !this.hasFetch) {
      this.hasFetch = true;
      this.fetchData();
    }
  }
  
  openModal = (mode: FormModes, values: RecordPart<RecordType>) => {
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
      const ret = await onOpenModal({}, FormModes.ADD);
      Object.assign(data, ret);
    }
    this.openModal(FormModes.ADD, { ...data });
  }

  openEditModal: OpenEditModal<RecordType> = async (values) => {
    const { onOpenModal } = this.props;
    const data = values;
    if (isFunction(onOpenModal)) {
      const ret = await onOpenModal(values, FormModes.EDIT);
      Object.assign(data, ret);
    }
    this.openModal(FormModes.EDIT, { ...data });
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
      this.setState({
        loading: true,
      });
      try {
        const ret = await onFetch(newInternalPagination, {
          ...innerFilters,
          ...outterFilters,
        }, sorter);
        newInternalPagination = {
          ...newInternalPagination,
          ...ret,
        };
      } finally {
        this.setState({
          loading: false,
        });
      }
    }
    this.setState({
      internalPagination: newInternalPagination,
    });
  };

  deleteRecord: DeleteRecord<RecordType> = async (records = []) => {
    const DELETE_CONFIRM_TEXT = `确定要删除这${records.length}条记录吗？`;

    const {
      onDelete,
      fetchAfterDelete = true,
      showDeleteConfirm = true,
    } = this.props;

    let shouldDelete = true;
    if (showDeleteConfirm) {
      shouldDelete = await showConfirm(DELETE_CONFIRM_TEXT);
    }

    if (!shouldDelete) {
      return;
    }

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
      fetchAfterCreate = true,
      fetchAfterEdit = true,
    } = this.props;

    const {
      formModalMode,
    } = this.state;

    if (isFunction(onSaveData)) {
      await onSaveData(values, formModalMode);
    }
    this.closeModal();
    if (
      (formModalMode === FormModes.ADD && fetchAfterCreate)
      || (formModalMode === FormModes.EDIT && fetchAfterEdit)  
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
      rowActions,
      fields,
      headerWidgets,
      headerResizable,
      wrapTableArea,
      wrapTopArea,
      showColumnConfig,
      showSelection = true,
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
      rowActions,
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
      loading,
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
        loading={loading}
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