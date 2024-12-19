Use a **must** object to create a boolean query.

A **must** object must contain a conjuncts array. The array lists all the queries that must have a match in a document to include the document in search results.

For example, a query could have a **must** object with 2 queries in a conjuncts array. The Search Service must find a match for both those queries in a document to include it in search results.

→ [Boolean Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#boolean-queries)