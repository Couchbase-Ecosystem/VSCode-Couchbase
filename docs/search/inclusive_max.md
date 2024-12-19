Set whether the Search Service should return documents that contain the exact **max** value.

If you set **inclusive_max** to false, only values less than **max** count as a match to your Search query.

If you do not set the **inclusive_max** value, by default, **max** is exclusive to the range.

→ [Numeric Range Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#numeric-range-queries)