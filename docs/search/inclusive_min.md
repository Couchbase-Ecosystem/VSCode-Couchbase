Set whether the Search Service should return documents that contain the exact **min** value.

If you set **inclusive_min** to false, only values greater than min count as a match to your Search query.

If you do not set the **inclusive_min** value, by default, **min** is inclusive to the range.

→ [Numeric Range Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#numeric-range-queries)