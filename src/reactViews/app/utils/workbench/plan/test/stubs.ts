import { ExecutionPlanNode, Plan } from 'types/plan';

export const plan1: Plan = {
  operator: {
    operatorId: 'op1',
    '#operator': 'Stream',
    '#stats': { '#itemsIn': 48, '#itemsOut': 48, '#phaseSwitches': 49, execTime: '484.748µs' },
    '#time_absolute': 0.000484748,
    '#time_normal': '00:00.000',
  },
  time_percent: 10,
  subsequence: {
    operator: {
      '#operator': 'op2',
    },
    time_percent: 5,
    predecessor: [
      {
        operator: {
          '#operator': 'op3',
        },
        time_percent: 3,
      },
    ],
  },
};

export const plan2: Plan = {
  operator: {
    operatorId: 'operator2',
    '#operator': 'Stream',
    '#stats': { '#itemsIn': 12, '#itemsOut': 21, '#phaseSwitches': 9, execTime: '34.748µs' },
    '#time_absolute': 0.000421748,
    '#time_normal': '00:00.000',
  },
  time_percent: 10,
  predecessor: [
    {
      operator: {
        '#operator': 'operator3',
      },
      time_percent: 2,
    },
    {
      operator: {
        '#operator': 'operator4',
      },
      time_percent: 5,
    },
  ],
};

export const executionPlanNode: ExecutionPlanNode = {
  name: 'Distinct',
  details: ['00:00.000 (10%)', '48 in / 48 out'],
  parent: 'null',
  level: 'node',
  time: undefined,
  time_percent: undefined,
  tooltip: '',
  cloneOf: null,
  children: [
    {
      name: 'Distinct',
      details: [],
      parent: 'Distinct',
      level: 'node',
      time: undefined,
      time_percent: undefined,
      tooltip: '',
      cloneOf: null,
      children: [
        {
          name: 'Project',
          details: ['1 terms'],
          parent: 'Distinct',
          level: 'node',
          time: undefined,
          time_percent: undefined,
          tooltip:
            '<div class="row"><h5>InitialProject</h5></div><ul class="wb-explain-tooltip-list"><li>distinct - true</li><li>result_terms<ul><li>expr - (`landmark`.`city`)</li></ul></li></ul>',
          cloneOf: null,
          children: [
            {
              name: 'Fetch',
              details: ['landmark'],
              parent: 'Project',
              level: 'node',
              time: undefined,
              time_percent: undefined,
              tooltip:
                '<div class="row"><h5>Fetch</h5></div><ul class="wb-explain-tooltip-list"><li>bucket - travel-sample</li><li>keyspace - landmark</li><li>namespace - default</li><li>scope - inventory</li></ul>',
              cloneOf: null,
              children: [
                {
                  name: 'PrimaryScan3',
                  details: [],
                  parent: 'Fetch',
                  level: 'node',
                  time: undefined,
                  time_percent: undefined,
                  tooltip:
                    '<div class="row"><h5>PrimaryScan3</h5></div><ul class="wb-explain-tooltip-list"><li>bucket - travel-sample</li><li>index - def_inventory_landmark_primary</li><li>index_projection<ul><li>primary_key - true</li></ul></li><li>keyspace - landmark</li><li>namespace - default</li><li>scope - inventory</li><li>using - gsi</li></ul>',
                  cloneOf: null,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const nodeStub = {
  data: {
    children: [],
    details: ['Detail 1', 'Detail 2', 'Detail 3'],
    level: '1',
    name: 'Node Name',
    parent: null,
    time: undefined,
    time_percent: 0,
    tooltip: 'Node Tooltip',
  },
  children: [],
  depth: 0,
  height: 0,
};
