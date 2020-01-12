import React from 'react';
import { ButtonProps } from 'antd/lib/button';
import SuperForm from '../SuperForm';
import { SearchItemConfig, OpenCreateModal, OpenEditModal, DeleteRecord, FetchData } from './type';

interface ITopAreaProps<RecordType> {
  searchItems: Array<SearchItemConfig>;
  selectedRowKeys: Array<string | number>;
  selectedRows: Array<RecordType>;
  openCreateModal: OpenCreateModal<RecordType>;
  openEditModal: OpenEditModal<RecordType>;
  deleteRecord: DeleteRecord<RecordType>;
  fetchData: FetchData;
  addBtnText?: string;
  addBtnProps?: ButtonProps;
  showAddBtn?: boolean;
  editBtnText?: string;
  editBtnProps?: ButtonProps;
  showEditBtn?: boolean;
  deleleBtnText?: string;
  deleteBtnProps?: ButtonProps;
  showDeleteBtn?: boolean;
}

export default React.memo(<RecordType extends {}>(props: ITopAreaProps<RecordType>) => {
  const {
    searchItems
  } = props;
  
  return <SuperForm
    fieldItems={searchItems}
  />
});