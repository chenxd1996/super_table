import React, { ComponentClass, ReactElement, ReactNode } from 'react';
import { Form } from 'antd';
import memorize from 'memoize-one';
import { FormComponentProps, FormItemProps } from 'antd/lib/form';
import { WrappedFormUtils, ValidationRule, FormProps } from 'antd/lib/form/Form';
import _get from 'lodash.get';
import _set from 'lodash.set';
import _cloneDeep from 'lodash.clonedeep';

import {
  IFormItemConfig,
  WidgetTypes,
  GetFieldDecoratorType,
  WrappedRule,
  WidgetProps,
  LabelType,
  GetArrayItem,
  FormValues,
  GetFieldDecoratorWrapper,
  OnFormChange,
  OnFormChangeWrapper,
} from './type';
import { getWidget } from './widgets';
import ArrayWrapper from './ArrayWrapper';
import WidgetWrapper from './WidgetWrapper';

interface IFormPropsAppend {
  fieldItems: Array<IFormItemConfig>;
  initialValues?: FormValues;
  onChange?: OnFormChange;
}

export type IFormProps = IFormPropsAppend
  & Pick<FormProps, Exclude<keyof FormProps, keyof IFormPropsAppend>>
  & FormComponentProps;

/**
 * 如果有validator则包一层，主要是为了注入表单其他字段的值，以提供校验
 * @param rules 
 * @param form 
 */
const wrappValidator = (rules: WrappedRule[], form: WrappedFormUtils): ValidationRule[] => {
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
const shouldRenderFormItem = (type: WidgetTypes, hasCustomRenderer: boolean) => {
  return type !== WidgetTypes.ARRAY && !hasCustomRenderer;
}

/**
 * 如果标签是个函数，则执行函数，获取标签
 */
const getLabel = (label: LabelType) => {
  if (typeof label === 'function') {
    return label();
  }
  return label;
}

const renderFormItem = memorize((
  fieldItems: Array<IFormItemConfig>,
  FormItem: ComponentClass<FormItemProps>,
  getFieldDecorator: GetFieldDecoratorWrapper,
  form: WrappedFormUtils,
  handleFormChange: OnFormChangeWrapper,
  initialValues: FormValues,
  currentValues: FormValues,
): React.ReactNode => {
  return (
    fieldItems.map((fieldItem) => {
      const {
        type,
        dataIndex,
        key = dataIndex,
        label = dataIndex || key,
        widgetConfig,
        getRenderer,
        children,
        formItemProps,
        getFieldDecoratorOptions = { rules: [] },
        inputAdaptor,
        outputAdaptor,
      } = fieldItem;


      let Widget = getWidget(type);

      const widgetProps: WidgetProps = {};
    
      if (widgetConfig) {
        // 取出除了defaultValue之外的其他配置
        const { defaultValue, ...other } = widgetConfig;
        Object.assign(widgetProps, other);
      }

      const isArrayType = type === WidgetTypes.ARRAY;
      const isObjectType = type === WidgetTypes.OBJECT;

      // 取出初始值
      const initialValue = _get(initialValues, dataIndex!, widgetConfig?.defaultValue);
      
      // 当前表单所有值
      const formValues = form.getFieldsValue();
      // 当前值
      const value = _get(formValues, dataIndex!, initialValue);

      let widgetElement: ReactElement | null;

      // 数组类型获取子项
      const getArrayItem: GetArrayItem = (index: number) => {
        const childrenCopy = children!.map((child) => {
          const fullKey = `${key}[${index}].${child.key}`;
          const fullDataIndex = `${dataIndex}[${index}].${child.dataIndex}`;
          return {
            ...child,
            key: fullKey,
            dataIndex: fullDataIndex,
          }
        });
        return renderFormItem(
          childrenCopy,
          FormItem,
          getFieldDecorator,
          form,
          handleFormChange,
          initialValues,
          currentValues,
        );
      };

      if (Array.isArray(children)) {
        if (isArrayType) {
          Object.assign(widgetProps, {
            getFieldDecorator,
            FormItem,
            label,
            key,
            nodeKey: key,
            formItemProps,
            initialValue,
          });
        } else if (isObjectType) {
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
          const childrenWidgets = renderFormItem(
            childrenCopy,
            FormItem,
            getFieldDecorator,
            form,
            handleFormChange,
            initialValues,
            currentValues,
          );

          Object.assign(widgetProps, {
            childrenWidgets,
          });
        }
      }

      const hasCustomRenderer = typeof getRenderer === 'function';

      if (hasCustomRenderer) {
        // 自定义表单组件
        widgetElement = getRenderer!({
          value,
          values: formValues,
          FormItem,
          getFieldDecorator,
          widgetProps,
          DefaultRenderer: Widget,
        });

        // Widget = data.renderer;
        // Object.assign(widgetProps, data.props || {});
      } else {
        widgetElement = Widget && <Widget {...widgetProps} />;
      }

      if (!widgetElement) {
        return null;
      }

      if (isArrayType) {
        // Object.assign(widgetProps, {
        //   WidgetClass: Widget,
        //   getArrayItem: getArrayItem,
        // });
        // Widget = ArrayWrapper;
        widgetElement = (
          <ArrayWrapper
            getArrayItem={getArrayItem}
            elementToWrap={widgetElement}
          />
        );
      }

      widgetElement = (
        <WidgetWrapper
          inputAdaptor={inputAdaptor}
          outAdaptor={outputAdaptor}
          // widgetProps={widgetProps}
          // WidgetClass={Widget}
          elementToWrap={widgetElement}
          handleFormChange={handleFormChange}
          dataIndex={dataIndex!}
          key={key}
          form={form}
          currentValues={currentValues}
        />
      );

      if (!shouldRenderFormItem(type, hasCustomRenderer)) {
        // 没有自定义表单的情况下并且是数组类型的情况下
        return widgetElement;
      }

      return (
        <FormItem
          {...formItemProps}
          label={getLabel(label)} // Array类型的标签在ArrayRender渲染
          key={key}
        >
          {
            // 这里判断是Object类型，就不要用getFieldDecorator包一层
            // 不然会报warning
            isObjectType ?
              (widgetElement || widgetProps.childrenWidgets) :
              getFieldDecorator(dataIndex as string, {
                ...getFieldDecoratorOptions,
                initialValue,
              })(widgetElement)
          }
        </FormItem>
      )
    })
  )
});

class SuperForm extends React.Component<IFormProps> {
  private values: FormValues = {}; // 保存经过处理后的数据

  private wrapGetFieldDecorator(getFieldDecorator: GetFieldDecoratorType) {
    const { form } = this.props;

    const getFieldDecoratorWrapepr: GetFieldDecoratorWrapper = (key, options) => {
      const { rules = [] } = options!;
      const newRules = wrappValidator(rules, form);
      return getFieldDecorator(key, {
        ...options,
        rules: newRules,
      });
    }
    return getFieldDecoratorWrapepr;
  }

  private handleFormChange(change: { [field: string]: any }) {
    const { onChange } = this.props;
    if (typeof onChange === 'function') {
      const currentValues = this.values;
      Object.keys(change).forEach((key) => {
        _set(currentValues, key, change[key]);
      });
      onChange(currentValues, change);      
    }
  }

  private getCurrentValues = memorize((initialValues) => {
    this.values = {
      ..._cloneDeep(initialValues),
      ...this.values,
    }
    return this.values;
  });

  render() {
    const {
      fieldItems,
      form,
      initialValues = {},
      children,
      onChange,
      ...other
    } = this.props;
    const { getFieldDecorator } = form!;
    const wrappedGetFieldDecorator = this.wrapGetFieldDecorator(getFieldDecorator);
    const currentValues = this.getCurrentValues(initialValues);
    return (
      <Form
        {...other}
      >
        {
          fieldItems && renderFormItem(
            fieldItems,
            Form.Item,
            wrappedGetFieldDecorator,
            form,
            this.handleFormChange.bind(this),
            initialValues,
            currentValues,
          )
        }
        {children}
      </Form> 
    );
  }
}

export default Form.create<IFormProps>()(SuperForm);