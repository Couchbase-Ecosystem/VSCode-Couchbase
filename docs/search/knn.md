Each object inside the knn array in a Search query describes a Vector Search query.
Add the knn array with at least one object to run a Vector Search query

**NOTE:** To run a Vector Search query, you must still include a **query** object with your Search request. To return only results from your Vector Search query, you can set the query object to a **match_none** query. To run a hybrid query that uses regular Search Service parameters together with Vector Search to return results

→ [Knn Object Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#knn-object)