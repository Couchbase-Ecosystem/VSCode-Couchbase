import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { clsx } from 'clsx';
import { Anchor } from 'components/anchor';
import { File as FileComponent } from 'components/file';
import { Form } from 'components/form';
import { FormElementContainer } from 'components/form-element-container';
import { Icon } from 'components/icon';
import { Chip } from 'components/inputs/autocomplete/chip/chip';
import { Status } from 'components/inputs/autocomplete/chip/chip.types';
import { Dropzone } from 'components/inputs/dropzone';
import { Select } from 'components/inputs/select';
import { TextField } from 'components/inputs/text-field';
import { TextArea } from 'components/inputs/textarea';
import { SUPPORT_IMPACT_OPTIONS, SUPPORT_IMPACT_PRIORITY, SUPPORT_PRIORITY_TEXT, SUPPORT_TOPIC_OPTIONS } from 'constants/support';
import { SupportTicketForm as SupportFormType } from 'sync/support-service';
import { Option } from './support-ticket-form.types';
import { getChipStatus, sdkOptions, sdkOptionsObject } from './support-ticket-form.utils';

export type SupportTicketFormProps = {
  form: SupportFormType;
  files: File[];
  onFileChange: (files: File[]) => void;
  displayFileList?: boolean;
  downloadFile?: boolean;
  projectOptions: Option[];
  databaseOptions: Option[];
  submitLabel?: string;
  edit?: boolean;
  readonly?: boolean;
  requiredFields?: string[];
  onSubmit: (values: SupportFormType) => void;
  onCancel: () => void;
};

export function SupportTicketForm({
  onSubmit,
  onCancel,
  form,
  files,
  onFileChange,
  displayFileList = true,
  downloadFile = false,
  projectOptions,
  databaseOptions,
  submitLabel = 'Create',
  edit = false,
  readonly = false,
  requiredFields = [],
}: SupportTicketFormProps) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      subject: form.subject,
      description: form.description,
      topic: form.topic,
      impact: form.impact,
      project: form.project,
      database: form.database,
      sdk: sdkOptionsObject[form.sdk],
    },
    reValidateMode: 'onChange',
  });

  const handleSubmitForm = handleSubmit((values) => {
    onSubmit(values);
  });

  const [fileDropError, setFileDropError] = useState(false);

  const impactPriority = SUPPORT_IMPACT_PRIORITY[form.impact];
  const impactPriorityContent = SUPPORT_PRIORITY_TEXT[impactPriority];

  const chipStatus: Status = getChipStatus(SUPPORT_IMPACT_PRIORITY[form.impact]);
  const priorityLabel = `${impactPriority} ${impactPriorityContent.title}`;

  return (
    <Form onSubmit={handleSubmitForm} submitLabel={submitLabel} onCancel={onCancel} cancelVariant="tertiary" readonly={readonly}>
      <FormElementContainer alwaysFullWidth={false}>
        <Controller
          render={({ field: { value, onChange } }) => (
            <TextField
              name="subject"
              label="Subject"
              value={value}
              onChange={onChange}
              placeholder="Summarize your support requirements"
              maxLength={150}
              limit={150}
              required
              readonly={readonly}
            />
          )}
          control={control}
          name="subject"
        />
      </FormElementContainer>
      {(!edit || readonly) && (
        <FormElementContainer alwaysFullWidth={false}>
          <Controller
            render={({ field: { value, onChange } }) => (
              <TextArea
                name="description"
                label="Description"
                value={value}
                placeholder="Please include as much detail as possible"
                onChange={onChange}
                readOnly={readonly}
                required
              />
            )}
            name="description"
            control={control}
          />
        </FormElementContainer>
      )}
      <FormElementContainer alwaysFullWidth={false}>
        <Controller
          render={({ field: { value, onChange } }) =>
            readonly ? (
              <TextField name="topic" label="Topic" value={value} onChange={onChange} required readonly={readonly} />
            ) : (
              <Select value={value} onChange={onChange} label="Topic" options={SUPPORT_TOPIC_OPTIONS} />
            )
          }
          name="topic"
          control={control}
        />
      </FormElementContainer>
      <FormElementContainer alwaysFullWidth={false}>
        <Controller
          render={({ field: { value, onChange } }) =>
            readonly ? (
              <TextField name="impact" label="Impact" value={value} onChange={onChange} required readonly={readonly} />
            ) : (
              <Select value={value} onChange={onChange} label="Impact" options={SUPPORT_IMPACT_OPTIONS} placeholder="Select..." />
            )
          }
          name="impact"
          control={control}
        />
      </FormElementContainer>
      <FormElementContainer alwaysFullWidth={false}>
        <Controller
          render={({ field: { value, onChange } }) => (
            <Select
              label={`Project ${!requiredFields.includes('project') ? '(optional)' : ''}`}
              value={value}
              onChange={onChange}
              placeholder="Select..."
              options={projectOptions}
              disabled={readonly}
            />
          )}
          name="project"
          control={control}
        />
      </FormElementContainer>
      <FormElementContainer alwaysFullWidth={false}>
        <Controller
          render={({ field: { value, onChange } }) => (
            <Select
              label={`Database ${!requiredFields.includes('database') ? '(optional)' : ''}`}
              placeholder="Select..."
              value={value}
              onChange={onChange}
              options={databaseOptions}
              disabled={readonly}
            />
          )}
          name="database"
          control={control}
        />
      </FormElementContainer>
      <FormElementContainer alwaysFullWidth={false}>
        <Controller
          render={({ field: { value, onChange } }) =>
            readonly ? (
              <TextField name="sdk" label="SDK" value={value} required readonly={readonly} />
            ) : (
              <Select label="SDK Type (optional)" value={value} onChange={onChange} options={sdkOptions} placeholder="Select..." />
            )
          }
          name="sdk"
          control={control}
        />
      </FormElementContainer>
      <FormElementContainer alwaysFullWidth={false}>
        {!readonly && (
          <>
            <Dropzone
              accept="text/plain,image/jpeg,image/gif,application/json,image/png,application/pdf"
              onDrop={(receivedFiles) => {
                setFileDropError(false);
                onFileChange([...files, ...(receivedFiles as File[])]);
              }}
              onDropRejected={() => {
                setFileDropError(true);
              }}
              multiple
              noClick
            />

            <div className={clsx('flex mt-1 items-end', fileDropError ? 'visible' : 'invisible')}>
              <span className="mr-1 fill-on-error-decoration">
                <Icon name="triangle-exclamation" />
              </span>
              <p className="text-on-error-decoration">There is a problem with one or more files.</p>
            </div>
          </>
        )}

        {files.length > 0 && displayFileList && (
          <div className="mt-4">
            {files.map((file) => (
              <FileComponent
                key={file.name}
                file={file}
                download={downloadFile}
                onRemove={(fileName) => onFileChange(files.filter(({ name }) => name !== fileName))}
              />
            ))}
          </div>
        )}
      </FormElementContainer>
      <FormElementContainer alwaysFullWidth={false}>
        <Chip status={chipStatus} chipType="status">
          <span className="text-xs font-medium uppercase leading-4 text-on-background">{priorityLabel}</span>
        </Chip>
        <p className="mt-3 text-sm leading-6 text-on-background">
          {impactPriorityContent.content}{' '}
          <Anchor openInNewTab href="https://www.couchbase.com/support-policy/cloud">
            <span className="text-sm font-medium leading-6">Learn More</span>
          </Anchor>
        </p>
      </FormElementContainer>
    </Form>
  );
}
