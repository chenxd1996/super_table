import React, { useState, useCallback } from 'react';
import { Modal } from 'antd';

export interface PictureRendererConfig {
  width?: number | string;
}

type PictureRendererProps = {
  value: any;
} & PictureRendererConfig;

export default React.memo((props: PictureRendererProps) => {
  const { value, width } = props;
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <>
      <img
        src={value}
        alt=""
        width={width}
        onClick={openModal}
        style={{
          cursor: 'pointer',
        }}
      />
      <Modal
        visible={modalVisible}
        footer={null}
        onCancel={closeModal}
      >
        <img
          src={value}
          alt=""
          style={{
            marginTop: 20,
            width: '100%',
          }}
        />
      </Modal>
    </>
  )
});