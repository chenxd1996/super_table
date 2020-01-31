import React, { ReactElement, useState } from 'react';
import { Badge } from 'antd';

type StatusColors = 'success' | 'error' | 'default' | 'processing' | 'warning';

export interface Status {
  mapValue: string | ReactElement;
  color?: StatusColors;
};

export interface StatusMap {
  [key: string]: Status;
}

export interface StatusRendererConfig {
  statusMap?: StatusMap | Promise<StatusMap>;
  useOptions?: boolean;
  fetchConfig?: {
    url: string;
    dataPath?: string;
    labelKey?: string;
    valueKey?: string;
  };
}

type StatusRendererProps = {
  value: any;
} & StatusRendererConfig;

export default React.memo((props: StatusRendererProps) => {
  const {
    value,
    statusMap: getStatusMap = {},
  } = props;

  const isStatusMapPromise = (statusMap: StatusMap | Promise<StatusMap>): statusMap is Promise<StatusMap> => {
    return statusMap instanceof Promise;
  };

  const [statusMap, setStatusMap] = useState(isStatusMapPromise(getStatusMap) ? {} : getStatusMap);
  if (isStatusMapPromise(statusMap)) {
    statusMap.then((res) => {
      setStatusMap(res);
    });
  }

  const { color, mapValue } = statusMap[value] || {};

  return <Badge status={color} text={mapValue} />
});