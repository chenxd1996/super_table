import React, { Children } from 'react';
import { Form, Input } from 'antd';
import { IFormItemConfig, WidgetTypes } from './type';
import { FormProps } from 'antd/lib/form';
import { getWidget } from './widgets';

type IFormProps = {
  fieldItems?: Array<IFormItemConfig>;
} & FormProps;

const renderFormItem = (
  fieldItems: Array<IFormItemConfig>,
  FormItem: React.Component,
  getFieldDecorator: Function,
): React.ReactNode => {
  return (
    <>
      {
        fieldItems.map((fieldItem) => {
          const {
            type,
            key,
            dataIndex,
            widgetConfig,
            render,
            children,
          } = fieldItem;

          let Widget = getWidget(type);
          const config = {};
          if (widgetConfig) {
            const { defaultValue, ...other } = widgetConfig;
            Object.assign(config, other);
          }

          if (Array.isArray(children)) {
            if (type === WidgetTypes.ARRAY) {
              Object.assign(config, {
                addNewItem: (index: number) => {
                  children.forEach((child) => {
                    child.key = `${key}[${index}].${child.key}`;
                    child.dataIndex = `${dataIndex}[${index}].${child.dataIndex}`;
                  });
                  return renderFormItem(children, FormItem, getFieldDecorator);
                }
              })
            } else {
              children.forEach((child) => {
                child.key = `${key}.${child.key}`;
                child.dataIndex = `${dataIndex}.${dataIndex}`;
              });
              // 这种情况是Object的情况
              return renderFormItem(children, FormItem, getFieldDecorator); 
            }
          }

          if (!Widget) {
            return null;
          }
          if (typeof render === 'function') {
            Widget = render(config, FormItem, getFieldDecorator);
          }
          // return getFieldDecorator()
        })
      }
    </>
  )
}

export default (props: IFormProps)  => {
  return (<Form { ...props }>
    <Form.Item label="我日------">
        <Input></Input>
        <div style={{ marginLeft: 100, width: 400 }}>
          <Form.Item label="我日------"><Input /></Form.Item>
        </div>
    </Form.Item>
    <Form.Item label="我日------">
        <Input></Input>
    </Form.Item>
  </Form>)
}