import React, { useCallback, useMemo } from 'react';
import Button, { ButtonProps } from 'antd/lib/button';
import shortId from 'shortid';
import SuperForm from '../../SuperForm';
import { SearchItemConfig, OpenCreateModal, OpenEditModal, DeleteRecord, FetchData, Filter, HeaderWidgets } from '../type';
import './index.scss';
import { isFunction } from '../../common';

interface ITopAreaProps<RecordType> {
  searchItems: Array<SearchItemConfig>;
  selectedRowKeys: Array<string | number>;
  selectedRows: Array<RecordType>;
  openCreateModal: OpenCreateModal;
  openEditModal: OpenEditModal<RecordType>;
  deleteRecord: DeleteRecord<RecordType>;
  fetchData: FetchData;
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
  setFilters: (filters: Filter<RecordType>) => void;
  headerWidgets?: HeaderWidgets;
}

const DEFAULT_SEARCH_BTN_TEXT = '查询';
const DEFAULT_RESET_BTN_TEXT = '重置';
const DEFAULT_ADD_BTN_TEXT = '添加';
const DEFAULT_DELETE_BTN_TEXT = '删除';
const DEFAULT_EDIT_BTN_TEXT = '编辑';

export default React.memo(<RecordType extends {}>(props: ITopAreaProps<RecordType>) => {
  const {
    searchItems,
    setFilters,
    selectedRows,
    // selectedRowKeys,
    openEditModal,
    openCreateModal,
    deleteRecord,
    fetchData,
    addBtnText = DEFAULT_ADD_BTN_TEXT,
    addBtnProps,
    showAddBtn = true,
    editBtnText = DEFAULT_EDIT_BTN_TEXT,
    editBtnProps,
    showEditBtn = true,
    deleteBtnText = DEFAULT_DELETE_BTN_TEXT,
    deleteBtnProps,
    showDeleteBtn = true,
    searchBtnProps,
    searchBtnText = DEFAULT_SEARCH_BTN_TEXT,
    resetBtnText = DEFAULT_RESET_BTN_TEXT,
    resetBtnProps,
    headerWidgets,
  } = props;

  const handleSearch = useCallback(() => {
    return fetchData();
  }, [fetchData])

  const handleResetSearch = useCallback(() => {
    setFilters({});
    return fetchData();
  }, [fetchData, setFilters]);

  const handleCreate = useCallback(() => {
    return openCreateModal();
  }, [openCreateModal]);

  const handleDelete = useCallback(() => {
    return deleteRecord(selectedRows);
  }, [deleteRecord, selectedRows]);

  const handleEdit = useCallback(() => {
    const toEdit = selectedRows[0];
    if (toEdit) {
      return openEditModal(toEdit);
    }
  }, [openEditModal, selectedRows]);

  const getSearchBtn = useCallback(() => {
    if (searchItems.length === 0) {
      return null;
    }
    return (
      <Button
        type="primary"
        {...searchBtnProps}
        onClick={handleSearch}
      >{searchBtnText}</Button>
    );
   }, [handleSearch, searchBtnProps, searchBtnText, searchItems.length]);

  const getResetBtn = useCallback(() => {
    if (searchItems.length === 0) {
      return null;
    }
    return (
      <Button
        {...resetBtnProps}
        onClick={handleResetSearch}
      >{resetBtnText}</Button>
    )
  }, [resetBtnProps, resetBtnText, handleResetSearch, searchItems.length]);

  const getAddBtn = useCallback(() => {
    if (!showAddBtn) {
      return null;
    }
    return (
      <Button
        type="primary"
        {...addBtnProps}
        onClick={handleCreate}
      >{addBtnText}</Button>
    );
  }, [addBtnProps, addBtnText, handleCreate, showAddBtn]);

  const getDeleteBtn = useCallback(() => {
    if (!showDeleteBtn) {
      return null;
    }
    return (
      <Button
        type="danger"
        {...deleteBtnProps}
        disabled={selectedRows.length <= 0}
        onClick={handleDelete}
      >{deleteBtnText}</Button>
    )
  }, [deleteBtnProps, deleteBtnText, handleDelete, selectedRows.length, showDeleteBtn]);

  const getEditBtn = useCallback(() => {
    if (!showEditBtn) {
      return null;
    }
    return (
      <Button
        type="primary"
        {...editBtnProps}
        disabled={selectedRows.length !== 1}
        onClick={handleEdit}
      >{editBtnText}</Button>
    )
  }, [editBtnProps, editBtnText, handleEdit, selectedRows, showEditBtn]);

  const handleFormChange = useCallback((values) => {
    setFilters(values);
  }, [setFilters]);

  const getHeaderWidgets = useCallback(() => {
    const widgets = [
      getSearchBtn(),
      getResetBtn(),
      getAddBtn(),
      getEditBtn(),
      getDeleteBtn(),
    ];

    if (isFunction(headerWidgets)) {
      const customerWidgets = headerWidgets(selectedRows, {
        openCreateModal,
        openEditModal,
        deleteRecord,
        fetchData,
      });
      widgets.push(...customerWidgets);
    }

    return widgets.map((widget) => {
      if (!widget) {
        return null;
      }
      const newProps = { ...widget.props };
      return (
        <div className="header-widget-item" key={shortId.generate()}>
          {
            widget
          }
        </div>
      )
    })
  }, [deleteRecord, fetchData, getAddBtn, getDeleteBtn, getEditBtn, getResetBtn, getSearchBtn, headerWidgets, openCreateModal, openEditModal, selectedRows]);

  const widgets = useMemo(getHeaderWidgets, [getHeaderWidgets]);

  
  return (
    <div className="top-area-container">
      <SuperForm
        fieldItems={searchItems}
        // labelCol={{
        //   span: 2,
        // }}
        // wrapperCol={{
        //   span: 3,
        // }}
        onChange={handleFormChange}
        layout="inline"
      >
        {
          widgets
        }
      </SuperForm>
    </div>
  );
});