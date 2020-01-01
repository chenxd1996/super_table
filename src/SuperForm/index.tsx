import React, { ComponentClass } from 'react';
import { Form } from 'antd';
import memorize from 'memoize-one';
import {
  IFormItemConfig,
  WidgetTypes,
  GetFieldDecoratorType,
  WrappedRule,
  WidgetProps,
  LabelType,
  GetArrayItem,
} from './type';
import { FormComponentProps, FormItemProps } from 'antd/lib/form';
import { getWidget } from './widgets';
import { WrappedFormUtils, ValidationRule } from 'antd/lib/form/Form';

interface IFormProps extends FormComponentProps {
  fieldItems?: Array<IFormItemConfig>;
}

/**
 * 如果有validator则包一层，主要是为了注入表单其他字段的值，以提供校验
 * @param rules 
 * @param form 
 */
const getWrappedValidator = (rules: WrappedRule[], form: WrappedFormUtils): ValidationRule[] => {
  return rules.map((rule) => {
    const { validator, ...other } = rule;
    if (validator) {
      const wrappedValidator = (rule: any, value: any, callback: any, source: any, options: any) => {
        validator({ rule, callback, value, source, options, formValues: form.getFieldsValue(), form });
      }
      Object.assign(other, {
        validator: wrappedValidator,
      })
    }
    return other;
  });
}

/**
 * 是否渲染FormItem
 * Array组件由于要定制标签，所以需要在Array组件内部进行渲染
 */
const shouldRenderFormItem = (type: WidgetTypes) => {
  return type !== WidgetTypes.ARRAY;
}

/**
 * 如果标签是个函数，则执行函数，获取标签
 */
const getLabel = (label: LabelType, getArrayItem?: GetArrayItem) => {
  if (typeof label === 'function') {
    return label(getArrayItem);
  }
  return label;
}

const renderFormItem = memorize((
  fieldItems: Array<IFormItemConfig>,
  FormItem: ComponentClass<FormItemProps>,
  getFieldDecorator: GetFieldDecoratorType,
  form: WrappedFormUtils,
): React.ReactNode => {
  return (
    fieldItems.map((fieldItem) => {
      const {
        type,
        key,
        dataIndex,
        label = dataIndex || key,
        widgetConfig,
        render,
        children,
        formItemProps,
        getFieldDecoratorOptions = { rules: [] },
      } = fieldItem;


      let Widget = getWidget(type);
      const widgetProps: WidgetProps = {};
      if (widgetConfig) {
        // 取出除了defaultValue之外的其他配置
        const { defaultValue, ...other } = widgetConfig;
        Object.assign(widgetProps, other);
      }

      const { rules = [] } = getFieldDecoratorOptions;
      const newRules = getWrappedValidator(rules, form);

      const isArrayType = type === WidgetTypes.ARRAY;
      const isObjectType = type === WidgetTypes.OBJECT;

      if (Array.isArray(children)) {
        if (isArrayType) {
          Object.assign(widgetProps, {
            getArrayItem: (index: number) => {
              const childrenCopy = children.map((child) => {
                const fullKey = `${key}[${index}].${child.key}`;
                const fullDataIndex = `${dataIndex}[${index}].${child.dataIndex}`;
                return {
                  ...child,
                  key: fullKey,
                  dataIndex: fullDataIndex,
                }
              });
              return renderFormItem(childrenCopy, FormItem, getFieldDecorator, form);
            },
            getFieldDecorator,
            FormItem,
            label,
            key,
            nodeKey: key,
            formItemProps,
            defaultValue: widgetConfig?.defaultValue,
          });
        } else {
          // 这种情况是Object的情况
          const childrenCopy = children.map((child) => {
            const fullKey = `${key}.${child.key}`;
            const fullDataIndex = `${dataIndex}.${child.dataIndex}`;
            return {
              ...child,
              key: fullKey,
              dataIndex: fullDataIndex,
            }
          });
          const childrenWidgets = renderFormItem(childrenCopy, FormItem, getFieldDecorator, form);

          Object.assign(widgetProps, {
            childrenWidgets,
          });
        }
      }

      let widgetElement = Widget && <Widget {...widgetProps} />;

      if (typeof render === 'function') {
        // 自定义表单组件
        widgetElement = render({
          widgetProps,
          FormItem,
          getFieldDecorator,
          widgetElement,
          fieldInfo: fieldItem,
        });
      } else if (!shouldRenderFormItem(type)) {
        // 没有自定义表单的情况下
        return widgetElement;
      }

      return (
        <FormItem
          {...formItemProps}
          label={getLabel(label, widgetProps.getArrayItem)} // Array类型的标签在ArrayRender渲染
          key={key}
        >
          {
            // 这里判断是Object类型，就不要用getFieldDecorator包一层
            // 不然会报warning
            isObjectType ?
              (widgetElement || widgetProps.childrenWidgets) :
              getFieldDecorator(key as string, {
                initialValue: widgetConfig?.defaultValue,
                ...getFieldDecoratorOptions,
                rules: newRules,
              })(widgetElement)
          }
        </FormItem>
      )
      // return getFieldDecorator()
    })
  )
});

class SuperForm extends React.Component<IFormProps> {
  render() {
    const { fieldItems, form } = this.props;
    const { getFieldDecorator } = form!;
    return (
      <Form>
        {
          fieldItems && renderFormItem(fieldItems, Form.Item, getFieldDecorator, form)
        }
      </Form> 
    );
  }
  
}

export default Form.create<IFormProps>()(SuperForm);