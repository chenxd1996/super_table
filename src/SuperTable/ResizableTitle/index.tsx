import React from 'react';
import { OnResize } from '../type';
import './index.scss';
import { Resizable } from 'react-resizable';

interface IResizableTitle {
  onResize?: OnResize;
  width?: number,
}

export const ResizableTitle = (props: IResizableTitle) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};