import React from 'react';
import { Modal } from 'antd';
import type { ModalProps } from 'antd';

interface AppModalProps extends ModalProps {
  children: React.ReactNode;
}

/**
 * Reusable modal component wrapping Ant Design Modal with consistent styling.
 * Component hộp thoại (Modal) tái sử dụng dựa trên Ant Design, chuẩn hoá giao diện.
 */
const AppModal: React.FC<AppModalProps> = ({ children, ...rest }) => {
  return (
    <Modal
      centered
      destroyOnHidden
      mask={{ closable: false }}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export default AppModal;
