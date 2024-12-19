Use the **match_phrase** property to run a match phrase query. The Search Service searches for exact matches to the phrase you specify.

Unlike a **match** query string, a **match_phrase** query string can contain spaces without using the operator property.

To use a match phrase query:
→ You must specify a field to search with the field property or the {field-name} syntax in your search query.
→ You must have Include Term Vectors enabled or the include_term_vectors property set to true on the field you want to search.

→ [Analytics Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#analytic-queries)