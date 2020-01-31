import React from 'react';
import _get from 'lodash.get';
import DateRenderer, { DateRendererConfig } from './Date';
import LinkRenderer, { LinkRendererConfig } from './Link';
import PictureRenderer, { PictureRendererConfig } from './Picture';
import StatusRenderer, { StatusRendererConfig, StatusMap, Status } from './Status';
import { IMapperConfig } from '../type';
import { IFormItemConfig } from '../../SuperForm/type';
import { IDateProps } from '../../SuperForm/widgets/DateTime';
import { ISelectProps } from '../../SuperForm/widgets/Select';
import { fetchData } from '../../common';

export type ColumnRendererConfig =
 DateRendererConfig | LinkRendererConfig | PictureRendererConfig | StatusRendererConfig;

export const columnRendererTypes = {
  date: 'date',
  link: 'link',
  picture: 'picture',
  status: 'status',
}

export type ColumnRendererType = keyof typeof columnRendererTypes;

const renderers = {
  [columnRendererTypes.date]: DateRenderer,
  [columnRendererTypes.link]: LinkRenderer,
  [columnRendererTypes.picture]: PictureRenderer,
  [columnRendererTypes.status]: StatusRenderer,
};

const mergeConfig = (
  mapConfig: IMapperConfig,
  formWidgetConfig?: IFormItemConfig['widgetConfig'],
) => {
  const { type, config = {} } = mapConfig;

  if (type === columnRendererTypes.date) {
    const { timestampType } = config as DateRendererConfig;
    if (!timestampType) {
      (config as DateRendererConfig).timestampType  = (formWidgetConfig as IDateProps).timestampType;
    }
  }

  if (type === columnRendererTypes.status) {
    const { statusMap } = config as StatusRendererConfig;
    if (!statusMap) {
      const { options = [] } = formWidgetConfig as ISelectProps || {};
      (config as StatusRendererConfig).statusMap = options.reduce<StatusMap>((prev, current) => {
        const { label, value } = current;
        prev[value] = { mapValue: label };
        return prev;
      }, {});
    }
  }
}

const fetchStatusMap = async (url: string, dataPath?: string, valueKey?: string, labelKey?: string) => {
  try {
    const data = await fetchData(url, dataPath);
    if (Array.isArray(data) && valueKey && labelKey) {
      return data.reduce<{
        [key: string]: Status;
      }>((prev, current) => {
        const label = _get(current, labelKey);
        const value = _get(current, valueKey);
        prev[value] = { mapValue: label };
        return prev;
      }, {})
    } else if (Array.isArray(data)) {
      return {};
    }
    return data || {};
  } catch (e) {
    console.error('fetch status map error:', e);
    throw e;
  }
}

export default (mapConfig: IMapperConfig, formWidgetConfig?: IFormItemConfig['widgetConfig']) => {
  if (mapConfig && formWidgetConfig) {
    mergeConfig(mapConfig, formWidgetConfig);
  }

  if (mapConfig &&
    mapConfig.type === columnRendererTypes.status  
  ) {
    const config = mapConfig.config as StatusRendererConfig || {};
    const { fetchConfig } = config;
    if (fetchConfig) {
      const {
        url, dataPath, labelKey, valueKey,
      } = fetchConfig;
  
      config.statusMap = fetchStatusMap(url, dataPath, valueKey, labelKey);
    }
  }

  const { type, config } = mapConfig;
  return (text: string, record: any, index: number) => {
    const Renderer = renderers[type];

    if (Renderer) {
      return <Renderer {...config} value={text} />;
    }
  }
};