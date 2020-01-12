import React, { useCallback } from 'react';
import { Upload, Button, Icon } from 'antd';
import { UploadProps, DraggerProps } from 'antd/lib/upload';
import { UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { OnChange } from '../../type';
import { ButtonProps } from 'antd/lib/button';
import { IconProps } from 'antd/lib/icon';

const { Dragger } = Upload;

export enum UploaderModes {
  NORMAL = 'normal',
  DRAG = 'drag',
}

interface IUploadPropsMap {
  [UploaderModes.NORMAL]: UploadProps;
  [UploaderModes.DRAG]: DraggerProps;
}

export type IUploadRenerProps = {
  mode: UploaderModes;
  value?: Array<UploadFile>;
  onChange: OnChange;
  buttonProps?: ButtonProps;
  iconProps?: IconProps;
  uploadText?: string | React.ReactNode;
} & IUploadPropsMap[UploaderModes];

const DEFAULT_UPLOAD_TEXT = '点击上传';
const DEFAULT_DRAG_TEXT = '点击或者拖拽上传';

export default React.memo((props: IUploadRenerProps) => {
  const {
    mode = UploaderModes.NORMAL,
    value,
    onChange,
    buttonProps,
    iconProps,
    uploadText,
    ...other
  } = props;

  const handleChange = useCallback((info: UploadChangeParam) => {
    const { fileList } = info;
    onChange(fileList);
  }, [onChange]);

  switch (mode) {
    case UploaderModes.NORMAL:
      return (
        <Upload
          fileList={value}
          onChange={handleChange}
          {...other}
        >
          <Button {...buttonProps} >
            <Icon type="upload" {...iconProps} />
            {uploadText || DEFAULT_UPLOAD_TEXT}
          </Button>
        </Upload>
      )
    case UploaderModes.DRAG:
      return (
        <Dragger
          fileList={value}
          onChange={handleChange}
          {...other}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" {...iconProps} />
          </p>
          <p className="ant-upload-text">{uploadText || DEFAULT_DRAG_TEXT}</p>
        </Dragger>
      )
    default:
      return null;
  }
});