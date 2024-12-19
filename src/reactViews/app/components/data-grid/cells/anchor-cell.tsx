import { Anchor, AnchorProps } from 'components/anchor';

export function AnchorCell({ children, ...props }: AnchorProps) {
  return <Anchor {...props}>{children}</Anchor>;
}
