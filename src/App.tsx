import React from 'react';
import SuperTable from "./SuperTable";
import { WidgetTypes, FormModes } from './SuperForm/type';
import { UploaderModes } from './SuperForm/widgets/Upload';
import { ISuperTableConfig } from './SuperTable/type';

const config: ISuperTableConfig<{
  key: string; name: string; age: number; address: string;
}> = {
  dataSource: [
    {
      key: '1',
      name: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1580624095007&di=02afcf344430def1a2c699391499fab2&imgtype=0&src=http%3A%2F%2Fphotocdn.sohu.com%2F20151213%2Fmp48127759_1449937320516_7.jpg',
      age: 32,
      address: '西湖区湖底公园1号',
    }
  ],
  fields: [
    {
      key: 'name',
      dataIndex: 'name',
      column: {
        title: '姓名123', // 默认等于key,
        width: 100,
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
        // render: () => {
        //   return '卧槽';
        // }
        map: {
          type: 'picture',
        }
      },
      formItem: {
        type: WidgetTypes.UPLOAD,
        label: '姓名1234', // 默认等于key,
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
          }],
          mode: UploaderModes.DRAG,
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
  headerResizable: true,
  onFetch: (page, filter, sorter) => {
    console.log('我日----', page, filter, sorter);
  }
  // addDBtn: undefined || true || {
  //   style: {},
  // },
  // editDataBtn: undefined || true || {
  //   style: {},
  // },
  // deleteBtn: undefined || true || {
  //   style: {},
  // },
  // headerWidgets: () => {

  // },
  // searchSorter: [] || (searchFields) => {

  // },
  // columnsOrder: [] || (colums) => {

  // },
  // formFieldsOrder: [] || (formFields) => {

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

const App: React.FC = () => {
  return (
    <SuperTable {...config} />
  );
}

export default App;