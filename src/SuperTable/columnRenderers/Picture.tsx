import React from 'react';

export interface PictureRendererConfig {
}

type PictureRendererProps = {
  value: any;
} & PictureRendererConfig;

export default React.memo((props: PictureRendererProps) => {
  const { value } = props;

  return (
    <>
      <img src={value} alt="" />
    </>
  )
});