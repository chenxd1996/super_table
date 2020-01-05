import React, { useRef, useEffect } from 'react';
import { Table } from 'antd';
import { parseTableConfig } from './utils';
import { WidgetTypes, FormModes } from '../SuperForm/type';
import Form from '../SuperForm';
import { ISuperTableConfig } from './type';

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

const config: {
  dataSource: any;
  superTable: ISuperTableConfig<{
    key: string; name: string; age: number; address: string;
  }>;
} = {
  dataSource: [
    {
      key: '1',
      name: [1],
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
          type: WidgetTypes.ARRAY,
          label: '姓名', // 默认等于key,
          // labelStyle: {},
          widgetConfig: {
            // options: [{ value: 1, text: '哈哈哈' }],
            placeholder: '我日',
            // getArrayItemTitle: (index: number) => {
            //   return `我日-----${index}`;
            // },
            options: [{
              value: 1,
              label: '我日',
            }, {
              value: 2,
              label: '我干',
            }]
          },
          formItemProps: {
            // required: true,
          },
          // inputAdaptor: () => {},
          // outputAdaptor: () => {},
          children: [{
            key: 'firstName',
            dataIndex: 'firstName',
            type: WidgetTypes.INPUT,
            label: '姓', // 默认等于key,
            inputAdaptor: (value) => {
              return value;
            },
            // outputAdaptor: () => {},
            widgetConfig: {
              placeholder: '请输入姓',
            },
            getFieldDecoratorOptions: {
              rules: [
                { validator:(arg) => { console.log('干-------', arg ); arg.callback('erro') } }
              ],
            }
          }, {
            key: 'secondName',
            dataIndex: 'secondName',
            type: WidgetTypes.INPUT,
            label: '名', // 默认等于key,
            // inputAdaptor: () => {},
            // outputAdaptor: (value) => { return '我日' },
            widgetConfig: {
              placeholder: '请输入名字',
            }
          }],
          mode: FormModes.ADD,
        },
        search: {
          config: {
            label: '名称', // 默认等于key,
            // place: 'inner',
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
    deleteBtn: undefined || true || {
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

  const ref = useRef<any>();

  useEffect(() => {
    console.log('我干---------', ref.current);
  }, [])
  
  return (<Form
    ref={ref}
    fieldItems={formItems}
    onChange={(update, allValues) => { console.log('我日-------', update, allValues) }}
    initialValues={config.dataSource[0]} />
  );
  // return (<Table dataSource={config.dataSource} columns={columns} />);
}