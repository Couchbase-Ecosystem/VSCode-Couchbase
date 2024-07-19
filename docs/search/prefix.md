Use the **prefix** property to run a prefix query.

Set the property to a string to return matches for any term that starts with that string in search results.

For example, you could set the **prefix** property to "inter" to return matches for "interview", "internal", "interesting", and so on.

If you use the prefix property, the Search Service does not use any analyzers on the contents of your query text.

→ [Non-Analytics Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#non-analytic-queries)