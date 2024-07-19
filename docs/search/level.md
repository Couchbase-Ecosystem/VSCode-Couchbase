Set the consistency to bounded or unbounded consistency:

→ **at_plus**: The Search query executes but requires that the Search index matches the timestamp of the last document update. You must provide a **vectors** object

→ **not_bounded**: The Search query executes without a consistency requirement. **not_bounded** is faster than **at_plus**, as it doesn't rely on a **vectors** object or wait for the Search index to match the Data Service index.

→ [Consistency Object Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#consistency)