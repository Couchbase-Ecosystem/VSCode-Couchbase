Use the **terms** array to run a phrase query. The Search Service searches for the strings you provide in the **terms** array in the specified order.

Unlike the match_phrase property, the **terms** array does not use any analyzers on the contents of your query text.

For example, set the **terms** array to ["nice", "view"]. The Search Service looks for any occurrences of nice in a document that are followed by an occurrence of view.

To use a phrase query:
→ You must set the field property in your search query.
→ You must have Include Term Vectors enabled or the include_term_vectors property set to true on the field you want to search.

→ [Non-Analytics Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#non-analytic-queries)