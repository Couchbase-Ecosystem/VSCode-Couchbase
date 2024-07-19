Set whether the Search Service should return documents that contain the exact **end** value.

If you set **inclusive_end** to false, only dates earlier than end count as a match to your Search query.

If you do not set the **inclusive_end** value, by default, **end** is exclusive to the range.

→ [Date Range Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#date-range-queries)