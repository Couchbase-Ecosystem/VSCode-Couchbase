import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { Button } from 'components/button';
import { Icon } from 'components/icon';

type FileProps = {
  unit?: 'KB' | 'MB';
  download?: boolean;
  file: File;
  onRemove?: (fileName: string) => void;
};

export function File({ unit = 'KB', download, file, onRemove }: FileProps) {
  const fileExtensionRegexp = /\.[^/.]+$/;
  return (
    <div
      className={clsx(
        'flex px-3 py-4 mb-4 rounded-md border border-on-background-decoration',
        download || onRemove ? 'justify-between' : 'justify-start'
      )}
    >
      <div className="flex items-center gap-x-2">
        <span className="text-base font-medium leading-6 text-on-background ">{file.name.replace(fileExtensionRegexp, '')}</span>
        <Icon name="circle-small" size="xsmall" />
        <span className="text-base leading-6 text-on-background">
          {file.size} {unit}
        </span>
      </div>
      {(download || onRemove) && (
        <div className="flex gap-x-4">
          {download && (
            <Button variant="tertiary" className="relative">
              <span className="flex items-center gap-x-1">
                <Icon name="download" />
                <span>Download</span>
                <Link to={file.name} download className="absolute z-50 text-background inset-0">
                  file link
                </Link>
              </span>
            </Button>
          )}
          {onRemove && (
            <Button
              variant="tertiary"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(file.name);
              }}
            >
              <span className="flex items-center gap-x-1 fill-on-background text-on-background">
                <Icon name="close" />
                <span>Remove</span>
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
