import { useForm } from 'react-hook-form';
import { debugLog } from 'utils/debug';
import { Form } from './form';

export function ExampleForm() {
  const { register, handleSubmit, reset } = useForm<{ test: string }>({ defaultValues: { test: '' } });

  const handleSubmitForm = handleSubmit((values) => {
    debugLog('handle submit form', values);
    return Promise.resolve(values);
  });

  const handleCancelForm = () => {
    reset();
    // close modal, location backward, etc.
  };

  return (
    <Form onSubmit={handleSubmitForm} onCancel={handleCancelForm} submitLabel="Send message">
      <input type="text" {...register('test')} />
    </Form>
  );
}
