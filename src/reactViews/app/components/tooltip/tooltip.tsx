import { createPortal } from 'react-dom';
import { TriggerType, usePopperTooltip } from 'react-popper-tooltip';
import { Placement, PositioningStrategy } from '@popperjs/core';
import { clsx } from 'clsx';

type TooltipProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  renderContent: () => React.ReactNode;
  strategy?: PositioningStrategy;
  placement?: Placement;
  trigger?: TriggerType;
  dark?: boolean;
  withPortal?: boolean;
};

const [TOOLTIP_OFFSET_X, TOOLTIP_OFFSET_Y] = [0, 12];
const TOOLTIP_CLASSES_BY_PLACEMENT: { [placement: string]: string } = {
  top: '-bottom-2.5 ml-0.5',
  bottom: '-top-1.5 ml-0.5',
  right: '-left-1.5 mt-0.5',
  left: '-right-2.5 mt-0.5',
};

export function Tooltip({
  placement,
  strategy = 'absolute',
  trigger = 'hover',
  dark = false,
  renderContent,
  withPortal = false,
  ...props
}: TooltipProps) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible, state } = usePopperTooltip(
    { trigger, placement, offset: [TOOLTIP_OFFSET_X, TOOLTIP_OFFSET_Y], interactive: true, delayHide: 100 },
    { strategy }
  );
  const content = renderContent();

  const computedPlacement = state ? state.placement : 'auto';
  const [corePlacement] = computedPlacement.split('-');

  const contentToRender = (
    <div
      {...getTooltipProps({
        className: clsx(
          'tooltip-parent absolute text-xs leading-normal font-normal border rounded border-on-background-decoration shadow py-2 px-3 cursor-auto select-text',
          dark ? 'bg-on-inactive text-background' : 'bg-background text-on-background-alternate',
          corePlacement
        ),
        style: {
          visibility: visible ? 'visible' : 'hidden',
        },
      })}
      ref={setTooltipRef}
    >
      <div
        {...getArrowProps({
          className: clsx(
            'triangle-with-shadow absolute w-[1.125rem] h-[1.125rem]',
            'after:absolute after:w-3.5 after:h-3.5 after:rotate-45',
            dark ? 'after:bg-on-inactive' : 'after:bg-background',
            TOOLTIP_CLASSES_BY_PLACEMENT[corePlacement]
          ),
        })}
      />
      <span className="whitespace-nowrap">{content}</span>
    </div>
  );

  return (
    <>
      <div {...props} ref={setTriggerRef} />
      {withPortal ? createPortal(contentToRender, document.body) : contentToRender}
    </>
  );
}
