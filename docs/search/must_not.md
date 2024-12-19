Use a **must_not** object to create a boolean query.

A **must_not** object must contain a disjuncts array. The array lists all the queries that must have a match in a document to include the document in search results.

For example, a query could have a **must_not** object with 3 queries in a disjuncts array. The Search Service must not find a match for any of the 3 queries in a document to include it in search results.

→ [Boolean Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#boolean-queries)