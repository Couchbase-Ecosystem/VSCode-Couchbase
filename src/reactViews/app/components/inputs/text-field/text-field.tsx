import { forwardRef } from 'react';
import { Input, InputProps } from 'components/inputs/input';
import { TextFieldType } from './text-field.types';

export interface TextFieldProps extends InputProps {
  type?: TextFieldType;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({ type = 'text', ...restProps }, ref) => {
  return <Input type={type} {...restProps} ref={ref} />;
});

TextField.displayName = 'TextField';
