import { ComponentProps, forwardRef, ReactNode, Ref } from 'react';
import { clsx } from 'clsx';
import { Button, ButtonVariant } from 'components/button';
import { ButtonContainer } from 'components/button-container/button-container';

export type FormProps = ComponentProps<'form'> & {
  onCancel?: () => void;
  submitLabel?: string;
  submitVariant?: ButtonVariant;
  cancelLabel?: string;
  cancelVariant?: ButtonVariant;
  disabled?: boolean;
  cancelDisabled?: boolean;
  loading?: boolean;
  reverseButtons?: boolean;
  errorText?: string;
  footer?: ReactNode;
  readonly?: boolean;
  fullWidthSubmit?: boolean;
};

export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      submitLabel = 'Submit',
      submitVariant = 'primary',
      onSubmit,
      cancelLabel = 'Cancel',
      cancelVariant = 'secondary',
      onCancel,
      disabled = false,
      cancelDisabled,
      loading = false,
      reverseButtons = false,
      errorText,
      readonly,
      fullWidthSubmit,
      footer,
      children,
      method = 'post',
      ...props
    }: FormProps,
    ref: Ref<HTMLFormElement>
  ) => {
    return (
      <form ref={ref} method={method} onSubmit={onSubmit} {...props}>
        {children}

        {!readonly && (
          <ButtonContainer>
            <div className={clsx(!fullWidthSubmit && 'inline-block')}>
              {reverseButtons && (
                <>
                  {onCancel && (
                    <span className="inline py-5 px-3">
                      <Button type="button" block={false} disabled={cancelDisabled} variant={cancelVariant} onClick={onCancel}>
                        {cancelLabel}
                      </Button>
                    </span>
                  )}
                  {submitLabel && (
                    <Button block={fullWidthSubmit} type="submit" disabled={disabled} loading={loading} variant={submitVariant}>
                      {submitLabel}
                    </Button>
                  )}
                </>
              )}
              {!reverseButtons && (
                <>
                  {submitLabel && (
                    <Button block={fullWidthSubmit} type="submit" disabled={disabled} loading={loading} variant={submitVariant}>
                      {submitLabel}
                    </Button>
                  )}
                  {onCancel && (
                    <span className="inline py-5 px-3">
                      <Button type="button" block={false} variant={cancelVariant} onClick={onCancel} disabled={cancelDisabled}>
                        {cancelLabel}
                      </Button>
                    </span>
                  )}
                </>
              )}
            </div>
          </ButtonContainer>
        )}
        {errorText && !loading && <p className="text-base text-on-error-decoration">{errorText}</p>}
        {footer}
      </form>
    );
  }
);

Form.displayName = 'Form';
