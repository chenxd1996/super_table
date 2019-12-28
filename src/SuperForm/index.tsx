import React from 'react';
import { Table } from 'antd';

// const config = {
//   dataSource: [
//     {
//       key: '1',
//       name: '胡彦斌',
//       age: 32,
//       address: '西湖区湖底公园1号',
//     }
//   ],
//   superTable: {
//     fields: [
//       {
//         key: 'name',
//         dataIndex: 'name',
//         children: [],
//         column: undefined || {
//           title: '名称' // 默认等于key,
//           style: {},
//           render: undefined || {
//             mapper: 'time',
//             config: {
//               type: 'millionSecond',
//               format: 'YYYY-MM-dd',
//             }
//           } || (text, record, index, ) => {
//             // 返回自定义渲染结果
//           },
//         },
//         formItem: undefined || {
//           type: 'select',
//           label: '名称' // 默认等于key,
//           labelStyle: {},
//           style: {},
//           config: {
//             options: [{ value: 1, text: '哈哈哈' }],
//           },
//           mode: 'add' || 'edit' || 'both',
//           inputAdaptor: () => {},
//           outputAdaptor: () => {},
//         } || (addValidator, listenTo: [{
//           key: 'name',
//           validateOnChange: true,
//         }]) => {
//           // 返回自定义组件
//         },
//       },
//       search: undefined || {
//         label: '名称', // 默认等于key,
//         mode: 'inner' || 'outter',
//         labelStyle: {},
//         style: {},
//         type: 'select', // 默认与formItem一致
//         config: { // 默认与formItem一致
//           options: [],
//         },
//       }
//     ],
//     addDataBtn: undefined || true || {
//       style: {},
//     },
//     editDataBtn: undefined || true || {
//       style: {},
//     },
//     headerWidgets: undefined || (widgets, methods) => {
  
//     },
//     searchSorter: [] || (searchFields) => {
  
//     },
//     columnsSorter: [] || (colums) => {
  
//     },
//     formFieldsSorter: [] || (formFields) => {
  
//     },
//     formFieldsGroups: [{
//       keys: [],
//       title: {
//         text: '啦啦',
//         style: {},
//       } || React组件,
//     }], 
//   }
// }

export default () => {
  const dataSource = [
    {
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
    },
    {
      key: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号',
    },
  ];
  
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '住址',
      dataIndex: 'address',
      key: 'address',
    },
  ];
  
  return (<Table dataSource={dataSource} columns={columns} />);
}