export const DATABASE_SCHEMA = {
    buckets: [
        {
            name: 'travel-sample',
            id: '123',
            scopes: [
                {
                    name: 'inventory',
                    id: '456',
                    collections: [
                        {
                            name: 'airline',
                            id: '789',
                        },
                        {
                            name: 'airport',
                            id: '101',
                        },
                    ],
                },
            ],
        },
    ],
};

export let QUERY = 'SELECT "Hello world" AS greeting;';