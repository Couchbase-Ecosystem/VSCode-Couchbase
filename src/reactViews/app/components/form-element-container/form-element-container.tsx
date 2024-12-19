import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type FormElementContainerProps = HTMLAttributes<HTMLDivElement> & {
  alwaysFullWidth?: boolean;
  indent?: boolean;
};

export function FormElementContainer({ alwaysFullWidth = true, indent = false, className, ...props }: FormElementContainerProps) {
  return (
    <div
      className={clsx('my-6', alwaysFullWidth ? 'w-full' : 'w-full md:w-3/4 lg:w-1/2 2xl:w-1/3', indent ? 'ml-2' : '', className)}
      {...props}
    />
  );
}
