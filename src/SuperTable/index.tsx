import React from 'react';
import { Table } from 'antd';
import { parseTableConfig } from './utils';
import { WidgetTypes, FormModes } from '../SuperForm/type';
import Form from '../SuperForm';

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
//           style: {},]\
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
//     deleteDataBtn: undefined || true || {
//       style: {},
//     }
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
//        render: () => {}
//     }], 
//   }
// }

const config = {
  dataSource: [
    {
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
    }
  ],
  superTable: {
    fields: [
      {
        key: 'name',
        dataIndex: 'name',
        column: {
          title: '姓名', // 默认等于key,
          style: {},
          // map: { mapper: '123' }
          // render: undefined || {
          //   mapper: 'time',
          //   config: {
          //     type: 'millionSecond',
          //     format: 'YYYY-MM-dd',
          //   }
          // } || (text, record, index, ) => {
          //   // 返回自定义渲染结果
          // },
          render: () => {
            return '卧槽';
          }
        },
        formItem: {
          type: WidgetTypes.INPUT,
          label: '姓名', // 默认等于key,
          // labelStyle: {},
          widgetConfig: {
            // options: [{ value: 1, text: '哈哈哈' }],
            placeholder: '我日',
          },
          formItemProps: {
            // required: true,
          },
          inputAdaptor: () => {},
          outputAdaptor: () => {},
          // children: [{
          //   type: WidgetTypes.INPUT,
          //   label: '姓', // 默认等于key,
          //   // labelStyle: {},
          //   style: {},
          //   inputAdaptor: () => {},
          //   outputAdaptor: () => {},
          // }, {
          //   type: WidgetTypes.INPUT,
          //   label: '姓', // 默认等于key,
          //   // labelStyle: {},
          //   style: {},
          //   inputAdaptor: () => {},
          //   outputAdaptor: () => {},
          // }],
          mode: FormModes.ADD,
        },
        search: {
          config: {
            label: '名称', // 默认等于key,
            place: 'inner',
            // labelStyle: {},
            // style: {},
            type: WidgetTypes.INPUT, // 默认与formItem一致
            widgetConfig: { // 默认与formItem一致
              options: [],
            },
          },
        }
      },
    ],
    addDataBtn: undefined || true || {
      style: {},
    },
    editDataBtn: undefined || true || {
      style: {},
    },
    deleteDataBtn: undefined || true || {
      style: {},
    },
    // headerWidgets: () => {
  
    // },
    // searchSorter: [] || (searchFields) => {
  
    // },
    // columnsSorter: [] || (colums) => {
  
    // },
    // formFieldsSorter: [] || (formFields) => {
  
    // },
    // formFieldsGroups: [{
    //   keys: [],
    //   title: {
    //     text: '啦啦',
    //     style: {},
    //   } || React组件,
    //    render: () => {}
    // }],
  }
}

export default () => {
  const { columns, formItems } = parseTableConfig<{
    key: string; name: string; age: number; address: string;
  }>(config.superTable);
 
  console.log('我日-----------------', columns);
  return (<Form fieldItems={formItems} />);
  // return (<Table dataSource={config.dataSource} columns={columns} />);
}