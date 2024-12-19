import { Key } from 'react';
import { Chip, ChipProps } from 'components/inputs/autocomplete/chip/chip';

type ChipsCellProps = {
  chipContents: { content: React.ReactNode; key: Key }[];
  chipProps: ChipProps;
};

export function ChipsCell({ chipContents, chipProps }: ChipsCellProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chipContents.map(({ content, key }) => (
        <Chip key={key} {...chipProps}>
          {content}
        </Chip>
      ))}
    </div>
  );
}
