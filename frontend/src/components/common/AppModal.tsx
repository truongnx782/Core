import React from 'react';
import { Modal } from 'antd';
import type { ModalProps } from 'antd';

interface AppModalProps extends ModalProps {
  children: React.ReactNode;
}

/**
 * Reusable modal component wrapping Ant Design Modal with consistent styling.
 */
const AppModal: React.FC<AppModalProps> = ({ children, ...rest }) => {
  return (
    <Modal
      centered
      destroyOnClose
      maskClosable={false}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export default AppModal;
