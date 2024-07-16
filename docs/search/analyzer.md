Use the **analyzer** property to modify the behavior of a match query or a match phrase query.

Set the **analyzer** property to the name of the analyzer you want to use on the contents of the match property or match_phrase property.

The specified analyzer only applies to the content of your Search request. It does not apply to the contents of documents in the Search index. However, the analyzer set on your Search request and in your Search index should match.

→ [Additional Query Object Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#additional-query-properties)