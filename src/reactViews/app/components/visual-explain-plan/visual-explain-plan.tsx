import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Button } from 'components/button';
import { IconName } from 'components/icon/icon.types';
import { FS_EXCLUDE } from 'constants/full-story';
import { select } from 'd3-selection';
import { ZoomBehavior } from 'd3-zoom';
import equal from 'fast-deep-equal';
import { Lists, Orientation, Plan, PlanOptions } from 'types/plan';
import { analyzePlan, convertN1QLPlanToPlanNodes, makeD3TreeFromSimpleTree, makeSimpleTreeFromPlanNodes } from 'utils/workbench';

interface VisualExplainPlanProps {
  plan: Plan;
  hideControls: boolean;
}

export function VisualExplainPlan({ plan, hideControls }: VisualExplainPlanProps) {
  const ref = useRef<HTMLDivElement>(null);
  const zoomer = useRef<ZoomBehavior<Element, unknown> | null>(null);
  const lists = useRef<Lists | null>(null);
  const [options, setOptions] = useState<PlanOptions>({
    lineHeight: 15,
    orientation: Orientation.LeftToRight,
    compact: false,
  });

  const calculateOptions = (node: HTMLDivElement) => {
    const { width, height } = node.getBoundingClientRect();
    setOptions((prevOptions) => ({
      ...prevOptions,
      compact: false,
      orientation: width > height ? Orientation.RightToLeft : Orientation.BottomToTop,
    }));
  };

  useEffect(() => {
    if (ref.current) {
      calculateOptions(ref.current);
    }
  }, [ref]);

  const prevPlan = useRef<Plan | null>(null);
  const prevOptions = useRef<PlanOptions>();

  useEffect(() => {
    if (plan && ref.current && !(equal(prevPlan.current, plan) && equal(prevOptions.current, options))) {
      prevPlan.current = { ...plan };
      prevOptions.current = { ...options };

      while (ref.current.hasChildNodes()) {
        if (ref.current.lastChild) {
          ref.current.removeChild(ref.current.lastChild);
        }
      }
      lists.current = analyzePlan(plan, null);
      const nodes = convertN1QLPlanToPlanNodes(plan, null, lists.current);
      if (nodes) {
        const tree = makeSimpleTreeFromPlanNodes(nodes, null, 'null');
        if (tree) {
          zoomer.current = makeD3TreeFromSimpleTree(tree, ref.current, options);
        }
      }
    }
  }, [plan, options]);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        calculateOptions(ref.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const zoom = (zoomIn: boolean) => {
    if (ref.current && zoomer.current) {
      const scale = zoomIn ? 2 : 0.5;
      select(ref.current)
        // @ts-ignore
        .transition()
        .call(zoomer.current?.scaleBy, scale);
    }
  };

  const itemLists = [
    { title: 'Indexes', items: Object.keys(lists.current?.indexes || {}) },
    { title: 'Collections', items: Object.keys(lists.current?.buckets || {}) },
    { title: 'Fields', items: Object.keys(lists.current?.fields || {}) },
  ];

  const buttonList = [
    { label: 'left-to-right', orientation: Orientation.LeftToRight, icon: 'left-chevron' },
    { label: 'right-to-left', orientation: Orientation.RightToLeft, icon: 'right-chevron' },
    { label: 'bottom-to-top', orientation: Orientation.TopToBottom, icon: 'up-chevron' },
    { label: 'top-to-bottom', orientation: Orientation.BottomToTop, icon: 'down-chevron' },
  ];

  const renderButton = (button: { label: string; orientation: Orientation; icon: string }) => {
    return (
      <Button
        key={button.label}
        disabled={options.orientation === button.orientation}
        iconOnly
        label={button.label}
        icon={button.icon as IconName}
        onClick={() =>
          setOptions((prevOptions) => ({
            ...prevOptions,
            orientation: button.orientation,
          }))
        }
        className={clsx({
          'cursor-pointer': options.orientation !== button.orientation,
        })}
      />
    );
  };

  const renderKeysList = (title: string, items: string[]) => {
    const itemTitle = items.length ? undefined : `No ${title.toLowerCase()} found`;
    const noItemsFound: boolean = items.length === 0;

    return (
      <div className="overflow-hidden text-ellipsis" key={title}>
        <span
          className={clsx('text-sm font-bold text-on-background-alternate', {
            'cursor-pointer': noItemsFound,
          })}
          title={itemTitle}
        >
          {title}
        </span>
        <span
          className={clsx('cursor-pointer italic ml-1', {
            hidden: noItemsFound,
          })}
          title={items.join('\n')}
        >
          {items.map((key) => (
            <span key={key} className="mr-2">
              {key}
            </span>
          ))}
        </span>
      </div>
    );
  };

  return (
    <div className="h-full w-full">
      {!hideControls && plan && (
        <div className="flex w-full items-center gap-4 bg-surface p-2 shadow">
          {itemLists.map((item) => renderKeysList(item.title, item.items))}
          <div className="ml-auto flex gap-2">{buttonList.map((button) => renderButton(button))}</div>
          <div className="ml-6 flex gap-2">
            <Button label="zoom-out" icon="minus" iconOnly onClick={() => zoom(false)} />
            <Button label="zoom-in" icon="plus" iconOnly onClick={() => zoom(true)} />
          </div>
        </div>
      )}
      <div className={`h-full w-full ${FS_EXCLUDE}`} ref={ref} />
    </div>
  );
}
