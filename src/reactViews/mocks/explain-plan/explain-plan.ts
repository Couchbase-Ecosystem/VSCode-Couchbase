
export interface Plan {
    operatorId?: string;
    '#operator'?: string;
    operator?: Plan;
    plan?: Plan;
    bucket?: string;
    index_id?: string;
    index_projection?: {};
    namespace?: string;
    scope?: string;
    spans?: [{}];
    using?: string;
    hint_not_followed?: string;
    privileges?: {
        List?: [{}];
    };
    '#time'?: string;
    '#stats'?: {
        execTime?: string;
        servTime?: string;
        '#itemsIn'?: number;
        '#itemsOut'?: number;
        '#phaseSwitches'?: number;
        kernTime?: string;
        state?: string;
        useMemory?: number;
    };
    optimizer_estimates?: {
        cardinality: number;
        cost: number;
        fr_cost: number;
        size: number;
    };
    '#time_normal'?: string;
    '#time_absolute'?: number;
    '~children'?: Plan[];
    '#children'?: Plan[];
    '#child'?: Plan;
    '~child'?: Plan;
    '~versions'?: string[];
    prepared?: {
        operator?: Plan;
    };
    key?: string;
    scan?: Plan;
    insert?: Plan;
    scans?: Plan[];
    delete?: Plan;
    update?: Plan;
    first?: Plan;
    second?: Plan;
    as?: string;
    keyspace?: string;
    index?: string;
    group_keys?: string[];
    condition?: string;
    expr?: string;
    on_keys?: string;
    parallel?: boolean;
    parallelBegin?: boolean;
    parallelEnd?: boolean;
    limit?: string;
    result_terms?: {
        expr: string;
        star?: boolean;
        as?: string;
    }[];
    sort_terms?: {
        expr: string;
    }[];
    keys?: {
        expr: string;
    }[];
    subsequence?: Plan | null;
    predecessor?: Plan | Plan[];
    BranchCount?: () => number;
    Depth?: () => number;
    time?: undefined | number;
    time_percent?: number;
    on_clause?: string;
    variables?: string;
    expressions?: string;
    aggregates?: string[];
}

export const mockPlan1: Plan = {
    '#operator': 'Authorize',
    '#stats': {
        '#phaseSwitches': 4,
        execTime: '2.633µs',
        servTime: '13.925µs',
    },
    time_percent: 9.4,
    privileges: {
        List: [{}],
    },
    '~child': {
        '#operator': 'Sequence',
        time_percent: 9.4,
        '#stats': {
            '#phaseSwitches': 2,
            execTime: '1.155µs',
        },
        '~children': [
            {
                time_percent: 9.4,
                '#operator': 'DummyScan',
                '#stats': {
                    '#itemsOut': 1,
                    '#phaseSwitches': 3,
                    execTime: '690ns',
                    kernTime: '689ns',
                },
                optimizer_estimates: {
                    cardinality: 1,
                    cost: 1.0842021724855044e-19,
                    fr_cost: 1.0842021724855044e-19,
                    size: 1,
                },
            },
            {
                '#operator': 'InitialProject',
                '#stats': {
                    '#itemsIn': 1,
                    '#itemsOut': 1,
                    '#phaseSwitches': 8,
                    execTime: '101.847µs',
                    kernTime: '6.707µs',
                    state: 'running',
                },
                optimizer_estimates: {
                    cardinality: 1,
                    cost: 0.001,
                    fr_cost: 0.001,
                    size: 1,
                },
                time_percent: 9.4,
                result_terms: [
                    {
                        as: 'greeting',
                        expr: '"hello"',
                    },
                ],
            },
            {
                '#operator': 'Stream',
                '#stats': {
                    '#itemsIn': 1,
                    '#itemsOut': 1,
                    '#phaseSwitches': 2,
                    execTime: '12.103µs',
                },
                time_percent: 9.4,
                optimizer_estimates: {
                    cardinality: 1,
                    cost: 0.001,
                    fr_cost: 0.001,
                    size: 1,
                },
            },
        ],
    },
    '~versions': ['7.1.4-N1QL', '7.1.4-3637-enterprise'],
};