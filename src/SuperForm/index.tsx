import React, { Children, ComponentClass} from 'react';
import { Form, Input } from 'antd';
import { IFormItemConfig, WidgetTypes } from './type';
import { FormComponentProps, FormItemProps } from 'antd/lib/form';
import { getWidget } from './widgets';

interface IFormProps extends FormComponentProps {
  fieldItems?: Array<IFormItemConfig>;
}

const renderFormItem = (
  fieldItems: Array<IFormItemConfig>,
  FormItem: ComponentClass<FormItemProps>,
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
            label = dataIndex || key,
            formItemProps,
          } = fieldItem;

          let Widget = getWidget(type);
          const widgetProps = {};
          if (widgetConfig) {
            const { defaultValue, ...other } = widgetConfig;
            Object.assign(widgetProps, other);
          }

          if (Array.isArray(children)) {
            if (type === WidgetTypes.ARRAY) {
              Object.assign(widgetProps, {
                getArrayItem: (index: number) => {
                  children.forEach((child) => {
                    child.key = `${key}[${index}].${child.key}`;
                    child.dataIndex = `${dataIndex}[${index}].${child.dataIndex}`;
                  });
                  return renderFormItem(children, FormItem, getFieldDecorator);
                }
              })
            } else {
              // 这种情况是Object的情况
              children.forEach((child) => {
                child.key = `${key}.${child.key}`;
                child.dataIndex = `${dataIndex}.${dataIndex}`;
              });
              const childrenWidgets = renderFormItem(children, FormItem, getFieldDecorator);
              Object.assign(widgetProps, {
                childrenWidgets,
              });
            }
          }

          if (!Widget) {
            return null;
          }

          let widgetElement = <Widget {...widgetProps} />;

          if (typeof render === 'function') {
            // 自定义表单组件
            widgetElement = render(widgetProps, FormItem, getFieldDecorator);
          }
  
          return (<FormItem
            {...formItemProps}
            label={label}
          >
            {getFieldDecorator(key, {
            })(widgetElement)}
          </FormItem>)
          // return getFieldDecorator()
        })
      }
    </>
  )
}

// const SuperForm = (props: IFormProps) => {
//   const { fieldItems, form } = props;
//   const { getFieldDecorator } = form!;
//   return (
//     <Form { ...props }>
//       {
//         fieldItems && renderFormItem(fieldItems, Form.Item, getFieldDecorator)
//       }
//     </Form>
//   )
// }

class SuperForm extends React.Component<IFormProps> {
  render() {
    const { fieldItems, form } = this.props;
    const { getFieldDecorator } = form!;
    return (
      <Form>
        {
          fieldItems && renderFormItem(fieldItems, Form.Item, getFieldDecorator)
        }
      </Form> 
    );
  }
  
}

export default Form.create<IFormProps>()(SuperForm);