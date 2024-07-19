Use the **disjuncts** array to specify multiple child queries in a single query object.

You can use the **disjuncts** array inside a must_not object, should object, or directly inside a query object.

Use a min property to set the number of query objects from the **disjuncts** array that must have a match in a document. If a document does not match the min number of query objects, the Search Service does not include the document in search results.

You can create objects in a **disjuncts** array to describe any of the available query types.

→ [Compound Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#boolean-queries)