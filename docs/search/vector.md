Enter the vector that you want to compare to the vector data in **field**.

The Search Service uses the similarity metric defined in the Search index definition to return the **k** closest vectors from the Search index.

**NOTE:** The vector in your Search query must match the dimension of the vectors stored in your Search index. If the dimensions do not match, your Search query does not return any results. For more information about the dimension value, see the dims property or the Dimension option in the UI.

→ [Knn Object Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#knn-object)