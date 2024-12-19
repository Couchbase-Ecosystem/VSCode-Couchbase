type MultiLineCellProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
};

export function MultiLineCell({ title, description }: MultiLineCellProps) {
  return (
    <div className="overflow-hidden align-middle">
      <p className="break-words text-base text-on-background">{title}</p>
      {description && <p className="break-words text-sm text-on-background-alternate">{description}</p>}
    </div>
  );
}
