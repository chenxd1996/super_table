import React from 'react';

export interface LinkRendererConfig {
  linkText?: string;
};

type LinkRendererProps = {
  value: any;
} & LinkRendererConfig;

export default React.memo((props: LinkRendererProps) => {
  const {
    value,
    linkText = value,
  } = props;

  return <a href={value}>{linkText}</a>
});