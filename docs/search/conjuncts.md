Use the **conjuncts** array to specify multiple child queries in a single query object.

You can use the **conjuncts** array inside a must object or directly inside a query object.

If you use the **conjuncts** array, every query object in the array must have a match in a document to include the document in search results.

You can create objects in a **conjuncts** array to describe any of the available query types.

→ [Compound Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#boolean-queries)