import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

type AppVariant = 'primary' | 'danger' | 'ghost' | 'default';

interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: AppVariant;
}

const variantMap: Record<AppVariant, Partial<ButtonProps>> = {
  primary: { type: 'primary' },
  danger: { type: 'primary', danger: true },
  ghost: { type: 'default' },
  default: { type: 'default' },
};

/**
 * Styled button component with predefined variant styles.
 */
const AppButton: React.FC<AppButtonProps> = ({ variant = 'default', children, ...rest }) => {
  const variantProps = variantMap[variant];

  return (
    <Button size="middle" {...variantProps} {...rest}>
      {children}
    </Button>
  );
};

export default AppButton;
