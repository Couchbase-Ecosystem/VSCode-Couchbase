Use a **should** object to create a boolean query.

A **should** object must contain a disjuncts array. The array lists all the queries that must have a match in a document to score the document higher in search results.

A document can be included in search results if it does not match the query or queries in a **should** object. The document scores higher in search results if it does match the query.

→ [Boolean Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#boolean-queries)