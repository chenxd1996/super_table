import React, { ReactElement } from 'react';
import { Card, Button } from 'antd';

interface IArrayItemProps {
  arrayItemTitle?: string, // 新增子项的标题
  arrayItemContainerStyle?: React.CSSProperties; // 子项容器的样式
  items: Array<React.ReactElement>;
  deleteBtnText?: string; // 删除按钮的文案
  deleteBtnStyle?: React.CSSProperties; // 删除按钮样式
  deleteBtn?: ReactElement; // 定制删除按钮
  deleteItem: () => void;
  canDelete: boolean;
}

export default React.memo((props: IArrayItemProps) => {
  const {
    arrayItemTitle,
    arrayItemContainerStyle,
    items,
    deleteBtn,
    deleteBtnStyle,
    deleteBtnText,
    deleteItem,
    canDelete,
  } = props;


  const defaultDeleteBtn = (
    <Button
      style={deleteBtnStyle}
      onClick={deleteItem}
      size="small"
      type="danger"
    >
        {deleteBtnText}
    </Button>
  );
  
  return (
    <Card
      title={arrayItemTitle}
      size="small"
      extra={canDelete ? (deleteBtn || defaultDeleteBtn) : null}
      // bordered={false}
    >
      <div
        style={arrayItemContainerStyle}
      >
        {
          items.map((item) => {
            return item;
          })
        }
      </div>
    </Card>
  );
});