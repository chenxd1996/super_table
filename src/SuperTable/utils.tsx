import React from 'react';
import { ISuperTableConfig, ColumnConfig } from "./type";
import { ColumnProps } from 'antd/lib/table';
import { IFormItemConfig } from '../SuperForm/type';

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
    renderFunc = getRenderFunc();
  }
  return {
    render: renderFunc,
    ...other,
  }
}

export const parseTableConfig = <RecordType extends {}>(tableConfig: ISuperTableConfig<RecordType>) => {
  const { fields } = tableConfig;
  const columns: Array<ColumnProps<RecordType>> = [];
  const formItems: Array<IFormItemConfig> = [];
  // const searchFields = [];

  fields.forEach((field) => {
    const { column, key, dataIndex, formItem } = field;
    // const isArray = children.s
    const parsedColumn = parseColumn({ ...column, key, dataIndex });
    if (parsedColumn) {
      columns.push(parsedColumn);
    }

    if (formItem) {
      formItems.push({ ...formItem, key, dataIndex })
    }
  });
  return { columns, formItems };
}