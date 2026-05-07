import React from 'react';
import { Input, Form } from 'antd';
import type { InputProps } from 'antd';

interface InputFieldProps extends InputProps {
  label?: string;
  error?: string;
  name: string;
  required?: boolean;
}

/**
 * Reusable form input field with label and error display.
 */
const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  name,
  required = false,
  type,
  ...rest
}) => {
  const InputComponent = type === 'password' ? Input.Password : Input;

  return (
    <Form.Item
      label={label}
      name={name}
      rules={required ? [{ required: true, message: `${label} is required` }] : []}
      validateStatus={error ? 'error' : undefined}
      help={error}
    >
      <InputComponent size="large" {...rest} />
    </Form.Item>
  );
};

export default InputField;
